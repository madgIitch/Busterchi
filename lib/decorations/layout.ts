export type DecorationSlot = {
  leftPct: number;
  topPct: number;
  widthPct: number;
  heightPct: number;
  widthPx?: number;
  heightPx?: number;
  zIndex: number;
  stackOffset?: { x: number; y: number };
};

export const DEFAULT_DECORATION_SLOT: DecorationSlot = {
  leftPct: 50,
  topPct: 65,
  widthPct: 30,
  heightPct: 30,
  zIndex: 20,
  stackOffset: { x: 10, y: 6 },
};

export const DECORATION_SLOTS: Record<string, DecorationSlot> = {
  paredes: { leftPct: 50, topPct: 50, widthPct: 100, heightPct: 100, zIndex: 1 },
  alfombras: {
    leftPct: 50,
    topPct: 78,
    widthPct: 70,
    heightPct: 38,
    zIndex: 5,
  },
  ventanas: {
    leftPct: 72,
    topPct: 22,
    widthPct: 28,
    heightPct: 38,
    zIndex: 10,
    stackOffset: { x: -8, y: 6 },
  },
  carteles: {
    leftPct: 30,
    topPct: 20,
    widthPct: 28,
    heightPct: 28,
    zIndex: 12,
    stackOffset: { x: 8, y: 6 },
  },
  banderas: {
    leftPct: 82.5,
    topPct: 23,
    widthPct: 24,
    heightPct: 22,
    widthPx: 285,
    heightPx: 185,
    zIndex: 1,
    stackOffset: { x: 10, y: 6 },
  },
  vinilos: {
    leftPct: 28,
    topPct: 36,
    widthPct: 18,
    heightPct: 18,
    zIndex: 13,
    stackOffset: { x: 10, y: 8 },
  },
  iluminacion: {
    leftPct: 78,
    topPct: 8,
    widthPct: 20,
    heightPct: 24,
    zIndex: 14,
    stackOffset: { x: -6, y: 8 },
  },
  muebles: {
    leftPct: 65,
    topPct: 62,
    widthPct: 40,
    heightPct: 42,
    zIndex: 25,
    stackOffset: { x: -8, y: 6 },
  },
  camas: {
    leftPct: 35,
    topPct: 66,
    widthPct: 46,
    heightPct: 40,
    zIndex: 24,
    stackOffset: { x: 8, y: 6 },
  },
  plantas: {
    leftPct: 18,
    topPct: 62,
    widthPct: 26,
    heightPct: 34,
    zIndex: 26,
    stackOffset: { x: 8, y: 6 },
  },
  juguetes: {
    leftPct: 50,
    topPct: 82,
    widthPct: 24,
    heightPct: 20,
    zIndex: 28,
    stackOffset: { x: 12, y: 6 },
  },
  accesorios: {
    leftPct: 56,
    topPct: 72,
    widthPct: 22,
    heightPct: 22,
    zIndex: 30,
    stackOffset: { x: 6, y: 6 },
  },
};

export const DECORATION_OVERRIDES: Record<string, DecorationSlot> = {};
