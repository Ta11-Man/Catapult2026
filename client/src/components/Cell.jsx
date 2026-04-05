export default function Cell({ imageData, onClick, cellWidth, cellHeight }) {
  const isFilled = Boolean(imageData);

  return (
    <div
      role="button"
      tabIndex={isFilled ? -1 : 0}
      className={isFilled ? 'cell filled' : 'cell empty'}
      style={{ 
        width: cellWidth, 
        height: cellHeight,
        cursor: isFilled ? 'inherit' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px dashed var(--px-divider)',
        boxSizing: 'border-box'
      }}
      // Only trigger onClick if it's an empty cell
      onClick={!isFilled ? onClick : undefined}
      aria-label={isFilled ? 'Filled cell' : 'Empty cell'}
    >
      {isFilled ? (
        <img 
          src={imageData} 
          style={{ width: '100%', height: '100%', display: 'block' }} 
          alt="Submitted drawing" 
          draggable="false" // Crucial: prevents browser "ghost" image drag
        />
      ) : (
        <span>+</span>
      )}
    </div>
  );
}