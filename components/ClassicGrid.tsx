
import React, { useState } from 'react';
import { KnowledgeCapsule, DimensionType } from '../types';
import { DIMENSIONS } from '../constants';
import CapsuleCard from './CapsuleCard';

interface Props {
  capsules: KnowledgeCapsule[];
  onSelect: (capsule: KnowledgeCapsule) => void;
  onLoadMore: (dimensionId: DimensionType) => Promise<void>;
  onFuse: (capA: KnowledgeCapsule, capB: KnowledgeCapsule) => Promise<void>;
}

const ClassicGrid: React.FC<Props> = ({ capsules, onSelect, onLoadMore, onFuse }) => {
  const [loadingDim, setLoadingDim] = useState<DimensionType | null>(null);
  const [isFusionMode, setIsFusionMode] = useState(false);
  const [fusionSelection, setFusionSelection] = useState<KnowledgeCapsule[]>([]);
  const [isFusing, setIsFusing] = useState(false);

  const handleLoad = async (dimId: DimensionType) => {
    setLoadingDim(dimId);
    await onLoadMore(dimId);
    setLoadingDim(null);
  };

  const toggleFusionSelection = (capsule: KnowledgeCapsule) => {
    if (fusionSelection.find(c => c.id === capsule.id)) {
      setFusionSelection(prev => prev.filter(c => c.id !== capsule.id));
    } else {
      if (fusionSelection.length < 2) {
        setFusionSelection(prev => [...prev, capsule]);
      }
    }
  };

  const handleIgnite = async () => {
    if (fusionSelection.length !== 2) return;
    setIsFusing(true);
    await onFuse(fusionSelection[0], fusionSelection[1]);
    setIsFusing(false);
    setFusionSelection([]);
    setIsFusionMode(false);
  };

  const renderColumn = (dimId: DimensionType) => {
    const dimCapsules = capsules.filter(c => c.dimensionId === dimId);
    const dim = DIMENSIONS[dimId];
    // Extract bg color for the header gradient
    const bgClass = dim.color.split(' ')[0].replace('text-', 'bg-');
    
    return (
      <div key={dimId} className="flex flex-col h-full min-w-[300px] bg-black/20 border-r border-white/5 last:border-r-0 relative">
        {/* Header */}
        <div className={`p-6 border-b border-white/10 relative overflow-hidden group shrink-0`}>
          <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-b from-${bgClass.split('-')[1]}-500 to-transparent`} />
          <div className="relative z-10">
            <h2 className={`text-2xl font-bold mb-1 flex items-center gap-2 ${dim.color.split(' ')[0]}`}>
              <span className="text-3xl">{dim.icon}</span>
              {dim.name}
            </h2>
            <h3 className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-2">{dim.subTitle}</h3>
            <p className="text-xs text-gray-400 leading-relaxed opacity-80">{dim.description}</p>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide pb-24">
          {dimCapsules.map(capsule => {
             const isSelected = !!fusionSelection.find(c => c.id === capsule.id);
             return (
                <CapsuleCard 
                  key={capsule.id} 
                  capsule={capsule} 
                  dimension={dim} 
                  onClick={() => isFusionMode ? toggleFusionSelection(capsule) : onSelect(capsule)}
                  isFusionMode={isFusionMode}
                  isSelectedForFusion={isSelected}
                />
             );
          })}
          
          <button 
            onClick={() => handleLoad(dimId)}
            disabled={loadingDim === dimId || isFusionMode}
            className={`w-full py-4 mt-4 rounded-xl border border-dashed border-white/10 text-xs uppercase font-bold tracking-widest text-gray-500 hover:border-${dim.color.split('-')[1]}-500/50 hover:text-white hover:bg-white/5 transition-all flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed`}
          >
            {loadingDim === dimId ? (
              <>
                <div className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <span>+ Discover More</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-hidden relative bg-[#050510] flex flex-col">
      {/* Top Bar Controls */}
      <div className="h-14 border-b border-white/10 flex items-center justify-between px-6 bg-black/40 backdrop-blur-md z-20 shrink-0">
          <div className="text-sm font-bold text-gray-300 tracking-wider">CLASSIC EXPLORER</div>
          <button 
             onClick={() => setIsFusionMode(!isFusionMode)}
             className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold uppercase tracking-widest transition-all ${isFusionMode ? 'bg-tier-accent text-white border-tier-accent shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}
          >
             <span className="text-lg">🧪</span>
             {isFusionMode ? 'Fusion Lab Active' : 'Open Fusion Lab'}
          </button>
      </div>

      <div className="flex-1 flex overflow-x-auto overflow-y-hidden">
         <div className="flex h-full min-w-max md:min-w-0 md:w-full">
            {Object.values(DimensionType).map(dimId => renderColumn(dimId))}
         </div>
      </div>

      {/* Fusion Reactor UI */}
      {isFusionMode && (
          <div className="absolute bottom-0 left-0 w-full bg-[#0f172a] border-t border-white/10 p-4 z-50 flex items-center justify-between animate-float" style={{animationDuration: '0.3s'}}>
              <div className="flex items-center gap-4">
                  <div className="hidden md:block">
                      <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Reactor Status</div>
                      <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${fusionSelection.length === 2 ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
                          <span className="text-sm text-white font-mono">{fusionSelection.length}/2 Capsules Loaded</span>
                      </div>
                  </div>
                  
                  {/* Slots */}
                  <div className="flex gap-2">
                      {[0, 1].map(i => (
                          <div key={i} className="w-48 h-12 rounded bg-black/50 border border-white/10 flex items-center px-3 text-xs text-gray-500 relative overflow-hidden">
                              {fusionSelection[i] ? (
                                  <>
                                     <span className="relative z-10 text-white truncate font-bold">{fusionSelection[i].title}</span>
                                     <div className={`absolute inset-0 opacity-20 bg-${DIMENSIONS[fusionSelection[i].dimensionId].color.split('-')[1]}-500`} />
                                  </>
                              ) : (
                                  <span className="opacity-50">Empty Slot {i+1}</span>
                              )}
                          </div>
                      ))}
                  </div>
              </div>

              <button 
                  onClick={handleIgnite}
                  disabled={fusionSelection.length !== 2 || isFusing}
                  className={`px-8 py-3 rounded-lg font-bold uppercase tracking-widest text-sm transition-all flex items-center gap-2
                    ${fusionSelection.length === 2 
                        ? 'bg-gradient-to-r from-tier-accent to-purple-600 text-white shadow-[0_0_20px_rgba(99,102,241,0.5)] hover:scale-105' 
                        : 'bg-white/5 text-gray-600 cursor-not-allowed border border-white/5'
                    }
                  `}
              >
                  {isFusing ? (
                      <>
                        <span className="animate-spin">⚙️</span> Synthesizing...
                      </>
                  ) : (
                      <>
                        <span>⚡ Ignite Fusion</span>
                      </>
                  )}
              </button>
          </div>
      )}
    </div>
  );
};

export default ClassicGrid;
