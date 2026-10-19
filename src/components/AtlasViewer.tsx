import React, { useState, useEffect, useRef } from 'react';
import { assetManager } from '../engine/assets';

interface AtlasViewerProps {
  onBack: () => void;
}

const CHARACTERS = [
  { id: 'rayden', name: 'Rayden Cruz' },
  { id: 'rayder_clone', name: 'Rayder Clone' },
  { id: 'punk', name: 'Punk' },
  { id: 'brute', name: 'Brute' },
  { id: 'charger', name: 'Charger' },
  { id: 'enforcer', name: 'Enforcer' },
  { id: 'chemical_soldier', name: 'Chemical Soldier' },
  { id: 'urban_ninja', name: 'Urban Ninja' },
  { id: 'mutant', name: 'Mutant' },
  { id: 'armored_guard', name: 'Armored Guard' },
  { id: 'brakk', name: 'Brakk (Boss)' },
  { id: 'grinder', name: 'Grinder (Boss)' },
  { id: 'titanx', name: 'Titan-X (Boss)' },
  { id: 'titanx_mejorado', name: 'Titan-X Mejorado (Boss)' },
  { id: 'kessler', name: 'Dr. Kessler (NPC)' },
];

const ANIMATION_ROWS = [
  { row: 0, name: 'IDLE (12 frames)' },
  { row: 1, name: 'WALK (12 frames)' },
  { row: 2, name: 'RUN / DASH (12 frames)' },
  { row: 3, name: 'LIGHT PUNCH (12 frames)' },
  { row: 4, name: 'MEDIUM CROSS (12 frames)' },
  { row: 5, name: 'HEAVY UPPERCUT / FINISHER (12 frames)' },
  { row: 6, name: 'RISING KICK (12 frames)' },
  { row: 7, name: 'ENERGY SPECIAL / BURST (12 frames)' },
  { row: 8, name: 'BLOCK & HURT (12 frames)' },
  { row: 9, name: 'KNOCKDOWN & DEFEAT (12 frames)' },
];

export const AtlasViewer: React.FC<AtlasViewerProps> = ({ onBack }) => {
  const [selectedChar, setSelectedChar] = useState<string>('rayden');
  const [selectedRow, setSelectedRow] = useState<number>(0);
  const [currentFrame, setCurrentFrame] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [fps, setFps] = useState<number>(12);
  const [zoom, setZoom] = useState<number>(2);
  const [viewMode, setViewMode] = useState<'anim' | 'sheet'>('anim');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Playback timer
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % 12);
    }, 1000 / fps);
    return () => clearInterval(interval);
  }, [isPlaying, fps]);

  // Draw current frame or entire 120-frame atlas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const img = assetManager.getImage(`${selectedChar}_120`);

    if (viewMode === 'anim') {
      canvas.width = 128 * zoom;
      canvas.height = 128 * zoom;

      // Dark checkered background for alpha visibility
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (img && img.naturalWidth > 0) {
        const sx = currentFrame * 128;
        const sy = selectedRow * 128;
        ctx.drawImage(img, sx, sy, 128, 128, 0, 0, canvas.width, canvas.height);
      } else {
        ctx.fillStyle = '#94a3b8';
        ctx.font = '14px monospace';
        ctx.fillText('Cargando atlas...', 10, 30);
      }
    } else {
      // Entire sheet view: 1536 x 1280 scaled
      canvas.width = 1536;
      canvas.height = 1280;
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (img && img.naturalWidth > 0) {
        ctx.drawImage(img, 0, 0);

        // Highlight selected frame in sheet
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        ctx.strokeRect(currentFrame * 128, selectedRow * 128, 128, 128);
      }
    }
  }, [selectedChar, selectedRow, currentFrame, zoom, viewMode]);

  const globalFrameIndex = selectedRow * 12 + currentFrame;

  return (
    <div className="absolute inset-0 bg-slate-950/95 z-50 flex flex-col p-6 text-slate-100 overflow-y-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
        <div>
          <h2 className="text-2xl font-bold font-mono text-cyan-400">
            VISOR DE ATLAS // 120 FRAMES
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Grid de 12 columnas × 10 filas (1536×1280 px). 120 frames por personaje con pivote anclado.
          </p>
        </div>

        <button
          onClick={onBack}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded text-sm font-mono font-bold transition-colors cursor-pointer border border-slate-600"
        >
          VOLVER AL MENU [ESC]
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1">
        {/* Left: Controls & Selectors */}
        <div className="w-full lg:w-80 flex flex-col gap-4 shrink-0 bg-slate-900/60 p-4 rounded border border-slate-800">
          {/* Character Select */}
          <div>
            <label className="block text-xs font-mono font-bold text-slate-400 mb-1">
              PERSONAJE (15 DISPONIBLES)
            </label>
            <select
              value={selectedChar}
              onChange={(e) => {
                setSelectedChar(e.target.value);
                setCurrentFrame(0);
              }}
              className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
            >
              {CHARACTERS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Animation Category */}
          <div>
            <label className="block text-xs font-mono font-bold text-slate-400 mb-1">
              ACCION / FILA (12 FRAMES)
            </label>
            <div className="flex flex-col gap-1 max-h-56 overflow-y-auto pr-1">
              {ANIMATION_ROWS.map((a) => (
                <button
                  key={a.row}
                  onClick={() => {
                    setSelectedRow(a.row);
                    setCurrentFrame(0);
                  }}
                  className={`text-left px-3 py-1.5 rounded text-xs font-mono transition-colors cursor-pointer ${
                    selectedRow === a.row
                      ? 'bg-cyan-600 text-white font-bold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {a.name}
                </button>
              ))}
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('anim')}
              className={`flex-1 py-1.5 rounded text-xs font-mono font-bold transition-colors cursor-pointer ${
                viewMode === 'anim'
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              ANIMACION
            </button>
            <button
              onClick={() => setViewMode('sheet')}
              className={`flex-1 py-1.5 rounded text-xs font-mono font-bold transition-colors cursor-pointer ${
                viewMode === 'sheet'
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              HOJA COMPLETA (120)
            </button>
          </div>

          {/* Animation Controls */}
          {viewMode === 'anim' && (
            <div className="flex flex-col gap-3 border-t border-slate-800 pt-3">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1 rounded text-xs font-mono font-bold cursor-pointer"
                >
                  {isPlaying ? 'PAUSAR' : 'REPRODUCIR'}
                </button>
                <span className="text-xs font-mono text-slate-400">
                  Frame: <strong className="text-cyan-400">{currentFrame + 1}</strong> / 12 (Global:{' '}
                  {globalFrameIndex})
                </span>
              </div>

              {/* Step Slider */}
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  Paso manual de frame
                </label>
                <input
                  type="range"
                  min="0"
                  max="11"
                  value={currentFrame}
                  onChange={(e) => {
                    setIsPlaying(false);
                    setCurrentFrame(parseInt(e.target.value));
                  }}
                  className="w-full cursor-pointer accent-cyan-400"
                />
              </div>

              {/* Speed Slider */}
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  Velocidad: {fps} FPS
                </label>
                <input
                  type="range"
                  min="4"
                  max="30"
                  value={fps}
                  onChange={(e) => setFps(parseInt(e.target.value))}
                  className="w-full cursor-pointer accent-amber-400"
                />
              </div>

              {/* Zoom Slider */}
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  Escala: {zoom}x
                </label>
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.5"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-full cursor-pointer accent-blue-400"
                />
              </div>
            </div>
          )}
        </div>

        {/* Right: Canvas Display Area */}
        <div className="flex-1 bg-slate-900/40 rounded border border-slate-800 p-4 flex flex-col items-center justify-center overflow-auto min-h-[400px]">
          <canvas
            ref={canvasRef}
            className="border border-slate-700 rounded shadow-2xl pixelated max-w-full"
          />
        </div>
      </div>
    </div>
  );
};
