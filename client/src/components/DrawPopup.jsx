import { useRef, useState } from 'react';
import { ReactSketchCanvas } from 'react-sketch-canvas';

export default function DrawPopup({ onClose, onSubmit }) {
  const sketchRef = useRef(null);
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(4);

  const handleSubmit = async () => {
    if (!sketchRef.current) return;
    const imageData = await sketchRef.current.exportImage('png');
    onSubmit(imageData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal draw-modal" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="close" onClick={onClose}>x</button>
        <h2>Draw your mark</h2>
        <div className="draw-controls">
          <label>
            Color
            <input type="color" value={strokeColor} onChange={(e) => setStrokeColor(e.target.value)} />
          </label>
          <label>
            Stroke
            <input
              type="range"
              min="1"
              max="20"
              value={strokeWidth}
              onChange={(e) => setStrokeWidth(Number(e.target.value))}
            />
          </label>
          <button type="button" onClick={() => sketchRef.current?.undo()}>Undo</button>
          <button type="button" onClick={() => sketchRef.current?.clearCanvas()}>Clear</button>
        </div>
        <ReactSketchCanvas
          ref={sketchRef}
          width="512px"
          height="512px"
          strokeWidth={strokeWidth}
          strokeColor={strokeColor}
          canvasColor="transparent"
        />
        <button type="button" className="primary" onClick={handleSubmit}>Submit</button>
      </div>
    </div>
  );
}

