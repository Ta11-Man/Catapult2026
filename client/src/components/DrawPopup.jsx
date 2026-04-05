import { useRef, useState } from 'react';
import { ReactSketchCanvas } from 'react-sketch-canvas';
import './DrawPopup.css';


export default function DrawPopup({ onClose, onSubmit }) {
  const sketchRef = useRef(null);
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [bg, setBg] = useState('#ffffff');
  const [strokeWidth, setStrokeWidth] = useState(15);
  const [backgroundImage, setBackgroundImage] = useState(null);

  const handleSubmit = async () => {
    if (!sketchRef.current) return;
    const imageData = await sketchRef.current.exportImage('png');
    onSubmit(imageData);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          // // Validation: Check if it's square (optional)
          // if (img.width !== img.height) {
          //   alert("Please upload a square image (1:1 aspect ratio).");
          //   return;
          // }
          setBackgroundImage(event.target.result);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="modal-overlay draw-overlay" onClick={onClose}>
      <div className="modal draw-modal" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="close" onClick={onClose}>x</button>
        <h2>Draw your mark</h2>
        <div className="draw-controls">
          <label>
            Color
            <input type="color" value={strokeColor} onChange={(e) => setStrokeColor(e.target.value)} />
          </label>
          <label>
            Background
            <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} />
          </label>
          <label>
            Stroke
            <input
              type="range"
              min="10"
              max="30"
              value={strokeWidth}
              onChange={(e) => setStrokeWidth(Number(e.target.value))}
            />
          </label>
          <div className="preview-container">
            <div
              style={{
                width: `${strokeWidth}px`,
                height: `${strokeWidth}px`,
                backgroundColor: strokeColor,
                borderRadius: '50%'
              }}
            />
          </div>
        </div>
        <div className="toolbar-row">
          <div className="action-group">
            <button type="button" onClick={() => sketchRef.current?.undo()}>Undo</button>
            <button type="button" onClick={() => sketchRef.current?.clearCanvas()}>Clear</button>
          </div>
          <div className="tool-group">
            <label className="upload-button">
              Upload Image
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
            </label>
            {backgroundImage && (
              <button type="button" onClick={() => setBackgroundImage(null)} className="remove-bg">
                Remove Image
              </button>
            )}
          </div>
        </div>
        <div className="canvas">
          <div className="canvas-frame">
            <ReactSketchCanvas
              ref={sketchRef}
              width="100%"
              height="100%"
              strokeWidth={strokeWidth}
              strokeColor={strokeColor}
              backgroundImage={backgroundImage}
              canvasColor={bg}
              allowOnlyPointerType="all"
              style={{ border: 'none' }}
              smoothScrolling={true}
              exportWithSmoothing={true}
            />
          </div>
        </div>

        <button type="button" className="primary" onClick={handleSubmit}>Submit</button>
      </div>
    </div>
  );
}
