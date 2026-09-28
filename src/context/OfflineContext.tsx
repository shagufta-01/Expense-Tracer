import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

interface OfflineContextType {
  isOnline: boolean;
  offlineQueueCount: number;
  queueOfflineExpense: (expenseData: any) => void;
  syncOfflineQueue: () => Promise<number>;
  isSyncing: boolean;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export const OfflineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [queue, setQueue] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem('madar_offline_queue');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const queueOfflineExpense = (expenseData: any) => {
    const updated = [...queue, { ...expenseData, queuedAt: new Date().toISOString() }];
    setQueue(updated);
    localStorage.setItem('madar_offline_queue', JSON.stringify(updated));
  };

  const syncOfflineQueue = useCallback(async (): Promise<number> => {
    if (!token || queue.length === 0 || isSyncing) return 0;

    setIsSyncing(true);
    let syncedCount = 0;
    const remaining: any[] = [];

    for (const item of queue) {
      try {
        const res = await fetch('/api/expenses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(item),
        });

        if (res.ok) {
          syncedCount++;
        } else {
          remaining.push(item);
        }
      } catch (err) {
        remaining.push(item);
      }
    }

    setQueue(remaining);
    localStorage.setItem('madar_offline_queue', JSON.stringify(remaining));
    setIsSyncing(false);
    return syncedCount;
  }, [token, queue, isSyncing]);

  // When coming back online, auto-trigger sync if queue has items
  useEffect(() => {
    if (isOnline && queue.length > 0 && token) {
      syncOfflineQueue();
    }
  }, [isOnline, queue.length, token, syncOfflineQueue]);

  return (
    <OfflineContext.Provider
      value={{
        isOnline,
        offlineQueueCount: queue.length,
        queueOfflineExpense,
        syncOfflineQueue,
        isSyncing,
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
};

export const useOffline = () => {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
};
