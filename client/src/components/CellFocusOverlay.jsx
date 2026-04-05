import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './CellFocusOverlay.module.css';

const TILT_SHIFT_MS = 680;  // how long cells drop before zoom starts
const ENTER_MS = 900;       // zoom-in duration
const EXIT_MS = 600;
const ENTER_EASING = 'cubic-bezier(0.25, 0.1, 0.1, 1)';
const EXIT_EASING = 'cubic-bezier(0.4, 0, 0.2, 1)';

export default function CellFocusOverlay({ focusedCell, onClose }) {
  const overlayRef = useRef(null);
  const [isClosing, setIsClosing] = useState(false);

  // Run FLIP enter animation whenever focusedCell is set
  useEffect(() => {
    if (!focusedCell) return;
    setIsClosing(false);

    const el = overlayRef.current;
    if (!el) return;

    const { rect } = focusedCell;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Invert: sit invisibly over the cell while tilt-shift settles
    const scaleX = rect.width / vw;
    const scaleY = rect.height / vh;
    const tx = rect.left + rect.width / 2 - vw / 2;
    const ty = rect.top + rect.height / 2 - vh / 2;

    el.style.transition = 'none';
    el.style.opacity = '0';
    el.style.transform = `translate(${tx}px, ${ty}px) scale(${scaleX}, ${scaleY})`;

    // After tilt-shift has settled, zoom in and fade in together
    const timerId = setTimeout(() => {
      requestAnimationFrame(() => {
        el.style.transition = `transform ${ENTER_MS}ms ${ENTER_EASING}, opacity 280ms ease`;
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
    }, TILT_SHIFT_MS);

    return () => clearTimeout(timerId);
  }, [focusedCell]);

  const handleClose = useCallback(() => {
    if (isClosing || !focusedCell) return;

    const el = overlayRef.current;
    if (!el) return;

    const { rect } = focusedCell;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const scaleX = rect.width / vw;
    const scaleY = rect.height / vh;
    const tx = rect.left + rect.width / 2 - vw / 2;
    const ty = rect.top + rect.height / 2 - vh / 2;

    setIsClosing(true);
    el.style.transition = `transform ${EXIT_MS}ms ${EXIT_EASING}, opacity ${EXIT_MS}ms ease`;
    el.style.transform = `translate(${tx}px, ${ty}px) scale(${scaleX}, ${scaleY})`;
    el.style.opacity = '0';

    setTimeout(onClose, EXIT_MS - 150);
  }, [isClosing, focusedCell, onClose]);

  useEffect(() => {
    if (!focusedCell) return;
    const onKeyDown = (e) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [focusedCell, handleClose]);

  if (!focusedCell) return null;

  return (
    <div
      ref={overlayRef}
      className={styles.overlay}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label="Cell drawing fullscreen view"
    >
      <img
        src={focusedCell.imageData}
        alt="Submitted drawing"
        className={styles.image}
      />
    </div>
  );
}
