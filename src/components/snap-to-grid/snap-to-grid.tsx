"use client";

import { useMeasure } from "react-use";

import { Cell, Grid } from "../grid";
import { DraggableElement } from "./components/draggable-element";
import { PlacementCell } from "./components/placement-cell";
import { CTA_POSITION, GRID_SIZE, PREFOOTER_ELEMENTS } from "./constants";
import { SnapToGridContextProvider } from "./context/snap-to-grid-context";

export const SnapToGrid = () => {
  const [containerRef, { width: containerWidth, height: containerHeight }] =
    useMeasure<HTMLDivElement>();

  const cellWidth = containerWidth / GRID_SIZE.columns;
  const cellHeight = containerHeight / GRID_SIZE.rows;

  const cellSize = { width: cellWidth, height: cellHeight };
  const hasMeasured = containerWidth > 0 && containerHeight > 0;

  return (
    <div
      className="container mx-auto mt-20 border border-neutral-200"
      ref={containerRef}
    >
      <Grid
        className="relative"
        columns={GRID_SIZE.columns}
        rows={GRID_SIZE.rows}
      >
        <Cell
          style={{
            gridRowStart: CTA_POSITION.position.row,
            gridRowEnd: CTA_POSITION.position.row + CTA_POSITION.size.rows,
            gridColumnStart: CTA_POSITION.position.column,
            gridColumnEnd:
              CTA_POSITION.position.column + CTA_POSITION.size.columns,
          }}
        />
        <SnapToGridContextProvider>
          <PlacementCell />
          {hasMeasured &&
            PREFOOTER_ELEMENTS.map((element) => (
              <DraggableElement
                cellSize={cellSize}
                className="size-full"
                element={element}
                key={element.title}
                style={{
                  gridRowStart: element.position.row,
                  gridColumnStart: element.position.column,
                  gridRowEnd: element.position.row + element.size.rows,
                  gridColumnEnd: element.position.column + element.size.columns,
                }}
              >
                <div className="size-full p-1">
                  <div className="relative flex size-full items-center justify-center rounded-lg border border-neutral-300 bg-neutral-100" />
                </div>
              </DraggableElement>
            ))}
        </SnapToGridContextProvider>
      </Grid>
    </div>
  );
};
