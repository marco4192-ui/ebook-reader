import { type Book } from '@/lib/book-store';

export const detectFormat = (filename: string): Book['format'] => {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'epub': return 'epub';
    case 'pdf': return 'pdf';
    case 'txt': return 'txt';
    case 'md': return 'md';
    case 'mobi': return 'mobi';
    case 'azw':
    case 'azw3': return 'azw3';
    case 'fb2': return 'fb2';
    case 'djvu':
    case 'djv': return 'djvu';
    case 'cbz': return 'cbz';
    case 'cbr': return 'cbr';
    case 'cb7': return 'cb7';
    case 'cbt': return 'cbt';
    case 'acv': return 'acv';
    default: return 'txt';
  }
};

export const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

export const formatTime = (seconds: number) => {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${mins}m`;
};

export const formatReadingTime = (minutes: number) => {
  if (minutes < 1) return '< 1 Min';
  if (minutes < 60) return `~${minutes} Min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `~${hours}h ${mins}m` : `~${hours}h`;
};
