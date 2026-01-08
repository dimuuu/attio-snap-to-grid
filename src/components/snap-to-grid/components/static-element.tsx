import { motion, useMotionValue, useTransform } from "motion/react";
import { useEffect } from "react";

import { cn } from "../../../lib/utils";
import { useSnapToGridContext } from "../context/snap-to-grid-context";
import type { ElementTitle } from "../types";

export const StaticElement = ({
  children,
  title,
  className,
  movementSpeed,
}: {
  title: ElementTitle;
  movementSpeed: { x: number; y: number };
} & React.ComponentProps<"div">) => {
  const speedX = useMotionValue(0);
  const speedY = useMotionValue(0);

  const { draggedElement } = useSnapToGridContext();

  const rotateX = useTransform(speedY, [-1000, 1000], [-20, 20]);
  const rotateY = useTransform(speedX, [-1000, 1000], [20, -20]);

  useEffect(() => {
    const cappedSpeedX = Math.min(Math.max(movementSpeed.x, -1000), 1000);
    const cappedSpeedY = Math.min(Math.max(movementSpeed.y, -1000), 1000);

    speedX.set(cappedSpeedX);
    speedY.set(cappedSpeedY);
  }, [movementSpeed, speedX, speedY]);

  return (
    <div
      className={cn("perspective-midrange relative size-full", {
        group: !draggedElement || draggedElement.title === title,
      })}
    >
      <motion.div
        className={cn("size-full", className)}
        style={{
          rotateX,
          rotateY,
        }}
      >
        {children}
      </motion.div>
      <div
        className={cn(
          "pointer-events-none absolute inset-0 bg-primary-background",
          "opacity-0 mix-blend-plus-lighter transition-opacity duration-150 ease-in-out group-hover:opacity-20 group-active:opacity-0"
        )}
      />
    </div>
  );
};
