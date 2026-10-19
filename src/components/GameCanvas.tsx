import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Player } from '../game/player';
import { StreetEnemy } from '../game/enemy';
import { Boss } from '../game/boss';
import { CombatWorld } from '../game/combatWorld';
import { CAMPAIGN_STAGES, CampaignManager } from '../game/campaign';
import { StoryDifficulty, BossId } from '../game/types';
import { assetManager } from '../engine/assets';
import { audioSystem } from '../engine/audio';
import { HUD } from './HUD';
import { SerumModal } from './SerumModal';

interface GameCanvasProps {
  campaign: CampaignManager;
  mode: 'campaign' | 'vs';
  vsConfig?: {
    stage: number;
    scenario: number;
    enemyCount: number;
    enemyTypes: number[];
    selectedCharacter: number;
    selectedBoss: number;
  };
  use120Atlas: boolean;
  onExitToMenu: () => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  campaign,
  mode,
  vsConfig,
  use120Atlas,
  onExitToMenu,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Entities
  const playerRef = useRef<Player>(new Player());
  const combatWorldRef = useRef<CombatWorld>(new CombatWorld(playerRef.current));

  // Game state
  const [gameState, setGameState] = useState<
    'intro' | 'combat' | 'dialogue' | 'boss_intro' | 'boss' | 'stage_clear' | 'game_over' | 'serum'
  >('combat');
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [currentScenarioIdx, setCurrentScenarioIdx] = useState<number>(0);
  const [activeStageId, setActiveStageId] = useState<number>(campaign.currentStage);
  const [dialogueLineIdx, setDialogueLineIdx] = useState<number>(0);
  const [stageTime, setStageTime] = useState<number>(0);
  const [finalRank, setFinalRank] = useState<string>('B');

  // Input state
  const keysRef = useRef<{
    left: boolean;
    right: boolean;
    up: boolean;
    down: boolean;
    punch: boolean;
    kick: boolean;
    energy: boolean;
    dash: boolean;
    rage: boolean;
    block: boolean;
  }>({
    left: false,
    right: false,
    up: false,
    down: false,
    punch: false,
    kick: false,
    energy: false,
    dash: false,
    rage: false,
    block: false,
  });

  const stageDef = CAMPAIGN_STAGES[activeStageId] || CAMPAIGN_STAGES[1];
  const scenario = stageDef.scenarios[currentScenarioIdx] || stageDef.scenarios[0];

  // Initialize or restart stage
  const initStage = useCallback(
    (stageNum: number, scenarioIdx: number = 0) => {
      const p = playerRef.current;
      p.applyUpgrades(campaign.upgrades);
      p.reset();
      p.x = 220;
      p.y = 585;

      const cw = combatWorldRef.current;
      cw.reset(scenario.startX, scenario.endX);
      cw.difficulty = campaign.difficulty;

      if (mode === 'vs' && vsConfig) {
        // VS Mode Setup
        p.applyCharacter(vsConfig.selectedCharacter);
        p.x = 320;
        p.y = 585;

        if (vsConfig.selectedBoss >= 0) {
          const boss = new Boss();
          boss.reset(vsConfig.selectedBoss as BossId, { x: 920, y: 585 });
          cw.boss = boss;
        } else {
          // Spawn custom enemies
          const count = Math.min(4, Math.max(1, vsConfig.enemyCount));
          const xs = [680, 820, 960, 1100];
          const ys = [575, 535, 610, 550];
          for (let i = 0; i < count; i++) {
            const e = new StreetEnemy();
            e.init({ x: xs[i], y: ys[i] }, vsConfig.enemyTypes[i]);
            cw.enemies.push(e);
          }
        }
        setGameState(vsConfig.selectedBoss >= 0 ? 'boss' : 'combat');
      } else {
        // Campaign setup
        // Spawn scenario wave
        scenario.waves.forEach((w) => {
          const e = new StreetEnemy();
          e.init({ x: w.x, y: w.y }, w.type);
          cw.enemies.push(e);
        });

        // Check if final scenario with Boss
        if (scenarioIdx === stageDef.scenarios.length - 1) {
          const boss = new Boss();
          boss.reset(stageDef.bossId, { x: scenario.endX - 350, y: 585 });
          cw.boss = boss;
        }

        setGameState('combat');
      }

      setStageTime(0);
      setIsPaused(false);
    },
    [mode, vsConfig, scenario, stageDef, campaign]
  );

  useEffect(() => {
    initStage(activeStageId, currentScenarioIdx);
  }, [activeStageId, currentScenarioIdx, initStage]);

  // Input listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        setIsPaused((prev) => !prev);
        return;
      }

      // Debug Stage jumping F1..F5
      if (e.key === 'F1') { setActiveStageId(1); setCurrentScenarioIdx(0); return; }
      if (e.key === 'F2') { setActiveStageId(2); setCurrentScenarioIdx(0); return; }
      if (e.key === 'F3') { setActiveStageId(3); setCurrentScenarioIdx(0); return; }
      if (e.key === 'F4') { setActiveStageId(4); setCurrentScenarioIdx(0); return; }
      if (e.key === 'F5') { setActiveStageId(5); setCurrentScenarioIdx(0); return; }

      // Movement
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keysRef.current.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keysRef.current.right = true;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') keysRef.current.up = true;
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') keysRef.current.down = true;

      // Combat
      if (e.key === 'j' || e.key === 'J' || e.key === 'Enter') keysRef.current.punch = true;
      if (e.key === 'k' || e.key === 'K') keysRef.current.kick = true;
      if (e.key === 'l' || e.key === 'L') keysRef.current.energy = true;
      if (e.key === 'Shift') keysRef.current.dash = true;
      if (e.key === ' ') keysRef.current.rage = true;

      // Restart on GameOver
      if (gameState === 'game_over' && (e.key === 'r' || e.key === 'R')) {
        initStage(activeStageId, currentScenarioIdx);
      }
      if (gameState === 'game_over' && (e.key === 'q' || e.key === 'Q')) {
        onExitToMenu();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keysRef.current.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keysRef.current.right = false;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') keysRef.current.up = false;
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') keysRef.current.down = false;

      if (e.key === 'j' || e.key === 'J' || e.key === 'Enter') keysRef.current.punch = false;
      if (e.key === 'k' || e.key === 'K') keysRef.current.kick = false;
      if (e.key === 'l' || e.key === 'L') keysRef.current.energy = false;
      if (e.key === 'Shift') keysRef.current.dash = false;
      if (e.key === ' ') keysRef.current.rage = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, activeStageId, currentScenarioIdx, initStage, onExitToMenu]);

  // Main 60 FPS Game Loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.033);
      lastTime = currentTime;

      const canvas = canvasRef.current;
      if (!canvas) {
        animationFrameId = requestAnimationFrame(loop);
        return;
      }
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        animationFrameId = requestAnimationFrame(loop);
        return;
      }

      ctx.imageSmoothingEnabled = false;

      const p = playerRef.current;
      const cw = combatWorldRef.current;

      // Update Logic if not paused and alive
      if (!isPaused && gameState !== 'game_over' && gameState !== 'stage_clear' && gameState !== 'serum') {
        setStageTime((prev) => prev + dt);

        // Player update
        p.handleInput(keysRef.current, dt);
        p.update(dt);

        // Check if player died
        if (p.hp <= 0) {
          setGameState('game_over');
        }

        // Enemies update
        cw.enemies.forEach((e) => {
          e.update(dt, p.x, p.y, p.isAttackActive());
        });

        // Boss update
        if (cw.boss && !cw.boss.defeated) {
          cw.boss.update(
            dt,
            p.x,
            p.y,
            p.isAttackActive(),
            (bp) => cw.bossProjectiles.push(bp),
            (shake) => (cw.screenShake = shake)
          );

          // Check if boss died
          if (cw.boss.defeated) {
            audioSystem.play('StageClear');
            const rank = campaign.calculateRank(stageTime, cw.maxCombo, p.hp, cw.damageTaken);
            setFinalRank(rank);
            setGameState('stage_clear');
          }
        }

        // Energy projectile release trigger
        if (p.attackType === 3 && p.energyReleased) {
          p.energyReleased = false;
          const dir = p.facing === 1 ? 1 : -1;
          cw.playerProjectiles.push({
            x: p.x + dir * 65,
            y: p.y - 70,
            vx: dir * 720,
            damage: p.isRageMode ? 32 : 22,
            life: 1.2,
            radius: 22,
          });
          cw.spawnImpactParticles(p.x + dir * 40, p.y - 70, '#38bdf8', true);
        }

        // Check wave clearing to advance scenario
        const allEnemiesDefeated = cw.enemies.length > 0 && cw.enemies.every((e) => e.isDefeated());
        if (allEnemiesDefeated && !cw.boss && mode === 'campaign') {
          if (currentScenarioIdx < stageDef.scenarios.length - 1) {
            setCurrentScenarioIdx((prev) => prev + 1);
          }
        }

        // Combat resolution & VFX
        cw.update(dt);
      }

      // --- RENDERING CANVAS ---
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      // Screen shake translation
      if (cw.screenShake > 0) {
        const shakeX = (Math.random() - 0.5) * cw.screenShake * 35;
        const shakeY = (Math.random() - 0.5) * cw.screenShake * 35;
        ctx.translate(shakeX, shakeY);
      }

      // World Camera translation
      ctx.translate(-cw.cameraX + 640, 0);

      // Draw Background
      const bgImg = assetManager.getImage(scenario.bgKey) || assetManager.getImage('bg_steel');
      if (bgImg && bgImg.naturalWidth > 0) {
        // Tile or stretch background
        ctx.drawImage(bgImg, 0, 0, 2560, 720);
      } else {
        ctx.fillStyle = '#0a0f1d';
        ctx.fillRect(0, 0, 3000, 720);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, 500, 3000, 220); // Lane floor
      }

      // Collect all entities for 2.5D Depth Sorting (Z-order by Y position)
      type EntityItem = { y: number; draw: () => void };
      const renderList: EntityItem[] = [];

      // Player
      renderList.push({
        y: p.y,
        draw: () => p.draw(ctx),
      });

      // Enemies
      cw.enemies.forEach((e) => {
        renderList.push({
          y: e.y,
          draw: () => e.draw(ctx, use120Atlas),
        });
      });

      // Boss
      if (cw.boss) {
        renderList.push({
          y: cw.boss.y,
          draw: () => cw.boss?.draw(ctx, use120Atlas),
        });
      }

      // Sort by Y ascending: higher Y is closer to screen bottom and drawn in front!
      renderList.sort((a, b) => a.y - b.y);
      renderList.forEach((item) => item.draw());

      // Draw Player Projectiles (Energy waves)
      cw.playerProjectiles.forEach((proj) => {
        ctx.save();
        ctx.fillStyle = '#38bdf8';
        ctx.shadowColor = '#0284c7';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, proj.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, proj.radius * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Draw Boss Projectiles
      cw.bossProjectiles.forEach((bProj) => {
        ctx.save();
        ctx.fillStyle = bProj.color;
        ctx.shadowColor = bProj.color;
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.arc(bProj.x, bProj.y, bProj.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Draw VFX Particles and floating numbers
      cw.drawVFX(ctx);

      ctx.restore();

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [
    isPaused,
    gameState,
    mode,
    currentScenarioIdx,
    stageDef,
    scenario,
    use120Atlas,
    activeStageId,
    stageTime,
    campaign,
  ]);

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center select-none overflow-hidden">
      {/* 16:9 1280x720 Virtual Arcade Canvas */}
      <div className="relative w-full max-w-[1280px] aspect-video max-h-[720px] bg-slate-950 shadow-2xl overflow-hidden">
        <canvas
          ref={canvasRef}
          width={1280}
          height={720}
          className="w-full h-full object-contain pixelated"
        />

        {/* In-Game HUD */}
        <HUD
          player={playerRef.current}
          boss={combatWorldRef.current.boss}
          stageTitle={stageDef.title}
          scenarioName={scenario.name}
          combo={combatWorldRef.current.combo}
          score={combatWorldRef.current.score}
          onPause={() => setIsPaused(!isPaused)}
          isPaused={isPaused}
        />

        {/* Pause Overlay */}
        {isPaused && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xs flex flex-col items-center justify-center z-40">
            <h2 className="text-4xl font-black font-mono text-cyan-400 tracking-widest mb-6">
              JUEGO EN PAUSA
            </h2>
            <div className="flex flex-col gap-3 w-64 font-mono font-bold text-sm">
              <button
                onClick={() => setIsPaused(false)}
                className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 py-2.5 rounded transition-colors cursor-pointer"
              >
                REANUDAR [ESC]
              </button>
              <button
                onClick={() => initStage(activeStageId, currentScenarioIdx)}
                className="bg-slate-800 hover:bg-slate-700 text-white py-2.5 rounded transition-colors cursor-pointer border border-slate-700"
              >
                REINICIAR [R]
              </button>
              <button
                onClick={onExitToMenu}
                className="bg-red-950/80 hover:bg-red-900 text-red-200 py-2.5 rounded transition-colors cursor-pointer border border-red-800"
              >
                SALIR AL MENU
              </button>
            </div>
          </div>
        )}

        {/* Game Over Screen */}
        {gameState === 'game_over' && (
          <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-50 animate-fade-in">
            <h2 className="text-6xl font-black font-mono text-red-600 tracking-widest drop-shadow-[0_0_25px_rgba(220,38,38,0.8)]">
              DERROTA
            </h2>
            <p className="text-sm font-mono text-slate-400 mt-2 mb-8">
              Rayden ha caído en combate.
            </p>
            <div className="flex gap-4 font-mono font-bold text-sm">
              <button
                onClick={() => initStage(activeStageId, currentScenarioIdx)}
                className="bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded cursor-pointer"
              >
                REINTENTAR [R]
              </button>
              <button
                onClick={onExitToMenu}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-6 py-3 rounded cursor-pointer border border-slate-700"
              >
                MENU [Q]
              </button>
            </div>
          </div>
        )}

        {/* Stage Clear Screen */}
        {gameState === 'stage_clear' && (
          <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center z-50">
            <div className="bg-slate-950 border-2 border-amber-400 p-8 rounded-lg max-w-lg w-full text-center shadow-2xl flex flex-col gap-4 font-mono">
              <span className="text-xs text-amber-400 tracking-widest uppercase">VICTORIA TOTAL</span>
              <h2 className="text-3xl font-black text-white">{stageDef.title} SUPERADO</h2>

              {/* Stats */}
              <div className="bg-slate-900/80 p-4 rounded border border-slate-800 text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">TIEMPO:</span>
                  <span className="text-white font-bold">{Math.round(stageTime)} segundos</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">MAX COMBO:</span>
                  <span className="text-amber-400 font-bold">
                    {combatWorldRef.current.maxCombo} HITS
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">PUNTUACION:</span>
                  <span className="text-cyan-400 font-bold">
                    {combatWorldRef.current.score.toString().padStart(6, '0')}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                  <span className="text-slate-400">RANGO OBTENIDO:</span>
                  <span className="text-4xl font-black text-amber-400">{finalRank}</span>
                </div>
              </div>

              {mode === 'campaign' ? (
                <button
                  onClick={() => setGameState('serum')}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3 rounded text-sm cursor-pointer transition-colors"
                >
                  SELECCIONAR SUERO X // CONTINUAR
                </button>
              ) : (
                <button
                  onClick={onExitToMenu}
                  className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black py-3 rounded text-sm cursor-pointer"
                >
                  VOLVER AL LABORATORIO
                </button>
              )}
            </div>
          </div>
        )}

        {/* Post-Stage Serum Modal */}
        {gameState === 'serum' && (
          <SerumModal
            stageCleared={activeStageId}
            options={campaign.getRewardOptions(activeStageId)}
            onSelectOption={(idx) => {
              campaign.applyReward(activeStageId, idx);
              if (activeStageId < 5) {
                setActiveStageId((prev) => prev + 1);
                setCurrentScenarioIdx(0);
                setGameState('combat');
              } else {
                // Campaign Finished!
                onExitToMenu();
              }
            }}
          />
        )}
      </div>
    </div>
  );
};
