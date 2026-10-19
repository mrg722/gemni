import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

const COLS = 12;
const ROWS = 10;
const TOTAL_FRAMES = 120;
const CELL_W = 128;
const CELL_H = 128;
const ATLAS_W = COLS * CELL_W; // 1536
const ATLAS_H = ROWS * CELL_H; // 1280

const OUTPUT_DIR = path.resolve('assets/atlases_120');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const CHARACTERS = [
  {
    id: 'rayden',
    name: 'Rayden Cruz',
    scale: 1.0,
    palette: {
      skin: [235, 185, 155],
      hair: [25, 20, 20],
      primary: [240, 245, 250],   // White shirt
      secondary: [20, 25, 35],    // Dark vest/jeans
      accent: [40, 45, 55],       // Boots/belt
      energy: [50, 215, 255],     // Electric blue
      outline: [10, 15, 20],
    },
    hasVisor: true,
    hasChains: false,
    hasSaws: false,
    hasMutantTubes: false,
    hasVest: true,
    hasLabCoat: false,
  },
  {
    id: 'rayder_clone',
    name: 'Rayder Clone',
    scale: 1.05,
    palette: {
      skin: [200, 175, 190],
      hair: [15, 15, 25],
      primary: [35, 25, 45],      // Dark purple shirt
      secondary: [15, 12, 25],    // Deep shadow pants
      accent: [80, 25, 110],
      energy: [220, 40, 180],     // Corrupted magenta
      outline: [8, 5, 15],
    },
    hasVisor: true,
    hasChains: false,
    hasSaws: false,
    hasMutantTubes: false,
    hasVest: true,
    hasLabCoat: false,
  },
  {
    id: 'punk',
    name: 'Punk',
    scale: 0.95,
    palette: {
      skin: [240, 190, 160],
      hair: [235, 45, 55],        // Red mohawk
      primary: [30, 30, 35],      // Leather jacket
      secondary: [50, 60, 80],    // Denim
      accent: [220, 220, 230],    // Metal spikes
      energy: [255, 90, 60],
      outline: [15, 15, 15],
    },
    hasVisor: false,
    hasChains: true,
    hasSaws: false,
    hasMutantTubes: false,
    hasVest: false,
    hasLabCoat: false,
  },
  {
    id: 'brute',
    name: 'Brute',
    scale: 1.25,
    palette: {
      skin: [215, 160, 130],
      hair: [40, 30, 25],
      primary: [160, 80, 40],     // Muscle tone / harness
      secondary: [45, 40, 35],    // Heavy utility trousers
      accent: [180, 130, 50],     // Brass knuckles
      energy: [255, 160, 40],
      outline: [20, 15, 10],
    },
    hasVisor: false,
    hasChains: false,
    hasSaws: false,
    hasMutantTubes: false,
    hasVest: false,
    hasLabCoat: false,
  },
  {
    id: 'charger',
    name: 'Charger',
    scale: 1.0,
    palette: {
      skin: [230, 180, 150],
      hair: [220, 180, 40],       // Blonde/gold
      primary: [235, 195, 35],    // Gold track jersey
      secondary: [25, 30, 40],    // Dark athletic shorts
      accent: [240, 240, 250],    // White sneakers
      energy: [255, 215, 50],
      outline: [15, 15, 15],
    },
    hasVisor: false,
    hasChains: false,
    hasSaws: false,
    hasMutantTubes: false,
    hasVest: false,
    hasLabCoat: false,
  },
  {
    id: 'enforcer',
    name: 'Enforcer',
    scale: 1.15,
    palette: {
      skin: [225, 175, 145],
      hair: [30, 30, 30],
      primary: [30, 75, 145],     // Blue riot armor
      secondary: [20, 30, 45],    // Navy combat pants
      accent: [70, 140, 240],     // Plating
      energy: [80, 160, 255],
      outline: [10, 15, 25],
    },
    hasVisor: true,
    hasChains: false,
    hasSaws: false,
    hasMutantTubes: false,
    hasVest: true,
    hasLabCoat: false,
  },
  {
    id: 'chemical_soldier',
    name: 'Chemical Soldier',
    scale: 1.1,
    palette: {
      skin: [180, 180, 180],      // Gas mask face
      hair: [50, 80, 50],
      primary: [55, 135, 75],     // Hazmat olive green
      secondary: [35, 75, 45],
      accent: [220, 200, 40],     // Hazard yellow
      energy: [60, 240, 100],     // Toxic vapor
      outline: [15, 25, 15],
    },
    hasVisor: true,
    hasChains: false,
    hasSaws: false,
    hasMutantTubes: true,
    hasVest: true,
    hasLabCoat: false,
  },
  {
    id: 'urban_ninja',
    name: 'Urban Ninja',
    scale: 0.98,
    palette: {
      skin: [230, 180, 150],
      hair: [20, 20, 25],
      primary: [80, 40, 130],     // Dark purple shinobi gi
      secondary: [25, 20, 35],    // Black wraps
      accent: [160, 90, 230],     // Glowing silk sash
      energy: [180, 100, 255],
      outline: [15, 10, 20],
    },
    hasVisor: false,
    hasChains: false,
    hasSaws: false,
    hasMutantTubes: false,
    hasVest: false,
    hasLabCoat: false,
  },
  {
    id: 'mutant',
    name: 'Mutant',
    scale: 1.3,
    palette: {
      skin: [75, 175, 105],       // Green bio-flesh
      hair: [30, 60, 40],
      primary: [40, 110, 65],     // Mutant bulk
      secondary: [30, 40, 35],    // Torn shorts
      accent: [120, 245, 150],    // Bioluminescent nodes
      energy: [80, 255, 130],
      outline: [15, 30, 15],
    },
    hasVisor: false,
    hasChains: false,
    hasSaws: false,
    hasMutantTubes: true,
    hasVest: false,
    hasLabCoat: false,
  },
  {
    id: 'armored_guard',
    name: 'Armored Guard',
    scale: 1.25,
    palette: {
      skin: [210, 170, 140],
      hair: [25, 25, 30],
      primary: [120, 135, 150],   // Steel plate
      secondary: [50, 60, 70],    // Under-armor mesh
      accent: [200, 215, 230],    // Polished edge
      energy: [150, 200, 255],
      outline: [25, 30, 35],
    },
    hasVisor: true,
    hasChains: false,
    hasSaws: false,
    hasMutantTubes: false,
    hasVest: true,
    hasLabCoat: false,
  },
  {
    id: 'brakk',
    name: 'Brakk',
    scale: 1.35,
    palette: {
      skin: [205, 145, 115],
      hair: [40, 25, 20],
      primary: [160, 65, 45],     // Heavy rust leather
      secondary: [40, 30, 30],    // Iron pants
      accent: [210, 160, 80],     // Heavy iron chains
      energy: [255, 85, 45],      // Fury orange
      outline: [25, 15, 15],
    },
    hasVisor: false,
    hasChains: true,
    hasSaws: false,
    hasMutantTubes: false,
    hasVest: true,
    hasLabCoat: false,
  },
  {
    id: 'grinder',
    name: 'Grinder',
    scale: 1.25,
    palette: {
      skin: [210, 175, 150],
      hair: [50, 50, 50],
      primary: [180, 115, 35],    // Industrial hazard orange
      secondary: [45, 45, 50],    // Dark work dungarees
      accent: [225, 225, 235],    // Circular buzz saws
      energy: [255, 160, 30],     // Sparks & overdrive
      outline: [20, 20, 20],
    },
    hasVisor: true,
    hasChains: false,
    hasSaws: true,
    hasMutantTubes: false,
    hasVest: false,
    hasLabCoat: false,
  },
  {
    id: 'titanx',
    name: 'Titan-X',
    scale: 1.35,
    palette: {
      skin: [60, 155, 100],       // Prototype mutant green
      hair: [20, 50, 30],
      primary: [40, 110, 75],     // Biomechanical flesh
      secondary: [35, 45, 40],    // Restraint plates
      accent: [80, 220, 130],     // Serum tanks
      energy: [70, 255, 140],
      outline: [15, 25, 15],
    },
    hasVisor: true,
    hasChains: false,
    hasSaws: false,
    hasMutantTubes: true,
    hasVest: false,
    hasLabCoat: false,
  },
  {
    id: 'titanx_mejorado',
    name: 'Titan-X Mejorado',
    scale: 1.5,
    palette: {
      skin: [45, 170, 95],        // Super mutant bio-mass
      hair: [15, 40, 25],
      primary: [30, 95, 60],      // Heavy armor plates
      secondary: [20, 30, 25],    // Steel joints
      accent: [110, 255, 160],    // Glowing bio-cannons
      energy: [90, 255, 160],
      outline: [10, 20, 10],
    },
    hasVisor: true,
    hasChains: false,
    hasSaws: false,
    hasMutantTubes: true,
    hasVest: false,
    hasLabCoat: false,
  },
  {
    id: 'kessler',
    name: 'Dr. Kessler',
    scale: 0.95,
    palette: {
      skin: [235, 195, 175],
      hair: [190, 195, 205],      // Silver hair
      primary: [240, 245, 250],   // White lab coat
      secondary: [30, 35, 45],    // Dark trousers
      accent: [80, 140, 200],     // Stethoscope / pen
      energy: [100, 200, 255],
      outline: [20, 25, 30],
    },
    hasVisor: true,
    hasChains: false,
    hasSaws: false,
    hasMutantTubes: false,
    hasVest: false,
    hasLabCoat: true,
  },
];

function putPixel(png, x, y, r, g, b, a = 255) {
  if (x < 0 || x >= png.width || y < 0 || y >= png.height || a <= 0) return;
  const idx = (png.width * Math.floor(y) + Math.floor(x)) * 4;

  if (a >= 255 || png.data[idx + 3] === 0) {
    png.data[idx] = r;
    png.data[idx + 1] = g;
    png.data[idx + 2] = b;
    png.data[idx + 3] = a;
  } else {
    const alpha = a / 255;
    const invAlpha = 1 - alpha;
    png.data[idx] = Math.round(r * alpha + png.data[idx] * invAlpha);
    png.data[idx + 1] = Math.round(g * alpha + png.data[idx + 1] * invAlpha);
    png.data[idx + 2] = Math.round(b * alpha + png.data[idx + 2] * invAlpha);
    png.data[idx + 3] = Math.min(255, png.data[idx + 3] + a);
  }
}

function fillRect(png, rx, ry, rw, rh, color, alpha = 255) {
  const x0 = Math.max(0, Math.floor(rx));
  const y0 = Math.max(0, Math.floor(ry));
  const x1 = Math.min(png.width, Math.ceil(rx + rw));
  const y1 = Math.min(png.height, Math.ceil(ry + rh));
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      putPixel(png, x, y, color[0], color[1], color[2], alpha);
    }
  }
}

function fillCircle(png, cx, cy, radius, color, alpha = 255) {
  const r2 = radius * radius;
  const x0 = Math.max(0, Math.floor(cx - radius));
  const x1 = Math.min(png.width, Math.ceil(cx + radius));
  const y0 = Math.max(0, Math.floor(cy - radius));
  const y1 = Math.min(png.height, Math.ceil(cy + radius));
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const dx = x - cx;
      const dy = y - cy;
      if (dx * dx + dy * dy <= r2) {
        putPixel(png, x, y, color[0], color[1], color[2], alpha);
      }
    }
  }
}

function renderFrame(png, spec, frameIdx, cellX, cellY) {
  const row = Math.floor(frameIdx / COLS);
  const col = frameIdx % COLS;
  const animTime = col / (COLS - 1);

  const baseX = cellX + 64;
  const baseY = cellY + 116;
  const pal = spec.palette;
  const s = spec.scale;

  let hipX = baseX;
  let hipY = baseY - 48 * s;
  let torsoAngle = 0;
  let leftLegExt = 0;
  let rightLegExt = 0;
  let leftArmExt = 0;
  let rightArmExt = 0;
  let energyFX = 0;
  let headYOffset = 0;
  let hurtFlash = false;
  let fallen = false;

  if (row === 0) {
    // IDLE
    const breath = Math.sin(animTime * Math.PI * 2);
    hipY += breath * 2.5 * s;
    headYOffset = breath * 1.5 * s;
  } else if (row === 1) {
    // WALK
    const walkPhase = animTime * Math.PI * 2;
    leftLegExt = Math.sin(walkPhase) * 14 * s;
    rightLegExt = -leftLegExt;
    hipY += Math.abs(Math.sin(walkPhase * 2)) * -3 * s;
    leftArmExt = -Math.sin(walkPhase) * 12 * s;
    rightArmExt = -leftArmExt;
  } else if (row === 2) {
    // RUN / DASH
    const runPhase = animTime * Math.PI * 2;
    torsoAngle = 14;
    leftLegExt = Math.sin(runPhase) * 22 * s;
    rightLegExt = -leftLegExt;
    hipX += 4 * s;
    hipY += Math.abs(Math.sin(runPhase * 2)) * -5 * s - 4 * s;
    leftArmExt = -Math.sin(runPhase) * 20 * s;
    rightArmExt = -leftArmExt;
    if (col > 2 && col < 10) {
      energyFX = 0.5;
    }
  } else if (row === 3) {
    // LIGHT PUNCH
    if (col < 3) {
      leftArmExt = -6 * s;
      torsoAngle = -5;
    } else if (col < 7) {
      rightArmExt = 26 * s;
      torsoAngle = 10;
      hipX += 6 * s;
    } else {
      rightArmExt = 10 * s;
    }
  } else if (row === 4) {
    // MEDIUM CROSS
    if (col < 4) {
      torsoAngle = -12;
      leftArmExt = -10 * s;
      hipY += 2 * s;
    } else if (col < 8) {
      torsoAngle = 18;
      leftArmExt = 32 * s;
      hipX += 10 * s;
      energyFX = 0.6;
    } else {
      torsoAngle = 4;
      leftArmExt = 8 * s;
    }
  } else if (row === 5) {
    // HEAVY UPPERCUT
    if (col < 4) {
      hipY += 12 * s;
      torsoAngle = -8;
      rightArmExt = -8 * s;
    } else if (col < 8) {
      hipY -= 18 * s;
      torsoAngle = 12;
      rightArmExt = 38 * s;
      energyFX = 0.9;
    } else {
      hipY -= 6 * s;
      rightArmExt = 14 * s;
    }
  } else if (row === 6) {
    // RISING KICK
    if (col < 3) {
      hipY += 4 * s;
      torsoAngle = -6;
    } else if (col < 8) {
      torsoAngle = -18;
      rightLegExt = 36 * s;
      hipY -= 8 * s;
      energyFX = 0.7;
    } else {
      rightLegExt = 12 * s;
    }
  } else if (row === 7) {
    // SPECIAL ENERGY WAVE
    if (col < 5) {
      torsoAngle = -8;
      leftArmExt = 14 * s;
      rightArmExt = 14 * s;
      energyFX = col * 0.2;
    } else if (col < 9) {
      torsoAngle = 16;
      leftArmExt = 34 * s;
      rightArmExt = 34 * s;
      energyFX = 1.0;
    } else {
      torsoAngle = 6;
      energyFX = 0.3;
    }
  } else if (row === 8) {
    // BLOCK & HURT
    if (col < 4) {
      torsoAngle = -10;
      leftArmExt = 10 * s;
      rightArmExt = 8 * s;
      hipX -= 4 * s;
    } else if (col < 8) {
      torsoAngle = -22;
      hipX -= 12 * s;
      hurtFlash = true;
    } else {
      torsoAngle = -12;
      hipX -= 6 * s;
    }
  } else if (row === 9) {
    // KNOCKDOWN & DEFEAT
    if (col < 3) {
      hipX -= 16 * s;
      hipY -= 16 * s;
      torsoAngle = -35;
      hurtFlash = true;
    } else if (col < 6) {
      hipX -= 24 * s;
      hipY -= 8 * s;
      torsoAngle = -70;
    } else {
      fallen = true;
      hipX -= 30 * s;
      hipY = baseY - 12 * s;
    }
  }

  if (!fallen) {
    fillCircle(png, hipX, baseY, 22 * s, [0, 0, 0], 80);

    const llx = hipX - 8 * s + leftLegExt * 0.6;
    const lly = hipY + 16 * s;
    fillRect(png, llx, lly, 10 * s, 26 * s, pal.secondary);
    fillRect(png, llx, lly + 22 * s, 12 * s, 8 * s, pal.accent);

    const rlx = hipX + 4 * s + rightLegExt * 0.8;
    const rly = hipY + 16 * s;
    fillRect(png, rlx, rly, 10 * s, 26 * s, pal.secondary);
    fillRect(png, rlx, rly + 22 * s, 12 * s, 8 * s, pal.accent);

    const tx = hipX - 12 * s + torsoAngle * 0.4;
    const ty = hipY - 22 * s;
    fillRect(png, tx, ty, 24 * s, 30 * s, pal.primary);

    if (spec.hasVest) {
      fillRect(png, tx - 2 * s, ty, 6 * s, 28 * s, pal.secondary);
      fillRect(png, tx + 20 * s, ty, 6 * s, 28 * s, pal.secondary);
    }
    if (spec.hasLabCoat) {
      fillRect(png, tx - 3 * s, ty, 8 * s, 34 * s, pal.primary);
      fillRect(png, tx + 19 * s, ty, 8 * s, 34 * s, pal.primary);
    }
    if (spec.hasMutantTubes) {
      fillRect(png, tx - 4 * s, ty + 4 * s, 5 * s, 16 * s, pal.energy);
      fillRect(png, tx + 23 * s, ty + 4 * s, 5 * s, 16 * s, pal.energy);
    }

    const lax = tx - 6 * s + leftArmExt;
    const lay = ty + 4 * s;
    fillRect(png, lax, lay, 8 * s, 20 * s, pal.primary);
    fillRect(png, lax, lay + 16 * s, 9 * s, 8 * s, pal.accent);

    const hx = tx + 12 * s;
    const hy = ty - 14 * s + headYOffset;
    fillCircle(png, hx, hy, 11 * s, pal.skin);
    fillCircle(png, hx - 2 * s, hy - 4 * s, 11 * s, pal.hair);
    if (spec.id === 'punk') {
      fillRect(png, hx - 2 * s, hy - 18 * s, 5 * s, 14 * s, pal.hair);
    }

    if (spec.hasVisor) {
      fillRect(png, hx + 1 * s, hy - 2 * s, 9 * s, 4 * s, pal.energy);
    } else {
      fillCircle(png, hx + 5 * s, hy - 1 * s, 2 * s, pal.outline);
    }

    const rax = tx + 14 * s + rightArmExt;
    const ray = ty + 6 * s;
    fillRect(png, rax, ray, 9 * s, 20 * s, pal.primary);
    fillRect(png, rax, ray + 15 * s, 10 * s, 9 * s, pal.accent);

    if (spec.hasChains) {
      for (let ci = 0; ci < 5; ci++) {
        fillCircle(png, rax + ci * 5 * s, ray + 18 * s + (ci % 2) * 3, 3 * s, pal.accent);
      }
    }
    if (spec.hasSaws) {
      fillCircle(png, rax + 12 * s, ray + 18 * s, 9 * s, pal.accent);
      fillCircle(png, rax + 12 * s, ray + 18 * s, 4 * s, [180, 50, 40]);
    }

    if (energyFX > 0) {
      const efx = rax + 18 * s;
      const efy = ray + 18 * s;
      const rad = 14 * s * energyFX;
      fillCircle(png, efx, efy, rad, pal.energy, 180);
      fillCircle(png, efx, efy, rad * 0.6, [255, 255, 255], 220);
    }

    if (hurtFlash) {
      fillCircle(png, hx, hy, 16 * s, [255, 255, 255], 160);
    }
  } else {
    fillCircle(png, hipX, baseY, 30 * s, [0, 0, 0], 80);
    fillRect(png, hipX - 22 * s, baseY - 8 * s, 36 * s, 10 * s, pal.primary);
    fillRect(png, hipX + 12 * s, baseY - 6 * s, 24 * s, 8 * s, pal.secondary);
    fillCircle(png, hipX - 28 * s, baseY - 6 * s, 9 * s, pal.skin);
    fillCircle(png, hipX - 30 * s, baseY - 8 * s, 9 * s, pal.hair);
    fillRect(png, hipX - 16 * s, baseY - 12 * s, 18 * s, 6 * s, pal.accent);
  }
}

function generateCharacterAtlas(spec) {
  const png = new PNG({ width: ATLAS_W, height: ATLAS_H });
  png.data.fill(0);

  for (let f = 0; f < TOTAL_FRAMES; f++) {
    const col = f % COLS;
    const row = Math.floor(f / COLS);
    const cellX = col * CELL_W;
    const cellY = row * CELL_H;
    renderFrame(png, spec, f, cellX, cellY);
  }

  const outPath = path.join(OUTPUT_DIR, `${spec.id}_120.png`);
  const buffer = PNG.sync.write(png);
  fs.writeFileSync(outPath, buffer);
  console.log(`[OK] Generated 120-frame atlas: ${outPath} (${ATLAS_W}x${ATLAS_H})`);
}

function generateAll() {
  console.log(`Starting generation of 120-frame atlases for ${CHARACTERS.length} characters...`);
  CHARACTERS.forEach((char) => {
    generateCharacterAtlas(char);
  });

  const manifest120 = {
    version: 4,
    description: 'District Fury 120-frame high-fidelity character atlases',
    render_target: { width: 1280, height: 720, fps: 60 },
    grid: [COLS, ROWS],
    cell: [CELL_W, CELL_H],
    total_frames: TOTAL_FRAMES,
    pivot: [64, 116],
    animations: {
      idle: { row: 0, frames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], fps: 12, loop: true },
      walk: { row: 1, frames: [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23], fps: 14, loop: true },
      run_dash: { row: 2, frames: [24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35], fps: 18, loop: false },
      punch_light: { row: 3, frames: [36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47], fps: 16, loop: false },
      punch_medium: { row: 4, frames: [48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59], fps: 16, loop: false },
      punch_heavy: { row: 5, frames: [60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71], fps: 15, loop: false },
      kick: { row: 6, frames: [72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83], fps: 15, loop: false },
      energy_wave: { row: 7, frames: [84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95], fps: 14, loop: false },
      block_hurt: { row: 8, frames: [96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107], fps: 14, loop: false },
      knockdown_defeat: { row: 9, frames: [108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119], fps: 12, loop: false },
    },
    characters: CHARACTERS.map((c) => ({
      id: c.id,
      name: c.name,
      scale: c.scale,
      atlas_path: `assets/atlases_120/${c.id}_120.png`,
    })),
  };

  const manifestPath = path.resolve('data/sprite_manifest_120.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest120, null, 2), 'utf-8');
  console.log(`[OK] Saved sprite manifest: ${manifestPath}`);
}

generateAll();
