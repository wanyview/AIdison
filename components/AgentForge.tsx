import React, { useState } from 'react';
import { Agent, AgentStats } from '../types';

interface Props {
  onComplete: (agent: Agent) => void;
}

const AgentForge: React.FC<Props> = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [stats, setStats] = useState<AgentStats>({ riskTolerance: 0.5, creativityBias: 0.5 });
  const [knowledge, setKnowledge] = useState('');
  const [objective, setObjective] = useState('');

  const handleMint = () => {
    if (!name || !role) return;

    const newAgent: Agent = {
      id: `envoy-${Date.now()}`,
      name,
      role: 'USER_ENVOY',
      avatar: '🧑‍🚀', // Could be dynamic based on stats
      systemPrompt: `You are ${name}, a ${role}. 
      Stats: [Risk: ${stats.riskTolerance}, Creativity: ${stats.creativityBias}]. 
      Objective: ${objective}.
      Knowledge Base: ${knowledge}`,
      isUser: true,
      stats,
      knowledgeBase: knowledge,
      objective
    };

    onComplete(newAgent);
  };

  // Dynamic visual feedback based on stats
  const coreColor = `rgba(${255 * stats.riskTolerance}, ${100}, ${255 * stats.creativityBias}, 0.8)`;
  const coreSize = 100 + (stats.riskTolerance * 50);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-float">
      <div className="glass-panel p-8 rounded-2xl max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 relative overflow-hidden">
        
        {/* Holographic Preview */}
        <div className="flex flex-col items-center justify-center relative">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-transparent pointer-events-none" />
          <h2 className="text-sm font-bold uppercase tracking-widest text-tier-accent mb-8">Agent Hologram</h2>
          
          <div className="relative w-64 h-64 flex items-center justify-center">
             {/* The "Core" that changes based on stats */}
             <div 
               className="rounded-full blur-xl transition-all duration-700 absolute"
               style={{ 
                 backgroundColor: coreColor,
                 width: `${coreSize}px`,
                 height: `${coreSize}px`,
               }} 
             />
             <div className="z-10 text-6xl animate-pulse-slow">🧑‍🚀</div>
             
             {/* Data Rings */}
             <div className="absolute inset-0 border border-white/20 rounded-full animate-spin-slow" />
             <div className="absolute inset-4 border border-dashed border-white/10 rounded-full animate-spin-slow" style={{ animationDirection: 'reverse' }} />
          </div>

          <div className="mt-8 text-center space-y-1">
             <div className="text-2xl font-bold text-white">{name || 'UNNAMED_UNIT'}</div>
             <div className="text-sm text-gray-400">{role || 'NO_ROLE_ASSIGNED'}</div>
          </div>
        </div>

        {/* Configuration Panel */}
        <div className="space-y-6 z-10">
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white">The Agent Forge</h3>
            <p className="text-xs text-gray-400">Configure your digital envoy parameters.</p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input 
                placeholder="Agent Name" 
                className="bg-black/40 border border-white/20 rounded-lg p-3 text-white focus:border-tier-accent outline-none"
                value={name} onChange={e => setName(e.target.value)}
              />
              <input 
                placeholder="Role (e.g. Bio-Architect)" 
                className="bg-black/40 border border-white/20 rounded-lg p-3 text-white focus:border-tier-accent outline-none"
                value={role} onChange={e => setRole(e.target.value)}
              />
            </div>

            <div className="space-y-3 pt-2">
               <div className="flex justify-between text-xs uppercase font-bold text-gray-500">
                  <span>Conservative</span>
                  <span>Risk Tolerance</span>
                  <span>Radical</span>
               </div>
               <input 
                 type="range" min="0" max="1" step="0.1" 
                 value={stats.riskTolerance}
                 onChange={e => setStats({...stats, riskTolerance: parseFloat(e.target.value)})}
                 className="w-full accent-tier-accent h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
               />
               
               <div className="flex justify-between text-xs uppercase font-bold text-gray-500 mt-4">
                  <span>Analytical</span>
                  <span>Creativity Bias</span>
                  <span>Abstract</span>
               </div>
               <input 
                 type="range" min="0" max="1" step="0.1" 
                 value={stats.creativityBias}
                 onChange={e => setStats({...stats, creativityBias: parseFloat(e.target.value)})}
                 className="w-full accent-pink-500 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
               />
            </div>

            <div>
              <label className="text-xs uppercase text-gray-500 font-bold mb-1 block">Knowledge Mount (RAG Sim)</label>
              <textarea 
                placeholder="Paste abstract, private notes, or raw data here..." 
                className="w-full bg-black/40 border border-white/20 rounded-lg p-3 text-xs text-white focus:border-tier-accent outline-none h-20 resize-none font-mono"
                value={knowledge} onChange={e => setKnowledge(e.target.value)}
              />
            </div>
          </div>

          <button 
            onClick={handleMint}
            disabled={!name || !role}
            className="w-full py-4 bg-gradient-to-r from-tier-accent to-purple-600 rounded-xl font-bold text-white shadow-lg hover:shadow-tier-accent/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
          >
            <span>MINT ENVOY & ENTER LOBBY</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgentForge;
