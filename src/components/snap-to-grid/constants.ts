import type { Element } from "./types";

export const GRID_SIZE = {
  rows: 13,
  columns: 24,
} as const;

export const CTA_POSITION = {
  position: { row: 6, column: 9 },
  size: { rows: 3, columns: 8 },
} as const;

export const ELEMENTS: readonly Element[] = [
  {
    title: "calendar",
    position: { row: 2, column: 3 },
    size: { rows: 4, columns: 4 },
  },
  {
    title: "select",
    position: { row: 3, column: 18 },
    size: { rows: 3, columns: 5 },
  },
  {
    title: "dropdown",
    position: { row: 9, column: 3 },
    size: { rows: 3, columns: 4 },
  },
  {
    title: "input",
    position: { row: 2, column: 8 },
    size: { rows: 1, columns: 3 },
  },
  {
    title: "labels",
    position: { row: 9, column: 18 },
    size: { rows: 2, columns: 5 },
  },
  {
    title: "user-avatar",
    position: { row: 10, column: 9 },
    size: { rows: 1, columns: 1 },
  },
  {
    title: "avatar",
    position: { row: 10, column: 10 },
    size: { rows: 1, columns: 1 },
  },
  {
    title: "app-avatar",
    position: { row: 10, column: 11 },
    size: { rows: 1, columns: 1 },
  },
  {
    title: "checkboxes",
    position: { row: 7, column: 19 },
    size: { rows: 1, columns: 2 },
  },
  {
    title: "button",
    position: { row: 11, column: 15 },
    size: { rows: 1, columns: 2 },
  },
] as const;
