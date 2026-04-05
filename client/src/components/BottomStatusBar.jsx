import { useEffect, useMemo, useRef, useState } from 'react';
import styles from './BottomStatusBar.module.css';

const MS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_HOUR = 60;
const HOURS_PER_DAY = 24;
const MS_PER_DAY = HOURS_PER_DAY * MINUTES_PER_HOUR * SECONDS_PER_MINUTE * MS_PER_SECOND;

function formatCountdown(remainingMs) {
  const totalSeconds = Math.floor(remainingMs / MS_PER_SECOND);
  const days = Math.floor(totalSeconds / (HOURS_PER_DAY * MINUTES_PER_HOUR * SECONDS_PER_MINUTE));
  const hours = Math.floor((totalSeconds % (HOURS_PER_DAY * MINUTES_PER_HOUR * SECONDS_PER_MINUTE)) / (MINUTES_PER_HOUR * SECONDS_PER_MINUTE));
  const minutes = Math.floor((totalSeconds % (MINUTES_PER_HOUR * SECONDS_PER_MINUTE)) / SECONDS_PER_MINUTE);
  const seconds = totalSeconds % SECONDS_PER_MINUTE;

  return `${String(days).padStart(3, '0')}D ${String(hours).padStart(2, '0')}H ${String(minutes).padStart(2, '0')}M ${String(seconds).padStart(2, '0')}S`;
}

export default function BottomStatusBar({ submissionCount, lastSubmissionDate }) {
  const infoWrapperRef = useRef(null);
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  const targetTimestamp = useMemo(() => {
    if (!submissionCount || !lastSubmissionDate) {
      return null;
    }

    const lastTimestamp = Date.parse(lastSubmissionDate);
    if (!Number.isFinite(lastTimestamp)) {
      return null;
    }

    const decayDays = 5 + (Math.log(submissionCount));
    return lastTimestamp + (decayDays * MS_PER_DAY);
  }, [submissionCount, lastSubmissionDate]);

  const [remainingMs, setRemainingMs] = useState(() => {
    if (targetTimestamp === null) {
      return null;
    }
    return Math.max(0, targetTimestamp - Date.now());
  });

  useEffect(() => {
    if (targetTimestamp === null) {
      setRemainingMs(null);
      return;
    }

    const updateRemaining = () => {
      setRemainingMs(Math.max(0, targetTimestamp - Date.now()));
    };

    updateRemaining();
    const intervalId = window.setInterval(updateRemaining, MS_PER_SECOND);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [targetTimestamp]);

  useEffect(() => {
    if (!isInfoOpen) {
      return;
    }

    const handlePointerDown = (event) => {
      if (!infoWrapperRef.current?.contains(event.target)) {
        setIsInfoOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
    };
  }, [isInfoOpen]);

  const timerText = remainingMs === null ? 'NO DECAY DATA' : formatCountdown(remainingMs);

  return (
    <div className={styles.bottomStatusBar} role="status" aria-label="Reef status">
      <span className={styles.barLeft}>{timerText}</span>
      <span className={styles.barCenter}>HUMANITY PREVAILS</span>
      <div className={styles.infoWrapper} ref={infoWrapperRef}>
        <button
          type="button"
          className={styles.infoTrigger}
          aria-label="More information"
          aria-expanded={isInfoOpen}
          onClick={() => setIsInfoOpen((prev) => !prev)}
        >
          i
        </button>
        <div
          className={`${styles.infoPopup} ${isInfoOpen ? styles.infoPopupOpen : ''}`}
          aria-hidden={!isInfoOpen}
        >
          <p>
            Welcome to Reef, a place of art for humanity. The timer on the left
            represents the current "decay" status of the reef, which is
            influenced by user submissions. Each submission contributes to the
            reef's vitality, and the timer counts down until the next decay
            event.
            <br></br>
            <br></br>
            Much like a real Coral Reef, our community needs fresh life to
            thrive, and bots do not bring life. Each submission is a
            once-in-a-lifetime contribution, causing a generational legacy and
            bringing us together in the shared human experience.
            <br></br>
            <br></br>
            We encourage you to submit your unique creation and be a part of
            this living artwork. Together, we can keep the reef vibrant and
            flourishing for generations to come.
          </p>
        </div>
      </div>
    </div>
  );
}
