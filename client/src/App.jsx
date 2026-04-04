import { useMemo, useRef, useState } from 'react';
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
  const { cells, gridSize, zoomLevel, beta, latestCreatedAt, addCell, zoomIn, zoomOut } = useGrid();
  const { verifiedNullifier, hasSubmitted, setVerifiedNullifier, setHasSubmitted } = useSession();

  const [activePopup, setActivePopup] = useState('idle');
  const [selectedGridIndex, setSelectedGridIndex] = useState(null);
  const [pendingImageData, setPendingImageData] = useState(null);

  const handleEmptyCellClick = (gridIndex) => {
    setSelectedGridIndex(gridIndex);
    setActivePopup('login');
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

  return (
    <div className={styles.app}>
      <div className={styles.stats}>
        <div>Cells: {cells.length}</div>
        <div>beta = {beta} days</div>
        <div>Next decay in: {nextDecayText}</div>
      </div>

      <Grid
        cells={cells}
        gridSize={gridSize}
        zoomLevel={zoomLevel}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onEmptyCellClick={handleEmptyCellClick}
        gridRef={gridRef}
      />

      <DownloadButton gridRef={gridRef} />

      {activePopup === 'login' && <LoginPopup onClose={closePopups} onVerify={handleVerify} />}
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

