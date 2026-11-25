'use client';

import { useState, useEffect } from 'react';

export const ParallaxBackground = ({ type, intensity }: { type: string; intensity: number }) => {
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setOffset({ x: x * intensity, y: y * intensity });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [intensity]);

  if (type === 'none') return null;

  const backgrounds: Record<string, string> = {
    stars: 'bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900',
    forest: 'bg-gradient-to-b from-green-900 via-emerald-800 to-green-900',
    ocean: 'bg-gradient-to-b from-blue-900 via-cyan-800 to-blue-900',
    mountains: 'bg-gradient-to-b from-slate-700 via-stone-600 to-slate-800',
    library: 'bg-gradient-to-b from-amber-900 via-orange-800 to-amber-900',
  };

  return (
    <div
      className={`fixed inset-0 -z-10 ${backgrounds[type]}`}
      style={{
        transform: `translate(${offset.x}px, ${offset.y}px)`,
        transition: 'transform 0.1s ease-out',
      }}
    >
      {/* Stars effect */}
      {type === 'stars' && (
        <div className="absolute inset-0">
          {Array.from({ length: 100 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                opacity: Math.random() * 0.8 + 0.2,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
