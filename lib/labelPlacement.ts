export const CARD_W = 90;
export const CARD_H = 36;

const GAP = 8;

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

interface Rect { x: number; y: number; w: number; h: number; }

function overlaps(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export function placeLabels(pins: [number, number][]): [number, number][] {
  const placed: Rect[] = [];
  return pins.map((pin) => {
    for (const [dx, dy] of ANCHORS) {
      const rect: Rect = { x: pin[0] + dx, y: pin[1] + dy, w: CARD_W, h: CARD_H };
      if (!placed.some((p) => overlaps(rect, p))) {
        placed.push(rect);
        return [pin[0] + dx, pin[1] + dy] as [number, number];
      }
    }
    const [dx, dy] = ANCHORS[ANCHORS.length - 1];
    placed.push({ x: pin[0] + dx, y: pin[1] + dy, w: CARD_W, h: CARD_H });
    return [pin[0] + dx, pin[1] + dy] as [number, number];
  });
}
