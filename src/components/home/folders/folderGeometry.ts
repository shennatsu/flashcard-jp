export const DRAG_THRESHOLD_PX = 8;

export type Point = {
  x: number;
  y: number;
};

export type NormalizedPoint = {
  x: number;
  y: number;
};

export type PositionBounds = {
  maxX: number;
  maxY: number;
};

const clampUnit = (value: number) => Math.min(1, Math.max(0, value));
const clampNonNegative = (value: number) => Math.max(0, value);

export function isPastDragThreshold(
  offset: Point,
  threshold = DRAG_THRESHOLD_PX,
): boolean {
  if (!Number.isFinite(offset.x) || !Number.isFinite(offset.y) || threshold < 0) {
    return false;
  }

  return Math.hypot(offset.x, offset.y) >= threshold;
}

export function clampPosition(point: Point, bounds: PositionBounds): Point {
  return {
    x: Math.min(clampNonNegative(bounds.maxX), Math.max(0, point.x)),
    y: Math.min(clampNonNegative(bounds.maxY), Math.max(0, point.y)),
  };
}

export function normalizedToPosition(
  point: NormalizedPoint,
  bounds: PositionBounds,
): Point {
  const safeBounds = {
    maxX: clampNonNegative(bounds.maxX),
    maxY: clampNonNegative(bounds.maxY),
  };

  return {
    x: clampUnit(point.x) * safeBounds.maxX,
    y: clampUnit(point.y) * safeBounds.maxY,
  };
}

export function positionToNormalized(
  point: Point,
  bounds: PositionBounds,
): NormalizedPoint {
  const safeBounds = {
    maxX: clampNonNegative(bounds.maxX),
    maxY: clampNonNegative(bounds.maxY),
  };
  const safePoint = clampPosition(point, safeBounds);

  return {
    x: safeBounds.maxX === 0 ? 0 : safePoint.x / safeBounds.maxX,
    y: safeBounds.maxY === 0 ? 0 : safePoint.y / safeBounds.maxY,
  };
}

export function updatePositionFromOffset(
  basePosition: Point,
  offset: Point,
  bounds: PositionBounds,
): Point {
  return clampPosition(
    { x: basePosition.x + offset.x, y: basePosition.y + offset.y },
    bounds,
  );
}
