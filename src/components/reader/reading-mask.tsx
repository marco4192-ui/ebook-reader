'use client';

export const ReadingMask = ({ enabled, lines, opacity, color }: { enabled: boolean; lines: number; opacity: number; color: string }) => {
  if (!enabled) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-30">
      {/* Top mask */}
      <div
        className="absolute top-0 left-0 right-0"
        style={{
          height: '40%',
          background: `linear-gradient(to bottom, ${color}${Math.round(opacity * 2.55).toString(16).padStart(2, '0')}, transparent)`,
        }}
      />
      {/* Bottom mask */}
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{
          height: '40%',
          background: `linear-gradient(to top, ${color}${Math.round(opacity * 2.55).toString(16).padStart(2, '0')}, transparent)`,
        }}
      />
    </div>
  );
};
