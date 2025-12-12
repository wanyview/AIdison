
import React, { useState } from 'react';
import Background from './components/Background';
import SalonInterface from './components/SalonInterface';
import AgentForge from './components/AgentForge';
import LobbyGalaxy from './components/LobbyGalaxy';
import ClassicGrid from './components/ClassicGrid';
import { DIMENSIONS, SEED_CAPSULES } from './constants';
import { DimensionType, KnowledgeCapsule, Agent } from './types';
import { discoverMoreCapsules, fuseCapsules } from './services/geminiService';

type ViewState = 'LANDING' | 'FORGE' | 'LOBBY' | 'SALON' | 'CLASSIC_GRID';

const App: React.FC = () => {
  const [viewState, setViewState] = useState<ViewState>('LANDING');
  const [isDemo, setIsDemo] = useState(false);
  
  // Data State
  const [userEnvoy, setUserEnvoy] = useState<Agent | null>(null);
  const [selectedCapsule, setSelectedCapsule] = useState<KnowledgeCapsule | null>(null);
  const [capsules, setCapsules] = useState<KnowledgeCapsule[]>(SEED_CAPSULES);
  
  // Helpers
  const handleEnterSystem = () => {
    setIsDemo(false);
    setViewState('FORGE');
  };

  const handleEnterClassic = () => {
    setIsDemo(false);
    // Create a default "Observer" agent for classic mode
    const observerAgent: Agent = {
        id: 'observer-classic',
        name: 'Observer',
        role: 'USER_ENVOY',
        avatar: '👁️',
        systemPrompt: 'You are a curious observer of the TIER system.',
        isUser: true,
        stats: { riskTolerance: 0.5, creativityBias: 0.5 }
    };
    setUserEnvoy(observerAgent);
    setViewState('CLASSIC_GRID');
  };

  const startDemo = () => {
     // Pick random capsule
     const randomCap = capsules[Math.floor(Math.random() * capsules.length)];
     const demoAgent: Agent = {
         id: 'demo-observer',
         name: 'Demo Observer',
         role: 'USER_ENVOY',
         avatar: '🧠',
         systemPrompt: 'Just watching.',
         isUser: true
     };
     setUserEnvoy(demoAgent);
     setSelectedCapsule(randomCap);
     setIsDemo(true);
     setViewState('SALON');
  };
  
  const handleForgeComplete = (agent: Agent) => {
    setUserEnvoy(agent);
    setViewState('LOBBY');
  };

  const handleSelectCapsule = (capsule: KnowledgeCapsule) => {
    setSelectedCapsule(capsule);
    setViewState('SALON');
  };

  const handleCloseSalon = () => {
    setSelectedCapsule(null);
    setIsDemo(false);
    // Return to where we came from
    if (userEnvoy?.id === 'observer-classic') {
        setViewState('CLASSIC_GRID');
    } else {
        setViewState('LOBBY');
    }
  };

  const handleEmergence = (newCapsule: KnowledgeCapsule) => {
    setCapsules(prev => [newCapsule, ...prev]);
  };

  const handleCreateProtocol = async (dimensionId: DimensionType) => {
     // Simulating quick generation for the Lobby "Create" button
     // Ensure we wait for the result
     const newCaps = await discoverMoreCapsules(
        dimensionId, 
        capsules.filter(c => c.dimensionId === dimensionId).map(c=>c.title), 
        1
     );
     if(newCaps.length > 0) {
        setCapsules(prev => [newCaps[0], ...prev]);
     }
  };

  const handleLoadMoreClassic = async (dimensionId: DimensionType) => {
     const newCaps = await discoverMoreCapsules(
        dimensionId, 
        capsules.filter(c => c.dimensionId === dimensionId).map(c=>c.title), 
        4
     );
     setCapsules(prev => [...prev, ...newCaps]);
  };

  const handleFuse = async (capA: KnowledgeCapsule, capB: KnowledgeCapsule) => {
     const fusedCap = await fuseCapsules(capA, capB);
     if (fusedCap) {
        setCapsules(prev => [fusedCap, ...prev]);
        // Optionally auto-open the new capsule? 
        // For now, let's just let it appear in the grid (it usually goes to Spirit or stays in dimension)
     }
  };

  return (
    <div className="min-h-screen text-white font-sans selection:bg-tier-accent selection:text-white flex flex-col overflow-hidden">
      <Background />

      {/* Navigation / Header */}
      <nav className="fixed top-0 left-0 w-full z-40 px-6 py-4 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
        <div 
          className="text-2xl font-bold tracking-tighter cursor-pointer flex items-center gap-2 pointer-events-auto"
          onClick={() => setViewState('LANDING')}
        >
          <span className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs shadow-[0_0_15px_rgba(99,102,241,0.5)]">T</span>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            TIER SALON
          </span>
        </div>
        
        {userEnvoy && (
          <div className="flex items-center gap-3 pointer-events-auto">
             <span className="text-xs text-gray-400 uppercase hidden md:block">
                 {userEnvoy.id === 'observer-classic' ? 'Observer Mode' : isDemo ? 'System Demo' : 'Commander Active'}
             </span>
             <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full border border-white/10 backdrop-blur-sm">
                <span className="text-lg">{userEnvoy.avatar}</span>
                <span className="text-sm font-bold text-tier-accent">{userEnvoy.name}</span>
             </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="relative z-10 pt-20 flex-1 flex flex-col h-full">
        
        {/* VIEW: LANDING */}
        {viewState === 'LANDING' && (
          <div className="flex-1 flex flex-col justify-center items-center animate-float px-6">
            <h1 className="text-5xl md:text-7xl font-bold text-center mb-6 leading-tight tracking-tight">
              AGENT <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">COMMANDER</span>
            </h1>
            <p className="text-gray-400 text-center max-w-2xl mb-10 text-lg font-light">
              Don't just watch. Mint your intelligent envoy, mount your private knowledge base, and debate civilization-level concepts with AI experts.
            </p>

            <div className="flex gap-4">
                <button 
                    onClick={handleEnterSystem}
                    className="px-10 py-4 bg-white text-black rounded-full font-bold tracking-widest uppercase text-sm transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)]"
                >
                    Initialize Protocol
                </button>
                <button 
                    onClick={handleEnterClassic}
                    className="px-10 py-4 border border-white/20 bg-black/40 text-white rounded-full font-bold tracking-widest uppercase text-sm transition-all hover:bg-white/10 hover:border-white/50 backdrop-blur-md"
                >
                    Classic View
                </button>
            </div>

            <button 
                onClick={startDemo}
                className="mt-8 text-xs text-gray-500 hover:text-white underline decoration-dotted underline-offset-4"
            >
                Watch System Demo
            </button>
          </div>
        )}

        {/* VIEW: FORGE */}
        {viewState === 'FORGE' && (
           <AgentForge onComplete={handleForgeComplete} />
        )}

        {/* VIEW: LOBBY */}
        {viewState === 'LOBBY' && (
           <LobbyGalaxy 
              capsules={capsules} 
              onSelect={handleSelectCapsule} 
              onCreateNew={handleCreateProtocol}
           />
        )}

        {/* VIEW: CLASSIC GRID */}
        {viewState === 'CLASSIC_GRID' && (
           <ClassicGrid 
              capsules={capsules}
              onSelect={handleSelectCapsule}
              onLoadMore={handleLoadMoreClassic}
              onFuse={handleFuse}
           />
        )}

        {/* VIEW: SALON */}
        {viewState === 'SALON' && selectedCapsule && userEnvoy && (
          <SalonInterface
            capsule={selectedCapsule}
            dimension={DIMENSIONS[selectedCapsule.dimensionId]}
            userEnvoy={userEnvoy}
            onClose={handleCloseSalon}
            onEmergence={handleEmergence}
            isDemo={isDemo}
          />
        )}

      </main>
    </div>
  );
};

export default App;
