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

export type VinylShelfGridConfig = {
  maxVinyls: number;
  leftColumn: { leftPct: number; topPct: number };
  rightColumn: { leftPct: number; topPct: number };
  topOffset: number;
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
    leftPct: 20,
    topPct: 90,
    widthPct: 70,
    heightPct: 38,
    widthPx: 851,
    heightPx: 273,
    zIndex: 3,
  },
  ventanas: {
    leftPct: 30,
    topPct: 22,
    widthPct: 37,
    heightPct: 38,
    zIndex: 10,
    stackOffset: { x: -8, y: 6 },
  },
  carteles: {
    leftPct: 75,
    topPct: 32,
    widthPct: 28,
    heightPct: 28,
    widthPx : 237,
    heightPx: 237,
    zIndex: 11,
    stackOffset: { x: 8, y: 6 },
  },
  banderas: {
    leftPct: 82,
    topPct: 16.5,
    widthPct: 24,
    heightPct: 22,
    widthPx: 285,
    heightPx: 185,
    zIndex: 11,
    stackOffset: { x: 10, y: 6 },
  },
  vinilos: {
    leftPct: 16,
    topPct: 27.5,
    widthPct: 18,
    heightPct: 18,
    widthPx: 37,
    heightPx: 37,
    zIndex: 5,
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
    leftPct: 25,
    topPct: 36,
    widthPct: 40,
    heightPct: 42,
    widthPx: 252,
    heightPx: 403,
    zIndex: 8,
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

export const HABITACION_DECORATION_SLOTS: Record<string, DecorationSlot> = {
  paredes: { leftPct: 50, topPct: 50, widthPct: 100, heightPct: 100, zIndex: 1 },
  alfombras: {
    leftPct: 53,
    topPct: 87,
    widthPct: 74,
    heightPct: 32,
    zIndex: 3,
    stackOffset: { x: 8, y: 4 },
  },
  ventanas: {
    leftPct: 80,
    topPct: 26,
    widthPct: 29,
    heightPct: 32,
    zIndex: 9,
    stackOffset: { x: -6, y: 4 },
  },
  carteles: {
    leftPct: 35,
    topPct: 36,
    widthPct: 15,
    heightPct: 15,
    zIndex: 10,
    stackOffset: { x: 7, y: 5 },
  },
  banderas: {
    leftPct: 33,
    topPct: 19,
    widthPct: 21,
    heightPct: 19,
    zIndex: 10,
    stackOffset: { x: 8, y: 5 },
  },
  vinilos: {
    leftPct: 64,
    topPct: 38,
    widthPct: 34,
    heightPct: 34,
    widthPx: 34,
    heightPx: 34,
    zIndex: 7,
    stackOffset: { x: 8, y: 6 },
  },
  iluminacion: {
    leftPct: 50,
    topPct: 10,
    widthPct: 20,
    heightPct: 21,
    zIndex: 15,
    stackOffset: { x: -5, y: 6 },
  },
  muebles: {
    leftPct: 71,
    topPct: 64,
    widthPct: 41,
    heightPct: 60,
    widthPx: 260,
    heightPx: 370,
    zIndex: 8,
    stackOffset: { x: -6, y: 6 },
  },
  camas: {
    leftPct: 36,
    topPct: 70,
    widthPct: 50,
    heightPct: 40,
    zIndex: 12,
    stackOffset: { x: 6, y: 5 },
  },
  plantas: {
    leftPct: 84,
    topPct: 67,
    widthPct: 24,
    heightPct: 31,
    zIndex: 13,
    stackOffset: { x: 7, y: 5 },
  },
  juguetes: {
    leftPct: 60,
    topPct: 88,
    widthPct: 21,
    heightPct: 17,
    zIndex: 14,
    stackOffset: { x: 8, y: 4 },
  },
  accesorios: {
    leftPct: 46,
    topPct: 79,
    widthPct: 22,
    heightPct: 20,
    zIndex: 14,
    stackOffset: { x: 6, y: 5 },
  },
};

export const DECORATION_OVERRIDES: Record<string, DecorationSlot> = {};

export const HABITACION_DECORATION_OVERRIDES: Record<string, DecorationSlot> = {
  "alfombras/Betis.png": {
    leftPct: 18,
    topPct: 88,
    widthPct: 13,
    heightPct: 13,
    zIndex: 5,
  },
  "alfombras/Athletic.png": {
    leftPct: 80,
    topPct: 88,
    widthPct: 13,
    heightPct: 13,
    zIndex: 5,
  },
};

export const VINYL_SHELF_SLOTS: Record<string, DecorationSlot> = {
  "muebles/Estantería Madera.png": {
    leftPct: 19.5,
    topPct: 32,
    widthPct: 18,
    heightPct: 18,
    widthPx: 37,
    heightPx: 37,
    zIndex: 5,
    stackOffset: { x: 10, y: 8 },
  },
  "muebles/Estantería Madera Premium.png": {
    leftPct: 21,
    topPct: 33,
    widthPct: 18,
    heightPct: 18,
    widthPx: 37,
    heightPx: 37,
    zIndex: 5,
    stackOffset: { x: 10, y: 8 },
  },
  "muebles/Estantería Moderna.png": {
    leftPct: 19.5,
    topPct: 31,
    widthPct: 18,
    heightPct: 18,
    widthPx: 37,
    heightPx: 37,
    zIndex: 5,
    stackOffset: { x: 10, y: 8 },
  },
};

export const HABITACION_VINYL_SHELF_SLOTS: Record<string, DecorationSlot> = {
  "muebles/Estantería Madera.png": {
    leftPct: 60,
    topPct: 51,
    widthPct: 32,
    heightPct: 32,
    widthPx: 68,
    heightPx: 68,
    zIndex: 10,
    stackOffset: { x: 8, y: 6 },
  },
  "muebles/Estantería Madera Premium.png": {
    leftPct: 58,
    topPct: 50,
    widthPct: 32,
    heightPct: 32,
    widthPx: 68,
    heightPx: 68,
    zIndex: 10,
    stackOffset: { x: 8, y: 6 },
  },
  "muebles/Estantería Moderna.png": {
    leftPct: 62,
    topPct: 49,
    widthPct: 32,
    heightPct: 32,
    widthPx: 68,
    heightPx: 68,
    zIndex: 10,
    stackOffset: { x: 8, y: 6 },
  },
};

export const HABITACION_VINYL_GRID_LAYOUTS: Record<string, VinylShelfGridConfig> = {
  "muebles/Estantería Madera.png": {
    maxVinyls: 8,
    leftColumn: { leftPct: 64, topPct: 28 },
    rightColumn: { leftPct: 74, topPct: 48 },
    topOffset: 8,
  },
  "muebles/Estantería Madera Premium.png": {
    maxVinyls: 8,
    leftColumn: { leftPct: 65, topPct: 37 },
    rightColumn: { leftPct: 74, topPct: 47 },
    topOffset: 8,
  },
  "muebles/Estantería Moderna.png": {
    maxVinyls: 10,
    leftColumn: { leftPct: 65, topPct: 26 },
    rightColumn: { leftPct: 75, topPct: 25 },
    topOffset: 8,
  },
};

export const FURNITURE_TYPE_SLOTS: Record<string, DecorationSlot> = {
  estanteria: {
    leftPct: 25,
    topPct: 38,
    widthPct: 40,
    heightPct: 42,
    widthPx: 252,
    heightPx: 403,
    zIndex: 1,
    stackOffset: { x: -8, y: 6 },
  },
  mesa: {
    leftPct: 20,
    topPct: 83,
    widthPct: 38,
    heightPct: 34,
    widthPx: 406,
    heightPx: 190,
    zIndex: 9,
    stackOffset: { x: -8, y: 6 },
  },
  sillon: {
    leftPct: 21.5,
    topPct: 68,
    widthPct: 34,
    heightPct: 34,
    widthPx: 615,
    heightPx: 308,
    zIndex: 6,
    stackOffset: { x: -8, y: 6 },
  },
};

export const HABITACION_FURNITURE_TYPE_SLOTS: Record<string, DecorationSlot> = {
  estanteria: {
    leftPct: 71,
    topPct: 45,
    widthPct: 25,
    heightPct: 60,
    zIndex: 8,
    stackOffset: { x: -6, y: 5 },
  },
  mesa: {
    leftPct: 50,
    topPct: 84,
    widthPct: 36,
    heightPct: 30,
    widthPx: 385,
    heightPx: 180,
    zIndex: 9,
    stackOffset: { x: -6, y: 5 },
  },
  sillon: {
    leftPct: 41,
    topPct: 65,
    widthPct: 33,
    heightPct: 32,
    widthPx: 860,
    heightPx: 286,
    zIndex: 8,
    stackOffset: { x: -6, y: 5 },
  },
};
