export const CARD_W = 110;
export const CARD_H = 44;

const GAP = 8;
const ITERS = 80;
const STRENGTH = 0.6;

const ANCHORS: [number, number][] = [
  [GAP, -(CARD_H + GAP)],
  [-(CARD_W + GAP), -(CARD_H + GAP)],
  [GAP, GAP],
  [-(CARD_W + GAP), GAP],
  [GAP, -(CARD_H / 2)],
  [-(CARD_W + GAP), -(CARD_H / 2)],
  [-(CARD_W / 2), -(CARD_H + GAP)],
  [-(CARD_W / 2), GAP],
];

function overlaps(ax: number, ay: number, bx: number, by: number, gap: number): boolean {
  return (
    ax < bx + CARD_W + gap &&
    ax + CARD_W + gap > bx &&
    ay < by + CARD_H + gap &&
    ay + CARD_H + gap > by
  );
}

// Returns [dx, dy] offsets relative to each pin
export function placeLabels(pins: [number, number][]): [number, number][] {
  if (pins.length === 0) return [];

  // Pass 1: greedy anchor — pick first anchor where no pin falls inside the card
  const positions: [number, number][] = pins.map((pin) => {
    const [px, py] = pin;
    for (const [dx, dy] of ANCHORS) {
      const lx = px + dx, ly = py + dy;
      const pinInside = pins.some(
        ([qx, qy]) => qx > lx && qx < lx + CARD_W && qy > ly && qy < ly + CARD_H
      );
      if (!pinInside) return [lx, ly];
    }
    return [px + ANCHORS[0][0], py + ANCHORS[0][1]];
  });

  // Pass 2: iterative PBD separation
  for (let iter = 0; iter < ITERS; iter++) {
    let anyOverlap = false;

    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const [ax, ay] = positions[i];
        const [bx, by] = positions[j];
        if (!overlaps(ax, ay, bx, by, GAP)) continue;
        anyOverlap = true;
        const cx = (ax + CARD_W / 2) - (bx + CARD_W / 2);
        const cy = (ay + CARD_H / 2) - (by + CARD_H / 2);
        const dist = Math.sqrt(cx * cx + cy * cy) || 1;
        const nx = (cx / dist) * STRENGTH;
        const ny = (cy / dist) * STRENGTH;
        positions[i] = [ax + nx, ay + ny];
        positions[j] = [bx - nx, by - ny];
      }
    }

    for (let i = 0; i < positions.length; i++) {
      const [lx, ly] = positions[i];
      for (const [px, py] of pins) {
        const pinInCard = px > lx && px < lx + CARD_W && py > ly && py < ly + CARD_H;
        if (!pinInCard) continue;
        anyOverlap = true;
        const cx = (lx + CARD_W / 2) - px;
        const cy = (ly + CARD_H / 2) - py;
        const dist = Math.sqrt(cx * cx + cy * cy) || 1;
        positions[i] = [lx + (cx / dist) * STRENGTH * 2, ly + (cy / dist) * STRENGTH * 2];
      }
    }

    if (!anyOverlap) break;
  }

  // Convert absolute positions back to pin-relative offsets
  return positions.map(([lx, ly], i) => [lx - pins[i][0], ly - pins[i][1]]);
}

export function nearestPointOnRect(
  px: number, py: number,
  rx: number, ry: number, rw: number, rh: number
): [number, number] {
  return [
    Math.max(rx, Math.min(px, rx + rw)),
    Math.max(ry, Math.min(py, ry + rh)),
  ];
}
