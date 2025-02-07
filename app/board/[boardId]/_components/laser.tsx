import React from 'react';
import { getSvgPathFromStroke } from "@/lib/utils";
import getStroke from "perfect-freehand";

type LaserPointerProps = {
  points: number[][];
  visible: boolean;
};

const LaserPointer: React.FC<LaserPointerProps> = ({ points, visible }) => {
  if (!visible || points.length === 0) return null; // Don't render if not visible or no points
  const pathData = getSvgPathFromStroke(
    getStroke(points, {
      size: 6,
      thinning: 1.5,
      smoothing: 0.5,
      streamline: 0.5,
    })
  );

  return (
    <path
      d={pathData}
      fill="red"
      stroke="red"
      strokeWidth={2}
      className="drop-shadow-glow"
    />
  );
};

export default LaserPointer;
