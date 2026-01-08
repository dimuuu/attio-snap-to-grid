import { motion, type PanInfo, useMotionValue, useSpring } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "../../../lib/utils";
import { GRID_SIZE } from "../constants";
import { useSnapToGridContext } from "../context/snap-to-grid-context";
import type { CellSize, Element, GridPosition } from "../types";
import { clampPosition, elementToBounds } from "../utils";
import { StaticElement } from "./static-element";

export const DraggableElement = ({
  children,
  element,
  cellSize,
  className,
  style,
}: {
  element: Element;
  cellSize: CellSize;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}) => {
  const {
    setDraggedElement,
    draggedElement,
    nextDraggedElementGridPosition,
    setNextDraggedElementGridPosition,
    updateElementPosition,
    checkForCollisions,
  } = useSnapToGridContext();

  const { width: cellWidth, height: cellHeight } = cellSize;
  const { title, position: initialPosition, size } = element;

  // Represent element position on the grid
  // Not used to actually position the element on the grid
  // We position the element with x and y translate
  // But we want to keep track of row and column for snapping to grid
  const [syntheticGridPosition, setSyntheticGridPosition] =
    useState<GridPosition>({
      row: initialPosition.row,
      column: initialPosition.column,
    });

  const isDragging = useRef(false);

  // Every time we drag the element, we calculate its position via offset value coming from event
  // But offset value is relative to initial position of the element
  // Meaning every time we drag it, it's going to reset
  // So we store the latest pixel offset to be able to add it to the initial position of the element
  const latestPixelOffset = useRef({ x: 0, y: 0 });

  const [movementSpeed, setMovementSpeed] = useState({ x: 0, y: 0 });

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const easedY = useSpring(y, {
    stiffness: 280,
    damping: 15,
    mass: 0.1,
  });
  const easedX = useSpring(x, {
    stiffness: 280,
    damping: 15,
    mass: 0.1,
  });

  const handleReposition = useCallback(() => {
    const newY =
      syntheticGridPosition.row * cellHeight - initialPosition.row * cellHeight;
    const newX =
      syntheticGridPosition.column * cellWidth -
      initialPosition.column * cellWidth;

    y.set(newY);
    x.set(newX);

    latestPixelOffset.current = { y: newY, x: newX };

    updateElementPosition(title, elementToBounds(syntheticGridPosition, size));
  }, [
    cellWidth,
    cellHeight,
    syntheticGridPosition,
    initialPosition.row,
    initialPosition.column,
    size,
    title,
    x,
    y,
    updateElementPosition,
  ]);

  useEffect(() => {
    handleReposition();
  }, [handleReposition]);

  const handleDrag = (info: PanInfo) => {
    const offsetPosition = {
      row: syntheticGridPosition.row + Math.round(info.offset.y / cellHeight),
      column:
        syntheticGridPosition.column + Math.round(info.offset.x / cellWidth),
    };

    const newGridPosition = clampPosition(offsetPosition, size, GRID_SIZE);

    setMovementSpeed({
      x: info.velocity.x,
      y: info.velocity.y,
    });

    y.set(latestPixelOffset.current.y + info.offset.y);
    x.set(latestPixelOffset.current.x + info.offset.x);

    checkForCollisions(title, elementToBounds(newGridPosition, size));
    setNextDraggedElementGridPosition(newGridPosition);
  };

  const handleSelect = () => {
    checkForCollisions(title, elementToBounds(syntheticGridPosition, size));
    setDraggedElement(element);
    setNextDraggedElementGridPosition(syntheticGridPosition);
    isDragging.current = true;
  };

  const handleRelease = () => {
    if (!isDragging.current) {
      return;
    }

    isDragging.current = false;

    const releasePosition = nextDraggedElementGridPosition ?? initialPosition;
    const isColliding = checkForCollisions(
      title,
      elementToBounds(releasePosition, size)
    );

    if (isColliding) {
      handleReposition();
    } else {
      setSyntheticGridPosition(releasePosition);
    }

    setMovementSpeed({ x: 0, y: 0 });
    setDraggedElement(null);
    setNextDraggedElementGridPosition(null);
  };

  return (
    <motion.div
      className={cn(
        "relative isolate z-10 cursor-grab active:cursor-grabbing",
        draggedElement?.title === title && "z-90",
        className
      )}
      layout
      onMouseDown={handleSelect}
      onMouseUp={handleRelease}
      onPan={(event, info) => {
        event.preventDefault();
        event.stopPropagation();
        handleDrag(info);
      }}
      onPanEnd={handleRelease}
      onTouchEnd={handleRelease}
      onTouchStart={handleSelect}
      style={{
        ...style,
        y: easedY,
        x: easedX,
        touchAction: "none",
      }}
    >
      <StaticElement movementSpeed={movementSpeed} title={title}>
        {children}
      </StaticElement>
    </motion.div>
  );
};
