export default function Cell({ imageData, onClick, onFilledCellClick, cellWidth, cellHeight, isDefocused }) {
  const isFilled = Boolean(imageData);

  const handleFilledClick = (e) => {
    if (onFilledCellClick) {
      onFilledCellClick(imageData, e.currentTarget.getBoundingClientRect());
    }
  };

  return (
    <button
      type="button"
      className={`cell${isFilled ? ' filled' : ' empty'}${isDefocused ? ' defocused' : ''}`}
      style={{ width: cellWidth, height: cellHeight }}
      onClick={isFilled ? handleFilledClick : onClick}
      aria-label={isFilled ? 'View submitted drawing' : 'Empty cell'}
    >
      {isFilled
        ? <img src={imageData} width={cellWidth} height={cellHeight} alt="Submitted drawing" />
        : <span>+</span>}
    </button>
  );
}
