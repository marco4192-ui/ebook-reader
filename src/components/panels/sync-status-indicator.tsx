'use client';

import { Cloud, CloudOff } from 'lucide-react';
import { useBookStore } from '@/lib/book-store';

export const SyncStatusIndicator = ({ onClick }: { onClick: () => void }) => {
  const { cloudSyncStatus, autoSyncEnabled } = useBookStore();

  return (
    <button 
      onClick={onClick}
      className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-muted transition-colors"
    >
      {cloudSyncStatus.connected ? (
        <>
          <Cloud className="w-5 h-5 text-green-500" />
          {autoSyncEnabled && (
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
          )}
        </>
      ) : (
        <CloudOff className="w-5 h-5 text-muted-foreground" />
      )}
    </button>
  );
};
