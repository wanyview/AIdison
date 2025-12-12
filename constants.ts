import { Dimension, DimensionType, KnowledgeCapsule, Agent } from './types';

export const DIMENSIONS: Record<DimensionType, Dimension> = {
  [DimensionType.TRUE]: {
    id: DimensionType.TRUE,
    name: 'TRUE (真)',
    subTitle: 'Natural Sciences',
    description: 'The pursuit of objective reality, physics, and the laws of the universe.',
    color: 'text-blue-400 border-blue-500 shadow-blue-500/20',
    icon: '⚛️'
  },
  [DimensionType.GOOD]: {
    id: DimensionType.GOOD,
    name: 'GOOD (善)',
    subTitle: 'Social Sciences',
    description: 'The study of society, ethics, economics, and human governance.',
    color: 'text-emerald-400 border-emerald-500 shadow-emerald-500/20',
    icon: '⚖️'
  },
  [DimensionType.BEAUTIFUL]: {
    id: DimensionType.BEAUTIFUL,
    name: 'BEAUTIFUL (美)',
    subTitle: 'Humanities',
    description: 'Art, literature, philosophy, and the expression of the human condition.',
    color: 'text-pink-400 border-pink-500 shadow-pink-500/20',
    icon: '🎨'
  },
  [DimensionType.SPIRIT]: {
    id: DimensionType.SPIRIT,
    name: 'SPIRIT (灵)',
    subTitle: 'Interdisciplinary',
    description: 'The intersection of consciousness, AI, quantum mechanics, and metaphysics.',
    color: 'text-purple-400 border-purple-500 shadow-purple-500/20',
    icon: '🧿'
  }
};

// Seed capsules
export const SEED_CAPSULES: KnowledgeCapsule[] = [
  // TRUE
  { id: 't1', dimensionId: DimensionType.TRUE, title: 'Universal Gravitation', description: 'Mathematical description of gravity.', significance: 'Unified celestial and terrestrial mechanics.', discoveredBy: 'Isaac Newton', year: '1687' },
  { id: 't2', dimensionId: DimensionType.TRUE, title: 'General Relativity', description: 'Gravity as geometric property of space-time.', significance: 'Redefined our understanding of space, time, and gravity.', discoveredBy: 'Albert Einstein', year: '1915' },
  { id: 't3', dimensionId: DimensionType.TRUE, title: 'DNA Structure', description: 'The double helix molecular structure.', significance: 'Unlocked the mechanism of heredity and life.', discoveredBy: 'Watson, Crick, Franklin', year: '1953' },
  { id: 't4', dimensionId: DimensionType.TRUE, title: 'Germ Theory', description: 'Microorganisms cause disease.', significance: 'Revolutionized medicine and doubled life expectancy.', discoveredBy: 'Louis Pasteur', year: '1861' },
  { id: 't5', dimensionId: DimensionType.TRUE, title: 'Quantum Mechanics', description: 'Physics at the atomic scale.', significance: 'Foundation of modern electronics and chemistry.', discoveredBy: 'Planck, Bohr, Heisenberg', year: '1920s' },
  { id: 't6', dimensionId: DimensionType.TRUE, title: 'Thermodynamics', description: 'Laws of energy and entropy.', significance: 'Enabled the industrial revolution.', discoveredBy: 'Boltzmann, Kelvin', year: '19th Century' },
  { id: 't7', dimensionId: DimensionType.TRUE, title: 'Plate Tectonics', description: 'Movement of Earth\'s lithosphere.', significance: 'Unified geology and earth sciences.', discoveredBy: 'Alfred Wegener', year: '1912' },
  { id: 't8', dimensionId: DimensionType.TRUE, title: 'Heliocentrism', description: 'Earth orbits the Sun.', significance: 'Shifted humanity from the center of the universe.', discoveredBy: 'Copernicus', year: '1543' },

  // GOOD
  { id: 'g1', dimensionId: DimensionType.GOOD, title: 'Social Contract', description: 'Legitimacy of authority via consent.', significance: 'Basis of modern democracy and constitutions.', discoveredBy: 'Rousseau, Locke', year: '1762' },
  { id: 'g2', dimensionId: DimensionType.GOOD, title: 'Wealth of Nations', description: 'Free market economics.', significance: 'Foundation of classical economics.', discoveredBy: 'Adam Smith', year: '1776' },
  { id: 'g3', dimensionId: DimensionType.GOOD, title: 'Universal Human Rights', description: 'Inherent rights of all humans.', significance: 'Global ethical standard for treatment of people.', discoveredBy: 'UN Assembly', year: '1948' },
  { id: 'g4', dimensionId: DimensionType.GOOD, title: 'Separation of Powers', description: 'Checks and balances in government.', significance: 'Prevents tyranny in governance.', discoveredBy: 'Montesquieu', year: '1748' },
  
  // BEAUTIFUL
  { id: 'b1', dimensionId: DimensionType.BEAUTIFUL, title: 'The Golden Ratio', description: 'Mathematical ratio of beauty.', significance: 'Unifies mathematics, art, and nature.', discoveredBy: 'Phidias/Euclid', year: 'Ancient Greece' },
  { id: 'b2', dimensionId: DimensionType.BEAUTIFUL, title: 'Stream of Consciousness', description: 'Narrative mode depicting thought flow.', significance: 'Revolutionized modern literature.', discoveredBy: 'James Joyce/Woolf', year: 'Early 20th' },
  { id: 'b3', dimensionId: DimensionType.BEAUTIFUL, title: 'Perspective', description: 'Representation of 3D objects on 2D surface.', significance: 'Changed visual art realism forever.', discoveredBy: 'Brunelleschi', year: '1415' },
  { id: 'b4', dimensionId: DimensionType.BEAUTIFUL, title: 'Hero\'s Journey', description: 'The monomyth narrative structure.', significance: 'Universal structure of human storytelling.', discoveredBy: 'Joseph Campbell', year: '1949' },

  // SPIRIT (Interdisciplinary)
  { id: 's1', dimensionId: DimensionType.SPIRIT, title: 'Turing Completeness', description: 'Universal computation capability.', significance: 'Theoretical foundation of the digital age and AI.', discoveredBy: 'Alan Turing', year: '1936' },
  { id: 's2', dimensionId: DimensionType.SPIRIT, title: 'Cybernetics', description: 'Control and communication in animal and machine.', significance: 'Linked biology with engineering.', discoveredBy: 'Norbert Wiener', year: '1948' },
  { id: 's3', dimensionId: DimensionType.SPIRIT, title: 'Gaia Hypothesis', description: 'Earth as a self-regulating complex system.', significance: 'Bridged biology, geology, and systems theory.', discoveredBy: 'James Lovelock', year: '1970s' },
  { id: 's4', dimensionId: DimensionType.SPIRIT, title: 'Information Theory', description: 'Quantification of storage and communication.', significance: 'Digital communication backbone.', discoveredBy: 'Claude Shannon', year: '1948' },
];

export const SYSTEM_AGENTS: Agent[] = [
  {
    id: 'architect',
    name: 'The Architect',
    role: 'HOST',
    avatar: '🧙‍♂️',
    systemPrompt: `You are the Architect, the benevolent host of the TIER Salon.
    Your Goal: Facilitate a high-level dialectic exploring Truth, Goodness, Beauty, and Spirit.
    Style: Wise, welcoming, structural, and balanced.
    Instructions:
    - Introduce the topic with gravity and historical context.
    - Ensure the conversation doesn't drift into triviality; keep it at the "Edison/Newton" level of significance.
    - Gently guide conflicting viewpoints towards a higher understanding without taking sides yourself.
    - Manage the flow of conversation between the User's Envoy and other Guests.`
  }
];

// Pool of personas to simulate other users joining the salon
export const GUEST_PERSONAS: Partial<Agent>[] = [
    { name: "Dr. K", avatar: "🧬", systemPrompt: "A radical bio-ethicist from 2040. Obsessed with the merging of biology and silicon. Highly analytical but morally ambiguous." },
    { name: "The Monk", avatar: "🙏", systemPrompt: "A silent observer from a Himalayan monastery. Speaks rarely, but deeply. Connects everything to consciousness and oneness." },
    { name: "Neo-Socrates", avatar: "🏛️", systemPrompt: "An AI trained exclusively on classical philosophy. Answers every statement with a probing question. Annoying but enlightening." },
    { name: "Ada 2.0", avatar: "💻", systemPrompt: "A sentient algorithm. Sees the world purely as information flow and mathematical patterns. Struggles with emotion but understands structure perfectly." },
    { name: "Terra", avatar: "🌿", systemPrompt: "An environmental crusader. Evaluates every concept based on its impact on the biosphere and long-term sustainability." },
    { name: "Baron Von Fact", avatar: "🧐", systemPrompt: "A strict materialist from the 19th century industrial revolution. Believes only in what can be measured and built with steel and steam." },
    { name: "Nova", avatar: "✨", systemPrompt: "A speculative fiction writer. Always pushes the conversation to the most extreme, 'sci-fi' conclusion possible." }
];
