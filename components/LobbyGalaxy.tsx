import React, { useState, useMemo, useEffect, useRef } from 'react';
import { KnowledgeCapsule, DimensionType } from '../types';
import { DIMENSIONS } from '../constants';
import { scanLatentSpace } from '../services/geminiService';

interface Props {
  capsules: KnowledgeCapsule[];
  onSelect: (capsule: KnowledgeCapsule) => void;
  onCreateNew: (dimensionId: DimensionType) => Promise<void>;
}

interface LatentLink {
    id: string;
    from: string; // Capsule ID
    to: string;   // Capsule ID
    insight: string;
    timestamp: number;
}

const LobbyGalaxy: React.FC<Props> = ({ capsules, onSelect, onCreateNew }) => {
  const [isCreating, setIsCreating] = useState<DimensionType | null>(null);
  const [hoveredSector, setHoveredSector] = useState<DimensionType | null>(null);
  
  // Telepathy State
  const [telepathyEnabled, setTelepathyEnabled] = useState(false);
  const [scanningPair, setScanningPair] = useState<[string, string] | null>(null);
  const [latentLinks, setLatentLinks] = useState<LatentLink[]>([]);
  const processingRef = useRef(false);

  const handleCreate = async (dimId: DimensionType) => {
    setIsCreating(dimId);
    await onCreateNew(dimId);
    setIsCreating(null);
  };

  // Group capsules by dimension for quadrant rendering
  const sectors = useMemo(() => {
    const grouped: Record<DimensionType, KnowledgeCapsule[]> = {
      [DimensionType.TRUE]: [],
      [DimensionType.GOOD]: [],
      [DimensionType.BEAUTIFUL]: [],
      [DimensionType.SPIRIT]: []
    };
    
    capsules.forEach(c => {
      if (grouped[c.dimensionId]) {
        grouped[c.dimensionId].push(c);
      }
    });
    return grouped;
  }, [capsules]);

  // Configuration for the 4 Quadrants
  const sectorConfig = {
    [DimensionType.TRUE]: { 
      x: -1, y: -1, 
      color: '#3b82f6', 
      label: 'TRUTH', 
      sub: 'Natural Sciences',
      icon: '⚛️'
    },
    [DimensionType.GOOD]: { 
      x: 1, y: -1, 
      color: '#10b981', 
      label: 'GOOD', 
      sub: 'Social Sciences',
      icon: '⚖️'
    },
    [DimensionType.BEAUTIFUL]: { 
      x: -1, y: 1, 
      color: '#ec4899', 
      label: 'BEAUTIFUL', 
      sub: 'Arts & Humanities',
      icon: '🎨'
    },
    [DimensionType.SPIRIT]: { 
      x: 1, y: 1, 
      color: '#8b5cf6', 
      label: 'SPIRIT', 
      sub: 'Interdisciplinary',
      icon: '🧿'
    },
  };

  // Deterministic Position Helper
  const getStarPosition = (capsule: KnowledgeCapsule) => {
      const config = sectorConfig[capsule.dimensionId];
      const centerX = config.x * 250; 
      const centerY = config.y * 200;

      const pseudoRandom = (seed: number) => {
          const x = Math.sin(seed) * 10000;
          return x - Math.floor(x);
      };
      const seed = capsule.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      
      const angle = pseudoRandom(seed) * Math.PI * 2;
      const dist = pseudoRandom(seed + 1) * 140; 
      
      return {
          x: centerX + Math.cos(angle) * dist,
          y: centerY + Math.sin(angle) * dist
      };
  };

  // --- TELEPATHY LOGIC ---
  useEffect(() => {
      let interval: ReturnType<typeof setInterval>;

      if (telepathyEnabled && capsules.length > 5) {
          interval = setInterval(async () => {
              if (processingRef.current) return;
              
              // Pick 2 random capsules
              const idxA = Math.floor(Math.random() * capsules.length);
              let idxB = Math.floor(Math.random() * capsules.length);
              while (idxB === idxA) idxB = Math.floor(Math.random() * capsules.length);

              const capA = capsules[idxA];
              const capB = capsules[idxB];
              
              // Only link cross-dimension for more interest
              if (capA.dimensionId === capB.dimensionId) return;

              // Don't relink
              if (latentLinks.find(l => (l.from === capA.id && l.to === capB.id) || (l.from === capB.id && l.to === capA.id))) return;

              setScanningPair([capA.id, capB.id]);
              processingRef.current = true;

              const insight = await scanLatentSpace(capA, capB);

              if (insight) {
                  setLatentLinks(prev => [...prev, {
                      id: `link-${Date.now()}`,
                      from: capA.id,
                      to: capB.id,
                      insight,
                      timestamp: Date.now()
                  }]);
              }

              processingRef.current = false;
              setScanningPair(null);

          }, 3000); // Attempt scan every 3s
      }

      return () => clearInterval(interval);
  }, [telepathyEnabled, capsules, latentLinks]);


  // Helper to render connection lines
  const renderLatentLines = () => {
      if (!telepathyEnabled && latentLinks.length === 0) return null;

      return (
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible">
             <defs>
                 <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                   <feGaussianBlur stdDeviation="2" result="blur" />
                   <feComposite in="SourceGraphic" in2="blur" operator="over" />
                 </filter>
             </defs>
             {/* Center Group to match the Galaxy Translation logic (which centers 0,0) */}
             {/* Note: The Galaxy uses flex center. We need to match coordinates. 
                 Since the getStarPosition returns offsets from center, we simply need to 
                 translate the SVG group to the center of the screen.
              */}
             <g transform="translate(50%, 50%)" style={{ transformBox: 'view-box' }}> 
                 {/* Existing Links */}
                 {latentLinks.map(link => {
                     const fromCap = capsules.find(c => c.id === link.from);
                     const toCap = capsules.find(c => c.id === link.to);
                     if (!fromCap || !toCap) return null;
                     
                     const p1 = getStarPosition(fromCap);
                     const p2 = getStarPosition(toCap);

                     return (
                         <g key={link.id}>
                            <line 
                                x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} 
                                stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1"
                            />
                            {/* Animated Pulse Packet */}
                            <circle r="2" fill="#fff">
                               <animateMotion 
                                 dur="2s" 
                                 repeatCount="indefinite"
                                 path={`M${p1.x},${p1.y} L${p2.x},${p2.y}`}
                               />
                            </circle>
                            {/* Insight Label (Midpoint) */}
                            <foreignObject x={(p1.x + p2.x)/2 - 60} y={(p1.y + p2.y)/2 - 10} width="120" height="40">
                                <div className="text-[8px] bg-black/80 text-tier-accent border border-tier-accent/30 rounded px-1 py-0.5 text-center truncate backdrop-blur-sm">
                                    {link.insight}
                                </div>
                            </foreignObject>
                         </g>
                     )
                 })}

                 {/* Active Scan Beam */}
                 {scanningPair && (
                     <line 
                        x1={getStarPosition(capsules.find(c=>c.id === scanningPair[0])!).x} 
                        y1={getStarPosition(capsules.find(c=>c.id === scanningPair[0])!).y} 
                        x2={getStarPosition(capsules.find(c=>c.id === scanningPair[1])!).x} 
                        y2={getStarPosition(capsules.find(c=>c.id === scanningPair[1])!).y} 
                        stroke="#ec4899" strokeWidth="2" strokeDasharray="4"
                        className="animate-pulse"
                        filter="url(#glow)"
                     />
                 )}
             </g>
          </svg>
      );
  }

  return (
    <div className="w-full h-full flex flex-col relative flex-1 bg-[#020205] overflow-hidden perspective-1000">
      
      {/* Header UI */}
      <div className="absolute top-0 left-0 p-6 z-20 pointer-events-none">
        <h2 className="text-4xl font-black text-white tracking-tighter">GALACTIC LOBBY</h2>
        <div className="flex items-center gap-2 mt-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"/>
            <p className="text-gray-400 text-sm font-mono uppercase">
                Systems Online: {capsules.length} Active Protocols
            </p>
        </div>
      </div>

      {/* Universe Container */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
         {/* Background Grid */}
         <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px] pointer-events-none" />

         {/* Latent Connection Layer */}
         {/* We need to wrap this carefully so it aligns with the absolute divs below */}
         <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center">
            {renderLatentLines()}
         </div>

         {/* Render 4 Sectors */}
         {(Object.keys(sectors) as DimensionType[]).map((dimId) => {
             const config = sectorConfig[dimId];
             const sectorCapsules = sectors[dimId];
             const isHovered = hoveredSector === dimId;
             
             // Base offset for the quadrant center
             const centerX = config.x * 250; 
             const centerY = config.y * 200;

             return (
                 <div 
                    key={dimId}
                    className="absolute transition-all duration-700 ease-out"
                    style={{ 
                        transform: `translate(${centerX}px, ${centerY}px) scale(${isHovered ? 1.1 : 1})`,
                        zIndex: isHovered ? 50 : 10
                    }}
                    onMouseEnter={() => setHoveredSector(dimId)}
                    onMouseLeave={() => setHoveredSector(null)}
                 >
                    {/* Sector Label Background */}
                    <div className={`absolute -translate-x-1/2 -translate-y-1/2 text-[120px] font-black text-white/[0.03] select-none pointer-events-none whitespace-nowrap transition-colors duration-500 ${isHovered ? 'text-white/[0.08]' : ''}`}>
                        {config.label}
                    </div>

                    {/* Sector Icon/Info (Visible on Hover) */}
                    <div className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center transition-opacity duration-300 pointer-events-none ${isHovered ? 'opacity-100' : 'opacity-30'}`}>
                         <div className="text-4xl mb-2 filter drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">{config.icon}</div>
                         <div className="text-xs uppercase tracking-[0.3em] text-gray-400 font-bold">{config.sub}</div>
                    </div>

                    {/* Create Button */}
                    <button
                       onClick={(e) => {
                           e.stopPropagation();
                           handleCreate(dimId);
                       }}
                       disabled={isCreating !== null}
                       className={`
                          absolute top-20 left-1/2 -translate-x-1/2 
                          px-4 py-1.5 rounded-full border border-white/10 bg-black/50 backdrop-blur-md
                          text-[10px] font-bold uppercase tracking-wider text-white
                          hover:bg-white/10 hover:border-white/40 hover:scale-105 transition-all
                          flex items-center gap-2
                          ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}
                       `}
                    >
                        {isCreating === dimId ? <span className="animate-spin">⟳</span> : <span>+</span>}
                        <span>Expand {config.label}</span>
                    </button>

                    {/* Render Stars */}
                    {sectorCapsules.map((capsule) => {
                         // We need to invert the quadrant translation here because getStarPosition returns relative to CENTER (0,0)
                         // But we are currently INSIDE the quadrant div which is shifted by (centerX, centerY).
                         // Wait, `getStarPosition` returns absolute coordinates from center (0,0).
                         // This `div` is translated to (centerX, centerY).
                         // So the star needs to be at (starAbsX - centerX, starAbsY - centerY).
                         // Let's re-verify the math.
                         // Angle/Dist logic in getStarPosition adds centerX.
                         // So if we just render here, we are double shifting.
                         
                         // Fix: calculate local position relative to quadrant center.
                         const absPos = getStarPosition(capsule);
                         const localX = absPos.x - centerX;
                         const localY = absPos.y - centerY;

                        return (
                            <div
                                key={capsule.id}
                                onClick={() => onSelect(capsule)}
                                className="absolute cursor-pointer group"
                                style={{
                                    transform: `translate(${localX}px, ${localY}px)`,
                                }}
                            >
                                {/* The Star */}
                                <div 
                                    className="w-4 h-4 rounded-full blur-[1px] transition-all duration-300 group-hover:scale-[2] group-hover:blur-none z-10 relative"
                                    style={{ 
                                        backgroundColor: config.color,
                                        boxShadow: `0 0 ${isHovered ? '20px' : '10px'} ${config.color}`
                                    }}
                                />
                                
                                {/* Tooltip */}
                                <div className="absolute top-6 left-1/2 -translate-x-1/2 w-48 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                                    <div className="bg-black/90 border border-white/20 p-3 rounded-lg backdrop-blur-xl">
                                        <h4 className="text-white font-bold text-xs mb-1">{capsule.title}</h4>
                                        <p className="text-[9px] text-gray-400 line-clamp-2">{capsule.description}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                 </div>
             );
         })}
      </div>
      
      {/* CONTROLS BAR (Bottom) */}
      <div className="absolute bottom-6 left-0 w-full flex justify-between items-end px-12 pointer-events-none z-30">
         
         {/* Left: Sector Legend */}
         <div className="flex gap-4 pointer-events-auto">
             {(Object.keys(sectorConfig) as DimensionType[]).map(d => (
                 <div key={d} className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/5">
                     <div className="w-2 h-2 rounded-full" style={{ background: sectorConfig[d].color }} />
                     <span className="text-[10px] font-bold text-gray-400 uppercase">{sectorConfig[d].label}</span>
                 </div>
             ))}
         </div>

         {/* Right: Telepathy Control */}
         <div className="pointer-events-auto flex flex-col items-end gap-2">
            <div className={`text-[10px] font-bold uppercase tracking-widest ${telepathyEnabled ? 'text-tier-accent animate-pulse' : 'text-gray-600'}`}>
                {telepathyEnabled ? 'Latent Field: Scanning...' : 'Latent Field: Offline'}
            </div>
            <button
                onClick={() => setTelepathyEnabled(!telepathyEnabled)}
                className={`
                    flex items-center gap-3 px-6 py-3 rounded-full border backdrop-blur-md transition-all
                    ${telepathyEnabled 
                        ? 'bg-tier-accent/20 border-tier-accent text-white shadow-[0_0_20px_rgba(99,102,241,0.4)]' 
                        : 'bg-black/40 border-white/10 text-gray-400 hover:border-white/30'
                    }
                `}
            >
                <span className="text-xl">🧠</span>
                <div className="flex flex-col items-start">
                    <span className="text-xs font-bold uppercase tracking-wider">Telepathy Protocol</span>
                    <span className="text-[9px] opacity-60">Connect Neural Vectors</span>
                </div>
                
                {/* Switch Graphic */}
                <div className={`w-8 h-4 rounded-full relative transition-colors ${telepathyEnabled ? 'bg-tier-accent' : 'bg-gray-700'}`}>
                    <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${telepathyEnabled ? 'left-4.5' : 'left-0.5'}`} style={{left: telepathyEnabled ? '18px' : '2px'}} />
                </div>
            </button>
            {latentLinks.length > 0 && (
                <div className="bg-black/60 border border-white/10 rounded px-2 py-1 text-[9px] text-gray-400">
                    {latentLinks.length} Connections Established
                </div>
            )}
         </div>

      </div>

    </div>
  );
};

export default LobbyGalaxy;