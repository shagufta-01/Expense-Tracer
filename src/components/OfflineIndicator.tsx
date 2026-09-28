import React from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { useOffline } from '../context/OfflineContext';
import { useLanguage } from '../context/LanguageContext';

export const OfflineIndicator: React.FC = () => {
  const { isOnline, offlineQueueCount, syncOfflineQueue, isSyncing } = useOffline();
  const { t } = useLanguage();

  if (isOnline && offlineQueueCount === 0) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-4 left-4 z-40 flex items-center gap-3 rounded-xl bg-slate-900/95 text-white px-4 py-2.5 shadow-xl border border-slate-700 backdrop-blur-md text-xs font-medium animate-in fade-in slide-in-from-bottom-2">
      {!isOnline && (
        <div className="flex items-center gap-1.5 text-amber-400">
          <WifiOff className="w-4 h-4 animate-pulse" />
          <span>{t.offlineNotice}</span>
        </div>
      )}

      {offlineQueueCount > 0 && (
        <div className="flex items-center gap-2 pl-2 border-l border-slate-700">
          <span className="bg-amber-500 text-slate-950 font-bold px-1.5 py-0.5 rounded-full text-[10px]">
            {offlineQueueCount}
          </span>
          <span>Queued</span>
          {isOnline && (
            <button
              onClick={() => syncOfflineQueue()}
              disabled={isSyncing}
              className="flex items-center gap-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-2 py-1 rounded-lg transition"
            >
              <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? t.syncing : t.syncNow}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
