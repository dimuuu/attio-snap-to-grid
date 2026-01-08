import type { GridBounds, GridPosition, GridSize } from "./types";

export function elementToBounds(
  position: GridPosition,
  size: GridSize
): GridBounds {
  return {
    rowStart: position.row,
    rowEnd: position.row + size.rows,
    columnStart: position.column,
    columnEnd: position.column + size.columns,
  };
}

export function checkBoundsOverlap(a: GridBounds, b: GridBounds): boolean {
  const isSeparatedVertically =
    a.rowEnd <= b.rowStart || a.rowStart >= b.rowEnd;
  const isSeparatedHorizontally =
    a.columnEnd <= b.columnStart || a.columnStart >= b.columnEnd;

  return !(isSeparatedVertically || isSeparatedHorizontally);
}

export function getOverlappingArea(
  a: GridBounds,
  b: GridBounds
): GridBounds | null {
  if (!checkBoundsOverlap(a, b)) {
    return null;
  }

  return {
    rowStart: Math.max(a.rowStart, b.rowStart),
    rowEnd: Math.min(a.rowEnd, b.rowEnd),
    columnStart: Math.max(a.columnStart, b.columnStart),
    columnEnd: Math.min(a.columnEnd, b.columnEnd),
  };
}

export function clampPosition(
  position: GridPosition,
  elementSize: GridSize,
  gridSize: GridSize
): GridPosition {
  return {
    row: Math.min(
      gridSize.rows - elementSize.rows + 1,
      Math.max(1, position.row)
    ),
    column: Math.min(
      gridSize.columns - elementSize.columns + 1,
      Math.max(1, position.column)
    ),
  };
}
