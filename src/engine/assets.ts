// Asset Manager for loading and slicing District Fury sprites and backdrops
export interface FrameSlice {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
}

class AssetManager {
  private images: Map<string, HTMLImageElement> = new Map();
  private loadedCount: number = 0;
  private totalCount: number = 0;
  private ready: boolean = false;
  private onReadyCallbacks: (() => void)[] = [];

  constructor() {}

  public loadAll() {
    const assetList: { key: string; src: string }[] = [
      // UI
      { key: 'menu_art', src: '/assets/ui/menu_main_art.png' },

      // Character
      { key: 'rayden', src: '/assets/characters/rayden_clean.png' },

      // Enemies
      { key: 'punk', src: '/assets/enemies/punk_clean.png' },
      { key: 'brute', src: '/assets/enemies/brute_clean.png' },
      { key: 'charger', src: '/assets/enemies/charger_clean.png' },
      { key: 'enforcer', src: '/assets/enemies/enforcer_clean.png' },
      { key: 'chemical_soldier', src: '/assets/enemies/chemical_soldier_clean.png' },
      { key: 'urban_ninja', src: '/assets/enemies/urban_ninja_clean.png' },
      { key: 'mutant', src: '/assets/enemies/mutant_clean.png' },
      { key: 'armored_guard', src: '/assets/enemies/armored_guard_clean.png' },

      // Backgrounds
      { key: 'bg_steel', src: '/assets/backgrounds/old_steel_yard_clean.png' },
      { key: 'bg_mercado_antiguo', src: '/assets/backgrounds/mercado_antiguo_clean.png' },
      { key: 'bg_zona_quimica', src: '/assets/backgrounds/zona_quimica_clean.png' },
      // Stage 1 to 5 Scenarios
      { key: 'bg_s1_1', src: '/assets/backgrounds/stage1_scenario01.png' },
      { key: 'bg_s1_2', src: '/assets/backgrounds/stage1_scenario02.png' },
      { key: 'bg_s1_3', src: '/assets/backgrounds/stage1_scenario03.png' },
      { key: 'bg_s1_4', src: '/assets/backgrounds/stage1_scenario04.png' },
      { key: 'bg_s2_1', src: '/assets/backgrounds/stage2_scenario01.png' },
      { key: 'bg_s2_2', src: '/assets/backgrounds/stage2_scenario02.png' },
      { key: 'bg_s2_3', src: '/assets/backgrounds/stage2_scenario03.png' },
      { key: 'bg_s2_4', src: '/assets/backgrounds/stage2_scenario04.png' },
      { key: 'bg_s3_1', src: '/assets/backgrounds/stage3_scenario01.png' },
      { key: 'bg_s3_2', src: '/assets/backgrounds/stage3_scenario02.png' },
      { key: 'bg_s3_3', src: '/assets/backgrounds/stage3_scenario03.png' },
      { key: 'bg_s3_4', src: '/assets/backgrounds/stage3_scenario04.png' },
      { key: 'bg_s4_1', src: '/assets/backgrounds/stage4_scenario01.png' },
      { key: 'bg_s4_2', src: '/assets/backgrounds/stage4_scenario02.png' },
      { key: 'bg_s4_3', src: '/assets/backgrounds/stage4_scenario03.png' },
      { key: 'bg_s4_4', src: '/assets/backgrounds/stage4_scenario04.png' },
      { key: 'bg_s5_1', src: '/assets/backgrounds/stage5_scenario01.png' },
      { key: 'bg_s5_2', src: '/assets/backgrounds/stage5_scenario02.png' },
      { key: 'bg_s5_3', src: '/assets/backgrounds/stage5_scenario03.png' },
      { key: 'bg_s5_4', src: '/assets/backgrounds/stage5_scenario04.png' },

      // Bosses - Brakk
      { key: 'brakk_basic', src: '/assets/bosses/brakk/basic.png' },
      { key: 'brakk_chain', src: '/assets/bosses/brakk/chain.png' },
      { key: 'brakk_chain_throw', src: '/assets/bosses/brakk/chain_throw.png' },
      { key: 'brakk_charge', src: '/assets/bosses/brakk/charge.png' },
      { key: 'brakk_death', src: '/assets/bosses/brakk/death.png' },
      { key: 'brakk_explosive', src: '/assets/bosses/brakk/explosive.png' },
      { key: 'brakk_fury', src: '/assets/bosses/brakk/fury.png' },
      { key: 'brakk_grab', src: '/assets/bosses/brakk/grab.png' },
      { key: 'brakk_heavy', src: '/assets/bosses/brakk/heavy.png' },
      { key: 'brakk_hurt', src: '/assets/bosses/brakk/hurt.png' },
      { key: 'brakk_idle', src: '/assets/bosses/brakk/idle.png' },
      { key: 'brakk_run', src: '/assets/bosses/brakk/run.png' },
      { key: 'brakk_smash', src: '/assets/bosses/brakk/smash.png' },
      { key: 'brakk_walk', src: '/assets/bosses/brakk/walk.png' },

      // Bosses - Grinder
      { key: 'grinder_death', src: '/assets/bosses/grinder/death.png' },
      { key: 'grinder_hurt', src: '/assets/bosses/grinder/hurt.png' },
      { key: 'grinder_idle', src: '/assets/bosses/grinder/idle.png' },
      { key: 'grinder_overdrive', src: '/assets/bosses/grinder/overdrive.png' },
      { key: 'grinder_ram', src: '/assets/bosses/grinder/ram.png' },
      { key: 'grinder_saw', src: '/assets/bosses/grinder/saw.png' },
      { key: 'grinder_slam', src: '/assets/bosses/grinder/slam.png' },

      // Bosses - Titan-X
      { key: 'titanx_death', src: '/assets/bosses/titanx/death.png' },
      { key: 'titanx_idle1', src: '/assets/bosses/titanx/idle1.png' },
      { key: 'titanx_idle2', src: '/assets/bosses/titanx/idle2.png' },
      { key: 'titanx_idle3', src: '/assets/bosses/titanx/idle3.png' },
      { key: 'titanx_idle4', src: '/assets/bosses/titanx/idle4.png' },
      { key: 'titanx_lean', src: '/assets/bosses/titanx/lean.png' },
      { key: 'titanx_punch1', src: '/assets/bosses/titanx/punch1.png' },
      { key: 'titanx_punch2', src: '/assets/bosses/titanx/punch2.png' },
      { key: 'titanx_recoil', src: '/assets/bosses/titanx/recoil.png' },
      { key: 'titanx_shoot_orb', src: '/assets/bosses/titanx/shoot_orb.png' },
      { key: 'titanx_slam', src: '/assets/bosses/titanx/slam.png' },
      { key: 'titanx_uppercut', src: '/assets/bosses/titanx/uppercut.png' },

      // Bosses - Titan-X Mejorado
      { key: 'titanx_m_cannon_aim', src: '/assets/bosses/titanx_mejorado/cannon_aim.png' },
      { key: 'titanx_m_charge_orb', src: '/assets/bosses/titanx_mejorado/charge_orb.png' },
      { key: 'titanx_m_dash', src: '/assets/bosses/titanx_mejorado/dash.png' },
      { key: 'titanx_m_death', src: '/assets/bosses/titanx_mejorado/death.png' },
      { key: 'titanx_m_idle1', src: '/assets/bosses/titanx_mejorado/idle1.png' },
      { key: 'titanx_m_idle2', src: '/assets/bosses/titanx_mejorado/idle2.png' },
      { key: 'titanx_m_idle3', src: '/assets/bosses/titanx_mejorado/idle3.png' },
      { key: 'titanx_m_idle4', src: '/assets/bosses/titanx_mejorado/idle4.png' },
      { key: 'titanx_m_rage_aura', src: '/assets/bosses/titanx_mejorado/rage_aura.png' },
      { key: 'titanx_m_shoot_orb', src: '/assets/bosses/titanx_mejorado/shoot_orb.png' },
      { key: 'titanx_m_slam', src: '/assets/bosses/titanx_mejorado/slam.png' },

      // Bosses - Rayder Clone
      { key: 'clone_dash', src: '/assets/bosses/rayder_clone/dash.png' },
      { key: 'clone_death', src: '/assets/bosses/rayder_clone/death.png' },
      { key: 'clone_hurt', src: '/assets/bosses/rayder_clone/hurt.png' },
      { key: 'clone_idle1', src: '/assets/bosses/rayder_clone/idle1.png' },
      { key: 'clone_idle2', src: '/assets/bosses/rayder_clone/idle2.png' },
      { key: 'clone_idle3', src: '/assets/bosses/rayder_clone/idle3.png' },
      { key: 'clone_idle4', src: '/assets/bosses/rayder_clone/idle4.png' },
      { key: 'clone_kick', src: '/assets/bosses/rayder_clone/kick.png' },
      { key: 'clone_punch', src: '/assets/bosses/rayder_clone/punch.png' },
      { key: 'clone_ready', src: '/assets/bosses/rayder_clone/ready.png' },
      { key: 'clone_release_orb', src: '/assets/bosses/rayder_clone/release_orb.png' },

      // Kessler NPC
      { key: 'kessler_idle', src: '/assets/npc/kessler/idle.png' },
      { key: 'kessler_walk1', src: '/assets/npc/kessler/walk1.png' },
      { key: 'kessler_walk2', src: '/assets/npc/kessler/walk2.png' },

      // 120-Frame High-Fidelity Character Atlases (15 characters)
      { key: 'rayden_120', src: '/assets/atlases_120/rayden_120.png' },
      { key: 'rayder_clone_120', src: '/assets/atlases_120/rayder_clone_120.png' },
      { key: 'punk_120', src: '/assets/atlases_120/punk_120.png' },
      { key: 'brute_120', src: '/assets/atlases_120/brute_120.png' },
      { key: 'charger_120', src: '/assets/atlases_120/charger_120.png' },
      { key: 'enforcer_120', src: '/assets/atlases_120/enforcer_120.png' },
      { key: 'chemical_soldier_120', src: '/assets/atlases_120/chemical_soldier_120.png' },
      { key: 'urban_ninja_120', src: '/assets/atlases_120/urban_ninja_120.png' },
      { key: 'mutant_120', src: '/assets/atlases_120/mutant_120.png' },
      { key: 'armored_guard_120', src: '/assets/atlases_120/armored_guard_120.png' },
      { key: 'brakk_120', src: '/assets/atlases_120/brakk_120.png' },
      { key: 'grinder_120', src: '/assets/atlases_120/grinder_120.png' },
      { key: 'titanx_120', src: '/assets/atlases_120/titanx_120.png' },
      { key: 'titanx_mejorado_120', src: '/assets/atlases_120/titanx_mejorado_120.png' },
      { key: 'kessler_120', src: '/assets/atlases_120/kessler_120.png' }
    ];

    this.totalCount = assetList.length;
    this.loadedCount = 0;

    assetList.forEach((item) => {
      const img = new Image();
      img.onload = () => {
        this.loadedCount++;
        if (this.loadedCount >= this.totalCount) {
          this.ready = true;
          this.onReadyCallbacks.forEach((cb) => cb());
        }
      };
      img.onerror = () => {
        // Fallback placeholder
        this.loadedCount++;
        if (this.loadedCount >= this.totalCount) {
          this.ready = true;
          this.onReadyCallbacks.forEach((cb) => cb());
        }
      };
      img.src = item.src;
      this.images.set(item.key, img);
    });
  }

  public getImage(key: string): HTMLImageElement | undefined {
    return this.images.get(key);
  }

  public isReady(): boolean {
    return this.ready;
  }

  public onReady(cb: () => void) {
    if (this.ready) {
      cb();
    } else {
      this.onReadyCallbacks.push(cb);
    }
  }

  public getLoadProgress(): number {
    return this.totalCount === 0 ? 1 : this.loadedCount / this.totalCount;
  }
}

export const assetManager = new AssetManager();
