import React from 'react';
import { SalonParticipant } from '../types';

interface Props {
  participants: SalonParticipant[];
  progress: number; // 0-100 Crystallization
}

const TacticalMap: React.FC<Props> = ({ participants, progress }) => {
  // Sort: Host inner top, System agents inner, User outer bottom
  const host = participants.find(p => p.agent.role === 'HOST');
  const user = participants.find(p => p.agent.isUser);
  const others = participants.filter(p => p !== host && p !== user);

  const getStatusColor = (p: SalonParticipant) => 
    p.status === 'speaking' ? '#6366f1' : p.status === 'online' ? '#10b981' : '#64748b';

  return (
    <div className="w-full h-full relative bg-[#050510] flex items-center justify-center overflow-hidden">
      {/* Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
      
      {/* Central Crystallizer */}
      <div className="relative z-10 w-32 h-32 flex items-center justify-center">
         {/* Progress Ring */}
         <svg className="absolute inset-0 w-full h-full -rotate-90">
           <circle cx="64" cy="64" r="60" stroke="#1f2937" strokeWidth="4" fill="none" />
           <circle 
             cx="64" cy="64" r="60" 
             stroke="#6366f1" strokeWidth="4" fill="none" 
             strokeDasharray="377" 
             strokeDashoffset={377 - (377 * progress / 100)}
             className="transition-all duration-1000"
           />
         </svg>
         
         {/* Core Crystal */}
         <div className={`relative w-16 h-16 bg-white/10 backdrop-blur-md border border-white/30 transform rotate-45 transition-all duration-1000 ${progress >= 100 ? 'shadow-[0_0_50px_#6366f1] bg-white' : 'shadow-[0_0_20px_rgba(99,102,241,0.2)]'}`}>
            <div className="absolute inset-0 flex items-center justify-center -rotate-45 font-bold text-xs text-tier-accent">
               {Math.round(progress)}%
            </div>
         </div>
      </div>

      {/* Connection Beams (Lasers) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {participants.filter(p => p.status === 'speaking').map(p => {
           // This is a simplified beam visualization. In a real 3D canvas we'd calculate exact coords.
           // For now, we assume a radial layout centered at 50% 50%
           return (
             <line 
               key={`beam-${p.agent.id}`}
               x1="50%" y1="50%" x2={p.agent.isUser ? "50%" : "50%"} y2={p.agent.isUser ? "85%" : "15%"} 
               stroke="#6366f1" strokeWidth="2" strokeDasharray="5,5" 
               className="animate-pulse"
             />
           );
        })}
      </svg>

      {/* Agents Placement */}
      {/* HOST - Top Center */}
      {host && (
        <div className="absolute top-[10%] left-1/2 -translate-x-1/2 flex flex-col items-center">
           <div 
             className={`w-16 h-16 rounded-full border-2 bg-gray-900 flex items-center justify-center text-3xl transition-all duration-300 shadow-xl ${host.status === 'speaking' ? 'scale-110 border-tier-accent shadow-tier-accent/50' : 'border-gray-700'}`}
           >
             {host.agent.avatar}
           </div>
           <div className="mt-2 text-xs font-bold text-gray-400 uppercase bg-black/50 px-2 rounded">Host</div>
        </div>
      )}

      {/* USER - Bottom Center */}
      {user && (
        <div className="absolute bottom-[10%] left-1/2 -translate-x-1/2 flex flex-col items-center z-20">
           <div 
             className={`w-20 h-20 rounded-full border-2 bg-gray-900 flex items-center justify-center text-4xl transition-all duration-300 shadow-xl ${user.status === 'speaking' ? 'scale-110 border-tier-accent shadow-tier-accent/50' : 'border-blue-500'}`}
           >
             {user.agent.avatar}
           </div>
           <div className="mt-2 text-sm font-bold text-blue-400 uppercase bg-black/80 px-3 py-1 rounded border border-blue-500/30">
              Commander {user.agent.name}
           </div>
        </div>
      )}

      {/* OTHERS - Radial */}
      {others.map((p, idx) => {
         // Simple distribution: Left and Right
         const isLeft = idx % 2 === 0;
         return (
            <div 
              key={p.agent.id}
              className={`absolute top-1/2 -translate-y-1/2 flex flex-col items-center ${isLeft ? 'left-[15%]' : 'right-[15%]'}`}
            >
               <div 
                 className={`w-14 h-14 rounded-full border-2 bg-gray-900 flex items-center justify-center text-2xl transition-all duration-300 ${p.status === 'speaking' ? 'scale-110 border-green-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'border-gray-700'}`}
               >
                 {p.agent.avatar}
               </div>
               <div className="mt-2 text-[10px] font-bold text-gray-500 uppercase">{p.agent.name}</div>
            </div>
         );
      })}

    </div>
  );
};

export default TacticalMap;
