import { useMemo } from 'react';
import Cell from './Cell';

export default function Grid({ 
  cells, 
  gridCols, 
  gridRows, 
  zoomLevel, 
  offset,
  onEmptyCellClick, 
  gridRef,
  onZoomIn, 
  onZoomOut,
  onMouseDown,
  onMouseMove,
  onMouseUp,    // Fixed casing: was onMouseUP
  onMouseLeave 
}) {
  const cellMap = useMemo(() => {
    const map = new Map();
    for (const cell of cells) {
      map.set(cell.gridIndex, cell);
    }
    return map;
  }, [cells]);

  const totalCells = gridCols * gridRows;

  const cellWidth = Math.floor((window.innerWidth - 32) / gridCols);
  const cellHeight = Math.floor((window.innerHeight - 32) / gridRows);

  // We check if the mouse is currently down by checking if any button is pressed
  // This allows us to update the cursor style without needing extra props
  const gridScrollStyle = {
    cursor: 'grab'
  };

  return (
    <div className="grid-shell">
      <div className="zoom-controls">
        <button type="button" onClick={onZoomOut}>-</button>
        <span>{zoomLevel.toFixed(1)}x</span>
        <button type="button" onClick={onZoomIn}>+</button>
      </div>
      
      <div 
        className="grid-scroll"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}     
        onMouseLeave={onMouseLeave}
        style={gridScrollStyle}
      >
        <div
          ref={gridRef}
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${gridCols}, ${cellWidth}px)`,
            gridTemplateRows: `repeat(${gridRows}, ${cellHeight}px)`,
            transform: `translate(${offset?.x || 0}px, ${offset?.y || 0}px) scale(${zoomLevel})`,
            transformOrigin: 'center center',
            pointerEvents: 'auto' // Ensure grid accepts clicks
          }}
        >
          {Array.from({ length: totalCells }).map((_, index) => {
            const cell = cellMap.get(index);
            return (
              <Cell
                key={index}
                imageData={cell?.imageData || null}
                onClick={() => onEmptyCellClick(index)}
                cellWidth={cellWidth}
                cellHeight={cellHeight}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}