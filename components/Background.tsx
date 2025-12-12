import React from 'react';

const Background: React.FC = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-tier-bg">
      {/* Deep Space Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1e1b4b] via-[#050510] to-[#000000] opacity-80" />
      
      {/* Animated Orbs/Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-tier-true opacity-[0.08] blur-[100px] animate-pulse-slow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[35vw] h-[35vw] rounded-full bg-tier-spirit opacity-[0.08] blur-[100px] animate-pulse-slow delay-1000" />
      
      {/* Stars (Simulated with simple divs to avoid heavy canvas for this snippet, though canvas is better for perf) */}
      <div className="absolute inset-0 opacity-30">
        {[...Array(20)].map((_, i) => (
            <div
                key={i}
                className="absolute rounded-full bg-white animate-float"
                style={{
                    width: Math.random() * 3 + 'px',
                    height: Math.random() * 3 + 'px',
                    top: Math.random() * 100 + '%',
                    left: Math.random() * 100 + '%',
                    animationDuration: (Math.random() * 10 + 5) + 's',
                    animationDelay: (Math.random() * 5) + 's',
                }}
            />
        ))}
      </div>
      
      {/* Grid Overlay for "High Tech" feel */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />
    </div>
  );
};

export default Background;
