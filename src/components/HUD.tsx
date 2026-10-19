import React from 'react';
import { Player } from '../game/player';
import { Boss } from '../game/boss';

interface HUDProps {
  player: Player;
  boss: Boss | null;
  stageTitle: string;
  scenarioName: string;
  combo: number;
  score: number;
  onPause: () => void;
  isPaused: boolean;
}

export const HUD: React.FC<HUDProps> = ({
  player,
  boss,
  stageTitle,
  scenarioName,
  combo,
  score,
  onPause,
  isPaused,
}) => {
  const hpPct = Math.max(0, Math.min(100, (player.hp / player.maxHp) * 100));
  const shieldPct = Math.max(0, Math.min(100, (player.shield / player.maxShield) * 100));
  const spPct = Math.max(0, Math.min(100, (player.sp / player.maxSp) * 100));
  const ragePct = Math.max(0, Math.min(100, (player.rage / player.maxRage) * 100));

  return (
    <div className="absolute inset-0 pointer-events-none select-none">
      {/* Top Left: Player Status Panel */}
      <div className="absolute top-3 left-4 flex items-start gap-3 bg-slate-950/85 border border-slate-700/80 rounded-sm p-2 shadow-2xl backdrop-blur-xs min-w-[340px] max-w-[460px]">
        {/* Rayden Portrait */}
        <div className="relative w-16 h-16 bg-slate-900 border-2 border-cyan-500/80 overflow-hidden shrink-0 shadow-inner">
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-950/40 to-slate-950/90" />
          <img
            src="/assets/characters/rayden_clean.png"
            alt="Rayden"
            className="w-full h-full object-cover object-top pixelated scale-140 translate-y-1"
          />
          {player.isRageMode && (
            <div className="absolute inset-0 bg-cyan-400/20 border-2 border-cyan-300 animate-pulse" />
          )}
        </div>

        {/* Vitals Bars */}
        <div className="flex-1 flex flex-col gap-1">
          {/* Header */}
          <div className="flex items-center justify-between text-xs font-bold tracking-wider">
            <span className="text-cyan-400 font-mono">
              {player.skin === 1 ? 'RAYDER CLON' : 'RAYDEN CRUZ'}
            </span>
            <span className="text-amber-400 font-mono text-[11px]">{stageTitle}</span>
          </div>

          {/* HP Bar */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono font-bold text-red-400 w-8">HP</span>
            <div className="flex-1 h-3.5 bg-slate-900 border border-slate-700 relative overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 transition-all duration-75"
                style={{ width: `${hpPct}%` }}
              />
              <span className="absolute inset-0 flex items-center justify-end pr-1 text-[9px] font-mono font-bold text-white drop-shadow">
                {Math.round(player.hp)} / {player.maxHp}
              </span>
            </div>
          </div>

          {/* Shield Bar */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono font-bold text-sky-400 w-8">DEF</span>
            <div className="flex-1 h-2 bg-slate-900 border border-slate-700 relative overflow-hidden">
              <div
                className="h-full bg-sky-400 transition-all duration-75"
                style={{ width: `${shieldPct}%` }}
              />
            </div>
          </div>

          {/* SP Bar */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono font-bold text-blue-400 w-8">SP</span>
            <div className="flex-1 h-2 bg-slate-900 border border-slate-700 relative overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-75"
                style={{ width: `${spPct}%` }}
              />
            </div>
          </div>

          {/* Rage Bar */}
          <div className="flex items-center gap-1.5">
            <span
              className={`text-[10px] font-mono font-bold w-8 ${
                player.isRageMode ? 'text-amber-300 animate-pulse' : 'text-orange-400'
              }`}
            >
              FURY
            </span>
            <div className="flex-1 h-2.5 bg-slate-900 border border-slate-700 relative overflow-hidden">
              <div
                className={`h-full transition-all duration-75 ${
                  player.isRageMode
                    ? 'bg-gradient-to-r from-amber-400 via-orange-500 to-cyan-400 animate-pulse'
                    : 'bg-gradient-to-r from-amber-600 to-orange-500'
                }`}
                style={{ width: `${ragePct}%` }}
              />
              {player.rage >= player.maxRage && !player.isRageMode && (
                <span className="absolute inset-0 flex items-center justify-center text-[8px] font-mono font-bold text-amber-200 animate-pulse tracking-widest">
                  [SPACE] RAGE READY
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Top Right: Score & Pause Button */}
      <div className="absolute top-3 right-4 flex items-center gap-4">
        <div className="bg-slate-950/80 border border-slate-800 rounded px-3 py-1 font-mono text-right backdrop-blur-xs">
          <div className="text-[10px] text-slate-400">SCORE</div>
          <div className="text-lg font-bold text-amber-400 tracking-wider">
            {score.toString().padStart(6, '0')}
          </div>
        </div>

        <button
          onClick={onPause}
          className="pointer-events-auto bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white px-3 py-2 rounded text-xs font-mono font-bold transition-colors cursor-pointer"
        >
          {isPaused ? 'REANUDAR' : 'PAUSA [ESC]'}
        </button>
      </div>

      {/* Stage Objective Banner */}
      <div className="absolute top-22 left-1/2 -translate-x-1/2 bg-slate-950/80 border-b border-cyan-500/50 px-4 py-1 text-center backdrop-blur-xs">
        <div className="text-xs font-bold font-mono text-cyan-300 tracking-wider uppercase">
          {scenarioName}
        </div>
      </div>

      {/* Combo Counter (when active) */}
      {combo > 1 && (
        <div className="absolute top-32 left-8 flex items-baseline gap-2 animate-bounce">
          <span className="text-4xl font-extrabold font-mono text-amber-400 drop-shadow-[0_2px_10px_rgba(251,191,36,0.5)]">
            {combo}
          </span>
          <span className="text-sm font-bold font-mono text-orange-400 tracking-widest uppercase">
            HITS COMBO!
          </span>
        </div>
      )}

      {/* Boss Health Bar (when Boss is active) */}
      {boss && !boss.defeated && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-[680px] max-w-[90vw] bg-slate-950/90 border-2 border-red-600/80 p-2 rounded shadow-2xl backdrop-blur-xs">
          <div className="flex items-center justify-between text-xs font-bold font-mono mb-1">
            <span className="text-red-400 tracking-wider uppercase">{boss.def.title}</span>
            <span className="text-amber-400 tracking-wider">FASE {boss.phase}</span>
          </div>

          <div className="h-4 bg-slate-900 border border-slate-700 relative overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 transition-all duration-75"
              style={{ width: `${Math.max(0, Math.min(100, (boss.hp / boss.maxHp) * 100))}%` }}
            />
            <span className="absolute inset-0 flex items-center justify-end pr-2 text-[10px] font-mono font-bold text-white drop-shadow">
              {boss.hp} / {boss.maxHp}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
