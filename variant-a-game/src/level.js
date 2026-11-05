// All values are stage CSS px (360x640 design). Assets are 2x, so sizes are pixel size / 2.
export const STAGE_WIDTH = 360;
export const STAGE_HEIGHT = 640;

// gameplay.png and bg_texture.png reach above the top fold, where the design hides them.
export const FIELD_TOP = 168.5;

export const GUT_X = -2; // Offset measured on design/01-start.png.
export const GUT_WIDTH = 2528;
export const END_SCROLL = GUT_WIDTH + GUT_X - STAGE_WIDTH;

export const PLAYER = { x: 55.5, y: 258.5, width: 42, height: 41 };
export const GESTURE = { x: 147.5, y: 452, width: 86.5, height: 96 };

// x is the position at scroll 0. Each file appears exactly once per run.
// The first four come from design/01-start.png, so the run starts on the designed frame.
// bac6 is the one obstacle the design draws smaller than 50%.
export const OBSTACLES = [
  { file: 'bac6', x: 94, y: 331, width: 33.5, height: 32 },
  { file: 'txt1', x: 99.5, y: 370, width: 23, height: 94 },
  { file: 'bac2', x: 274.5, y: 328, width: 21.5, height: 77 },
  { file: 'txt2', x: 301.5, y: 389, width: 34, height: 113 },
  { file: 'txt5', x: 470, y: 240, width: 30, height: 181 },
  { file: 'bac1', x: 620, y: 300, width: 62.5, height: 59.5 },
  { file: 'txt6', x: 770, y: 240, width: 20.5, height: 144.5 },
  { file: 'bac3', x: 920, y: 500, width: 79, height: 28 },
  { file: 'txt9', x: 1070, y: 400, width: 25.5, height: 156.5 },
  { file: 'bac5', x: 1220, y: 255, width: 53.5, height: 43.5 },
  { file: 'txt8', x: 1370, y: 240, width: 18.5, height: 153 },
  { file: 'bac4', x: 1520, y: 450, width: 69, height: 34 },
  { file: 'txt4', x: 1670, y: 470, width: 29, height: 84.5 },
  { file: 'txt3', x: 1820, y: 260, width: 23.5, height: 60.5 },
  { file: 'txt7', x: 1970, y: 465, width: 29.5, height: 81.5 },
];
