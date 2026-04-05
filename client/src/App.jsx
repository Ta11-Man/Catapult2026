import { IDKitWidget, useIDKit } from '@worldcoin/idkit';
import { useEffect, useMemo, useRef, useState } from 'react';
import styles from './App.module.css';
import Grid from './components/Grid';
import LoginPopup from './components/LoginPopup';
import DrawPopup from './components/DrawPopup';
import ConfirmPopup from './components/ConfirmPopup';
import AlreadySubmittedPopup from './components/AlreadySubmittedPopup';
import BottomStatusBar from './components/BottomStatusBar';
import { createCell } from './api/client';
import { useGrid } from './hooks/useGrid';
import { useSession } from './hooks/useSession';


export default function App() {
  const INTRO_EXIT_MS = 1300;
  const OVERLAY_HEADING = 'WELCOME TO THE REEF EXPERIENCE';
  const TYPEWRITER_STEP_MS = 145;
  const ENTER_BUTTON_DELAY_MS = 600;
  const gridRef = useRef(null);
  const audioRef = useRef(null);
  const { cells, gridCols, gridRows, zoomLevel, addCell, zoomIn, zoomOut } = useGrid();
  const {
    verifiedNullifier,
    hasSubmitted,
    createWithoutLogin,
    setVerifiedNullifier,
    setHasSubmitted
  } = useSession();

  const [activePopup, setActivePopup] = useState('idle');
  const [selectedGridIndex, setSelectedGridIndex] = useState(null);
  const [pendingImageData, setPendingImageData] = useState(null);
  const [isLoginFlowActive, setIsLoginFlowActive] = useState(false);
  const [isWorldIdPending, setIsWorldIdPending] = useState(false);
  const [isWelcomeOverlayVisible, setIsWelcomeOverlayVisible] = useState(true);
  const [isWelcomeOverlayExiting, setIsWelcomeOverlayExiting] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const [typingDone, setTypingDone] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const worldIdResolvedRef = useRef(false);
  const worldIdWasOpenRef = useRef(false);
  const { open: isIdKitOpen, setOpen: setIdKitOpen } = useIDKit();

  const submissionCount = cells.length;
  const lastSubmissionDate = useMemo(() => {
    let latestTimestamp = -Infinity;
    let latestDate = null;

    for (const cell of cells) {
      const timestamp = Date.parse(cell?.createdAt);
      if (Number.isFinite(timestamp) && timestamp > latestTimestamp) {
        latestTimestamp = timestamp;
        latestDate = cell.createdAt;
      }
    }

    return latestDate;
  }, [cells]);


  const handleEmptyCellClick = (gridIndex) => {
    setSelectedGridIndex(gridIndex);
    setIsLoginFlowActive(true);

    // Reuse the current page session so repeat clicks do not force relogin.
    if (verifiedNullifier) {
      setActivePopup(hasSubmitted ? 'already_submitted' : 'draw');
      return;
    }

    setActivePopup('login');
  };

  const handleEnterExperience = () => {
    if (isWelcomeOverlayExiting) {
      return;
    }

    // Explicit user gesture improves autoplay reliability across browsers.
    if (audioRef.current) {
      audioRef.current.play().catch(() => {
        // Ignore autoplay errors; existing fallback listeners still apply.
      });
    }

    setIsWelcomeOverlayExiting(true);
  };

  useEffect(() => {
    if (!isWelcomeOverlayExiting) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setIsWelcomeOverlayVisible(false);
      setIsWelcomeOverlayExiting(false);
    }, INTRO_EXIT_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isWelcomeOverlayExiting, INTRO_EXIT_MS]);

  const closePopups = () => {
    setActivePopup('idle');
    setPendingImageData(null);
    setSelectedGridIndex(null);
    setIsLoginFlowActive(false);
    setIsWorldIdPending(false);
    worldIdResolvedRef.current = false;
    worldIdWasOpenRef.current = false;
  };


  const handleVerify = ({ nullifier_hash, nullifierHash }) => {
    if (!isLoginFlowActive || selectedGridIndex === null) {
      return;
    }

    const normalized = nullifierHash || nullifier_hash;
    if (!normalized) {
      return;
    }

    setVerifiedNullifier(normalized);
    if (hasSubmitted) {
      setActivePopup('already_submitted');
      return;
    }
    setActivePopup('draw');
  };

  const handleWorldIdSuccess = (result) => {
    worldIdResolvedRef.current = true;
    setIsWorldIdPending(false);
    handleVerify(result);
  };

  const handleWorldIdError = () => {
    worldIdResolvedRef.current = true;
    if (!isLoginFlowActive || selectedGridIndex === null) {
      setIsWorldIdPending(false);
      return;
    }

    // If the user dismisses IDKit, return to the same login choice screen.
    setIsWorldIdPending(false);
    setActivePopup('login');
  };


  const handleVerifyWithWorldId = () => {
    if (!isLoginFlowActive || activePopup !== 'login') {
      return;
    }

    // Unmount our modal first so IDKit is never layered behind it.
    worldIdResolvedRef.current = false;
    worldIdWasOpenRef.current = false;
    setIsWorldIdPending(true);
    setActivePopup('idle');
    requestAnimationFrame(() => {
      setIdKitOpen(true);
    });
  };

  useEffect(() => {
    if (!isWorldIdPending) {
      return;
    }

    if (isIdKitOpen) {
      worldIdWasOpenRef.current = true;
      return;
    }

    // Wait until the widget actually opened at least once.
    if (!worldIdWasOpenRef.current) {
      return;
    }

    setIsWorldIdPending(false);

    if (!isLoginFlowActive || selectedGridIndex === null || worldIdResolvedRef.current) {
      return;
    }

    // Closed via X/backdrop without a success/error callback: restore login choices.
    setActivePopup('login');
  }, [isIdKitOpen, isWorldIdPending, isLoginFlowActive, selectedGridIndex]);

  const handleCreateWithoutLogin = () => {
    createWithoutLogin();
    setActivePopup('draw');
  };

  const handleDrawSubmit = (imageData) => {
    setPendingImageData(imageData);
    setActivePopup('confirm');
  };
  const handleConfirm = async () => {
    if (!verifiedNullifier || !pendingImageData || selectedGridIndex === null) {
      closePopups();
      return;
    }

    try {
      const created = await createCell({
        nullifierHash: verifiedNullifier,
        imageData: pendingImageData,
        gridIndex: selectedGridIndex
      });
      addCell(created);
      setHasSubmitted(true);
      closePopups();
    } catch (error) {
      if (error.status === 409 && error.message === 'already_submitted') {
        setHasSubmitted(true);
        setActivePopup('already_submitted');
        return;
      }
      closePopups();
    }
  };

  useEffect(() => {
    const audio = new Audio('/audio/bg.mp3');
    audio.loop = true;
    audio.preload = 'auto';
    audioRef.current = audio;

    const tryPlay = () => {
      if (!audioRef.current) {
        return;
      }
      audioRef.current.play().catch(() => {
        // Browser may block autoplay until user interacts.
      });
    };

    tryPlay();

    const onFirstInteraction = () => {
      tryPlay();
      window.removeEventListener('click', onFirstInteraction);
      window.removeEventListener('keydown', onFirstInteraction);
      window.removeEventListener('touchstart', onFirstInteraction);
    };

    window.addEventListener('click', onFirstInteraction);
    window.addEventListener('keydown', onFirstInteraction);
    window.addEventListener('touchstart', onFirstInteraction);

    return () => {
      window.removeEventListener('click', onFirstInteraction);
      window.removeEventListener('keydown', onFirstInteraction);
      window.removeEventListener('touchstart', onFirstInteraction);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!isWelcomeOverlayVisible) {
      return;
    }

    setDisplayedText('');
    setTypingDone(false);
    setShowButton(false);

    let timeoutId;

    const typeAtIndex = (index) => {
      timeoutId = window.setTimeout(() => {
        const nextIndex = index + 1;
        setDisplayedText(OVERLAY_HEADING.slice(0, nextIndex));

        if (nextIndex >= OVERLAY_HEADING.length) {
          setTypingDone(true);
          return;
        }

        typeAtIndex(nextIndex);
      }, TYPEWRITER_STEP_MS);
    };

    typeAtIndex(0);

    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, []);

  useEffect(() => {
    if (!typingDone) {
      setShowButton(false);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setShowButton(true);
    }, ENTER_BUTTON_DELAY_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [typingDone]);

  useEffect(() => {
    if (isWelcomeOverlayExiting) {
      setShowButton(false);
    }
  }, [isWelcomeOverlayExiting]);

  return (
    <div className={styles.app}>
      {isWelcomeOverlayVisible && (
        <div
          className={`${styles.welcomeOverlay} ${isWelcomeOverlayExiting ? styles.welcomeOverlayExit : ''}`}
          role="dialog"
          aria-modal="true"
          aria-label="Welcome to the Reef Experience"
        >
          <div className={styles.welcomeContent}>
            <h1 className={styles.welcomeTitle}>
              {displayedText}
              {!isWelcomeOverlayExiting && <span className={styles.cursor} aria-hidden="true" />}
            </h1>
            <button
              type="button"
              className={`${styles.welcomeEnterButton} ${showButton ? styles.enterButtonVisible : styles.enterButtonHidden}`}
              onClick={handleEnterExperience}
            >
              Enter
            </button>
          </div>
        </div>
      )}

      <BottomStatusBar
        submissionCount={submissionCount}
        lastSubmissionDate={lastSubmissionDate}
      />


      <Grid
        cells={cells}
        gridCols={gridCols}
        gridRows={gridRows}
        zoomLevel={zoomLevel}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onEmptyCellClick={handleEmptyCellClick}
        gridRef={gridRef}
      />


      {/* keep root-mounted widget */}
      <IDKitWidget
           app_id={import.meta.env.VITE_WLD_APP_ID}
           action={import.meta.env.VITE_WLD_ACTION}
           onSuccess={handleWorldIdSuccess}
           onError={handleWorldIdError}
           verification_level="device"
       >
         {() => null}
       </IDKitWidget>


      {activePopup === 'login' && !isWorldIdPending && (
        <LoginPopup
          onClose={closePopups}
          onVerifyWithWorldId={handleVerifyWithWorldId}
          onCreateWithoutLogin={handleCreateWithoutLogin}
        />
      )}
      {activePopup === 'draw' && <DrawPopup onClose={closePopups} onSubmit={handleDrawSubmit} />}
      {activePopup === 'confirm' && (
        <ConfirmPopup
          imageData={pendingImageData}
          onClose={closePopups}
          onConfirm={handleConfirm}
          onBack={() => setActivePopup('draw')}
        />
      )}
      {activePopup === 'already_submitted' && <AlreadySubmittedPopup onClose={closePopups} />}
    </div>
  );
}