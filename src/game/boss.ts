// Boss implementation matching District Fury BossDefinition and multi-phase AI
import { BossId, BossDefinition, Facing, CombatBox } from './types';
import { BOSS_DEFINITIONS } from './combatData';
import { assetManager } from '../engine/assets';
import { audioSystem } from '../engine/audio';

export interface BossProjectile {
  x: number;
  y: number;
  vx: number;
  damage: number;
  life: number;
  radius: number;
  color: string;
}

export class Boss {
  public id: BossId = BossId.Brakk;
  public def: BossDefinition = BOSS_DEFINITIONS[BossId.Brakk];
  public x: number = 900;
  public y: number = 585;
  public vx: number = 0;
  public vy: number = 0;
  public facing: Facing = Facing.Left;

  public hp: number = 1200;
  public maxHp: number = 1200;
  public phase: number = 1;
  public attackTimer: number = 1.0;
  public elapsed: number = 0;
  public invuln: number = 0;
  public currentAttackIndex: number = -1;
  public attackResolved: boolean = false;
  public defeated: boolean = false;
  public blocking: boolean = false;

  private animTimer: number = 0;
  private animFrame: number = 0;

  constructor() {}

  public reset(id: BossId, pos: { x: number; y: number }) {
    this.id = id;
    this.def = BOSS_DEFINITIONS[id];
    this.x = pos.x;
    this.y = pos.y;
    this.maxHp = this.def.maxHp;
    this.hp = this.maxHp;
    this.phase = 1;
    this.attackTimer = 1.0;
    this.elapsed = 0;
    this.invuln = 0;
    this.currentAttackIndex = -1;
    this.attackResolved = false;
    this.defeated = false;
    this.blocking = false;
    this.vx = 0;
    this.vy = 0;
    this.facing = Facing.Left;
  }

  public takeDamage(dmg: number) {
    if (this.defeated || this.invuln > 0) return;

    if (this.blocking) {
      dmg = Math.max(1, Math.round(dmg * 0.2));
    }

    this.hp = Math.max(0, this.hp - dmg);
    this.invuln = 0.12;

    if (this.hp <= 0) {
      this.defeated = true;
      audioSystem.play('GameOver');
      return;
    }

    // Check phase transition
    const ratio = this.hp / this.maxHp;
    if (this.phase === 1 && ratio <= this.def.phases[0].hpRatioThreshold) {
      this.phase = 2;
      this.attackTimer = 0.2;
      audioSystem.play('BossPhase');
    } else if (this.phase === 2 && this.def.phases[1] && ratio <= this.def.phases[1].hpRatioThreshold) {
      this.phase = 3;
      this.attackTimer = 0.1;
      audioSystem.play('BossPhase');
    }
  }

  public update(
    dt: number,
    playerX: number,
    playerY: number,
    playerAttacking: boolean,
    onSpawnProjectile: (p: BossProjectile) => void,
    onScreenShake: (intensity: number) => void
  ) {
    if (this.defeated) return;

    this.elapsed += dt;
    this.animTimer += dt;
    if (this.invuln > 0) this.invuln -= dt;

    // Face player
    if (this.currentAttackIndex === -1) {
      this.facing = playerX > this.x ? Facing.Right : Facing.Left;
    }

    const dx = playerX - this.x;
    const dy = playerY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Active Phase multipliers
    const phaseIdx = Math.min(this.phase - 1, this.def.phases.length - 1);
    const phaseDef = this.def.phases[phaseIdx] || {
      speedMult: 1.0,
      cooldownMult: 1.0,
      damageMult: 1.0,
      auraColor: 'rgba(0,0,0,0)',
    };

    if (this.currentAttackIndex === -1) {
      this.attackTimer -= dt;

      // Defensive blocking
      if (playerAttacking && dist < 160 && Math.random() < 0.035 * this.phase) {
        this.blocking = true;
        this.vx = 0;
        this.vy = 0;
        return;
      }
      this.blocking = false;

      // Ready to attack?
      if (this.attackTimer <= 0) {
        // Pick an attack based on distance
        const validAttacks = this.def.attacks.filter((atk) => dist <= atk.range + 50);
        const attackList = validAttacks.length > 0 ? validAttacks : this.def.attacks;
        const chosen = attackList[Math.floor(Math.random() * attackList.length)];
        this.currentAttackIndex = this.def.attacks.indexOf(chosen);
        this.elapsed = 0;
        this.attackResolved = false;

        audioSystem.play('BossAttack');

        // Charge or dash thrust
        if (chosen.name === 'Charge' || chosen.name === 'Ram' || chosen.name === 'Dash') {
          this.vx = (this.facing === Facing.Right ? 1 : -1) * 380 * phaseDef.speedMult;
        }
        return;
      }

      // Move toward player
      const speed = this.def.walkSpeed * phaseDef.speedMult;
      if (dist > 140) {
        this.vx = (dx / dist) * speed;
        this.vy = (dy / dist) * speed * 0.6;
      } else {
        this.vx = 0;
        this.vy = 0;
      }
    } else {
      // Executing attack
      const atk = this.def.attacks[this.currentAttackIndex];
      const startup = atk.startup;
      const active = atk.startup + atk.active;
      const total = active + atk.recovery;

      // Projectile spawning
      if (atk.spawnsProjectile && !this.attackResolved && this.elapsed >= startup) {
        this.attackResolved = true;
        const dir = this.facing === Facing.Right ? 1 : -1;
        onSpawnProjectile({
          x: this.x + dir * 60,
          y: this.y - 65,
          vx: dir * (atk.projectileSpeed || 500),
          damage: Math.round(atk.damage * phaseDef.damageMult),
          life: 2.0,
          radius: 20,
          color: this.id === BossId.RayderClone ? '#e11d48' : '#22c55e',
        });
        onScreenShake(atk.shake);
      }

      if (this.elapsed >= total) {
        this.currentAttackIndex = -1;
        this.attackTimer = atk.cooldown * phaseDef.cooldownMult;
        this.vx = 0;
        this.vy = 0;
      }
    }

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    if (this.animTimer >= 0.10) {
      this.animTimer = 0;
      this.animFrame = (this.animFrame + 1) % 12;
    }
  }

  public isAttackActive(): boolean {
    if (this.currentAttackIndex === -1) return false;
    const atk = this.def.attacks[this.currentAttackIndex];
    return this.elapsed >= atk.startup && this.elapsed <= atk.startup + atk.active;
  }

  public getAttackHitbox(): CombatBox {
    if (this.currentAttackIndex === -1) return new CombatBox(0, 0, 0, 0);
    const atk = this.def.attacks[this.currentAttackIndex];
    const dir = this.facing === Facing.Right ? 1 : -1;
    return new CombatBox(
      this.x + dir * atk.boxForward - atk.boxWidth / 2,
      this.y - 75 - atk.boxHeight / 2,
      atk.boxWidth,
      atk.boxHeight
    );
  }

  public getHurtbox(): CombatBox {
    return new CombatBox(this.x - 45, this.y - 120, 90, 120);
  }

  public getCurrentAttackDamage(): number {
    if (this.currentAttackIndex === -1) return 10;
    const atk = this.def.attacks[this.currentAttackIndex];
    const phaseIdx = Math.min(this.phase - 1, this.def.phases.length - 1);
    const mult = this.def.phases[phaseIdx]?.damageMult || 1.0;
    return Math.round(atk.damage * mult);
  }

  public draw(ctx: CanvasRenderingContext2D, use120Atlas: boolean = false) {
    ctx.save();

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(this.x, this.y - 2, 45 * this.def.scale, 14 * this.def.scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // Phase Aura
    if (this.phase >= 2 && !this.defeated) {
      const phaseIdx = Math.min(this.phase - 1, this.def.phases.length - 1);
      const auraColor = this.def.phases[phaseIdx]?.auraColor || 'rgba(255, 60, 40, 0.4)';
      const pulse = Math.sin(this.elapsed * 6) * 8 + 15;
      ctx.save();
      ctx.fillStyle = auraColor;
      ctx.beginPath();
      ctx.arc(this.x, this.y - 65, 65 + pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    const bossKeyMap = ['brakk', 'grinder', 'titanx', 'titanx_mejorado', 'rayder_clone'];
    const key = use120Atlas ? `${bossKeyMap[this.id]}_120` : `${bossKeyMap[this.id]}_120`;
    const img = assetManager.getImage(key);

    if (img && img.naturalWidth > 0) {
      ctx.save();
      ctx.translate(this.x, this.y);
      if (this.facing === Facing.Left) {
        ctx.scale(-1, 1);
      }

      // Map to 120-frame rows
      let row = 0;
      let col = this.animFrame % 12;
      if (this.defeated) {
        row = 9;
        col = 10;
      } else if (this.currentAttackIndex !== -1) {
        row = (3 + (this.currentAttackIndex % 4));
      } else if (Math.abs(this.vx) > 10 || Math.abs(this.vy) > 10) {
        row = 1;
      }

      const sx = col * 128;
      const sy = row * 128;
      const sw = 128;
      const sh = 128;
      const scale = this.def.scale * 1.25;

      ctx.drawImage(img, sx, sy, sw, sh, -64 * scale, -116 * scale, 128 * scale, 128 * scale);
      ctx.restore();
    } else {
      // Procedural boss silhouette
      ctx.save();
      ctx.translate(this.x, this.y);
      if (this.facing === Facing.Left) ctx.scale(-1, 1);
      ctx.fillStyle = this.id === BossId.Brakk ? '#c2410c' : this.id === BossId.Grinder ? '#eab308' : '#15803d';
      ctx.fillRect(-30, -110, 60, 110);
      ctx.restore();
    }

    ctx.restore();
  }
}
