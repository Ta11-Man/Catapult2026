import { useEffect, useMemo, useRef } from 'react';
import Cell from './Cell';
import { MAX_ZOOM, MIN_ZOOM } from '../hooks/useGrid';

const ZOOM_SPEED = 0.001;
const DRAG_THRESHOLD_PX = 5;

export default function Grid({ cells, gridCols, gridRows, zoomLevel, panOffset, setZoomLevel, setPanOffset, onEmptyCellClick, gridRef }) {
  const containerRef = useRef(null);
  const zoomLevelRef = useRef(zoomLevel);
  const panOffsetRef = useRef(panOffset);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const panStartRef = useRef({ x: 0, y: 0 });
  const didDragRef = useRef(false);

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

  useEffect(() => {
    zoomLevelRef.current = zoomLevel;
  }, [zoomLevel]);

  useEffect(() => {
    panOffsetRef.current = panOffset;
  }, [panOffset]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const handleWheel = (event) => {
      event.preventDefault();

      const currentZoom = zoomLevelRef.current;
      const { x: panX, y: panY } = panOffsetRef.current;
      const newZoom = Math.min(
        MAX_ZOOM,
        Math.max(MIN_ZOOM, currentZoom * (1 - event.deltaY * ZOOM_SPEED))
      );

      const rect = container.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;
      const scaleDiff = newZoom / currentZoom;
      const newPanX = mouseX - scaleDiff * (mouseX - panX);
      const newPanY = mouseY - scaleDiff * (mouseY - panY);

      const nextPan = { x: newPanX, y: newPanY };
      zoomLevelRef.current = newZoom;
      panOffsetRef.current = nextPan;
      setZoomLevel(newZoom);
      setPanOffset(nextPan);
    };

    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [setPanOffset, setZoomLevel]);

  const handleMouseDown = (event) => {
    isDraggingRef.current = true;
    didDragRef.current = false;
    dragStartRef.current = { x: event.clientX, y: event.clientY };
    panStartRef.current = { ...panOffsetRef.current };
  };

  const handleMouseMove = (event) => {
    if (!isDraggingRef.current) {
      return;
    }

    const deltaX = event.clientX - dragStartRef.current.x;
    const deltaY = event.clientY - dragStartRef.current.y;
    const nextPan = {
      x: panStartRef.current.x + deltaX,
      y: panStartRef.current.y + deltaY
    };

    const dragDistance = Math.hypot(deltaX, deltaY);
    didDragRef.current = dragDistance > DRAG_THRESHOLD_PX;
    panOffsetRef.current = nextPan;
    setPanOffset(nextPan);
  };

  const handleStopDrag = () => {
    isDraggingRef.current = false;
  };

  const handleCellClick = (index) => {
    if (didDragRef.current) {
      return;
    }
    onEmptyCellClick(index);
  };

  return (
    <div className="grid-shell">
      <div
        ref={containerRef}
        className="grid-scroll"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleStopDrag}
        onMouseLeave={handleStopDrag}
      >
        <div
          ref={gridRef}
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${gridCols}, ${cellWidth}px)`,
            gridTemplateRows: `repeat(${gridRows}, ${cellHeight}px)`,
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
            transformOrigin: '0 0'
          }}
        >
          {Array.from({ length: totalCells }).map((_, index) => {
            const cell = cellMap.get(index);
            return (
              <Cell
                key={index}
                imageData={cell?.imageData || null}
                onClick={() => handleCellClick(index)}
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

