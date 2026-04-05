import { useEffect, useMemo, useRef, useState } from 'react';
import styles from './App.module.css';
import Grid from './components/Grid';
import LoginPopup from './components/LoginPopup';
import DrawPopup from './components/DrawPopup';
import ConfirmPopup from './components/ConfirmPopup';
import AlreadySubmittedPopup from './components/AlreadySubmittedPopup';
import DownloadButton from './components/DownloadButton';
import { createCell } from './api/client';
import { useGrid } from './hooks/useGrid';
import { useSession } from './hooks/useSession';

export default function App() {
  const gridRef = useRef(null);
  const audioRef = useRef(null);
  const { cells, gridCols, gridRows, zoomLevel, beta, latestCreatedAt, addCell, zoomIn, zoomOut } = useGrid();
  const {
    verifiedNullifier,
    hasSubmitted,
    loginWithWorldId,
    createWithoutLogin,
    worldIdResponse,
    setVerifiedNullifier,
    setHasSubmitted
  } = useSession();

  const [activePopup, setActivePopup] = useState('idle');
  const [selectedGridIndex, setSelectedGridIndex] = useState(null);
  const [pendingImageData, setPendingImageData] = useState(null);

  const handleEmptyCellClick = (gridIndex) => {
    setSelectedGridIndex(gridIndex);
    setActivePopup('draw');
  };

  const closePopups = () => {
    setActivePopup('idle');
    setPendingImageData(null);
    setSelectedGridIndex(null);
  };

  const handleVerify = ({ nullifier_hash, nullifierHash }) => {
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

  const handleWorldIdLogin = () => {
    loginWithWorldId();
    if (worldIdResponse) {
      handleVerify(worldIdResponse);
    }
  };

  const handleCreateWithoutLogin = () => {
    createWithoutLogin();
    if (worldIdResponse) {
      handleVerify(worldIdResponse);
    }
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
        imageData: pendingImageData
      });
      addCell(created);
      setHasSubmitted(true);
      closePopups();
    } catch (error) {
      if (error.status === 409) {
        setHasSubmitted(true);
        setActivePopup('already_submitted');
        return;
      }
      closePopups();
    }
  };

  const nextDecayText = useMemo(() => {
    if (!latestCreatedAt) {
      return `${beta} days from last submission`;
    }
    return `${beta} days from ${new Date(latestCreatedAt).toLocaleString()}`;
  }, [beta, latestCreatedAt]);

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

  return (
    <div className={styles.app}>
      <div className={styles.stats}>
        <div>Cells: {cells.length}</div>
        <div>beta = {beta} days</div>
        <div>Next decay in: {nextDecayText}</div>
      </div>

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

      <DownloadButton gridRef={gridRef} />

      {activePopup === 'login' && (
        <LoginPopup
          onClose={closePopups}
          onVerify={handleWorldIdLogin}
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