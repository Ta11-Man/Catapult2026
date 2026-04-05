import { useRef, useState } from 'react';
import { ReactSketchCanvas } from 'react-sketch-canvas';
import './DrawPopup.css';

const FALLBACK_CANVAS_SIZE = 512;

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('image_load_failed'));
    img.src = src;
  });
}

function drawCoverImage(ctx, img, targetWidth, targetHeight) {
  const scale = Math.max(targetWidth / img.width, targetHeight / img.height);
  const drawWidth = img.width * scale;
  const drawHeight = img.height * scale;
  const dx = (targetWidth - drawWidth) / 2;
  const dy = (targetHeight - drawHeight) / 2;
  ctx.drawImage(img, dx, dy, drawWidth, drawHeight);
}

export default function DrawPopup({ onClose, onSubmit }) {
  const sketchRef = useRef(null);
  const canvasFrameRef = useRef(null);
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [bg, setBg] = useState('#ffffff');
  const [strokeWidth, setStrokeWidth] = useState(15);
  const [backgroundImage, setBackgroundImage] = useState(null);

  const handleSubmit = async () => {
    if (!sketchRef.current) return;

    const strokeImageData = await sketchRef.current.exportImage('png');

    try {
      const frameWidth = canvasFrameRef.current?.clientWidth || FALLBACK_CANVAS_SIZE;
      const frameHeight = canvasFrameRef.current?.clientHeight || FALLBACK_CANVAS_SIZE;
      const composite = document.createElement('canvas');
      composite.width = frameWidth;
      composite.height = frameHeight;

      const ctx = composite.getContext('2d');
      if (!ctx) {
        onSubmit(strokeImageData);
        return;
      }

      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, frameWidth, frameHeight);

      if (backgroundImage) {
        const uploadedImage = await loadImage(backgroundImage);
        drawCoverImage(ctx, uploadedImage, frameWidth, frameHeight);
      }

      const strokeImage = await loadImage(strokeImageData);
      ctx.drawImage(strokeImage, 0, 0, frameWidth, frameHeight);
      onSubmit(composite.toDataURL('image/png'));
    } catch (_error) {
      // Keep submission functional even if one composition layer fails.
      onSubmit(strokeImageData);
    }
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
          <div className="canvas-frame" ref={canvasFrameRef}>
            <div className="canvas-base" style={{ backgroundColor: bg }} />
            {backgroundImage && (
              <img
                className="canvas-upload-preview"
                src={backgroundImage}
                alt=""
                aria-hidden="true"
                draggable={false}
              />
            )}
            <ReactSketchCanvas
              ref={sketchRef}
              width="100%"
              height="100%"
              strokeWidth={strokeWidth}
              strokeColor={strokeColor}
              canvasColor="transparent"
              allowOnlyPointerType="all"
              style={{ border: 'none', position: 'relative', zIndex: 2, background: 'transparent' }}
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
