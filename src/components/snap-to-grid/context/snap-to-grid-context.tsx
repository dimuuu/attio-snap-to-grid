import { createContext, useCallback, useContext, useState } from "react";

import { CTA_POSITION } from "../constants";
import type { Element, ElementTitle, GridBounds, GridPosition } from "../types";
import { elementToBounds, getOverlappingArea } from "../utils";

interface SnapToGridContextValue {
  elementPositions: Record<string, GridBounds>;
  updateElementPosition: (
    title: ElementTitle | "cta",
    bounds: GridBounds
  ) => void;

  isDraggedElementColliding: boolean;
  overlappingAreas: Record<string, GridBounds>;
  checkForCollisions: (
    title: ElementTitle | "cta",
    nextBounds: GridBounds
  ) => boolean;

  draggedElement: Element | null;
  setDraggedElement: (element: Element | null) => void;
  nextDraggedElementGridPosition: GridPosition | null;
  setNextDraggedElementGridPosition: (position: GridPosition | null) => void;
}

const SnapToGridContext = createContext<SnapToGridContextValue | undefined>(
  undefined
);

export const SnapToGridContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [elementPositions, setElementPositions] = useState<
    Record<string, GridBounds>
  >({
    cta: elementToBounds(CTA_POSITION.position, CTA_POSITION.size),
  });

  const [isDraggedElementColliding, setIsDraggedElementColliding] =
    useState(false);
  const [overlappingAreas, setOverlappingAreas] = useState<
    Record<string, GridBounds>
  >({});

  const [draggedElement, setDraggedElement] = useState<Element | null>(null);
  const [nextDraggedElementGridPosition, setNextDraggedElementGridPosition] =
    useState<GridPosition | null>(null);

  const updateElementPosition = useCallback(
    (title: ElementTitle | "cta", bounds: GridBounds) => {
      setElementPositions((prev) => ({
        ...prev,
        [title]: bounds,
      }));
    },
    []
  );

  const checkForCollisions = useCallback(
    (title: ElementTitle | "cta", nextBounds: GridBounds): boolean => {
      const newOverlappingAreas: Record<string, GridBounds> = {};
      let isColliding = false;

      for (const [otherTitle, bounds] of Object.entries(elementPositions)) {
        if (otherTitle === title) {
          continue;
        }

        const overlap = getOverlappingArea(nextBounds, bounds);
        if (overlap) {
          isColliding = true;
          newOverlappingAreas[otherTitle] = overlap;
        }
      }

      setOverlappingAreas(newOverlappingAreas);
      setIsDraggedElementColliding(isColliding);

      return isColliding;
    },
    [elementPositions]
  );

  return (
    <SnapToGridContext.Provider
      value={{
        elementPositions,
        updateElementPosition,
        isDraggedElementColliding,
        overlappingAreas,
        checkForCollisions,
        draggedElement,
        setDraggedElement,
        nextDraggedElementGridPosition,
        setNextDraggedElementGridPosition,
      }}
    >
      {children}
    </SnapToGridContext.Provider>
  );
};

export const useSnapToGridContext = () => {
  const context = useContext(SnapToGridContext);
  if (!context) {
    throw new Error(
      "useSnapToGridContext must be used within a SnapToGridContextProvider"
    );
  }
  return context;
};
