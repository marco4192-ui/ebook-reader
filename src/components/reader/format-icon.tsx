'use client';

import { BookIcon, BookOpen, FileText, FileIcon, Image as ImageIcon } from 'lucide-react';
import { type Book } from '@/lib/book-store';

export const FormatIcon = ({ format }: { format: Book['format'] }) => {
  switch (format) {
    case 'pdf': return <FileIcon className="w-4 h-4 text-red-500" />;
    case 'epub': return <BookOpen className="w-4 h-4 text-blue-500" />;
    case 'txt': return <FileText className="w-4 h-4 text-gray-500" />;
    case 'md': return <FileText className="w-4 h-4 text-purple-500" />;
    case 'mobi':
    case 'azw3': return <BookIcon className="w-4 h-4 text-orange-500" />;
    case 'fb2': return <BookOpen className="w-4 h-4 text-cyan-500" />;
    case 'djvu': return <FileIcon className="w-4 h-4 text-amber-600" />;
    case 'cbz':
    case 'cbr':
    case 'cb7':
    case 'cbt':
    case 'acv': return <ImageIcon className="w-4 h-4 text-green-500" />;
    default: return <FileIcon className="w-4 h-4" />;
  }
};
