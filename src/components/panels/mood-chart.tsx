'use client';

export const MoodChart = ({ emotionCurve }: { emotionCurve: { position: number; emotion: string; intensity: number }[] }) => {
  const emotionColors: Record<string, string> = {
    'Freude': 'fill-yellow-400 text-yellow-400',
    'Trauer': 'fill-blue-400 text-blue-400',
    'Angst': 'fill-purple-400 text-purple-400',
    'Wut': 'fill-red-400 text-red-400',
    'Überraschung': 'fill-pink-400 text-pink-400',
    'Neutral': 'fill-gray-400 text-gray-400',
    'Hoffnung': 'fill-green-400 text-green-400',
    'Spannung': 'fill-orange-400 text-orange-400',
  };

  return (
    <div className="h-40 flex items-end gap-1">
      {emotionCurve.map((point, i) => (
        <div key={i} className="flex-1 flex flex-col items-center group relative">
          <div
            className={`w-full rounded-t transition-all ${emotionColors[point.emotion]?.split(' ')[0] || 'fill-gray-400'} opacity-80 group-hover:opacity-100`}
            style={{ height: `${Math.max(point.intensity, 5)}%` }}
          />
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-popover px-2 py-1 rounded text-xs whitespace-nowrap z-10">
            {point.emotion}: {point.intensity}%
          </div>
        </div>
      ))}
    </div>
  );
};
