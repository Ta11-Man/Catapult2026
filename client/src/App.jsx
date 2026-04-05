import { useState, useMemo, useEffect, useRef } from 'react';
import axios from 'axios';
import WelcomeOverlay from './components/WelcomeOverlay';
import Grid from './components/Grid';
import LoginPopup from './components/LoginPopup';
import DrawPopup from './components/DrawPopup';
import ConfirmPopup from './components/ConfirmPopup';
import AlreadySubmittedPopup from './components/AlreadySubmittedPopup';
import BottomStatusBar from './components/BottomStatusBar';
import { createCell } from './api/client';
import { useGrid } from './hooks/useGrid';
import { useSession } from './hooks/useSession';
import styles from './App.module.css';

function App() {
  const [activePopup, setActivePopup] = useState('idle');
  const [isWorldIdPending, setIsWorldIdPending] = useState(false);
  const [focusedCellIndex, setFocusedCellIndex] = useState(null);
  const [showWelcome, setShowWelcome] = useState(true);

  const { 
    cells, 
    gridCols, 
    gridRows, 
    zoomLevel, 
    handleZoomIn, 
    handleZoomOut,
    fetchCells,
    addCell,
    isInitialLoading
  } = useGrid();

  const {
    currentNullifier,
    setVerifiedNullifier,
    hasSubmitted,
    logout
  } = useSession();

  const gridRef = useRef(null);

  useEffect(() => {
    fetchCells();
  }, [fetchCells]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setFocusedCellIndex(null);
        if (activePopup === 'login' || activePopup === 'draw' || activePopup === 'confirm') {
          setActivePopup('idle');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePopup]);

  const handleEmptyCellClick = (index) => {
    if (hasSubmitted) {
      setActivePopup('already_submitted');
      return;
    }
    setActivePopup('login');
  };

  const handleFilledCellClick = (index) => {
    if (focusedCellIndex === index) {
      setFocusedCellIndex(null);
    } else {
      setFocusedCellIndex(index);
    }
  };

  const handleLoginSuccess = (nullifier) => {
    setVerifiedNullifier(nullifier);
    setActivePopup('draw');
  };

  const handleDrawConfirm = (imageData) => {
    setActivePopup('confirm');
  };

  const handleSubmission = async (imageData) => {
    try {
      const response = await createCell(currentNullifier, imageData);
      addCell(response);
      setVerifiedNullifier(currentNullifier, true);
      setActivePopup('idle');
    } catch (error) {
      console.error('Submission failed:', error);
      alert(error.message || 'Submission failed');
    }
  };

  const latestCell = useMemo(() => {
    if (!cells.length) return null;
    return [...cells].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
  }, [cells]);

  return (
    <div className={styles.app}>
      {showWelcome && (
        <WelcomeOverlay onEnter={() => setShowWelcome(false)} />
      )}
      
      <Grid 
        cells={cells}
        gridCols={gridCols}
        gridRows={gridRows}
        zoomLevel={zoomLevel}
        focusedCellIndex={focusedCellIndex}
        onEmptyCellClick={handleEmptyCellClick}
        onFilledCellClick={handleFilledCellClick}
        onClose={() => setFocusedCellIndex(null)}
        gridRef={gridRef}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
      />

      {activePopup === 'login' && (
        <LoginPopup 
          onSuccess={handleLoginSuccess}
          onClose={() => setActivePopup('idle')}
          setIsWorldIdPending={setIsWorldIdPending}
        />
      )}

      {activePopup === 'draw' && (
        <DrawPopup 
          onConfirm={handleDrawConfirm}
          onClose={() => setActivePopup('idle')}
        />
      )}

      {activePopup === 'confirm' && (
        <ConfirmPopup 
          onConfirm={handleSubmission}
          onBack={() => setActivePopup('draw')}
          onClose={() => setActivePopup('idle')}
        />
      )}

      {activePopup === 'already_submitted' && (
        <AlreadySubmittedPopup 
          onClose={() => setActivePopup('idle')}
        />
      )}

      <BottomStatusBar 
        submissionCount={cells.length}
        lastSubmissionTime={latestCell?.createdAt}
      />
    </div>
  );
}

export default App;