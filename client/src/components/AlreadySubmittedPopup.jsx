export default function AlreadySubmittedPopup({ onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="close" onClick={onClose}>x</button>
        <h2>You've already left your mark.</h2>
        <p>Each World ID can only submit once, ever.</p>
        <button type="button" className="primary" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

