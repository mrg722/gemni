import React, { useState, useEffect } from 'react';
import { StoryDifficulty } from '../game/types';
import { audioSystem } from '../engine/audio';

interface MenuProps {
  onNewGame: () => void;
  onOpenVSMode: () => void;
  onOpenControls: () => void;
  onOpenAtlasViewer: () => void;
  difficulty: StoryDifficulty;
  onChangeDifficulty: (newDiff: StoryDifficulty) => void;
  use120Atlas: boolean;
  onToggle120Atlas: () => void;
}

export const Menu: React.FC<MenuProps> = ({
  onNewGame,
  onOpenVSMode,
  onOpenControls,
  onOpenAtlasViewer,
  difficulty,
  onChangeDifficulty,
  use120Atlas,
  onToggle120Atlas,
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [showOptionsModal, setShowOptionsModal] = useState<boolean>(false);
  const [showCreditsModal, setShowCreditsModal] = useState<boolean>(false);

  const menuItems = [
    { label: 'NUEVA PARTIDA', action: onNewGame },
    { label: 'MODO VS // LABORATORIO', action: onOpenVSMode },
    {
      label: `DIFICULTAD: ${
        difficulty === StoryDifficulty.Easy
          ? 'FACIL'
          : difficulty === StoryDifficulty.Hard
          ? 'DIFICIL'
          : 'NORMAL'
      }`,
      action: () => {
        const next =
          difficulty === StoryDifficulty.Easy
            ? StoryDifficulty.Normal
            : difficulty === StoryDifficulty.Normal
            ? StoryDifficulty.Hard
            : StoryDifficulty.Easy;
        onChangeDifficulty(next);
        audioSystem.play('Ui');
      },
    },
    { label: 'CONTROLES', action: onOpenControls },
    { label: 'VISOR DE ATLAS 120 FRAMES', action: onOpenAtlasViewer },
    { label: 'OPCIONES DE MOTOR', action: () => setShowOptionsModal(true) },
    { label: 'CREDITOS // IP ORIGINAL', action: () => setShowCreditsModal(true) },
  ];

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showOptionsModal || showCreditsModal) {
        if (e.key === 'Escape') {
          setShowOptionsModal(false);
          setShowCreditsModal(false);
        }
        return;
      }

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + menuItems.length) % menuItems.length);
        audioSystem.play('Ui');
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % menuItems.length);
        audioSystem.play('Ui');
      } else if (e.key === 'Enter' || e.key === 'j' || e.key === 'J') {
        e.preventDefault();
        menuItems[selectedIndex].action();
        audioSystem.play('Ui');
      } else if (e.key === 'v' || e.key === 'V') {
        onOpenVSMode();
      } else if (e.key === 'c' || e.key === 'C') {
        onOpenControls();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, showOptionsModal, showCreditsModal, difficulty]);

  return (
    <div className="relative w-full h-full bg-slate-950 overflow-hidden flex items-center justify-center select-none">
      {/* Background Illustrated Art */}
      <div className="absolute inset-0 z-0">
        <img
          src="/assets/ui/menu_main_art.png"
          alt="District Fury Menu Art"
          className="w-full h-full object-cover object-center opacity-85"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/80" />
      </div>

      {/* Main Menu Box */}
      <div className="relative z-10 w-[780px] max-w-[95vw] bg-slate-950/92 border border-slate-700/80 rounded-lg p-8 shadow-2xl backdrop-blur-xs flex flex-col items-center">
        {/* Glowing Side Accents */}
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-cyan-400 to-blue-600 rounded-l" />
        <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-amber-400 to-orange-500 rounded-r" />

        {/* Title & Subtitles */}
        <h1 className="text-5xl font-black font-mono tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-cyan-200 to-white drop-shadow-[0_4px_16px_rgba(6,182,212,0.4)]">
          DISTRICT FURY
        </h1>
        <div className="text-cyan-400 font-mono text-xs font-bold tracking-widest mt-1">
          BEAT-EM-UP DE HISTORIA // ARCADE 2D
        </div>
        <div className="text-amber-400 font-mono text-sm font-semibold tracking-wider mt-1 mb-8">
          CAPITULO 1 // LA RUTA DE LAS CADENAS
        </div>

        {/* Menu Items List */}
        <div className="w-full max-w-[460px] flex flex-col gap-2">
          {menuItems.map((item, idx) => {
            const isSelected = selectedIndex === idx;
            return (
              <button
                key={idx}
                onClick={() => {
                  setSelectedIndex(idx);
                  item.action();
                  audioSystem.play('Ui');
                }}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`relative flex items-center justify-between px-6 py-2.5 rounded font-mono transition-all text-left cursor-pointer border ${
                  isSelected
                    ? 'bg-gradient-to-r from-cyan-950/90 to-blue-900/70 border-cyan-400 text-amber-200 shadow-[0_0_15px_rgba(6,182,212,0.3)] translate-x-1'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                {/* Selector Arrow */}
                <div className="flex items-center gap-3">
                  <span
                    className={`text-sm ${
                      isSelected ? 'text-cyan-400 font-black animate-pulse' : 'text-transparent'
                    }`}
                  >
                    ▶
                  </span>
                  <span className={`text-sm font-bold tracking-wider ${isSelected ? 'text-white' : ''}`}>
                    {item.label}
                  </span>
                </div>

                {isSelected && (
                  <span className="text-[11px] font-mono text-cyan-400/80 font-bold tracking-widest">
                    [ENTER]
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Keyhints */}
        <div className="mt-8 pt-4 border-t border-slate-800/80 w-full text-center font-mono text-xs text-slate-400 flex justify-center gap-6">
          <span>
            <strong className="text-amber-400">ENTER / J</strong> Jugar
          </span>
          <span>
            <strong className="text-cyan-400">C</strong> Controles
          </span>
          <span>
            <strong className="text-cyan-400">V</strong> Modo VS
          </span>
          <span>
            <strong className="text-amber-400">↑ / ↓</strong> Mover cursor
          </span>
        </div>
      </div>

      {/* Options Modal */}
      {showOptionsModal && (
        <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-700 p-6 rounded max-w-md w-full font-mono flex flex-col gap-4">
            <h3 className="text-lg font-bold text-cyan-400 border-b border-slate-800 pb-2">
              OPCIONES DE MOTOR Y AUDIO
            </h3>

            <div className="flex items-center justify-between py-2 border-b border-slate-800">
              <span className="text-sm text-slate-200">Sonido y Efectos</span>
              <button
                onClick={() => {
                  audioSystem.setMuted(!audioSystem.isMuted());
                }}
                className={`px-3 py-1 rounded text-xs font-bold cursor-pointer ${
                  audioSystem.isMuted() ? 'bg-red-900 text-red-200' : 'bg-emerald-800 text-emerald-200'
                }`}
              >
                {audioSystem.isMuted() ? 'SILENCIADO' : 'ACTIVADO'}
              </button>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-800">
              <div>
                <span className="text-sm text-slate-200 block">Render con Atlas 120</span>
                <span className="text-[10px] text-slate-400 block">
                  Usa los nuevos atlas de 120 frames para personajes y enemigos
                </span>
              </div>
              <button
                onClick={onToggle120Atlas}
                className={`px-3 py-1 rounded text-xs font-bold cursor-pointer ${
                  use120Atlas ? 'bg-cyan-700 text-cyan-100' : 'bg-slate-800 text-slate-300'
                }`}
              >
                {use120Atlas ? '120 FRAMES' : 'CLASICO'}
              </button>
            </div>

            <button
              onClick={() => setShowOptionsModal(false)}
              className="mt-2 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 rounded text-xs cursor-pointer"
            >
              VOLVER [ESC]
            </button>
          </div>
        </div>
      )}

      {/* Credits Modal */}
      {showCreditsModal && (
        <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-700 p-6 rounded max-w-lg w-full font-mono flex flex-col gap-4">
            <h3 className="text-lg font-bold text-amber-400 border-b border-slate-800 pb-2">
              DISTRICT FURY // CREDITOS
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed">
              District Fury es una IP original de videojuego 2D beat'em up / arcade brawler con
              combate reactivo, hitboxes/hurtboxes precisas, combos encadenables, 5 stages de historia,
              enemigos con IA adaptativa y modo laboratorio.
            </p>

            <div className="text-[11px] text-slate-400 space-y-1 bg-slate-900/60 p-3 rounded">
              <div>• Personajes originales: Rayden Cruz, Brakk, Grinder, Titan-X, Titan-X Mejorado, Dr. Kessler</div>
              <div>• Motor: React + Canvas 2D + Web Audio API (60 FPS)</div>
              <div>• Sprite Atlases: 120 frames de alta definición por entidad</div>
            </div>

            <button
              onClick={() => setShowCreditsModal(false)}
              className="mt-2 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 rounded text-xs cursor-pointer"
            >
              CERRAR [ESC]
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
