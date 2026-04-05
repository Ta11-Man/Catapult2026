import { useMemo } from 'react';
import Cell from './Cell';

export default function Grid({ cells, gridCols, gridRows, zoomLevel, focusedCellIndex, onEmptyCellClick, onFilledCellClick, gridRef, onZoomIn, onZoomOut }) {
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

  const isFocusing = focusedCellIndex !== null && focusedCellIndex !== undefined;

  return (
    <div className="grid-shell">
      <div className="zoom-controls">
        <button type="button" onClick={onZoomOut}>-</button>
        <span>{zoomLevel.toFixed(1)}x</span>
        <button type="button" onClick={onZoomIn}>+</button>
      </div>
      <div className="grid-scroll">
        <div
          ref={gridRef}
          className={`grid${isFocusing ? ' is-focusing' : ''}`}
          style={{
            gridTemplateColumns: `repeat(${gridCols}, ${cellWidth}px)`,
            gridTemplateRows: `repeat(${gridRows}, ${cellHeight}px)`,
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'center center'
          }}
        >
          {Array.from({ length: totalCells }).map((_, index) => {
            const cell = cellMap.get(index);
            return (
              <Cell
                key={index}
                imageData={cell?.imageData || null}
                onClick={() => onEmptyCellClick(index)}
                onFilledCellClick={(imageData, rect) => onFilledCellClick(index, imageData, rect)}
                cellWidth={cellWidth}
                cellHeight={cellHeight}
                isDefocused={isFocusing && index !== focusedCellIndex}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
