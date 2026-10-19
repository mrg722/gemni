import React from 'react';

interface ControlsProps {
  onClose: () => void;
}

export const ControlsModal: React.FC<ControlsProps> = ({ onClose }) => {
  return (
    <div className="absolute inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-950 border-2 border-cyan-500/80 rounded-lg max-w-xl w-full p-6 shadow-[0_0_50px_rgba(6,182,212,0.25)] flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-xl font-bold font-mono text-cyan-400 tracking-wider">
            CONTROLES DE JUEGO // PC & TACTIL
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white font-mono text-sm cursor-pointer"
          >
            [CERRAR]
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs font-mono">
          <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
            <div className="text-cyan-300 font-bold mb-2">MOVIMIENTO Y NAVEGACION</div>
            <div className="space-y-1.5 text-slate-300">
              <div className="flex justify-between">
                <span className="text-amber-400 font-bold">W, A, S, D / Flechas</span>
                <span>Moverse en 2.5D</span>
              </div>
              <div className="flex justify-between">
                <span className="text-amber-400 font-bold">Shift</span>
                <span>Dash / Evasión</span>
              </div>
              <div className="flex justify-between">
                <span className="text-amber-400 font-bold">ESC / P</span>
                <span>Pausar partida</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
            <div className="text-cyan-300 font-bold mb-2">SISTEMA DE COMBATE</div>
            <div className="space-y-1.5 text-slate-300">
              <div className="flex justify-between">
                <span className="text-amber-400 font-bold">J</span>
                <span>Puñetazo (Combo ×3)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-amber-400 font-bold">K</span>
                <span>Patada alta (Lanzamiento)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-amber-400 font-bold">L</span>
                <span>Onda de Energía (SP)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-amber-400 font-bold">Espacio</span>
                <span>Modo Furia (Rage)</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/80 p-3 rounded border border-slate-800 col-span-2">
            <div className="text-cyan-300 font-bold mb-2">ATAJOS DE AUDITORIA // DEBUG</div>
            <div className="grid grid-cols-5 gap-2 text-center text-slate-300">
              <div className="bg-slate-950 p-1.5 rounded border border-slate-800">
                <div className="text-amber-400 font-bold">F1</div>
                <div className="text-[10px] text-slate-400">Stage 1</div>
              </div>
              <div className="bg-slate-950 p-1.5 rounded border border-slate-800">
                <div className="text-amber-400 font-bold">F2</div>
                <div className="text-[10px] text-slate-400">Stage 2</div>
              </div>
              <div className="bg-slate-950 p-1.5 rounded border border-slate-800">
                <div className="text-amber-400 font-bold">F3</div>
                <div className="text-[10px] text-slate-400">Stage 3</div>
              </div>
              <div className="bg-slate-950 p-1.5 rounded border border-slate-800">
                <div className="text-amber-400 font-bold">F4</div>
                <div className="text-[10px] text-slate-400">Stage 4</div>
              </div>
              <div className="bg-slate-950 p-1.5 rounded border border-slate-800">
                <div className="text-amber-400 font-bold">F5</div>
                <div className="text-[10px] text-slate-400">Stage 5</div>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold font-mono py-2.5 rounded cursor-pointer transition-colors"
        >
          ENTENDIDO
        </button>
      </div>
    </div>
  );
};
