import { cn } from "../lib/utils";

export const Line = ({
  vertical = false,
  dashed = false,
  className,
  ...props
}: { vertical?: boolean; dashed?: boolean } & React.ComponentProps<"svg">) => {
  return (
    <svg
      className={cn("text-neutral-200", className)}
      height={vertical ? "100%" : "1"}
      width={vertical ? "1" : "100%"}
      {...props}
    >
      <title>Line</title>
      <line
        stroke="currentColor"
        strokeDasharray={dashed ? "4 6" : undefined}
        strokeLinecap="round"
        x1={vertical ? "0.5" : "0"}
        x2={vertical ? "0.5" : "100%"}
        y1={vertical ? "0" : "0.5"}
        y2={vertical ? "100%" : "0.5"}
      />
    </svg>
  );
};

export function Grid({
  columns,
  rows,
  children,
  className,
  ...props
}: {
  columns: number;
  rows: number;
} & React.ComponentProps<"div">) {
  return (
    <div
      className={cn("relative grid w-full items-center", className)}
      style={{
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
        aspectRatio: `${columns} / ${rows}`,
      }}
      {...props}
    >
      <Guides columns={columns} rows={rows} />
      {children}
    </div>
  );
}

export function GridLine({
  column,
  row,
  dashed,
  className,
  style,
  ...props
}: ({ column: number; row?: never } | { row: number; column?: never }) & {
  dashed?: boolean;
} & React.ComponentProps<"svg">) {
  return (
    <Line
      className={cn(
        "absolute text-neutral-200",
        { "inset-y-0 left-0 col-span-full -translate-x-1/2": !!column },
        { "inset-x-0 top-0 row-span-full -translate-y-1/2": !!row },
        className
      )}
      dashed={dashed}
      style={{
        gridColumn: column,
        gridRow: row,
        ...style,
      }}
      vertical={!!column}
      {...props}
    />
  );
}

export function Guides({
  columns,
  rows,
  className,
  ...props
}: {
  columns: number;
  rows: number;
} & React.ComponentProps<"div">) {
  const verticalLinesCount = columns - 1;
  const horizontalLinesCount = rows - 1;

  return (
    <div
      className={cn("absolute inset-0 *:*:text-neutral-200", className)}
      {...props}
    >
      <div className="absolute inset-x-[0.5px] inset-y-0 flex justify-evenly">
        {Array.from({ length: verticalLinesCount }).map((_, index) => {
          return (
            <Line
              dashed
              key={`vertical-line-${
                // biome-ignore lint/suspicious/noArrayIndexKey: this is safe to use in this context
                index
              }`}
              vertical
            />
          );
        })}
      </div>
      <div className="absolute inset-x-0 inset-y-[0.5px] flex flex-col justify-evenly">
        {Array.from({ length: horizontalLinesCount }).map((_, index) => {
          return (
            <Line
              dashed
              key={`horizontal-line-${
                // biome-ignore lint/suspicious/noArrayIndexKey: this is safe to use in this context
                index
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}

export function Vertex({
  column,
  row,
  className,
  style,
  ...props
}: { column: number; row: number } & React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "absolute top-0 left-0 size-1 -translate-x-1/2 -translate-y-1/2 bg-neutral-400",
        className
      )}
      style={{
        gridColumn: column,
        gridRow: row,
        ...style,
      }}
      {...props}
    />
  );
}

export function Cell({
  showBorders = true,
  showVertices = true,
  className,
  children,
  ...props
}: {
  showBorders?: boolean;
  showVertices?: boolean;
} & React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "absolute inset-0 grid grid-cols-1 grid-rows-1 bg-white",
        className
      )}
      {...props}
    >
      {children}
      {showBorders && (
        <>
          <GridLine row={1} />
          <GridLine row={-1} />
          <GridLine column={1} />
          <GridLine column={-1} />
        </>
      )}
      {showVertices && (
        <>
          <Vertex column={1} row={1} />
          <Vertex column={1} row={-1} />
          <Vertex column={-1} row={1} />
          <Vertex column={-1} row={-1} />
        </>
      )}
    </div>
  );
}
