import { IDKitWidget } from '@worldcoin/idkit';

export default function LoginPopup({ onClose, onVerify }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="close" onClick={onClose}>x</button>
        <h2>Leave your mark</h2>
        <p>One submission per human, forever.</p>
        <IDKitWidget
          app_id={import.meta.env.VITE_WLD_APP_ID}
          action={import.meta.env.VITE_WLD_ACTION}
          onSuccess={onVerify}
          verification_level="device"
        >
          {({ open }) => (
            <button type="button" className="primary" onClick={open}>
              Verify with World ID
            </button>
          )}
        </IDKitWidget>
      </div>
    </div>
  );
}

