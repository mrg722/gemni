// Core Types and Data Models for District Fury

export enum Facing {
  Left = -1,
  Right = 1,
}

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export enum PlayerState {
  Idle,
  Walk,
  Dash,
  Attack,
  Block,
  Hit,
  GuardBreak,
  Knockdown,
  Defeat,
}

export enum AttackType {
  None,
  Punch,
  Kick,
  Energy,
  Dash,
  Rage,
  Finisher,
}

export enum AttackId {
  None = 0,
  Punch1,
  Punch2,
  Punch3,
  Kick,
  EnergyWave,
  DashAttack,
  RageAttack,
  Finisher,
  Count,
}

export interface AttackDef {
  name: string;
  damage: number;
  startup: number;
  active: number;
  recovery: number;
  range: number;
  depth: number;
  boxWidth: number;
  boxHeight: number;
  boxForward: number;
  boxCenterOffsetY: number;
  knockback: number;
  hitstun: number;
  launch: number;
  spCost: number;
  rageGain: number;
  priority: number;
  cooldown: number;
  canCombo: boolean;
  canCancel: boolean;
  breaksGuard: boolean;
  heavy: boolean;
  spawnsProjectile: boolean;
  hitstop: number;
  shake: number;
  comboWindow: number;
}

export enum StreetEnemyType {
  Punk = 0,
  Brute = 1,
  Charger = 2,
  Enforcer = 3,
  ChemicalSoldier = 4,
  UrbanNinja = 5,
  Mutant = 6,
  ArmoredGuard = 7,
}

export interface EnemyProfile {
  name: string;
  maxHp: number;
  damage: number;
  walkSpeed: number;
  attackRange: number;
  attackCooldown: number;
  aggroDistance: number;
  reactionTime: number;
  canBlock: boolean;
  color: string;
  scale: number;
}

export enum BossId {
  Brakk = 0,
  Grinder = 1,
  TitanX = 2,
  TitanXMejorado = 3,
  RayderClone = 4,
}

export interface BossAttackDef {
  name: string;
  damage: number;
  startup: number;
  active: number;
  recovery: number;
  range: number;
  depth: number;
  boxWidth: number;
  boxHeight: number;
  boxForward: number;
  knockback: number;
  hitstun: number;
  cooldown: number;
  priority: number;
  heavy: boolean;
  spawnsProjectile: boolean;
  projectileSpeed: number;
  hitstop: number;
  shake: number;
}

export interface BossPhaseDef {
  hpRatioThreshold: number;
  speedMult: number;
  cooldownMult: number;
  damageMult: number;
  auraColor: string;
}

export interface BossDefinition {
  id: BossId;
  name: string;
  title: string;
  maxHp: number;
  walkSpeed: number;
  width: number;
  height: number;
  scale: number;
  phases: BossPhaseDef[];
  attacks: BossAttackDef[];
}

export interface PlayerUpgrades {
  bonusMaxHp: number;
  bonusMaxSp: number;
  bonusMaxShield: number;
  rageCapacityScale: number;
  attackDamageScale: number;
  energyDamageScale: number;
  moveSpeedScale: number;
  dashCooldownScale: number;
  comboWindowBonus: number;
}

export interface RewardOption {
  name: string;
  description: string;
}

export interface CharacterVisual {
  name: string;
  folder: string | null;
  uniformCanvas: boolean;
  scale: number;
  targetHeight: number;
  footInset: number;
  facesRightByDefault: boolean;
  maxHp: number;
  damageMultiplier: number;
  speedMultiplier: number;
}

export enum StoryDifficulty {
  Easy = 0,
  Normal = 1,
  Hard = 2,
}

export class CombatBox {
  constructor(
    public x: number,
    public y: number,
    public width: number,
    public height: number
  ) {}

  public intersects(other: CombatBox): boolean {
    return (
      this.x < other.x + other.width &&
      this.x + this.width > other.x &&
      this.y < other.y + other.height &&
      this.y + this.height > other.y
    );
  }
}
