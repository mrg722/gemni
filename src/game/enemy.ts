// Street Enemy implementation with AI state machine, archetypes, and rendering
import { StreetEnemyType, Facing, CombatBox } from './types';
import { ENEMY_PROFILES } from './combatData';
import { assetManager } from '../engine/assets';
import { audioSystem } from '../engine/audio';

export enum EnemyState {
  Idle,
  Walk,
  Windup,
  Attack,
  Block,
  Hit,
  Knockdown,
  Defeat,
}

export class StreetEnemy {
  public x: number = 0;
  public y: number = 0;
  public z: number = 0;
  public vx: number = 0;
  public vy: number = 0;
  public facing: Facing = Facing.Left;
  public state: EnemyState = EnemyState.Idle;
  public type: StreetEnemyType = StreetEnemyType.Punk;

  public hp: number = 75;
  public maxHp: number = 75;
  public attackDamage: number = 8;
  public active: boolean = false;
  public hasHit: boolean = false;

  public stateTimer: number = 0;
  public attackTimer: number = 0;
  public windupTimer: number = 0;
  public hitstunTimer: number = 0;
  public knockdownTimer: number = 0;
  public blockTimer: number = 0;

  private animFrame: number = 0;
  private animTimer: number = 0;

  constructor() {}

  public init(pos: { x: number; y: number; z?: number }, type: StreetEnemyType) {
    this.x = pos.x;
    this.y = pos.y;
    this.z = pos.z || 0;
    this.type = type;
    const profile = ENEMY_PROFILES[type];
    this.maxHp = profile.maxHp;
    this.hp = profile.maxHp;
    this.attackDamage = profile.damage;
    this.active = true;
    this.state = EnemyState.Idle;
    this.stateTimer = 0;
    this.attackTimer = Math.random() * 0.8 + 0.4;
    this.windupTimer = 0;
    this.hitstunTimer = 0;
    this.knockdownTimer = 0;
    this.blockTimer = 0;
    this.hasHit = false;
    this.vx = 0;
    this.vy = 0;
    this.facing = Facing.Left;
  }

  public isDefeated(): boolean {
    return this.state === EnemyState.Defeat;
  }

  public update(dt: number, playerX: number, playerY: number, playerAttacking: boolean) {
    if (!this.active || this.state === EnemyState.Defeat) return;

    this.stateTimer += dt;
    this.animTimer += dt;
    const profile = ENEMY_PROFILES[this.type];

    // Face player
    if (this.state !== EnemyState.Hit && this.state !== EnemyState.Knockdown) {
      this.facing = playerX > this.x ? Facing.Right : Facing.Left;
    }

    // Hitstun
    if (this.hitstunTimer > 0) {
      this.hitstunTimer -= dt;
      this.x += this.vx * dt;
      this.vx *= 0.88;
      if (this.hitstunTimer <= 0) {
        this.state = EnemyState.Idle;
        this.vx = 0;
      }
      return;
    }

    // Knockdown
    if (this.knockdownTimer > 0) {
      this.knockdownTimer -= dt;
      this.x += this.vx * dt;
      this.vx *= 0.9;
      if (this.knockdownTimer <= 0) {
        this.state = EnemyState.Idle;
        this.vx = 0;
      }
      return;
    }

    const dx = playerX - this.x;
    const dy = playerY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // AI Decision Tree
    if (this.state === EnemyState.Idle || this.state === EnemyState.Walk) {
      this.attackTimer -= dt;

      // Defensive reaction
      if (profile.canBlock && playerAttacking && dist < 120 && Math.random() < 0.04) {
        this.state = EnemyState.Block;
        this.blockTimer = 0.45;
        this.vx = 0;
        this.vy = 0;
        return;
      }

      // Check attack range
      if (dist <= profile.attackRange && Math.abs(dy) <= 30 && this.attackTimer <= 0) {
        // Start windup telegraph
        this.state = EnemyState.Windup;
        this.windupTimer = profile.reactionTime;
        this.vx = 0;
        this.vy = 0;
        return;
      }

      // Approach player
      if (dist > profile.attackRange - 15) {
        this.state = EnemyState.Walk;
        const speed = profile.walkSpeed;
        const nx = dx / (dist || 1);
        const ny = dy / (dist || 1);
        this.vx = nx * speed;
        this.vy = ny * speed * 0.65;
      } else {
        this.state = EnemyState.Idle;
        this.vx = 0;
        this.vy = 0;
      }
    } else if (this.state === EnemyState.Windup) {
      this.windupTimer -= dt;
      if (this.windupTimer <= 0) {
        // Execute attack
        this.state = EnemyState.Attack;
        this.stateTimer = 0;
        this.hasHit = false;
        if (this.type === StreetEnemyType.Charger) {
          // Dash thrust forward
          this.vx = (this.facing === Facing.Right ? 1 : -1) * 320;
        } else {
          this.vx = (this.facing === Facing.Right ? 1 : -1) * 60;
        }
      }
    } else if (this.state === EnemyState.Attack) {
      this.x += this.vx * dt;
      this.vx *= 0.9;
      if (this.stateTimer >= 0.38) {
        this.state = EnemyState.Idle;
        this.attackTimer = profile.attackCooldown + Math.random() * 0.4;
      }
    } else if (this.state === EnemyState.Block) {
      this.blockTimer -= dt;
      if (this.blockTimer <= 0) {
        this.state = EnemyState.Idle;
      }
    }

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Animation frame timing
    if (this.animTimer >= 0.12) {
      this.animTimer = 0;
      this.animFrame = (this.animFrame + 1) % 4;
    }
  }

  public takeDamage(dmg: number, knockback: { x: number; y: number } = { x: 0, y: 0 }) {
    if (this.state === EnemyState.Defeat) return;

    if (this.state === EnemyState.Block) {
      dmg = Math.max(1, Math.round(dmg * 0.25));
      knockback.x *= 0.3;
    }

    this.hp -= dmg;
    if (this.hp <= 0) {
      this.hp = 0;
      this.state = EnemyState.Defeat;
      this.vx = knockback.x * 0.5;
      audioSystem.play('EnemyDeath');
      return;
    }

    // Heavy hit knocks down, regular hit causes hitstun
    if (Math.abs(knockback.x) > 400 || dmg >= 18) {
      this.state = EnemyState.Knockdown;
      this.knockdownTimer = 0.45;
      this.vx = knockback.x * 0.6;
    } else {
      this.state = EnemyState.Hit;
      this.hitstunTimer = 0.22;
      this.vx = knockback.x * 0.4;
    }
  }

  public isAttackActive(): boolean {
    return this.state === EnemyState.Attack && this.stateTimer >= 0.08 && this.stateTimer <= 0.28;
  }

  public getAttackHitbox(): CombatBox {
    const dir = this.facing === Facing.Right ? 1 : -1;
    return new CombatBox(this.x + dir * 20 - 30, this.y - 75, 60, 50);
  }

  public getHurtbox(): CombatBox {
    return new CombatBox(this.x - 30, this.y - 100, 60, 100);
  }

  public draw(ctx: CanvasRenderingContext2D, use120Atlas: boolean = false) {
    if (!this.active) return;
    const profile = ENEMY_PROFILES[this.type];

    ctx.save();

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(this.x, this.y - 2, 30 * profile.scale, 10 * profile.scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // Health bar above enemy
    if (this.hp < this.maxHp && this.state !== EnemyState.Defeat) {
      const bw = 46;
      const bh = 5;
      const bx = this.x - bw / 2;
      const by = this.y - 115 * profile.scale;
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(bx - 1, by - 1, bw + 2, bh + 2);
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(bx, by, bw * (this.hp / this.maxHp), bh);
    }

    // Windup telegraph icon
    if (this.state === EnemyState.Windup) {
      ctx.fillStyle = '#facc15';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('!', this.x - 4, this.y - 120 * profile.scale);
    }

    // Atlas key
    const typeKeys = [
      'punk',
      'brute',
      'charger',
      'enforcer',
      'chemical_soldier',
      'urban_ninja',
      'mutant',
      'armored_guard',
    ];
    const key = use120Atlas ? `${typeKeys[this.type]}_120` : typeKeys[this.type];
    const img = assetManager.getImage(key);

    if (img && img.naturalWidth > 0) {
      ctx.save();
      ctx.translate(this.x, this.y);
      if (this.facing === Facing.Left) {
        ctx.scale(-1, 1);
      }

      if (use120Atlas) {
        // 12 cols x 10 rows
        let row = 0;
        let col = this.animFrame % 12;
        if (this.state === EnemyState.Idle) row = 0;
        else if (this.state === EnemyState.Walk) row = 1;
        else if (this.state === EnemyState.Windup || this.state === EnemyState.Attack) row = 3;
        else if (this.state === EnemyState.Block) row = 8;
        else if (this.state === EnemyState.Hit) { row = 8; col = 6; }
        else if (this.state === EnemyState.Knockdown || this.state === EnemyState.Defeat) { row = 9; col = 8; }

        const sx = col * 128;
        const sy = row * 128;
        const sw = 128;
        const sh = 128;
        const scale = profile.scale;
        ctx.drawImage(img, sx, sy, sw, sh, -64 * scale, -116 * scale, 128 * scale, 128 * scale);
      } else {
        // Classic 4 cols x 3 rows of 128x128
        let frame = 0;
        if (this.state === EnemyState.Idle) frame = this.animFrame % 4; // 0..3
        else if (this.state === EnemyState.Walk) frame = this.animFrame % 4;
        else if (this.state === EnemyState.Windup || this.state === EnemyState.Attack) frame = 4 + (this.animFrame % 4); // 4..7
        else if (this.state === EnemyState.Hit || this.state === EnemyState.Block) frame = 8;
        else if (this.state === EnemyState.Knockdown || this.state === EnemyState.Defeat) frame = 10;

        const col = frame % 4;
        const row = Math.floor(frame / 4);
        const sx = col * 128;
        const sy = row * 128;
        const sw = 128;
        const sh = 128;
        const scale = profile.scale;
        ctx.drawImage(img, sx, sy, sw, sh, -64 * scale, -116 * scale, 128 * scale, 128 * scale);
      }

      ctx.restore();
    } else {
      // Procedural fallback
      ctx.save();
      ctx.translate(this.x, this.y);
      if (this.facing === Facing.Left) ctx.scale(-1, 1);
      ctx.fillStyle = profile.color;
      ctx.fillRect(-15 * profile.scale, -80 * profile.scale, 30 * profile.scale, 80 * profile.scale);
      ctx.restore();
    }

    ctx.restore();
  }
}
