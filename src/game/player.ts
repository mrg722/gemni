// Player Entity Implementation for District Fury
import {
  Facing,
  PlayerState,
  AttackType,
  AttackId,
  AttackDef,
  CombatBox,
  PlayerUpgrades,
} from './types';
import { ATTACK_DEFS, CHARACTER_VISUALS } from './combatData';
import { audioSystem } from '../engine/audio';
import { assetManager } from '../engine/assets';

export class Player {
  public x: number = 360;
  public y: number = 585;
  public z: number = 0;
  public vx: number = 0;
  public vy: number = 0;
  public facing: Facing = Facing.Right;
  public state: PlayerState = PlayerState.Idle;
  public attackType: AttackType = AttackType.None;
  public currentAttack: AttackId = AttackId.None;

  public hp: number = 100;
  public maxHp: number = 100;
  public shield: number = 40;
  public maxShield: number = 40;
  public sp: number = 60;
  public maxSp: number = 60;
  public rage: number = 0;
  public maxRage: number = 100;
  public isRageMode: boolean = false;
  public skin: number = 0; // 0 = Rayden original

  public stateTimer: number = 0;
  public attackElapsed: number = 0;
  public attackDuration: number = 0;
  public dashTimer: number = 0;
  public dashInvulnerability: number = 0;
  public dashCooldown: number = 0;
  public comboWindow: number = 0;
  public comboCount: number = 0;
  public comboStep: number = 0;
  public hasHit: boolean = false;
  public energyReleased: boolean = false;

  public blockTimer: number = 0;
  public hitstunTimer: number = 0;
  public knockdownTimer: number = 0;
  public rageAuraPhase: number = 0;

  // Visual animators
  private animFrame: number = 0;
  private animTimer: number = 0;

  public upgrades: PlayerUpgrades = {
    bonusMaxHp: 0,
    bonusMaxSp: 0,
    bonusMaxShield: 0,
    rageCapacityScale: 1.0,
    attackDamageScale: 1.0,
    energyDamageScale: 1.0,
    moveSpeedScale: 1.0,
    dashCooldownScale: 1.0,
    comboWindowBonus: 0,
  };

  constructor() {
    this.reset();
  }

  public reset() {
    const visual = CHARACTER_VISUALS[this.skin] || CHARACTER_VISUALS[0];
    this.maxHp = visual.maxHp + this.upgrades.bonusMaxHp;
    this.hp = this.maxHp;
    this.maxShield = 40 + this.upgrades.bonusMaxShield;
    this.shield = this.maxShield;
    this.maxSp = 60 + this.upgrades.bonusMaxSp;
    this.sp = this.maxSp;
    this.maxRage = Math.round(100 * this.upgrades.rageCapacityScale);
    this.rage = 0;
    this.isRageMode = false;

    this.state = PlayerState.Idle;
    this.attackType = AttackType.None;
    this.currentAttack = AttackId.None;
    this.facing = Facing.Right;
    this.vx = 0;
    this.vy = 0;
    this.comboCount = 0;
    this.comboStep = 0;
    this.comboWindow = 0;
    this.dashTimer = 0;
    this.dashInvulnerability = 0;
    this.dashCooldown = 0;
    this.hitstunTimer = 0;
    this.knockdownTimer = 0;
    this.energyReleased = false;
    this.hasHit = false;
    this.animFrame = 0;
    this.animTimer = 0;
  }

  public applyCharacter(skinId: number) {
    this.skin = Math.max(0, Math.min(CHARACTER_VISUALS.length - 1, skinId));
    this.reset();
  }

  public applyUpgrades(newUpgrades: PlayerUpgrades) {
    this.upgrades = { ...newUpgrades };
    this.reset();
  }

  public canAct(): boolean {
    return (
      this.state !== PlayerState.Hit &&
      this.state !== PlayerState.Knockdown &&
      this.state !== PlayerState.GuardBreak &&
      this.state !== PlayerState.Defeat &&
      this.state !== PlayerState.Dash
    );
  }

  public handleInput(
    keys: {
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
    },
    dt: number
  ) {
    if (!this.canAct()) return;

    const visual = CHARACTER_VISUALS[this.skin] || CHARACTER_VISUALS[0];
    const baseSpeed = 260 * visual.speedMultiplier * this.upgrades.moveSpeedScale * (this.isRageMode ? 1.25 : 1.0);

    // Rage Mode activation
    if (keys.rage && !this.isRageMode && this.rage >= this.maxRage) {
      this.isRageMode = true;
      audioSystem.play('Rage');
    }

    // Dash
    if (keys.dash && this.dashCooldown <= 0) {
      this.state = PlayerState.Dash;
      this.dashTimer = 0.24;
      this.dashInvulnerability = 0.22;
      this.dashCooldown = 0.45 * this.upgrades.dashCooldownScale;
      const dir = this.facing === Facing.Right ? 1 : -1;
      this.vx = dir * baseSpeed * 2.3;
      audioSystem.play('Dash');
      return;
    }

    // Attacks
    if (this.state !== PlayerState.Attack) {
      if (keys.punch) {
        let nextAttack = AttackId.Punch1;
        if (this.comboWindow > 0) {
          if (this.comboStep === 1) nextAttack = AttackId.Punch2;
          else if (this.comboStep === 2) nextAttack = AttackId.Punch3;
        }
        this.startAttack(nextAttack, AttackType.Punch);
        return;
      }

      if (keys.kick) {
        this.startAttack(AttackId.Kick, AttackType.Kick);
        return;
      }

      if (keys.energy && this.sp >= 20) {
        this.sp -= 20;
        this.startAttack(AttackId.EnergyWave, AttackType.Energy);
        audioSystem.play('EnergyCharge');
        return;
      }

      if (keys.block) {
        this.state = PlayerState.Block;
        this.vx = 0;
        this.vy = 0;
        return;
      }
    }

    // Movement
    if (this.state === PlayerState.Idle || this.state === PlayerState.Walk) {
      let mx = 0;
      let my = 0;

      if (keys.left) {
        mx -= 1;
        this.facing = Facing.Left;
      }
      if (keys.right) {
        mx += 1;
        this.facing = Facing.Right;
      }
      if (keys.up) my -= 1;
      if (keys.down) my += 1;

      if (mx !== 0 && my !== 0) {
        const inv = 1 / Math.SQRT2;
        mx *= inv;
        my *= inv;
      }

      this.vx = mx * baseSpeed;
      this.vy = my * baseSpeed * 0.75; // Depth axis is slightly slower for authentic brawler feel

      if (mx !== 0 || my !== 0) {
        this.state = PlayerState.Walk;
      } else {
        this.state = PlayerState.Idle;
      }
    }
  }

  public startAttack(id: AttackId, type: AttackType) {
    const def = ATTACK_DEFS[id];
    this.currentAttack = id;
    this.attackType = type;
    this.state = PlayerState.Attack;
    this.attackElapsed = 0;
    this.attackDuration = def.startup + def.active + def.recovery;
    this.hasHit = false;
    this.energyReleased = false;

    if (id === AttackId.Punch1 || id === AttackId.Punch2) {
      audioSystem.play('Punch');
    } else if (id === AttackId.Punch3 || id === AttackId.Kick) {
      audioSystem.play('Kick');
    }
  }

  public update(dt: number) {
    this.stateTimer += dt;
    this.rageAuraPhase += dt * 6.0;

    // Dash Timers
    if (this.dashCooldown > 0) this.dashCooldown -= dt;
    if (this.dashInvulnerability > 0) this.dashInvulnerability -= dt;

    if (this.dashTimer > 0) {
      this.dashTimer -= dt;
      this.x += this.vx * dt;
      this.vx *= 0.92;
      if (this.dashTimer <= 0) {
        this.state = PlayerState.Idle;
        this.vx = 0;
      }
      return;
    }

    // SP Regeneration (passive)
    if (this.sp < this.maxSp) {
      this.sp = Math.min(this.maxSp, this.sp + 8 * dt);
    }

    // Rage Mode depletion
    if (this.isRageMode) {
      this.rage -= 18 * dt;
      if (this.rage <= 0) {
        this.rage = 0;
        this.isRageMode = false;
      }
    }

    // Shield passive regeneration
    if (this.shield < this.maxShield && this.state !== PlayerState.Hit) {
      this.shield = Math.min(this.maxShield, this.shield + 4 * dt);
    }

    // Combo Window
    if (this.comboWindow > 0) {
      this.comboWindow -= dt;
      if (this.comboWindow <= 0) {
        this.comboStep = 0;
      }
    }

    // Attack state update
    if (this.state === PlayerState.Attack) {
      this.attackElapsed += dt;
      const def = ATTACK_DEFS[this.currentAttack];

      // Spawn projectile event for EnergyWave
      if (
        this.currentAttack === AttackId.EnergyWave &&
        !this.energyReleased &&
        this.attackElapsed >= def.startup
      ) {
        this.energyReleased = true;
        audioSystem.play('EnergyShot');
      }

      if (this.attackElapsed >= this.attackDuration) {
        this.state = PlayerState.Idle;
        this.attackType = AttackType.None;
        this.currentAttack = AttackId.None;
      }
    }

    // Hitstun / Knockdown
    if (this.hitstunTimer > 0) {
      this.hitstunTimer -= dt;
      if (this.hitstunTimer <= 0 && this.state === PlayerState.Hit) {
        this.state = PlayerState.Idle;
      }
    }

    if (this.knockdownTimer > 0) {
      this.knockdownTimer -= dt;
      if (this.knockdownTimer <= 0 && this.state === PlayerState.Knockdown) {
        this.state = PlayerState.Idle;
      }
    }

    // Position integration
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Movement animation
    this.animTimer += dt;
    if (this.state === PlayerState.Walk) {
      if (this.animTimer >= 0.09) {
        this.animTimer = 0;
        this.animFrame = (this.animFrame + 1) % 4;
      }
    } else if (this.state === PlayerState.Idle) {
      if (this.animTimer >= 0.16) {
        this.animTimer = 0;
        this.animFrame = (this.animFrame + 1) % 4;
      }
    }
  }

  public takeDamage(damage: number, knockbackX: number = 0) {
    if (this.dashInvulnerability > 0 || this.state === PlayerState.Defeat) return;

    if (this.state === PlayerState.Block) {
      // 80% damage reduction when blocking
      damage = Math.max(1, Math.round(damage * 0.2));
      knockbackX *= 0.3;
      audioSystem.play('Hit');
    }

    // Shield absorbs damage first
    if (this.shield > 0) {
      if (this.shield >= damage) {
        this.shield -= damage;
        damage = 0;
      } else {
        damage -= this.shield;
        this.shield = 0;
      }
    }

    if (damage > 0) {
      this.hp = Math.max(0, this.hp - damage);
      this.addRage(Math.round(damage * 0.7));
    }

    if (this.hp <= 0) {
      this.state = PlayerState.Defeat;
      audioSystem.play('GameOver');
      return;
    }

    if (this.state !== PlayerState.Block) {
      this.state = PlayerState.Hit;
      this.hitstunTimer = 0.24;
      this.x += knockbackX * 0.05;
      audioSystem.play('HeavyHit');
    }
  }

  public addRage(amount: number) {
    if (this.isRageMode) return;
    this.rage = Math.min(this.maxRage, this.rage + amount);
  }

  public onAttackConnected(def: AttackDef) {
    this.hasHit = true;
    this.comboCount++;
    this.comboStep = (this.comboStep + 1) % 3;
    this.comboWindow = def.comboWindow + this.upgrades.comboWindowBonus;
    this.addRage(def.rageGain);
  }

  public isAttackActive(): boolean {
    if (this.state !== PlayerState.Attack) return false;
    const def = ATTACK_DEFS[this.currentAttack];
    return (
      this.attackElapsed >= def.startup &&
      this.attackElapsed <= def.startup + def.active
    );
  }

  public getAttackHitbox(): CombatBox {
    const def = ATTACK_DEFS[this.currentAttack];
    const dir = this.facing === Facing.Right ? 1 : -1;
    const cx = this.x + dir * def.boxForward;
    const cy = this.y + def.boxCenterOffsetY;
    return new CombatBox(
      cx - def.boxWidth / 2,
      cy - def.boxHeight / 2,
      def.boxWidth,
      def.boxHeight
    );
  }

  public getHurtbox(): CombatBox {
    return new CombatBox(this.x - 32, this.y - 100, 64, 100);
  }

  public getAttackDamage(): number {
    const def = ATTACK_DEFS[this.currentAttack];
    const visual = CHARACTER_VISUALS[this.skin] || CHARACTER_VISUALS[0];
    let dmg = def.damage * visual.damageMultiplier * this.upgrades.attackDamageScale;
    if (this.currentAttack === AttackId.EnergyWave) {
      dmg *= this.upgrades.energyDamageScale;
    }
    if (this.isRageMode) {
      dmg *= 1.35;
    }
    return Math.round(dmg);
  }

  public getAttackKnockback(): number {
    const def = ATTACK_DEFS[this.currentAttack];
    return def.knockback * (this.isRageMode ? 1.3 : 1.0);
  }

  // Draw Rayden onto the Canvas2D
  public draw(ctx: CanvasRenderingContext2D) {
    ctx.save();

    // Shadow on the ground lane
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(this.x, this.y - 2, 34, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Rage aura effect
    if (this.isRageMode) {
      ctx.save();
      const pulse = Math.sin(this.rageAuraPhase) * 6 + 18;
      const grad = ctx.createRadialGradient(
        this.x,
        this.y - 50,
        15,
        this.x,
        this.y - 50,
        55 + pulse
      );
      grad.addColorStop(0, 'rgba(60, 200, 255, 0.55)');
      grad.addColorStop(0.5, 'rgba(30, 130, 255, 0.3)');
      grad.addColorStop(1, 'rgba(0, 80, 255, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(this.x, this.y - 50, 55 + pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Determine sprite
    const img = assetManager.getImage('rayden');

    if (img && img.naturalWidth > 0 && this.skin === 0) {
      // Atlas slicing for Rayden: 4 columns x 4 rows of 96x96
      let frameIndex = 0;
      if (this.state === PlayerState.Idle) {
        frameIndex = this.animFrame % 4; // 0..3
      } else if (this.state === PlayerState.Walk) {
        frameIndex = 4 + (this.animFrame % 4); // 4..7
      } else if (this.state === PlayerState.Attack) {
        if (this.attackType === AttackType.Punch) {
          frameIndex = this.comboStep === 2 ? 9 : 8;
        } else if (this.attackType === AttackType.Kick) {
          frameIndex = 10;
        } else if (this.attackType === AttackType.Energy) {
          frameIndex = 12;
        } else {
          frameIndex = 8;
        }
      } else if (this.state === PlayerState.Hit || this.state === PlayerState.Knockdown) {
        frameIndex = 13;
      } else if (this.state === PlayerState.Dash) {
        frameIndex = 14;
      } else if (this.state === PlayerState.Defeat) {
        frameIndex = 15;
      } else if (this.state === PlayerState.Block) {
        frameIndex = 8; // guard stance
      }

      const col = frameIndex % 4;
      const row = Math.floor(frameIndex / 4);
      const sx = col * 96;
      const sy = row * 96;
      const sw = 96;
      const sh = 96;

      ctx.save();
      ctx.translate(this.x, this.y);
      if (this.facing === Facing.Left) {
        ctx.scale(-1, 1);
      }

      // Rayden scale is slightly boosted for hero prominence (1.25x)
      const scale = 1.25;
      const dw = sw * scale;
      const dh = sh * scale;
      const dx = -dw / 2;
      const dy = -dh + 6;

      ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
      ctx.restore();
    } else {
      // Fallback procedural rendering
      this.drawProcedural(ctx);
    }

    ctx.restore();
  }

  private drawProcedural(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.x, this.y);
    if (this.facing === Facing.Left) {
      ctx.scale(-1, 1);
    }

    // Legs
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-14, -40, 10, 38);
    ctx.fillRect(4, -40, 10, 38);

    // Torso / White shirt
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(-16, -78, 32, 40);

    // Black sleeveless vest
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-18, -78, 7, 36);
    ctx.fillRect(11, -78, 7, 36);

    // Head
    ctx.fillStyle = '#fbcfe8';
    ctx.beginPath();
    ctx.arc(0, -90, 14, 0, Math.PI * 2);
    ctx.fill();

    // Dark curly hair
    ctx.fillStyle = '#1c1917';
    ctx.beginPath();
    ctx.arc(0, -96, 15, Math.PI, Math.PI * 2);
    ctx.fill();

    // Blue visor glasses
    ctx.fillStyle = '#06b6d4';
    ctx.fillRect(2, -92, 12, 6);

    // Metallic gauntlets
    ctx.fillStyle = '#38bdf8';
    if (this.state === PlayerState.Attack) {
      ctx.fillRect(16, -72, 22, 12);
    } else {
      ctx.fillRect(10, -60, 12, 12);
    }

    ctx.restore();
  }
}
