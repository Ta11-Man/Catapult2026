import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchCells } from '../api/client';

export const BASE_BETA = 3;
export const SCALE_FACTOR = 0.5;

const COLS_UNIT = 16;
const ROWS_UNIT = 9;

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
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const { gridCols, gridRows } = useMemo(() => computeGridDimensions(cells.length), [cells.length]);
  const beta = useMemo(() => BASE_BETA + cells.length * SCALE_FACTOR, [cells.length]);

  const addCell = useCallback((cell) => {
    setCells((prev) => [...prev, cell]);
  }, []);

  const zoomIn = useCallback(() => {
    setZoomLevel((prev) => Math.min(3.0, Number((prev + 0.2).toFixed(1))));
  }, []);

  const zoomOut = useCallback(() => {
    setZoomLevel((prev) => Math.max(0.4, Number((prev - 0.2).toFixed(1))));
  }, []);

  const latestCreatedAt = cells.length ? cells[cells.length - 1].createdAt : null;

  return {
    cells,
    gridCols,
    gridRows,
    zoomLevel,
    beta,
    latestCreatedAt,
    addCell,
    zoomIn,
    zoomOut,
    setZoomLevel
  };
}

