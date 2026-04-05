import { useMemo, useState, useEffect } from "react";
import Cell from "./Cell";

export default function Grid({
  cells,
  gridCols,
  gridRows,
  zoomLevel,
  focusedCellIndex,
  onEmptyCellClick,
  onFilledCellClick,
  onClose,
  gridRef,
  onZoomIn,
  onZoomOut,
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

  const isFocusing =
    focusedCellIndex !== null && focusedCellIndex !== undefined;
  const [delayedFocus, setDelayedFocus] = useState(false);

  useEffect(() => {
    if (isFocusing) {
      const timer = setTimeout(() => {
        setDelayedFocus(true);
      }, 540); // slightly more than the 540ms move-out
      return () => clearTimeout(timer);
    }
    setDelayedFocus(false);
  }, [isFocusing]);

  const transformStyle = useMemo(() => {
    if (!delayedFocus || focusedCellIndex === null) {
      return { transform: `scale(${zoomLevel})` };
    }

    const col = focusedCellIndex % gridCols;
    const row = Math.floor(focusedCellIndex / gridCols);
    const cellCenterX = (col + 0.5) * cellWidth;
    const cellCenterY = (row + 0.5) * cellHeight;
    const gridCenterX = (gridCols * cellWidth) / 2;
    const gridCenterY = (gridRows * cellHeight) / 2;

    const dx = gridCenterX - cellCenterX;
    const dy = gridCenterY - cellCenterY;
    const s = zoomLevel * 4;

    return {
      transform: `scale(${s}) translate(${dx}px, ${dy}px)`,
    };
  }, [
    delayedFocus,
    focusedCellIndex,
    zoomLevel,
    gridCols,
    gridRows,
    cellWidth,
    cellHeight,
  ]);

  return (
    <div className="grid-shell">
      <div className="zoom-controls">
        <button type="button" onClick={onZoomOut}>
          -
        </button>
        <span>{zoomLevel.toFixed(1)}x</span>
        <button type="button" onClick={onZoomIn}>
          +
        </button>
      </div>
      <div className="grid-scroll" onClick={onClose}>
        <div
          ref={gridRef}
          className={`grid${isFocusing ? " is-focusing" : ""}`}
          onClick={(e) => isFocusing && e.stopPropagation()}
          style={{
            gridTemplateColumns: `repeat(${gridCols}, ${cellWidth}px)`,
            gridTemplateRows: `repeat(${gridRows}, ${cellHeight}px)`,
            ...transformStyle,
            transformOrigin: "center center",
          }}
        >
          {Array.from({ length: totalCells }).map((_, index) => {
            const cell = cellMap.get(index);
            return (
              <Cell
                key={index}
                imageData={cell?.imageData || null}
                onClick={() => onEmptyCellClick(index)}
                onFilledCellClick={(imageData, rect) =>
                  onFilledCellClick(index, imageData, rect)
                }
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
