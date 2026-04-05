export default function Cell({ imageData, onClick, cellWidth, cellHeight }) {
  const isFilled = Boolean(imageData);

  return (
    <button
      type="button"
      className={isFilled ? 'cell filled' : 'cell empty'}
      style={{ width: cellWidth, height: cellHeight }}
      onClick={isFilled ? undefined : onClick}
      disabled={isFilled}
      aria-label={isFilled ? 'Filled cell' : 'Empty cell'}
    >
      {isFilled ? <img src={imageData} width={cellWidth} height={cellHeight} alt="Submitted drawing" draggable={false} /> : <span>+</span>}
    </button>
  );
}

