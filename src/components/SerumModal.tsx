import React from 'react';
import { RewardOption } from '../game/types';

interface SerumModalProps {
  stageCleared: number;
  options: [RewardOption, RewardOption, RewardOption];
  onSelectOption: (index: number) => void;
}

export const SerumModal: React.FC<SerumModalProps> = ({
  stageCleared,
  options,
  onSelectOption,
}) => {
  return (
    <div className="absolute inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-950 border-2 border-amber-500/80 rounded-lg max-w-2xl w-full p-6 shadow-[0_0_50px_rgba(245,158,11,0.25)] flex flex-col gap-6">
        {/* Title */}
        <div className="text-center border-b border-slate-800 pb-4">
          <span className="text-xs font-mono font-bold text-amber-400 tracking-widest uppercase">
            STAGE {stageCleared} SUPERADO
          </span>
          <h2 className="text-2xl font-black font-mono text-white tracking-wider mt-1">
            SUERO X // MEJORA DE PROGRESION
          </h2>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Elige un suero para fortalecer permanentemente a Rayden durante el resto de la campaña.
          </p>
        </div>

        {/* 3 Options */}
        <div className="flex flex-col gap-3">
          {options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => onSelectOption(idx)}
              className="flex items-center gap-4 bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700 hover:border-amber-400 p-4 rounded text-left transition-all group cursor-pointer"
            >
              <div className="w-10 h-10 rounded bg-slate-950 border border-amber-500/50 flex items-center justify-center text-lg font-black font-mono text-amber-400 group-hover:scale-110 transition-transform">
                {idx + 1}
              </div>
              <div className="flex-1">
                <div className="text-base font-bold font-mono text-white group-hover:text-amber-300">
                  {opt.name}
                </div>
                <div className="text-xs font-mono text-slate-400 mt-0.5">
                  {opt.description}
                </div>
              </div>
              <span className="text-xs font-mono text-slate-500 group-hover:text-amber-400 font-bold">
                ELEGIR [{idx + 1}]
              </span>
            </button>
          ))}
        </div>

        <div className="text-center text-xs font-mono text-slate-500">
          Pulsa 1, 2 o 3 en el teclado o haz clic sobre la opción deseada.
        </div>
      </div>
    </div>
  );
};
