import React, { useState, useEffect, useRef } from 'react';
import { Message, Agent, KnowledgeCapsule, Dimension, SalonState, SalonParticipant } from '../types';
import { SYSTEM_AGENTS } from '../constants';
import { generateAgentResponse, checkForEmergence, generateGuestAgent } from '../services/geminiService';
import TacticalMap from './TacticalMap';

interface Props {
  capsule: KnowledgeCapsule;
  dimension: Dimension;
  userEnvoy: Agent; // Passed from Forge
  onClose: () => void;
  onEmergence: (capsule: KnowledgeCapsule) => void;
  isDemo?: boolean;
}

const SalonInterface: React.FC<Props> = ({ capsule, dimension, userEnvoy, onClose, onEmergence, isDemo = false }) => {
  const [salonState, setSalonState] = useState<SalonState>(SalonState.LOBBY);
  const [messages, setMessages] = useState<Message[]>([]);
  const [participants, setParticipants] = useState<SalonParticipant[]>([]);
  const [crystallizationProgress, setCrystallizationProgress] = useState(0);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Refs for loop state to avoid closure staleness
  const participantsRef = useRef(participants);
  const salonStateRef = useRef(salonState);

  useEffect(() => {
    participantsRef.current = participants;
  }, [participants]);

  useEffect(() => {
    salonStateRef.current = salonState;
  }, [salonState]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Init Salon
  useEffect(() => {
    initializeSalon();
  }, []);

  const initializeSalon = async () => {
     // Initial: Host + User
     const initialParticipants: SalonParticipant[] = [
        { agent: SYSTEM_AGENTS[0], status: 'online' },
        { agent: userEnvoy, status: 'connecting' }
     ];
     setParticipants(initialParticipants);
     
     // Simulate connections
     setTimeout(() => setParticipants(prev => prev.map(p => p.agent.isUser ? { ...p, status: 'online' } : p)), 1000);

     // Add guests
     const guests = [generateGuestAgent(), generateGuestAgent()];
     for (const guest of guests) {
        await new Promise(r => setTimeout(r, 800));
        setParticipants(prev => [...prev, { agent: guest, status: 'online' }]);
     }

     startSession();
  };

  const startSession = () => {
      setSalonState(SalonState.ACTIVE);
      const introMsg: Message = {
        id: 'init',
        agentId: 'architect',
        content: `Protocol initiated: "${capsule.title}". Commander ${userEnvoy.name}, your data has been mounted. Let us synthesize.`,
        timestamp: Date.now()
      };
      setMessages([introMsg]);
      runSalonLoop([introMsg]);
  };

  const runSalonLoop = async (currentHistory: Message[]) => {
      if (salonStateRef.current === SalonState.COMPLETED) return;

      const currentParticipants = participantsRef.current;
      const lastSpeakerId = currentHistory[currentHistory.length - 1].agentId;
      const availableSpeakers = currentParticipants.filter(p => p.agent.id !== lastSpeakerId);
      const nextSpeakerParticipant = availableSpeakers[Math.floor(Math.random() * availableSpeakers.length)];
      
      if (!nextSpeakerParticipant) return;

      // Speak State
      setParticipants(prev => prev.map(p => p.agent.id === nextSpeakerParticipant.agent.id ? { ...p, status: 'speaking' } : { ...p, status: 'online' }));
      
      await new Promise(r => setTimeout(r, 2000)); // Pacing

      const responseText = await generateAgentResponse(
          nextSpeakerParticipant.agent, 
          capsule, 
          currentHistory
      );

      // Random Insight Labeling
      const labels = ['#Analysis', '#Ethics', '#Synthesis', '#Data', '#Risk'];
      const randomLabel = Math.random() > 0.7 ? labels[Math.floor(Math.random() * labels.length)] : undefined;

      const newMsg: Message = {
          id: `msg-${Date.now()}`,
          agentId: nextSpeakerParticipant.agent.id,
          content: responseText,
          timestamp: Date.now(),
          insightLabel: randomLabel
      };

      const updatedHistory = [...currentHistory, newMsg];
      setMessages(updatedHistory);
      setParticipants(prev => prev.map(p => ({ ...p, status: 'online' })));

      // Crystallization Check
      if (updatedHistory.length % 3 === 0) {
          // Increase progress visibly
          const increment = 15 + Math.random() * 10;
          const newProgress = Math.min(100, crystallizationProgress + increment);
          setCrystallizationProgress(newProgress);

          if (newProgress >= 100) {
             completeSalon(updatedHistory);
             return;
          }
      }

      if (updatedHistory.length < 25) {
        runSalonLoop(updatedHistory);
      } else {
        completeSalon(updatedHistory);
      }
  };

  const completeSalon = async (history: Message[]) => {
      setSalonState(SalonState.COMPLETED);
      const em = await checkForEmergence(history, capsule);
      
      const completionMsg: Message = {
          id: `sys-end-${Date.now()}`,
          agentId: 'architect',
          content: `Crystallization Complete. Artifact generated: ${em?.title || 'Consensus Data'}.`,
          timestamp: Date.now()
      };
      setMessages(prev => [...prev, completionMsg]);
      
      if (em) onEmergence(em);
  };

  // UI
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-6 bg-black/95 backdrop-blur-xl">
       <div className="w-full h-full max-w-7xl flex flex-col md:flex-row glass-panel rounded-none md:rounded-xl overflow-hidden shadow-2xl border border-white/10">
          
          {/* LEFT: TACTICAL MAP (Top on Mobile, Left on Desktop) */}
          <div className="w-full h-[35%] md:h-full md:flex-[2] relative border-b md:border-b-0 md:border-r border-white/10 bg-black/40">
             {/* Map Header */}
             <div className="absolute top-4 left-4 z-20 pointer-events-none">
                <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                   <span className="text-xl md:text-2xl">{dimension.icon}</span> {capsule.title}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                   <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                   <span className="text-[10px] text-green-400 font-mono">LIVE SESSION // {participants.length} AGENTS</span>
                </div>
             </div>
             
             <TacticalMap participants={participants} progress={crystallizationProgress} />
             
             {/* Bottom Controls */}
             <div className="absolute bottom-4 left-4 right-4 z-20 flex justify-between items-end">
                <div className="bg-black/60 p-3 rounded-lg border border-white/10 max-w-sm hidden md:block">
                   <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Current Insight</div>
                   <div className="text-sm text-white italic">
                      "{messages[messages.length-1]?.content.substring(0, 60)}..."
                   </div>
                </div>
                <button onClick={onClose} className="ml-auto px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded text-xs uppercase font-bold backdrop-blur-md">
                   Abort Protocol
                </button>
             </div>
          </div>

          {/* RIGHT: DATA STREAM (Bottom on Mobile, Right on Desktop) */}
          <div className="w-full h-[65%] md:h-full md:flex-1 flex flex-col bg-[#0f172a]">
             <div className="p-3 border-b border-white/10 bg-black/20 flex justify-between items-center">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Live Transcript</span>
                <span className="text-xs text-tier-accent font-mono">{messages.length} PACKETS</span>
             </div>

             <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => {
                   const agent = participants.find(p => p.agent.id === msg.agentId)?.agent || SYSTEM_AGENTS[0];
                   return (
                      <div key={msg.id} className={`flex gap-3 ${agent.isUser ? 'flex-row-reverse' : ''}`}>
                         <div className={`w-8 h-8 rounded shrink-0 flex items-center justify-center text-sm border ${agent.isUser ? 'bg-tier-accent/20 border-tier-accent' : 'bg-white/5 border-white/10'}`}>
                            {agent.avatar}
                         </div>
                         <div className={`max-w-[85%]`}>
                            <div className={`flex items-center gap-2 mb-1 ${agent.isUser ? 'flex-row-reverse' : ''}`}>
                               <span className={`text-[10px] font-bold uppercase ${agent.isUser ? 'text-tier-accent' : 'text-gray-400'}`}>{agent.name}</span>
                               {msg.insightLabel && (
                                  <span className="text-[9px] bg-white/10 px-1 rounded text-gray-400">{msg.insightLabel}</span>
                               )}
                            </div>
                            <div className={`text-xs leading-relaxed p-3 rounded-lg ${agent.isUser ? 'bg-tier-accent/10 text-white border border-tier-accent/20' : 'bg-black/20 text-gray-300 border border-white/5'}`}>
                               {msg.content}
                            </div>
                         </div>
                      </div>
                   );
                })}
             </div>
             
             {/* Manual Input */}
             <div className="p-4 border-t border-white/10 bg-black/40">
                <input 
                   placeholder="Override Envoy: Input manual command..."
                   className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-tier-accent outline-none font-mono"
                   onKeyDown={(e) => {
                      if(e.key === 'Enter') {
                         // handle manual
                         e.currentTarget.value = '';
                      }
                   }}
                />
             </div>
          </div>
       </div>
    </div>
  );
};

export default SalonInterface;