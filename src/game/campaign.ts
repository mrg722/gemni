// Campaign System: 5 Stages, Scenarios, Waves, Kessler Cameos, Post-stage Serums, and Save State
import { BossId, StreetEnemyType, StoryDifficulty, PlayerUpgrades, RewardOption } from './types';
import { CAMPAIGN_REWARD_OPTIONS } from './combatData';

export interface StageScenario {
  id: number;
  name: string;
  bgKey: string;
  startX: number;
  endX: number;
  objective: string;
  storyMessage: string;
  waves: { x: number; y: number; type: StreetEnemyType }[];
  gatekeeper?: { type: StreetEnemyType; hpBonus: number; dmgBonus: number; title: string };
}

export interface StageDefinition {
  stageNumber: number;
  title: string;
  subtitle: string;
  bossId: BossId;
  scenarios: StageScenario[];
  kesslerIntro?: string[];
}

export const CAMPAIGN_STAGES: Record<number, StageDefinition> = {
  1: {
    stageNumber: 1,
    title: 'STAGE 1 // SLUM DISTRICT',
    subtitle: 'CAPITULO 1 // LA RUTA DE LAS CADENAS',
    bossId: BossId.Brakk,
    scenarios: [
      {
        id: 1,
        name: 'BARRIO BAJO // BLOQUE 17',
        bgKey: 'bg_steel',
        startX: 180,
        endX: 1450,
        objective: 'Rompe el bloqueo de la calle.',
        storyMessage: 'Rayden entra al Barrio Bajo. La banda de Brakk controla la ruta.',
        waves: [
          { x: 620, y: 570, type: StreetEnemyType.Punk },
          { x: 790, y: 535, type: StreetEnemyType.Punk },
          { x: 960, y: 610, type: StreetEnemyType.Charger },
          { x: 1120, y: 545, type: StreetEnemyType.Punk },
        ],
        gatekeeper: {
          type: StreetEnemyType.Brute,
          hpBonus: 150,
          dmgBonus: 4,
          title: 'Teniente del Bloque 17: el guardián no piensa retroceder.',
        },
      },
      {
        id: 2,
        name: 'MERCADO ANTIGUO // LINEA DEL CANAL',
        bgKey: 'bg_mercado_antiguo',
        startX: 1500,
        endX: 2850,
        objective: 'Atraviesa la ruta del mercado.',
        storyMessage: 'Los símbolos de cadena conducen al viejo mercado.',
        waves: [
          { x: 1620, y: 570, type: StreetEnemyType.Punk },
          { x: 1770, y: 525, type: StreetEnemyType.Charger },
          { x: 1930, y: 610, type: StreetEnemyType.Punk },
          { x: 2090, y: 545, type: StreetEnemyType.Brute },
          { x: 2240, y: 585, type: StreetEnemyType.Charger },
        ],
        gatekeeper: {
          type: StreetEnemyType.Enforcer,
          hpBonus: 260,
          dmgBonus: 8,
          title: 'Ejecutor del mercado: el cruce del canal está cerrado.',
        },
      },
      {
        id: 3,
        name: 'PUERTA DE ACERO // RUTA DE CARGA',
        bgKey: 'bg_steel',
        startX: 2900,
        endX: 4250,
        objective: 'Toma la puerta de carga.',
        storyMessage: 'La ruta de carga es la última defensa antes del territorio de Brakk.',
        waves: [
          { x: 3020, y: 575, type: StreetEnemyType.Charger },
          { x: 3180, y: 525, type: StreetEnemyType.Brute },
          { x: 3350, y: 610, type: StreetEnemyType.Punk },
          { x: 3520, y: 545, type: StreetEnemyType.Enforcer },
          { x: 3670, y: 590, type: StreetEnemyType.Charger },
        ],
        gatekeeper: {
          type: StreetEnemyType.ArmoredGuard,
          hpBonus: 380,
          dmgBonus: 12,
          title: 'Guardia de la puerta: protege el suministro de Brakk.',
        },
      },
      {
        id: 4,
        name: 'ASTILLERO DE CADENAS // TERRITORIO DE BRAKK',
        bgKey: 'bg_steel',
        startX: 4300,
        endX: 5900,
        objective: 'Llega al astillero y derrota a Brakk.',
        storyMessage: 'Las cadenas convergen. Brakk espera al final del astillero.',
        waves: [
          { x: 4420, y: 575, type: StreetEnemyType.Enforcer },
          { x: 4580, y: 525, type: StreetEnemyType.Charger },
          { x: 4740, y: 610, type: StreetEnemyType.Brute },
          { x: 4900, y: 545, type: StreetEnemyType.Enforcer },
          { x: 5060, y: 590, type: StreetEnemyType.Punk },
        ],
      },
    ],
  },
  2: {
    stageNumber: 2,
    title: 'STAGE 2 // OLD STEEL YARD',
    subtitle: 'CAPITULO 2 // EL FILO DE LA FUNDICION',
    bossId: BossId.Grinder,
    scenarios: [
      {
        id: 1,
        name: 'DEEP LINE // ENTRADA',
        bgKey: 'bg_s2_1',
        startX: 180,
        endX: 1450,
        objective: 'Penetra en los túneles industriales de la Deep Line.',
        storyMessage: 'Humo denso y maquinaria pesada: la fundición de Grinder opera sin freno.',
        waves: [
          { x: 620, y: 570, type: StreetEnemyType.ChemicalSoldier },
          { x: 800, y: 535, type: StreetEnemyType.UrbanNinja },
          { x: 980, y: 600, type: StreetEnemyType.Mutant },
          { x: 1150, y: 540, type: StreetEnemyType.ChemicalSoldier },
        ],
      },
      {
        id: 2,
        name: 'ZONA QUIMICA // PROCESAMIENTO',
        bgKey: 'bg_zona_quimica',
        startX: 1500,
        endX: 2850,
        objective: 'Atraviesa los depósitos de refrigerante tóxico.',
        storyMessage: 'Tanques de suero verde alimentan los experimentos mecánicos.',
        waves: [
          { x: 1650, y: 560, type: StreetEnemyType.ChemicalSoldier },
          { x: 1820, y: 520, type: StreetEnemyType.Mutant },
          { x: 2000, y: 610, type: StreetEnemyType.UrbanNinja },
          { x: 2180, y: 550, type: StreetEnemyType.ArmoredGuard },
        ],
        gatekeeper: {
          type: StreetEnemyType.Mutant,
          hpBonus: 300,
          dmgBonus: 10,
          title: 'Espécimen Químico Beta: masa bio-tóxica inestable.',
        },
      },
      {
        id: 3,
        name: 'CAMARA DE GRINDER // CORTE Y ACERO',
        bgKey: 'bg_s2_3',
        startX: 2900,
        endX: 4500,
        objective: 'Detén las sierras mecánicas de Grinder.',
        storyMessage: 'El chirrido de las sierras anuncia al verdugo de la fundición.',
        waves: [
          { x: 3050, y: 570, type: StreetEnemyType.ArmoredGuard },
          { x: 3220, y: 530, type: StreetEnemyType.ChemicalSoldier },
          { x: 3400, y: 600, type: StreetEnemyType.UrbanNinja },
          { x: 3580, y: 550, type: StreetEnemyType.Mutant },
        ],
      },
    ],
  },
  3: {
    stageNumber: 3,
    title: 'STAGE 3 // ASTRA TOWER',
    subtitle: 'CAPITULO 3 // NUCLEO DE INVESTIGACION',
    bossId: BossId.TitanX,
    scenarios: [
      {
        id: 1,
        name: 'PUBLIC ATRIUM',
        bgKey: 'bg_s3_1',
        startX: 180,
        endX: 1450,
        objective: 'Abre paso a través del vestíbulo de alta seguridad.',
        storyMessage: 'Los guardias corporativos de Astra Tower intentan contener la infiltración.',
        waves: [
          { x: 650, y: 560, type: StreetEnemyType.ArmoredGuard },
          { x: 820, y: 530, type: StreetEnemyType.UrbanNinja },
          { x: 1000, y: 600, type: StreetEnemyType.Enforcer },
          { x: 1180, y: 540, type: StreetEnemyType.ArmoredGuard },
        ],
      },
      {
        id: 2,
        name: 'RESEARCH FLOOR // PROYECTO BIOMECANICO',
        bgKey: 'bg_s3_2',
        startX: 1500,
        endX: 2850,
        objective: 'Accede al laboratorio central.',
        storyMessage: 'Cápsulas de criogenia rotas: el espécimen Titan-X ha despertado.',
        waves: [
          { x: 1680, y: 560, type: StreetEnemyType.Mutant },
          { x: 1860, y: 520, type: StreetEnemyType.ChemicalSoldier },
          { x: 2040, y: 610, type: StreetEnemyType.UrbanNinja },
          { x: 2220, y: 550, type: StreetEnemyType.Mutant },
        ],
      },
      {
        id: 3,
        name: 'EXECUTIVE CORE // CAMARA DE TITAN-X',
        bgKey: 'bg_s3_3',
        startX: 2900,
        endX: 4500,
        objective: 'Enfrenta al prototipo humanoide biomecánico.',
        storyMessage: 'Titan-X ruge con energía de suero verde en sus cilindros dorsales.',
        waves: [
          { x: 3050, y: 570, type: StreetEnemyType.ArmoredGuard },
          { x: 3250, y: 530, type: StreetEnemyType.Mutant },
          { x: 3450, y: 600, type: StreetEnemyType.UrbanNinja },
        ],
      },
    ],
  },
  4: {
    stageNumber: 4,
    title: 'STAGE 4 // KESSLER TOWER',
    subtitle: 'CAPITULO 4 // LA CUSPIDE DEL DOCTOR',
    bossId: BossId.TitanXMejorado,
    kesslerIntro: [
      'DR. KESSLER: "Llegas tarde, Rayden. La fórmula ha alcanzado la perfección."',
      'DR. KESSLER: "Observa a Titan-X Mejorado. Ya no es un prototipo: es un dios biomecánico."',
      'DR. KESSLER: "¡Destrúyelo y no dejes ni rastro de su ADN!"',
    ],
    scenarios: [
      {
        id: 1,
        name: 'KESSLER TOWER // SEGURIDAD DE ELITE',
        bgKey: 'bg_s4_1',
        startX: 180,
        endX: 1450,
        objective: 'Derriba la escolta de honor del Dr. Kessler.',
        storyMessage: 'Sistemas automatizados y soldados modificados genéticamente.',
        waves: [
          { x: 650, y: 560, type: StreetEnemyType.ArmoredGuard },
          { x: 820, y: 530, type: StreetEnemyType.UrbanNinja },
          { x: 1000, y: 610, type: StreetEnemyType.ChemicalSoldier },
          { x: 1180, y: 540, type: StreetEnemyType.ArmoredGuard },
        ],
      },
      {
        id: 2,
        name: 'NUCLEO EJECUTIVO // TITAN-X MEJORADO',
        bgKey: 'bg_s4_2',
        startX: 1500,
        endX: 3200,
        objective: 'Destruye la forma final biomecánica.',
        storyMessage: 'Titan-X Mejorado emerge de las sombras con cañones de suero bio-eléctrico.',
        waves: [
          { x: 1680, y: 560, type: StreetEnemyType.ArmoredGuard },
          { x: 1880, y: 530, type: StreetEnemyType.Mutant },
          { x: 2080, y: 600, type: StreetEnemyType.UrbanNinja },
        ],
      },
    ],
  },
  5: {
    stageNumber: 5,
    title: 'STAGE 5 // CAMARA DEL CLON',
    subtitle: 'CAPITULO FINAL // EL ESPEJO OSCURO',
    bossId: BossId.RayderClone,
    kesslerIntro: [
      'DR. KESSLER: "El verdadero Rayden jamás podrá superar a su copia optimizada."',
      'RAYDER CLON: "Tus dudas te hacen débil. Yo soy el poder sin ataduras."',
      'RAYDEN: "¡Terminemos con esto de una vez!"',
    ],
    scenarios: [
      {
        id: 1,
        name: 'CAMARA DEL CLON // EL DUELO FINAL',
        bgKey: 'bg_s5_1',
        startX: 180,
        endX: 3000,
        objective: 'Vence a tu propio clon corrupto.',
        storyMessage: 'El clon refleja cada uno de tus movimientos con letalidad oscura.',
        waves: [
          { x: 650, y: 560, type: StreetEnemyType.UrbanNinja },
          { x: 850, y: 530, type: StreetEnemyType.ArmoredGuard },
          { x: 1050, y: 600, type: StreetEnemyType.Mutant },
        ],
      },
    ],
  },
};

export class CampaignManager {
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

  public currentStage: number = 1;
  public stagesCompleted: number = 0;
  public totalScore: number = 0;
  public difficulty: StoryDifficulty = StoryDifficulty.Normal;

  constructor() {
    this.load();
  }

  public getRewardOptions(stageCleared: number): [RewardOption, RewardOption, RewardOption] {
    return CAMPAIGN_REWARD_OPTIONS[stageCleared] || CAMPAIGN_REWARD_OPTIONS[1];
  }

  public applyReward(stageCleared: number, optionIdx: number) {
    const opts = this.getRewardOptions(stageCleared);
    const chosen = opts[optionIdx] || opts[0];

    if (chosen.name === 'SUERO DE RESISTENCIA') {
      this.upgrades.bonusMaxHp += stageCleared === 1 ? 25 : 20;
      this.upgrades.bonusMaxShield += 15;
    } else if (chosen.name === 'SUERO DE FUERZA') {
      this.upgrades.attackDamageScale += stageCleared === 2 ? 0.18 : 0.12;
    } else if (chosen.name === 'SUERO DE MOVILIDAD') {
      this.upgrades.moveSpeedScale += 0.08;
      this.upgrades.dashCooldownScale *= 0.85;
    } else if (chosen.name === 'SUERO DE COMBO') {
      this.upgrades.comboWindowBonus += 0.12;
    } else if (chosen.name === 'SUERO DE ENERGIA') {
      this.upgrades.bonusMaxSp += stageCleared === 3 ? 25 : 35;
      this.upgrades.energyDamageScale += stageCleared === 3 ? 0.15 : 0.20;
    } else if (chosen.name === 'SUERO DE FURIA') {
      this.upgrades.rageCapacityScale *= 0.85;
      if (stageCleared >= 4) this.upgrades.attackDamageScale += 0.15;
    } else {
      // SUERO X COMPLETO
      this.upgrades.bonusMaxHp += 30;
      this.upgrades.bonusMaxSp += 20;
      this.upgrades.attackDamageScale += 0.10;
    }

    this.stagesCompleted = Math.max(this.stagesCompleted, stageCleared);
    this.save();
  }

  public resetCampaign() {
    this.upgrades = {
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
    this.currentStage = 1;
    this.totalScore = 0;
    this.save();
  }

  public calculateRank(stageTime: number, maxCombo: number, hpRemaining: number, damageTaken: number): string {
    const scoreVal =
      Math.max(0, 360 - stageTime) * 0.32 +
      maxCombo * 11 +
      hpRemaining * 1.7 -
      damageTaken * 1.7 +
      100;

    if (scoreVal >= 520) return 'SSS';
    if (scoreVal >= 430) return 'SS';
    if (scoreVal >= 350) return 'S';
    if (scoreVal >= 275) return 'A';
    if (scoreVal >= 210) return 'B';
    if (scoreVal >= 145) return 'C';
    return 'D';
  }

  public save() {
    try {
      const data = {
        upgrades: this.upgrades,
        stagesCompleted: this.stagesCompleted,
        totalScore: this.totalScore,
        difficulty: this.difficulty,
      };
      localStorage.setItem('district_fury_campaign', JSON.stringify(data));
    } catch {
      // ignore in iframe storage restrict
    }
  }

  public load() {
    try {
      const raw = localStorage.getItem('district_fury_campaign');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.upgrades) this.upgrades = parsed.upgrades;
        if (typeof parsed.stagesCompleted === 'number') this.stagesCompleted = parsed.stagesCompleted;
        if (typeof parsed.totalScore === 'number') this.totalScore = parsed.totalScore;
        if (typeof parsed.difficulty === 'number') this.difficulty = parsed.difficulty;
      }
    } catch {
      // ignore
    }
  }
}

export const campaignManager = new CampaignManager();
