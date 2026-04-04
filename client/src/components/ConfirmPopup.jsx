export default function ConfirmPopup({ imageData, onClose, onConfirm, onBack }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="close" onClick={onClose}>x</button>
        <h2>Confirm submission</h2>
        <img src={imageData} alt="Preview" width="128" height="128" />
        <p>Your drawing will be permanently added to the canvas. This cannot be undone.</p>
        <button type="button" className="destructive" onClick={onConfirm}>
          Confirm - this is permanent
        </button>
        <button type="button" className="ghost" onClick={onBack}>Go back</button>
      </div>
    </div>
  );
}

