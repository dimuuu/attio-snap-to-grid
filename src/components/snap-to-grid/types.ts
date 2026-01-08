export interface GridPosition {
  row: number;
  column: number;
}

export interface GridSize {
  rows: number;
  columns: number;
}

export interface CellSize {
  width: number;
  height: number;
}

export interface GridBounds {
  rowStart: number;
  rowEnd: number;
  columnStart: number;
  columnEnd: number;
}

export type ElementTitle =
  | "calendar"
  | "dropdown"
  | "input"
  | "user-avatar"
  | "app-avatar"
  | "avatar"
  | "button"
  | "select"
  | "checkboxes"
  | "toggles"
  | "labels";

export interface Element {
  title: ElementTitle;
  position: GridPosition;
  size: GridSize;
}
