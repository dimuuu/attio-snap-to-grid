# Attio Developers Platform Snap To Grid Component

## Step 1: Building a Grid and Placing Items

### Define Types

```typescript
// types.ts

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

export interface Element {
  title: string;
  position: GridPosition;
  size: GridSize;
}
```

### Create the Grid Component

The grid uses CSS Grid. We pass in column and row counts and generate a template.

```tsx
// grid.tsx

export function Grid({
  columns,
  rows,
  children,
}: {
  columns: number;
  rows: number;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
        aspectRatio: `${columns} / ${rows}`,
      }}
    >
      {children}
    </div>
  );
}
```

### Define Grid Configuration and Elements

```typescript
// constants.ts

export const GRID_SIZE = {
  rows: 13,
  columns: 24,
} as const;

export const ELEMENTS: readonly Element[] = [
  {
    title: "calendar",
    position: { row: 2, column: 3 },
    size: { rows: 4, columns: 4 },
  },
  {
    title: "dropdown",
    position: { row: 9, column: 3 },
    size: { rows: 3, columns: 4 },
  },
  // ... more elements
];
```

### Place Elements on the Grid

Elements are positioned using CSS Grid's `gridRowStart`, `gridColumnStart`, `gridRowEnd`, `gridColumnEnd` properties.

```tsx
// snap-to-grid.tsx

export const SnapToGrid = () => {
  return (
    <Grid columns={GRID_SIZE.columns} rows={GRID_SIZE.rows}>
      {ELEMENTS.map((element) => (
        <div
          key={element.title}
          style={{
            gridRowStart: element.position.row,
            gridColumnStart: element.position.column,
            gridRowEnd: element.position.row + element.size.rows,
            gridColumnEnd: element.position.column + element.size.columns,
          }}
        >
          {/* Element content */}
        </div>
      ))}
    </Grid>
  );
};
```

---

## Step 2: Making Elements Draggable

### Measure the Container

We need pixel dimensions of each cell to convert drag offsets to grid positions.

```tsx
const [containerRef, { width: containerWidth, height: containerHeight }] =
  useMeasure<HTMLDivElement>();

const cellWidth = containerWidth / GRID_SIZE.columns;
const cellHeight = containerHeight / GRID_SIZE.rows;
```

### Track Position in Two Coordinate Systems

We maintain a `syntheticGridPosition` (grid coordinates) for snapping logic, and use Motion's `useMotionValue` (pixel coordinates) for smooth animation.

```tsx
// Grid position for snapping logic
const [syntheticGridPosition, setSyntheticGridPosition] = useState<GridPosition>({
  row: initialPosition.row,
  column: initialPosition.column,
});

// Pixel offset for animation
const x = useMotionValue(0);
const y = useMotionValue(0);

// Spring for smooth movement
const easedX = useSpring(x, { stiffness: 280, damping: 15, mass: 0.1 });
const easedY = useSpring(y, { stiffness: 280, damping: 15, mass: 0.1 });
```

### Handle Drag Events

The `onPan` event from Motion provides an `offset` (how far the pointer moved from where the drag started). We convert this to grid cells.

```tsx
// Store pixel offset between drags
const latestPixelOffset = useRef({ x: 0, y: 0 });

const handleDrag = (info: PanInfo) => {
  // Convert pixel offset to grid position
  const offsetPosition = {
    row: syntheticGridPosition.row + Math.round(info.offset.y / cellHeight),
    column: syntheticGridPosition.column + Math.round(info.offset.x / cellWidth),
  };

  // Update pixel position for smooth following
  y.set(latestPixelOffset.current.y + info.offset.y);
  x.set(latestPixelOffset.current.x + info.offset.x);
};
```

The `latestPixelOffset` ref is necessary because `info.offset` resets to `(0, 0)` on each new drag. We accumulate the offset across multiple drags.

### Snap on Release

When drag ends, update the synthetic grid position. The spring animation handles the visual snap.

```tsx
const handleReposition = useCallback(() => {
  const newY = syntheticGridPosition.row * cellHeight - initialPosition.row * cellHeight;
  const newX = syntheticGridPosition.column * cellWidth - initialPosition.column * cellWidth;

  y.set(newY);
  x.set(newX);

  latestPixelOffset.current = { y: newY, x: newX };
}, [syntheticGridPosition, cellWidth, cellHeight, initialPosition]);

const handleRelease = () => {
  setSyntheticGridPosition(nextPosition);
};

useEffect(() => {
  handleReposition();
}, [handleReposition]);
```

### Render with Motion

```tsx
<motion.div
  onPan={(event, info) => handleDrag(info)}
  onPanEnd={handleRelease}
  style={{
    x: easedX,
    y: easedY,
    gridRowStart: element.position.row,
    gridColumnStart: element.position.column,
    gridRowEnd: element.position.row + element.size.rows,
    gridColumnEnd: element.position.column + element.size.columns,
  }}
>
  {children}
</motion.div>
```

---

## Step 3: Out of Bounds Placement Prevention

### Clamp Position Utility

Prevent elements from being dragged outside the grid boundaries.

```typescript
// utils.ts

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
```

### Apply Clamping During Drag

```tsx
const handleDrag = (info: PanInfo) => {
  const offsetPosition = {
    row: syntheticGridPosition.row + Math.round(info.offset.y / cellHeight),
    column: syntheticGridPosition.column + Math.round(info.offset.x / cellWidth),
  };

  // Clamp to grid boundaries
  const newGridPosition = clampPosition(offsetPosition, size, GRID_SIZE);

  y.set(latestPixelOffset.current.y + info.offset.y);
  x.set(latestPixelOffset.current.x + info.offset.x);
};
```

The element can still visually drag outside bounds (via pixel offset), but the computed grid position stays within limits. On release, it snaps to the clamped position.

---

## Step 4: Collision Detection

### Define GridBounds Type

```typescript
export interface GridBounds {
  rowStart: number;
  rowEnd: number;
  columnStart: number;
  columnEnd: number;
}
```

### Convert Element to Bounds

```typescript
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
```

### AABB Overlap Check

Two rectangles overlap if they are NOT separated on either axis.

```typescript
export function checkBoundsOverlap(a: GridBounds, b: GridBounds): boolean {
  const isSeparatedVertically = a.rowEnd <= b.rowStart || a.rowStart >= b.rowEnd;
  const isSeparatedHorizontally = a.columnEnd <= b.columnStart || a.columnStart >= b.columnEnd;

  return !(isSeparatedVertically || isSeparatedHorizontally);
}
```

### Calculate Overlapping Area

Returns the intersection of two bounds, or null if no overlap.

```typescript
export function getOverlappingArea(a: GridBounds, b: GridBounds): GridBounds | null {
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
```

### Track Element Positions in Context

```tsx
// context/snap-to-grid-context.tsx

const [elementPositions, setElementPositions] = useState<Record<string, GridBounds>>({});

const updateElementPosition = useCallback((title: string, bounds: GridBounds) => {
  setElementPositions((prev) => ({ ...prev, [title]: bounds }));
}, []);

const checkForCollisions = useCallback(
  (title: string, nextBounds: GridBounds): boolean => {
    let isColliding = false;

    for (const [otherTitle, bounds] of Object.entries(elementPositions)) {
      if (otherTitle === title) continue;

      const overlap = getOverlappingArea(nextBounds, bounds);
      if (overlap) {
        isColliding = true;
      }
    }

    return isColliding;
  },
  [elementPositions]
);
```

### Register Element Position on Mount and Update

```tsx
useEffect(() => {
  updateElementPosition(title, elementToBounds(syntheticGridPosition, size));
}, [syntheticGridPosition, size, title, updateElementPosition]);
```

### Prevent Placement on Collision

```tsx
const handleRelease = () => {
  const releasePosition = nextDraggedElementGridPosition ?? initialPosition;
  const isColliding = checkForCollisions(title, elementToBounds(releasePosition, size));

  if (isColliding) {
    // Snap back to previous valid position
    handleReposition();
  } else {
    // Accept new position
    setSyntheticGridPosition(releasePosition);
  }
};
```

---

## Step 5: Indicating Next Placement and Collisions Visually

### Track Drag State in Context

```tsx
const [draggedElement, setDraggedElement] = useState<Element | null>(null);
const [nextDraggedElementGridPosition, setNextDraggedElementGridPosition] =
  useState<GridPosition | null>(null);
const [isDraggedElementColliding, setIsDraggedElementColliding] = useState(false);
const [overlappingAreas, setOverlappingAreas] = useState<Record<string, GridBounds>>({});
```

### Update State During Drag

```tsx
const checkForCollisions = useCallback(
  (title: string, nextBounds: GridBounds): boolean => {
    const newOverlappingAreas: Record<string, GridBounds> = {};
    let isColliding = false;

    for (const [otherTitle, bounds] of Object.entries(elementPositions)) {
      if (otherTitle === title) continue;

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
```

### PlacementCell Component

Renders a preview outline at the next grid position and hatched overlays on collision areas.

```tsx
// components/placement-cell.tsx

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

  const borderColor = isDraggedElementColliding ? "border-red-500" : "border-gray-400";

  return (
    <div
      className="col-span-full row-span-full grid"
      style={{
        gridTemplateColumns: `repeat(${GRID_SIZE.columns}, 1fr)`,
        gridTemplateRows: `repeat(${GRID_SIZE.rows}, 1fr)`,
      }}
    >
      {/* Preview outline */}
      <div
        className={`border ${borderColor}`}
        style={{
          gridRowStart: nextDraggedElementGridPosition.row,
          gridColumnStart: nextDraggedElementGridPosition.column,
          gridRowEnd: nextDraggedElementGridPosition.row + draggedElement.size.rows,
          gridColumnEnd: nextDraggedElementGridPosition.column + draggedElement.size.columns,
        }}
      />

      {/* Collision overlays */}
      {Object.entries(overlappingAreas).map(([title, area]) => (
        <div
          key={title}
          className="bg-red-500/10"
          style={{
            gridRowStart: area.rowStart,
            gridColumnStart: area.columnStart,
            gridRowEnd: area.rowEnd,
            gridColumnEnd: area.columnEnd,
          }}
        >
          <Hatch />
        </div>
      ))}
    </div>
  );
};
```

### Update Drag Handlers

```tsx
const handleSelect = () => {
  setDraggedElement(element);
  setNextDraggedElementGridPosition(syntheticGridPosition);
};

const handleDrag = (info: PanInfo) => {
  const offsetPosition = {
    row: syntheticGridPosition.row + Math.round(info.offset.y / cellHeight),
    column: syntheticGridPosition.column + Math.round(info.offset.x / cellWidth),
  };

  const newGridPosition = clampPosition(offsetPosition, size, GRID_SIZE);

  y.set(latestPixelOffset.current.y + info.offset.y);
  x.set(latestPixelOffset.current.x + info.offset.x);

  checkForCollisions(title, elementToBounds(newGridPosition, size));
  setNextDraggedElementGridPosition(newGridPosition);
};

const handleRelease = () => {
  const releasePosition = nextDraggedElementGridPosition ?? initialPosition;
  const isColliding = checkForCollisions(title, elementToBounds(releasePosition, size));

  if (isColliding) {
    handleReposition();
  } else {
    setSyntheticGridPosition(releasePosition);
  }

  setDraggedElement(null);
  setNextDraggedElementGridPosition(null);
};
```

### Render PlacementCell in the Grid

```tsx
<Grid columns={GRID_SIZE.columns} rows={GRID_SIZE.rows}>
  <SnapToGridContextProvider>
    <PlacementCell />
    {ELEMENTS.map((element) => (
      <DraggableElement key={element.title} element={element} cellSize={cellSize}>
        {/* content */}
      </DraggableElement>
    ))}
  </SnapToGridContextProvider>
</Grid>
```
