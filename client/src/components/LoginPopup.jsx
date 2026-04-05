export default function LoginPopup({ onClose, onVerifyWithWorldId, onCreateWithoutLogin }) {
  return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal" onClick={(event) => event.stopPropagation()}>
          <button type="button" className="close" onClick={onClose}>x</button>
          <h2>Leave your mark</h2>
          <p>One submission per human, forever.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button type="button" className="primary" onClick={onVerifyWithWorldId}>
              Verify with World ID
            </button>

            <button type="button" className="primary" onClick={onCreateWithoutLogin}>
              Create without logging in
            </button>
          </div>
        </div>
      </div>
  );
}
