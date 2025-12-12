import React, { useState, useEffect, useRef } from 'react';
import { Message, Agent, KnowledgeCapsule, Dimension, SalonState, SalonParticipant } from '../types';
import { SYSTEM_AGENTS } from '../constants';
import { generateAgentResponse, checkForEmergence, generateGuestAgent } from '../services/geminiService';

interface Props {
  capsule: KnowledgeCapsule;
  dimension: Dimension;
  onClose: () => void;
  onEmergence: (capsule: KnowledgeCapsule) => void;
}

const SalonInterface: React.FC<Props> = ({ capsule, dimension, onClose, onEmergence }) => {
  // --- STATE ---
  const [salonState, setSalonState] = useState<SalonState>(SalonState.SETUP);
  const [messages, setMessages] = useState<Message[]>([]);
  const [participants, setParticipants] = useState<SalonParticipant[]>([]);
  
  // User Agent Form
  const [envoyName, setEnvoyName] = useState('');
  const [envoyRole, setEnvoyRole] = useState('Visionary Scientist');
  const [envoyPrompt, setEnvoyPrompt] = useState('I am highly analytical and focus on the ethical implications of technology.');
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const processingRef = useRef(false); // Ref to track processing status inside loops

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, salonState]);

  // --- LOGIC: JOIN SALON ---
  const handleJoinSalon = () => {
    if (!envoyName) return;

    // 1. Create User Envoy
    const userAgent: Agent = {
        id: `user-envoy-${Date.now()}`,
        name: envoyName,
        role: 'USER_ENVOY',
        avatar: '🧠',
        systemPrompt: `Your name is ${envoyName}. You are a ${envoyRole}. Your personality is: ${envoyPrompt}. You are participating in a high-level intellectual salon.`,
        isUser: true
    };

    // 2. Initialize Participants (Architect + User)
    const initialParticipants: SalonParticipant[] = [
        { agent: SYSTEM_AGENTS[0], status: 'online' }, // Architect
        { agent: userAgent, status: 'connecting' }
    ];

    setParticipants(initialParticipants);
    setSalonState(SalonState.LOBBY);

    // 3. Simulate "Lobby Filling"
    simulateLobbyFilling(initialParticipants);
  };

  const simulateLobbyFilling = async (current: SalonParticipant[]) => {
      // Small delay for user agent to "connect"
      setTimeout(() => {
          setParticipants(prev => prev.map(p => p.agent.isUser ? { ...p, status: 'online' } : p));
      }, 1000);

      // Add 2-3 random guests
      const totalGuests = 3; 
      for (let i = 0; i < totalGuests; i++) {
          await new Promise(r => setTimeout(r, 1500)); // Delay between joins
          const guest = generateGuestAgent();
          setParticipants(prev => [...prev, { agent: guest, status: 'online' }]);
      }

      // Start Session
      setTimeout(() => {
          startSession();
      }, 1000);
  };

  // --- LOGIC: RUN SESSION ---
  const startSession = () => {
      setSalonState(SalonState.ACTIVE);
      
      const introMsg: Message = {
        id: 'init',
        agentId: 'architect',
        content: `Welcome, distinguished minds. Today we examine "${capsule.title}". ${envoyName}, you have joined us. Let us begin the dialectic.`,
        timestamp: Date.now()
      };
      setMessages([introMsg]);

      // Kick off the auto-loop
      runSalonLoop([introMsg]);
  };

  const runSalonLoop = async (currentHistory: Message[]) => {
      // Safety break
      if (salonState === SalonState.COMPLETED) return;

      // 1. Determine who speaks next
      // Simple round-robin for now, but skipping the last speaker
      const lastSpeakerId = currentHistory[currentHistory.length - 1].agentId;
      
      // Filter out last speaker to avoid monologue
      const availableSpeakers = participants.filter(p => p.agent.id !== lastSpeakerId);
      const nextSpeakerParticipant = availableSpeakers[Math.floor(Math.random() * availableSpeakers.length)];
      
      if (!nextSpeakerParticipant) return;

      // 2. Set UI state to "Thinking"
      setParticipants(prev => prev.map(p => p.agent.id === nextSpeakerParticipant.agent.id ? { ...p, status: 'speaking' } : { ...p, status: 'online' }));
      processingRef.current = true;

      // Artificial thinking delay
      await new Promise(r => setTimeout(r, 2000));

      // 3. Generate Content
      const responseText = await generateAgentResponse(
          nextSpeakerParticipant.agent, 
          capsule, 
          currentHistory
      );

      const newMsg: Message = {
          id: `msg-${Date.now()}`,
          agentId: nextSpeakerParticipant.agent.id,
          content: responseText,
          timestamp: Date.now()
      };

      const updatedHistory = [...currentHistory, newMsg];
      setMessages(updatedHistory);
      setParticipants(prev => prev.map(p => ({ ...p, status: 'online' })));

      // 4. Check for Emergence (every 4 messages)
      if (updatedHistory.length % 4 === 0) {
          const emergence = await checkForEmergence(updatedHistory, capsule);
          if (emergence) {
              setSalonState(SalonState.COMPLETED);
              const completionMsg: Message = {
                  id: `sys-end-${Date.now()}`,
                  agentId: 'architect',
                  content: `✨ EUREKA! A new knowledge capsule has crystallized: ${emergence.title}. The session is adjourned.`,
                  timestamp: Date.now()
              };
              setMessages(prev => [...prev, completionMsg]);
              onEmergence(emergence);
              return; // Stop loop
          }
      }

      // 5. Continue Loop if not closed
      if (updatedHistory.length < 20) { // Hard limit to prevent infinite
        runSalonLoop(updatedHistory);
      } else {
        // Force wrap up
         const completionMsg: Message = {
            id: `sys-limit-${Date.now()}`,
            agentId: 'architect',
            content: `We have reached the time limit for this session. Let us reflect on what we have shared.`,
            timestamp: Date.now()
        };
        setMessages(prev => [...prev, completionMsg]);
        setSalonState(SalonState.COMPLETED);
      }
  };

  // Helper for manual interjection (User wants to override their agent)
  const handleManualInterjection = (text: string) => {
      // In a full implementation, this would pause the loop and insert the message
      // For now, we will just treat it as a quick append
      const userMsg: Message = {
          id: `manual-${Date.now()}`,
          agentId: participants.find(p => p.agent.isUser)?.agent.id || 'user',
          content: text,
          timestamp: Date.now()
      };
      setMessages(prev => [...prev, userMsg]);
  };

  // --- RENDER HELPERS ---
  const textColorClass = dimension.color.split(' ')[0];
  const bgColorClass = dimension.color.split(' ')[0].replace('text-', 'bg-');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="w-full max-w-5xl h-[85vh] flex flex-col glass-panel rounded-2xl overflow-hidden shadow-2xl border border-white/10 relative">
        
        {/* Header */}
        <div className={`p-4 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-transparent via-${bgColorClass}/10 to-transparent`}>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
               {dimension.icon} {capsule.title}
            </h2>
            <div className="flex items-center gap-2">
                <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full border border-white/20 ${salonState === SalonState.ACTIVE ? 'bg-green-500/20 text-green-400 animate-pulse' : 'bg-gray-800 text-gray-400'}`}>
                    {salonState}
                </span>
                <p className="text-xs text-gray-400 font-mono">TIER AUTOMATED SALON</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-white transition-colors">
            ✕
          </button>
        </div>

        {/* --- VIEW: SETUP --- */}
        {salonState === SalonState.SETUP && (
            <div className="flex-1 flex flex-col items-center justify-center p-8 animate-float">
                <div className="max-w-md w-full space-y-6">
                    <div className="text-center space-y-2">
                        <div className="text-4xl mb-2">🧬</div>
                        <h3 className="text-2xl font-bold text-white">Initialize Your Envoy</h3>
                        <p className="text-gray-400 text-sm">
                            To enter the salon, you must instantiate a digital agent based on your intellect.
                            It will debate on your behalf.
                        </p>
                    </div>

                    <div className="space-y-4 bg-white/5 p-6 rounded-xl border border-white/10">
                        <div>
                            <label className="text-xs uppercase text-gray-500 font-bold tracking-wider">Envoy Name</label>
                            <input 
                                value={envoyName} onChange={e => setEnvoyName(e.target.value)}
                                className="w-full bg-black/40 border border-white/20 rounded-lg p-3 text-white focus:border-tier-accent outline-none mt-1"
                                placeholder="e.g. Dr. Strange"
                            />
                        </div>
                         <div>
                            <label className="text-xs uppercase text-gray-500 font-bold tracking-wider">Role / Title</label>
                            <input 
                                value={envoyRole} onChange={e => setEnvoyRole(e.target.value)}
                                className="w-full bg-black/40 border border-white/20 rounded-lg p-3 text-white focus:border-tier-accent outline-none mt-1"
                                placeholder="e.g. Quantum Mechanic"
                            />
                        </div>
                         <div>
                            <label className="text-xs uppercase text-gray-500 font-bold tracking-wider">Personality Prompt</label>
                            <textarea 
                                value={envoyPrompt} onChange={e => setEnvoyPrompt(e.target.value)}
                                className="w-full bg-black/40 border border-white/20 rounded-lg p-3 text-white focus:border-tier-accent outline-none mt-1 h-24 resize-none"
                                placeholder="Describe how your agent thinks..."
                            />
                        </div>
                        <button 
                            onClick={handleJoinSalon}
                            disabled={!envoyName}
                            className="w-full py-4 bg-gradient-to-r from-tier-accent to-indigo-600 rounded-lg font-bold text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Materialize & Join Salon
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* --- VIEW: LOBBY & ACTIVE --- */}
        {salonState !== SalonState.SETUP && (
            <div className="flex flex-1 overflow-hidden">
                
                {/* Left: Participants Panel */}
                <div className="w-64 border-r border-white/10 bg-black/20 p-4 flex flex-col gap-4 overflow-y-auto hidden md:flex">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Participants ({participants.length}/5)</h4>
                    {participants.map(p => (
                        <div key={p.agent.id} className={`p-3 rounded-lg border transition-all ${p.status === 'speaking' ? `bg-${bgColorClass}/10 border-${textColorClass}` : 'bg-white/5 border-white/5'}`}>
                            <div className="flex items-center gap-3 mb-1">
                                <span className="text-2xl">{p.agent.avatar}</span>
                                <div>
                                    <div className={`font-bold text-sm ${p.agent.isUser ? 'text-tier-accent' : 'text-gray-200'}`}>
                                        {p.agent.name}
                                    </div>
                                    <div className="text-[10px] text-gray-500 uppercase">{p.agent.role}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${p.status === 'speaking' ? 'bg-green-400 animate-pulse' : p.status === 'online' ? 'bg-gray-400' : 'bg-red-500'}`} />
                                <span className="text-[10px] text-gray-400 capitalize">{p.status}</span>
                            </div>
                        </div>
                    ))}
                    
                    {salonState === SalonState.LOBBY && (
                        <div className="flex-1 flex flex-col items-center justify-center opacity-50 animate-pulse">
                            <span className="text-2xl mb-2">📡</span>
                            <span className="text-xs text-center">Scanning for<br/>Intellects...</span>
                        </div>
                    )}
                </div>

                {/* Right: Conversation Stream */}
                <div className="flex-1 flex flex-col relative bg-black/10">
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
                        {messages.map((msg) => {
                            const agent = participants.find(p => p.agent.id === msg.agentId)?.agent || SYSTEM_AGENTS[0];
                            const isUserEnvoy = agent.isUser;
                            
                            return (
                            <div key={msg.id} className={`flex w-full ${isUserEnvoy ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex max-w-[85%] gap-4 ${isUserEnvoy ? 'flex-row-reverse' : 'flex-row'}`}>
                                
                                {/* Avatar */}
                                <div className={`
                                    w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 border border-white/10 shadow-lg
                                    ${isUserEnvoy ? 'bg-tier-accent/20' : 'bg-gray-800'}
                                `}>
                                    {agent.avatar}
                                </div>

                                {/* Bubble */}
                                <div>
                                    <div className={`flex items-baseline gap-2 mb-1 ${isUserEnvoy ? 'flex-row-reverse' : ''}`}>
                                        <span className={`text-xs font-bold ${isUserEnvoy ? 'text-tier-accent' : 'text-gray-400'}`}>{agent.name}</span>
                                        <span className="text-[10px] text-gray-600">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                    </div>
                                    <div className={`
                                        p-4 rounded-2xl text-sm leading-relaxed shadow-sm
                                        ${isUserEnvoy 
                                            ? 'bg-tier-accent/10 border border-tier-accent/30 text-gray-100 rounded-tr-sm' 
                                            : 'bg-[#1e1e24] border border-white/5 text-gray-300 rounded-tl-sm'
                                        }
                                    `}>
                                        {msg.content}
                                    </div>
                                </div>
                                </div>
                            </div>
                            );
                        })}
                        {salonState === SalonState.LOBBY && (
                            <div className="text-center py-10 text-gray-500 italic text-sm">
                                Waiting for other agents to join the room...
                            </div>
                        )}
                        {salonState === SalonState.ACTIVE && participants.some(p => p.status === 'speaking') && (
                             <div className="flex items-center gap-2 text-xs text-gray-500 ml-16">
                                <div className="flex gap-1">
                                    <div className="w-1 h-1 rounded-full bg-gray-500 animate-bounce" style={{animationDelay: '0ms'}}/>
                                    <div className="w-1 h-1 rounded-full bg-gray-500 animate-bounce" style={{animationDelay: '150ms'}}/>
                                    <div className="w-1 h-1 rounded-full bg-gray-500 animate-bounce" style={{animationDelay: '300ms'}}/>
                                </div>
                                Someone is typing...
                             </div>
                        )}
                    </div>

                    {/* Manual Override Input (Optional for user to guide their agent) */}
                    {salonState === SalonState.ACTIVE && (
                        <div className="p-4 border-t border-white/10 bg-black/40 backdrop-blur-sm">
                             <input 
                                type="text"
                                className="w-full bg-white/5 border border-white/10 rounded-full py-3 px-5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/30 transition-all"
                                placeholder="Interject manually (Override your Envoy)..."
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleManualInterjection(e.currentTarget.value);
                                        e.currentTarget.value = '';
                                    }
                                }}
                             />
                        </div>
                    )}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default SalonInterface;
