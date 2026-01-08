import { cn } from "../../../lib/utils";
import { Cell, Vertex } from "../../grid";
import { Hatch } from "../../hatch";
import { GRID_SIZE } from "../constants";
import { useSnapToGridContext } from "../context/snap-to-grid-context";

export const PlacementCell = () => {
  const {
    draggedElement,
    nextDraggedElementGridPosition,
    isDraggedElementColliding,
    overlappingAreas,
  } = useSnapToGridContext();

  if (!(draggedElement && nextDraggedElementGridPosition)) {
    return null;
  }

  const vertexColor = isDraggedElementColliding ? "bg-red-500" : "bg-gray-400";
  const borderColor = isDraggedElementColliding
    ? "border-red-500"
    : "border-gray-400";

  return (
    <div
      className="relative col-span-full row-span-full grid size-full"
      style={{
        gridTemplateColumns: `repeat(${GRID_SIZE.columns}, 1fr)`,
        gridTemplateRows: `repeat(${GRID_SIZE.rows}, 1fr)`,
      }}
    >
      <Cell
        className={cn(
          "relative isolate z-20 border bg-transparent",
          borderColor
        )}
        showBorders={false}
        showVertices={false}
        style={{
          gridRowStart: nextDraggedElementGridPosition.row,
          gridColumnStart: nextDraggedElementGridPosition.column,
          gridRowEnd:
            nextDraggedElementGridPosition.row + draggedElement.size.rows,
          gridColumnEnd:
            nextDraggedElementGridPosition.column + draggedElement.size.columns,
        }}
      >
        <Vertex className={vertexColor} column={1} row={1} />
        <Vertex className={vertexColor} column={1} row={-1} />
        <Vertex className={vertexColor} column={-1} row={1} />
        <Vertex className={vertexColor} column={-1} row={-1} />
      </Cell>
      {Object.entries(overlappingAreas).map(
        ([overlappingElementTitle, overlappingArea]) => (
          <div
            className="relative isolate z-20"
            key={overlappingElementTitle}
            style={{
              gridRowStart: overlappingArea.rowStart,
              gridColumnStart: overlappingArea.columnStart,
              gridRowEnd: overlappingArea.rowEnd,
              gridColumnEnd: overlappingArea.columnEnd,
            }}
          >
            <Hatch className="absolute inset-0 bg-red-500/10 text-red-500/40" />
          </div>
        )
      )}
    </div>
  );
};
