export default function Cell({ imageData, onClick }) {
  const isFilled = Boolean(imageData);

  return (
    <button
      type="button"
      className={isFilled ? 'cell filled' : 'cell empty'}
      onClick={isFilled ? undefined : onClick}
      disabled={isFilled}
      aria-label={isFilled ? 'Filled cell' : 'Empty cell'}
    >
      {isFilled ? <img src={imageData} width="512" height="512" alt="Submitted drawing" /> : <span>+</span>}
    </button>
  );
}

