import React from 'react';
import { StreetEnemyType, BossId } from '../game/types';
import { CHARACTER_VISUALS } from '../game/combatData';

interface VSConfig {
  stage: number;
  scenario: number;
  enemyCount: number;
  enemyTypes: StreetEnemyType[];
  selectedCharacter: number;
  selectedBoss: number; // -1 = None, 0..4 = BossId
}

interface VSModeLabProps {
  config: VSConfig;
  onChangeConfig: (newConfig: VSConfig) => void;
  onStartFight: () => void;
  onBackToMenu: () => void;
}

const STAGES = [
  { id: 0, name: 'STAGE 1 // SLUM DISTRICT', scenarios: ['Barrio Bajo // Bloque 17', 'Mercado Antiguo // Línea Canal', 'Puerta de Acero', 'Astillero de Brakk'] },
  { id: 1, name: 'STAGE 2 // OLD STEEL YARD', scenarios: ['Deep Line // Entrada', 'Old Steel Yard // Fundición', 'Zona Química', 'Depósitos', 'Cámara de Grinder'] },
  { id: 2, name: 'STAGE 3 // ASTRA TOWER', scenarios: ['Public Atrium', 'Research Floor', 'Executive Core'] },
  { id: 3, name: 'STAGE 4 // KESSLER TOWER', scenarios: ['Kessler Tower // Seguridad', 'Núcleo Ejecutivo // Titan-X Mejorado'] },
  { id: 4, name: 'STAGE 5 // CAMARA DEL CLON', scenarios: ['Cámara del Clon // Duelo'] },
];

const ENEMY_OPTIONS = [
  { type: StreetEnemyType.Punk, name: 'Punk' },
  { type: StreetEnemyType.Brute, name: 'Brute' },
  { type: StreetEnemyType.Charger, name: 'Charger' },
  { type: StreetEnemyType.Enforcer, name: 'Enforcer' },
  { type: StreetEnemyType.ChemicalSoldier, name: 'Chemical Soldier' },
  { type: StreetEnemyType.UrbanNinja, name: 'Urban Ninja' },
  { type: StreetEnemyType.Mutant, name: 'Mutant' },
  { type: StreetEnemyType.ArmoredGuard, name: 'Armored Guard' },
];

const BOSS_OPTIONS = [
  { id: -1, name: 'NINGUNO (COMBATE DE CALLE)' },
  { id: BossId.Brakk, name: 'BRAKK // LA CADENA' },
  { id: BossId.Grinder, name: 'GRINDER // EL SEGADOR' },
  { id: BossId.TitanX, name: 'TITAN-X // PROTOTIPO' },
  { id: BossId.TitanXMejorado, name: 'TITAN-X MEJORADO' },
  { id: BossId.RayderClone, name: 'RAYDER CLONE // FINAL' },
];

export const VSModeLab: React.FC<VSModeLabProps> = ({
  config,
  onChangeConfig,
  onStartFight,
  onBackToMenu,
}) => {
  const currentStageInfo = STAGES[config.stage] || STAGES[0];

  const update = (patch: Partial<VSConfig>) => {
    onChangeConfig({ ...config, ...patch });
  };

  return (
    <div className="absolute inset-0 bg-slate-950/95 z-50 flex flex-col p-6 text-slate-100 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-cyan-500/40 pb-4 mb-6">
        <div>
          <h2 className="text-3xl font-bold font-mono text-cyan-400 tracking-wider">
            MODO VS // LABORATORIO
          </h2>
          <p className="text-xs font-mono text-slate-400">
            Entorno de pruebas de colisiones, escalado, hitboxes y duelos con hasta 4 enemigos o bosses.
          </p>
        </div>

        <button
          onClick={onBackToMenu}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded text-sm font-mono font-bold transition-colors cursor-pointer border border-slate-600"
        >
          MENU PRINCIPAL [ESC]
        </button>
      </div>

      {/* Main Form Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto w-full">
        {/* Stage & Scenario */}
        <div className="bg-slate-900/80 p-4 rounded border border-slate-800 flex flex-col gap-4">
          <h3 className="text-sm font-bold font-mono text-amber-400 border-b border-slate-800 pb-2">
            1. ESCENARIO
          </h3>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">STAGE</label>
            <select
              value={config.stage}
              onChange={(e) => {
                const s = parseInt(e.target.value);
                update({ stage: s, scenario: 0 });
              }}
              className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm font-mono text-cyan-300"
            >
              {STAGES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">ZONA / ESCENARIO</label>
            <select
              value={config.scenario}
              onChange={(e) => update({ scenario: parseInt(e.target.value) })}
              className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm font-mono text-slate-200"
            >
              {currentStageInfo.scenarios.map((sc, i) => (
                <option key={i} value={i}>
                  {sc}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Character Skin Selector */}
        <div className="bg-slate-900/80 p-4 rounded border border-slate-800 flex flex-col gap-4">
          <h3 className="text-sm font-bold font-mono text-amber-400 border-b border-slate-800 pb-2">
            2. PERSONAJE JUGABLE
          </h3>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">SELECCIONAR ROSTER</label>
            <select
              value={config.selectedCharacter}
              onChange={(e) => update({ selectedCharacter: parseInt(e.target.value) })}
              className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm font-mono text-cyan-300"
            >
              {CHARACTER_VISUALS.map((c, i) => (
                <option key={i} value={i}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs font-mono text-slate-400 bg-slate-950/60 p-3 rounded">
            <div>
              HP Base:{' '}
              <strong className="text-emerald-400">
                {CHARACTER_VISUALS[config.selectedCharacter]?.maxHp || 100}
              </strong>
            </div>
            <div>
              Multiplicador Daño:{' '}
              <strong className="text-amber-400">
                {CHARACTER_VISUALS[config.selectedCharacter]?.damageMultiplier}x
              </strong>
            </div>
            <div>
              Multiplicador Velocidad:{' '}
              <strong className="text-cyan-400">
                {CHARACTER_VISUALS[config.selectedCharacter]?.speedMultiplier}x
              </strong>
            </div>
          </div>
        </div>

        {/* Boss or Enemies */}
        <div className="bg-slate-900/80 p-4 rounded border border-slate-800 flex flex-col gap-4 md:col-span-2">
          <h3 className="text-sm font-bold font-mono text-amber-400 border-b border-slate-800 pb-2">
            3. OPONENTE // BOSS O ENEMIGOS
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">MODALIDAD DE BOSS</label>
              <select
                value={config.selectedBoss}
                onChange={(e) => update({ selectedBoss: parseInt(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm font-mono text-rose-300"
              >
                {BOSS_OPTIONS.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            {config.selectedBoss === -1 && (
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">
                  CANTIDAD DE ENEMIGOS (1 A 4)
                </label>
                <input
                  type="range"
                  min="1"
                  max="4"
                  value={config.enemyCount}
                  onChange={(e) => update({ enemyCount: parseInt(e.target.value) })}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <span className="text-xs font-mono font-bold text-cyan-400">
                  {config.enemyCount} enemigos simultáneos
                </span>
              </div>
            )}
          </div>

          {/* Individual Enemy slots when no boss is selected */}
          {config.selectedBoss === -1 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
              {Array.from({ length: config.enemyCount }).map((_, idx) => (
                <div key={idx} className="bg-slate-950 p-2 rounded border border-slate-800">
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    Slot {idx + 1}
                  </label>
                  <select
                    value={config.enemyTypes[idx] ?? StreetEnemyType.Punk}
                    onChange={(e) => {
                      const copy = [...config.enemyTypes];
                      copy[idx] = parseInt(e.target.value) as StreetEnemyType;
                      update({ enemyTypes: copy });
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-slate-200"
                  >
                    {ENEMY_OPTIONS.map((eo) => (
                      <option key={eo.type} value={eo.type}>
                        {eo.name}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Start Button */}
      <div className="mt-8 flex justify-center">
        <button
          onClick={onStartFight}
          className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-lg font-mono px-12 py-4 rounded shadow-2xl transition-all transform hover:scale-105 cursor-pointer tracking-wider"
        >
          INICIAR COMBATE [ENTER / J]
        </button>
      </div>
    </div>
  );
};
