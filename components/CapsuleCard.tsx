import React from 'react';
import { KnowledgeCapsule, Dimension, DimensionType } from '../types';

interface Props {
  capsule: KnowledgeCapsule;
  dimension: Dimension;
  onClick: () => void;
  isFusionMode?: boolean;
  isSelectedForFusion?: boolean;
}

const CapsuleCard: React.FC<Props> = ({ 
  capsule, 
  dimension, 
  onClick, 
  isFusionMode = false,
  isSelectedForFusion = false 
}) => {
  // Determine border color based on dimension
  const baseColor = {
    [DimensionType.TRUE]: 'border-blue-500 shadow-blue-500/20',
    [DimensionType.GOOD]: 'border-emerald-500 shadow-emerald-500/20',
    [DimensionType.BEAUTIFUL]: 'border-pink-500 shadow-pink-500/20',
    [DimensionType.SPIRIT]: 'border-purple-500 shadow-purple-500/20',
  }[dimension.id];

  const hoverColor = {
    [DimensionType.TRUE]: 'hover:border-blue-500 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]',
    [DimensionType.GOOD]: 'hover:border-emerald-500 hover:shadow-[0_0_15px_rgba(16,185,129,0.5)]',
    [DimensionType.BEAUTIFUL]: 'hover:border-pink-500 hover:shadow-[0_0_15px_rgba(236,72,153,0.5)]',
    [DimensionType.SPIRIT]: 'hover:border-purple-500 hover:shadow-[0_0_15px_rgba(139,92,246,0.5)]',
  }[dimension.id];

  const fusionStyle = isSelectedForFusion 
    ? 'border-tier-accent shadow-[0_0_20px_rgba(99,102,241,0.6)] scale-105 bg-tier-accent/10' 
    : isFusionMode 
      ? 'border-dashed border-gray-600 opacity-70 hover:opacity-100 hover:border-tier-accent' 
      : `border-white/5 ${hoverColor}`;

  return (
    <div 
      onClick={onClick}
      className={`
        relative group cursor-pointer 
        glass-panel rounded-xl p-6 
        transition-all duration-300 ease-out
        border
        ${fusionStyle}
        ${!isFusionMode && 'hover:-translate-y-1'}
      `}
    >
      <div className="flex justify-between items-start mb-3">
        <span className="text-xs font-mono text-gray-400 uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">
            {capsule.year}
        </span>
        
        {isFusionMode ? (
            <div className={`w-4 h-4 rounded-full border border-white/40 flex items-center justify-center transition-colors ${isSelectedForFusion ? 'bg-tier-accent border-tier-accent' : ''}`}>
                {isSelectedForFusion && <div className="w-2 h-2 rounded-full bg-white" />}
            </div>
        ) : (
            <div className="group/tooltip relative z-20">
                <div className="w-5 h-5 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-[10px] text-gray-500 hover:bg-tier-accent hover:text-white hover:border-tier-accent transition-all cursor-help">
                    ?
                </div>
                 {/* Tooltip Content */}
                <div className="absolute right-0 top-7 w-56 p-3 rounded-lg bg-[#0f172a] border border-white/20 shadow-2xl opacity-0 translate-y-2 pointer-events-none group-hover/tooltip:opacity-100 group-hover/tooltip:translate-y-0 transition-all duration-200 z-50">
                    <div className="text-[10px] uppercase tracking-widest text-tier-accent mb-1 font-bold">Significance</div>
                    <p className="text-xs text-gray-300 leading-relaxed font-light">{capsule.significance}</p>
                    <div className="absolute -top-1 right-2 w-2 h-2 bg-[#0f172a] border-t border-l border-white/20 rotate-45"></div>
                </div>
            </div>
        )}
      </div>
      
      <h3 className="text-lg font-bold text-white mb-2 leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-400">
        {capsule.title}
      </h3>
      
      <p className="text-sm text-gray-400 line-clamp-2 mb-4 group-hover:text-gray-300">
        {capsule.description}
      </p>

      <div className="flex items-center gap-2">
         <span className="text-xs text-gray-500 group-hover:text-tier-accent transition-colors">
            {capsule.discoveredBy || 'Unknown Origin'}
         </span>
         {capsule.parents && (
           <span className="ml-auto text-xs bg-tier-accent/20 text-tier-accent px-2 py-0.5 rounded-full border border-tier-accent/30">
             Hybrid
           </span>
         )}
      </div>
      
      {/* Decorative corners - Hide in fusion mode to reduce noise */}
      {!isFusionMode && (
        <>
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/10 group-hover:border-white/40 transition-colors rounded-tl-lg" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/10 group-hover:border-white/40 transition-colors rounded-br-lg" />
        </>
      )}
    </div>
  );
};

export default CapsuleCard;