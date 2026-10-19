import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

const COLS = 12;
const ROWS = 10;
const TOTAL_FRAMES = 120;
const CELL_W = 128;
const CELL_H = 128;
const EXPECTED_W = COLS * CELL_W; // 1536
const EXPECTED_H = ROWS * CELL_H; // 1280

const CHARACTERS = [
  'rayden',
  'rayder_clone',
  'punk',
  'brute',
  'charger',
  'enforcer',
  'chemical_soldier',
  'urban_ninja',
  'mutant',
  'armored_guard',
  'brakk',
  'grinder',
  'titanx',
  'titanx_mejorado',
  'kessler',
];

const DIR = path.resolve('assets/atlases_120');

console.log('================================================================');
console.log('AUDITORIA DE SPRITE ATLASES 120 FRAMES (DISTRICT FURY)');
console.log('================================================================');

let totalAudited = 0;
let totalPassed = 0;
let errors = [];

for (const charId of CHARACTERS) {
  totalAudited++;
  const filePath = path.join(DIR, `${charId}_120.png`);

  if (!fs.existsSync(filePath)) {
    errors.push(`[FALLA] No existe archivo para ${charId}: ${filePath}`);
    continue;
  }

  const fileData = fs.readFileSync(filePath);
  const png = PNG.sync.read(fileData);

  // 1. Check dimensions
  if (png.width !== EXPECTED_W || png.height !== EXPECTED_H) {
    errors.push(`[FALLA] ${charId}: Dimensiones incorrectas ${png.width}x${png.height}, esperado ${EXPECTED_W}x${EXPECTED_H}`);
    continue;
  }

  // 2. Validate all 120 frames
  let emptyFrames = [];
  let frameStats = [];

  for (let frame = 0; frame < TOTAL_FRAMES; frame++) {
    const col = frame % COLS;
    const row = Math.floor(frame / COLS);
    const x0 = col * CELL_W;
    const y0 = row * CELL_H;

    let minX = CELL_W, minY = CELL_H, maxX = -1, maxY = -1;
    let solidPixels = 0;

    for (let cy = 0; cy < CELL_H; cy++) {
      for (let cx = 0; cx < CELL_W; cx++) {
        const px = x0 + cx;
        const py = y0 + cy;
        const idx = (png.width * py + px) * 4;
        const alpha = png.data[idx + 3];

        if (alpha >= 8) {
          solidPixels++;
          minX = Math.min(minX, cx);
          minY = Math.min(minY, cy);
          maxX = Math.max(maxX, cx);
          maxY = Math.max(maxY, cy);
        }
      }
    }

    if (solidPixels === 0) {
      emptyFrames.push(frame);
    } else {
      frameStats.push({ frame, solidPixels, box: [minX, minY, maxX, maxY] });
    }
  }

  if (emptyFrames.length > 0) {
    errors.push(`[FALLA] ${charId}: Tiene ${emptyFrames.length} frames vacios: ${emptyFrames.join(', ')}`);
  } else {
    totalPassed++;
    console.log(`[VERIFICADO] ${charId.padEnd(18)} -> 120/120 frames validos, PNG RGBA 1536x1280 px, 0 frames vacios`);
  }
}

console.log('================================================================');
console.log(`RESULTADO FINAL AUDITORIA: ${totalPassed} / ${totalAudited} atlas validados con exito`);
if (errors.length > 0) {
  console.log('ERRORES DETECTADOS:');
  errors.forEach(e => console.log('  ' + e));
  process.exit(1);
} else {
  console.log('TODOS LOS ATLAS DE 120 FRAMES CUMPLEN EL 100% DE REQUISITOS TECNICOS');
  process.exit(0);
}
