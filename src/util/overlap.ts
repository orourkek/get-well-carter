import { GameObjects, Geom } from 'phaser';

export function getOverlap(
  r1: Geom.Rectangle,
  r2: Geom.Rectangle,
): Geom.Rectangle | null {

  const x = Math.max(r1.x, r2.x);
  const xx = Math.min(r1.x + r1.width, r2.x + r2.width);

  if (xx < x) {
    return null;
  }

  const y = Math.max(r1.y, r2.y);
  const yy = Math.min(r1.y + r1.height, r2.y + r2.height);

  if (yy < y) {
    return null;
  }

  return new Geom.Rectangle(
    x,
    y,
    xx - x,
    yy - y,
  );
}

export function getOverlapArea(
  r1: Geom.Rectangle,
  r2: Geom.Rectangle,
): number {
  const overlap = getOverlap(r1, r2);
  return overlap ? Geom.Rectangle.Area(overlap) : 0;
}

export function checkOverlap(
  obj1: GameObjects.Components.GetBounds,
  obj2: GameObjects.Components.GetBounds,
) {
  const obj1Bounds = obj1.getBounds();
  const obj2Bounds = obj2.getBounds();
  const overlap = getOverlap(obj1Bounds, obj2Bounds);

  if (!overlap) {
    return;
  }

  const overlapArea = overlap.width * overlap.height;
  const obj1MaxDim = Math.max(obj1Bounds.height, obj1Bounds.width);
  const obj2MaxDim = Math.max(obj2Bounds.height, obj2Bounds.width);
  const minOverlap = ((obj1MaxDim * 1/8) * (obj2MaxDim * 1/8));
  const minDimensions = Math.min((obj1MaxDim * 1/8), (obj2MaxDim * 1/8));

  if (overlapArea > minOverlap) {
    if (overlap.width > minDimensions && overlap.height > minDimensions) {
      return true;
    }
  }
  return false;
}
