import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { fetchCells } from '../api/client';

export const BASE_BETA = 3;
export const SCALE_FACTOR = 0.5;
export const MIN_ZOOM = 0.2;
export const MAX_ZOOM = 3;

const COLS_UNIT = 16;
const ROWS_UNIT = 9;
const INITIAL_FIT_MARGIN = 64;
const BOTTOM_STATUS_RESERVE = 72;
const INITIAL_FIT_SAFETY_SCALE = 0.959;

function computeGridDimensions(cellCount) {
  let n = 1;
  while (cellCount >= n * COLS_UNIT * n * ROWS_UNIT * 0.75) {
    n *= 2;
  }
  return { gridCols: n * COLS_UNIT, gridRows: n * ROWS_UNIT };
}

export function useGrid() {
  const [cells, setCells] = useState([]);
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const hasFetchedCellsRef = useRef(false);
  const hasAppliedInitialFitRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    fetchCells()
      .then((fetched) => {
        if (isMounted) {
          setCells(fetched);
        }
      })
      .catch(() => {
        if (isMounted) {
          setCells([]);
        }
      })
      .finally(() => {
        if (isMounted) {
          hasFetchedCellsRef.current = true;
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const { gridCols, gridRows } = useMemo(() => computeGridDimensions(cells.length), [cells.length]);
  const beta = useMemo(() => BASE_BETA + cells.length * SCALE_FACTOR, [cells.length]);

  useEffect(() => {
    if (hasAppliedInitialFitRef.current || !hasFetchedCellsRef.current) {
      return;
    }

    const cellWidth = Math.floor((window.innerWidth - 32) / gridCols);
    const cellHeight = Math.floor((window.innerHeight - 32) / gridRows);
    const totalGridWidth = cellWidth * gridCols;
    const totalGridHeight = cellHeight * gridRows;

    if (totalGridWidth <= 0 || totalGridHeight <= 0) {
      return;
    }

    const availableW = Math.max(1, window.innerWidth - INITIAL_FIT_MARGIN);
    const availableH = Math.max(1, window.innerHeight - BOTTOM_STATUS_RESERVE - INITIAL_FIT_MARGIN);
    const fitZoom = Math.min(availableW / totalGridWidth, availableH / totalGridHeight, 1);
    // Leave a tiny safety buffer so edges are not clipped on first paint.
    const clamped = Math.max(MIN_ZOOM, Number((fitZoom * INITIAL_FIT_SAFETY_SCALE).toFixed(2)));

    setZoomLevel(clamped);
    hasAppliedInitialFitRef.current = true;
  }, [gridCols, gridRows]);

  const addCell = useCallback((cell) => {
    setCells((prev) => [...prev, cell]);
  }, []);

  const zoomIn = useCallback(() => {
    setZoomLevel((prev) => Math.min(MAX_ZOOM, Number((prev + 0.2).toFixed(1))));
  }, []);

  const zoomOut = useCallback(() => {
    setZoomLevel((prev) => Math.max(MIN_ZOOM, Number((prev - 0.2).toFixed(1))));
  }, []);

  const latestCreatedAt = cells.length ? cells[cells.length - 1].createdAt : null;

  return {
    cells,
    gridCols,
    gridRows,
    zoomLevel,
    panOffset,
    beta,
    latestCreatedAt,
    addCell,
    zoomIn,
    zoomOut,
    setZoomLevel,
    setPanOffset
  };
}
