'use client';

export const NightModeOverlay = ({ enabled, intensity }: { enabled: boolean; intensity: number }) => {
  if (!enabled) return null;

  return (
    <div
      className="fixed inset-0 z-[200] pointer-events-none"
      style={{
        background: `rgba(255, 0, 0, ${intensity / 200})`,
        mixBlendMode: 'multiply',
      }}
    />
  );
};
