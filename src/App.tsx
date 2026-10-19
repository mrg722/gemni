import React, { useState, useEffect } from 'react';
import { Menu } from './components/Menu';
import { GameCanvas } from './components/GameCanvas';
import { VSModeLab } from './components/VSModeLab';
import { ControlsModal } from './components/Controls';
import { AtlasViewer } from './components/AtlasViewer';
import { campaignManager } from './game/campaign';
import { StoryDifficulty, StreetEnemyType } from './game/types';
import { assetManager } from './engine/assets';
import { audioSystem } from './engine/audio';

export const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<
    'menu' | 'campaign' | 'vs_setup' | 'vs_fight' | 'atlas_viewer'
  >('menu');
  const [showControls, setShowControls] = useState<boolean>(false);
  const [assetsLoaded, setAssetsLoaded] = useState<boolean>(false);
  const [loadProgress, setLoadProgress] = useState<number>(0);
  const [difficulty, setDifficulty] = useState<StoryDifficulty>(campaignManager.difficulty);
  const [use120Atlas, setUse120Atlas] = useState<boolean>(true);

  // VS Mode Lab configuration
  const [vsConfig, setVsConfig] = useState({
    stage: 0,
    scenario: 0,
    enemyCount: 2,
    enemyTypes: [
      StreetEnemyType.Punk,
      StreetEnemyType.Brute,
      StreetEnemyType.Charger,
      StreetEnemyType.Enforcer,
    ],
    selectedCharacter: 0,
    selectedBoss: -1,
  });

  // Preload all assets
  useEffect(() => {
    assetManager.loadAll();
    const interval = setInterval(() => {
      setLoadProgress(assetManager.getLoadProgress());
      if (assetManager.isReady()) {
        setAssetsLoaded(true);
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, []);

  // Handle first user interaction for audio
  const handleUserInteraction = () => {
    audioSystem.startBGM();
  };

  return (
    <div
      onClick={handleUserInteraction}
      className="relative w-screen h-screen bg-black overflow-hidden flex items-center justify-center select-none"
    >
      {/* Loading Screen */}
      {!assetsLoaded && (
        <div className="absolute inset-0 bg-slate-950 z-50 flex flex-col items-center justify-center p-6 text-slate-100 font-mono">
          <div className="text-3xl font-black text-cyan-400 tracking-widest mb-2">
            DISTRICT FURY
          </div>
          <div className="text-xs text-amber-400 mb-6">
            CARGANDO ASSETS Y SPRITE ATLASES DE 120 FRAMES...
          </div>
          <div className="w-72 h-3 bg-slate-900 border border-slate-700 rounded overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-100"
              style={{ width: `${Math.round(loadProgress * 100)}%` }}
            />
          </div>
          <div className="text-xs text-slate-400 mt-2 font-mono">
            {Math.round(loadProgress * 100)}%
          </div>
        </div>
      )}

      {/* Screen Routing */}
      {assetsLoaded && currentScreen === 'menu' && (
        <Menu
          onNewGame={() => {
            campaignManager.resetCampaign();
            setCurrentScreen('campaign');
          }}
          onOpenVSMode={() => setCurrentScreen('vs_setup')}
          onOpenControls={() => setShowControls(true)}
          onOpenAtlasViewer={() => setCurrentScreen('atlas_viewer')}
          difficulty={difficulty}
          onChangeDifficulty={(d) => {
            setDifficulty(d);
            campaignManager.difficulty = d;
            campaignManager.save();
          }}
          use120Atlas={use120Atlas}
          onToggle120Atlas={() => setUse120Atlas(!use120Atlas)}
        />
      )}

      {assetsLoaded && currentScreen === 'vs_setup' && (
        <VSModeLab
          config={vsConfig}
          onChangeConfig={setVsConfig}
          onStartFight={() => setCurrentScreen('vs_fight')}
          onBackToMenu={() => setCurrentScreen('menu')}
        />
      )}

      {assetsLoaded && (currentScreen === 'campaign' || currentScreen === 'vs_fight') && (
        <GameCanvas
          campaign={campaignManager}
          mode={currentScreen === 'campaign' ? 'campaign' : 'vs'}
          vsConfig={currentScreen === 'vs_fight' ? vsConfig : undefined}
          use120Atlas={use120Atlas}
          onExitToMenu={() => setCurrentScreen('menu')}
        />
      )}

      {assetsLoaded && currentScreen === 'atlas_viewer' && (
        <AtlasViewer onBack={() => setCurrentScreen('menu')} />
      )}

      {/* Controls Modal */}
      {showControls && <ControlsModal onClose={() => setShowControls(false)} />}
    </div>
  );
};
