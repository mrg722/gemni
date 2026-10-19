// Combat World: Collision resolution, projectiles, VFX particles, floating numbers and camera
import { Player } from './player';
import { StreetEnemy } from './enemy';
import { Boss, BossProjectile } from './boss';
import { CombatBox, AttackType, StoryDifficulty } from './types';
import { audioSystem } from '../engine/audio';

export interface FloatingText {
  text: string;
  x: number;
  y: number;
  vy: number;
  color: string;
  life: number;
  maxLife: number;
  fontSize: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
}

export interface PlayerProjectile {
  x: number;
  y: number;
  vx: number;
  damage: number;
  life: number;
  radius: number;
}

export class CombatWorld {
  public player: Player;
  public enemies: StreetEnemy[] = [];
  public boss: Boss | null = null;
  public playerProjectiles: PlayerProjectile[] = [];
  public bossProjectiles: BossProjectile[] = [];
  public particles: Particle[] = [];
  public floatingTexts: FloatingText[] = [];

  public hitstop: number = 0;
  public screenShake: number = 0;
  public cameraX: number = 640;
  public minX: number = 180;
  public maxX: number = 1200;
  public laneMin: number = 505;
  public laneMax: number = 625;

  public score: number = 0;
  public combo: number = 0;
  public maxCombo: number = 0;
  public comboTimer: number = 0;
  public damageTaken: number = 0;
  public defeatedCount: number = 0;
  public difficulty: StoryDifficulty = StoryDifficulty.Normal;

  constructor(player: Player) {
    this.player = player;
  }

  public reset(minX: number = 180, maxX: number = 1200) {
    this.minX = minX;
    this.maxX = maxX;
    this.enemies = [];
    this.boss = null;
    this.playerProjectiles = [];
    this.bossProjectiles = [];
    this.particles = [];
    this.floatingTexts = [];
    this.hitstop = 0;
    this.screenShake = 0;
    this.combo = 0;
    this.comboTimer = 0;
  }

  public spawnFloatingText(text: string, x: number, y: number, color: string = '#facc15', size: number = 16) {
    this.floatingTexts.push({
      text,
      x,
      y,
      vy: -55,
      color,
      life: 0.65,
      maxLife: 0.65,
      fontSize: size,
    });
  }

  public spawnImpactParticles(x: number, y: number, color: string = '#f59e0b', heavy: boolean = false) {
    const count = heavy ? 24 : 12;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const speed = Math.random() * (heavy ? 280 : 160) + 60;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: Math.random() * (heavy ? 6 : 4) + 2,
        life: heavy ? 0.38 : 0.22,
        maxLife: heavy ? 0.38 : 0.22,
      });
    }
  }

  public update(dt: number) {
    if (this.hitstop > 0) {
      this.hitstop -= dt;
      return;
    }

    if (this.screenShake > 0) {
      this.screenShake = Math.max(0, this.screenShake - dt * 2.5);
    }

    // Combo timer
    if (this.comboTimer > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) {
        this.combo = 0;
      }
    }

    // Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 0.92;
      p.vy *= 0.92;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Update Floating text
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.life -= dt;
      ft.y += ft.vy * dt;
      ft.vy *= 0.95;
      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }

    // Update Player Projectiles
    for (let i = this.playerProjectiles.length - 1; i >= 0; i--) {
      const p = this.playerProjectiles[i];
      p.x += p.vx * dt;
      p.life -= dt;

      // Hit enemies
      const pBox = new CombatBox(p.x - p.radius, p.y - p.radius, p.radius * 2, p.radius * 2);
      let hit = false;
      for (const e of this.enemies) {
        if (!e.active || e.isDefeated()) continue;
        if (pBox.intersects(e.getHurtbox())) {
          hit = true;
          e.takeDamage(p.damage, { x: p.vx > 0 ? 380 : -380, y: 0 });
          this.spawnImpactParticles(p.x, p.y, '#38bdf8', true);
          this.spawnFloatingText(`${p.damage}`, e.x, e.y - 80, '#38bdf8', 18);
          this.combo++;
          this.comboTimer = 1.2;
          this.maxCombo = Math.max(this.maxCombo, this.combo);
          this.score += p.damage * 10;
          this.hitstop = 0.08;
          this.screenShake = 0.12;
          break;
        }
      }

      // Hit Boss
      if (!hit && this.boss && !this.boss.defeated) {
        if (pBox.intersects(this.boss.getHurtbox())) {
          hit = true;
          this.boss.takeDamage(p.damage);
          this.spawnImpactParticles(p.x, p.y, '#38bdf8', true);
          this.spawnFloatingText(`${p.damage}`, this.boss.x, this.boss.y - 100, '#38bdf8', 20);
          this.combo++;
          this.comboTimer = 1.2;
          this.maxCombo = Math.max(this.maxCombo, this.combo);
          this.score += p.damage * 12;
          this.hitstop = 0.10;
          this.screenShake = 0.14;
        }
      }

      if (hit || p.life <= 0) {
        this.playerProjectiles.splice(i, 1);
      }
    }

    // Update Boss Projectiles
    for (let i = this.bossProjectiles.length - 1; i >= 0; i--) {
      const bp = this.bossProjectiles[i];
      bp.x += bp.vx * dt;
      bp.life -= dt;

      const bpBox = new CombatBox(bp.x - bp.radius, bp.y - bp.radius, bp.radius * 2, bp.radius * 2);
      if (bpBox.intersects(this.player.getHurtbox())) {
        const hpBefore = this.player.hp;
        this.player.takeDamage(bp.damage, bp.vx * 0.4);
        const dealt = hpBefore - this.player.hp;
        this.damageTaken += dealt;
        this.spawnImpactParticles(this.player.x, this.player.y - 60, bp.color, true);
        this.spawnFloatingText(`-${dealt}`, this.player.x, this.player.y - 90, '#ef4444', 18);
        this.hitstop = 0.10;
        this.screenShake = 0.18;
        this.bossProjectiles.splice(i, 1);
        continue;
      }

      if (bp.life <= 0) {
        this.bossProjectiles.splice(i, 1);
      }
    }

    // Resolve Player Attack Hits
    if (this.player.isAttackActive() && !this.player.hasHit && this.player.attackType !== AttackType.Energy) {
      const pAttackBox = this.player.getAttackHitbox();
      const pDmg = this.player.getAttackDamage();
      const pKnock = this.player.getAttackKnockback();
      const dir = this.player.facing === 1 ? 1 : -1;

      // Hit Enemies
      for (const e of this.enemies) {
        if (!e.active || e.isDefeated()) continue;
        // Depth tolerance check (must be within 40px in Z/Y lane)
        if (Math.abs(this.player.y - e.y) > 42) continue;

        if (pAttackBox.intersects(e.getHurtbox())) {
          this.player.hasHit = true;
          this.player.onAttackConnected({
            comboWindow: 0.45,
            rageGain: 8,
          } as unknown as any);

          const hpBefore = e.hp;
          e.takeDamage(pDmg, { x: dir * pKnock, y: 0 });
          if (hpBefore > 0 && e.isDefeated()) {
            this.defeatedCount++;
          }

          this.combo++;
          this.comboTimer = 1.2;
          this.maxCombo = Math.max(this.maxCombo, this.combo);
          this.score += pDmg * 10 + this.combo * 8;

          const isHeavy = this.player.attackType === AttackType.Kick || this.player.comboStep === 2;
          this.spawnImpactParticles(e.x, e.y - 70, isHeavy ? '#f97316' : '#fde047', isHeavy);
          this.spawnFloatingText(`${pDmg}`, e.x, e.y - 90, isHeavy ? '#f97316' : '#fde047', isHeavy ? 20 : 16);
          this.hitstop = isHeavy ? 0.10 : 0.06;
          this.screenShake = isHeavy ? 0.14 : 0.07;
          break;
        }
      }

      // Hit Boss
      if (this.boss && !this.boss.defeated && !this.player.hasHit) {
        if (Math.abs(this.player.y - this.boss.y) <= 55 && pAttackBox.intersects(this.boss.getHurtbox())) {
          this.player.hasHit = true;
          this.player.onAttackConnected({
            comboWindow: 0.45,
            rageGain: 10,
          } as unknown as any);

          this.boss.takeDamage(pDmg);
          this.combo++;
          this.comboTimer = 1.2;
          this.maxCombo = Math.max(this.maxCombo, this.combo);
          this.score += pDmg * 14 + this.combo * 10;

          const isHeavy = this.player.attackType === AttackType.Kick || this.player.comboStep === 2;
          this.spawnImpactParticles(this.boss.x, this.boss.y - 80, '#f97316', true);
          this.spawnFloatingText(`${pDmg}`, this.boss.x, this.boss.y - 110, '#f97316', 22);
          this.hitstop = 0.12;
          this.screenShake = 0.18;
        }
      }
    }

    // Resolve Enemy Hits vs Player
    for (const e of this.enemies) {
      if (!e.active || e.isDefeated()) continue;
      if (e.isAttackActive() && !e.hasHit) {
        if (Math.abs(this.player.y - e.y) <= 38 && e.getAttackHitbox().intersects(this.player.getHurtbox())) {
          e.hasHit = true;
          const hpBefore = this.player.hp;
          const dir = e.facing === 1 ? 1 : -1;
          this.player.takeDamage(e.attackDamage, dir * 260);
          const dealt = hpBefore - this.player.hp;
          this.damageTaken += dealt;
          this.spawnImpactParticles(this.player.x, this.player.y - 70, '#ef4444', false);
          this.spawnFloatingText(`-${dealt}`, this.player.x, this.player.y - 95, '#ef4444', 18);
          this.combo = 0;
          this.hitstop = 0.08;
          this.screenShake = 0.12;
          break;
        }
      }
    }

    // Resolve Boss Hits vs Player
    if (this.boss && !this.boss.defeated && this.boss.isAttackActive()) {
      if (Math.abs(this.player.y - this.boss.y) <= 50 && this.boss.getAttackHitbox().intersects(this.player.getHurtbox())) {
        const hpBefore = this.player.hp;
        const bDmg = this.boss.getCurrentAttackDamage();
        const dir = this.boss.facing === 1 ? 1 : -1;
        this.player.takeDamage(bDmg, dir * 450);
        const dealt = hpBefore - this.player.hp;
        this.damageTaken += dealt;
        this.spawnImpactParticles(this.player.x, this.player.y - 70, '#dc2626', true);
        this.spawnFloatingText(`-${dealt}`, this.player.x, this.player.y - 100, '#dc2626', 22);
        this.combo = 0;
        this.hitstop = 0.12;
        this.screenShake = 0.24;
      }
    }

    // Clamp Player and Enemies to lane boundaries
    this.player.x = Math.max(this.minX, Math.min(this.maxX, this.player.x));
    this.player.y = Math.max(this.laneMin, Math.min(this.laneMax, this.player.y));

    for (const e of this.enemies) {
      e.x = Math.max(this.minX, Math.min(this.maxX, e.x));
      e.y = Math.max(this.laneMin, Math.min(this.laneMax, e.y));
    }

    if (this.boss) {
      this.boss.x = Math.max(this.minX + 80, Math.min(this.maxX - 80, this.boss.x));
      this.boss.y = Math.max(this.laneMin, Math.min(this.laneMax, this.boss.y));
    }

    // Separation steering: prevent enemies from overlapping
    for (let i = 0; i < this.enemies.length; i++) {
      for (let j = i + 1; j < this.enemies.length; j++) {
        const e1 = this.enemies[i];
        const e2 = this.enemies[j];
        if (!e1.active || e1.isDefeated() || !e2.active || e2.isDefeated()) continue;
        const dx = e2.x - e1.x;
        const dy = e2.y - e1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 65 && dist > 0.01) {
          const push = (65 - dist) * 0.5;
          const nx = dx / dist;
          const ny = dy / dist;
          e1.x -= nx * push * 0.1;
          e1.y -= ny * push * 0.1;
          e2.x += nx * push * 0.1;
          e2.y += ny * push * 0.1;
        }
      }
    }

    // Camera smoothing
    const targetCamX = Math.max(640, Math.min(this.maxX - 640, this.player.x));
    this.cameraX += (targetCamX - this.cameraX) * 0.1;
  }

  // Draw floating numbers and particles on screen
  public drawVFX(ctx: CanvasRenderingContext2D) {
    // Draw Particles
    for (const p of this.particles) {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * (p.life / p.maxLife), 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw Floating Text Numbers
    for (const ft of this.floatingTexts) {
      ctx.save();
      ctx.font = `bold ${ft.fontSize}px sans-serif`;
      ctx.fillStyle = ft.color;
      ctx.shadowColor = '#000';
      ctx.shadowBlur = 4;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }
  }
}
