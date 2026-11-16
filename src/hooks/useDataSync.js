import { useEffect, useRef, useCallback } from 'react';
import api from '../api/apiClient';
import { reloadProductConfigFromBackend } from '../utils/productConfigManager';

/**
 * useDataSync: Multi-User Real-Time Data Synchronization Hook
 * 
 * Automatically synchronizes changes between Tim and Bram:
 * 1. Periodic non-intrusive heartbeat check (every 10s on active tabs)
 * 2. Instant re-sync when tab regains focus or becomes visible
 * 3. Cross-tab synchronization via BroadcastChannel
 * 4. Zero disruptive reloads — fires fine-grained entity update events
 */
export function useDataSync({ onSyncEntity = null, enabled = true } = {}) {
  const lastTimestampsRef = useRef({
    leads: 0,
    quotes: 0,
    projects: 0,
    invoices: 0,
    settings: 0,
    customers: 0,
    partners: 0,
  });

  const isCheckingRef = useRef(false);
  const broadcastChannelRef = useRef(null);

  const checkSync = useCallback(async () => {
    if (isCheckingRef.current || !enabled) return;
    if (typeof document !== 'undefined' && document.hidden) return;

    isCheckingRef.current = true;
    try {
      const res = await api.get('/sync/status');
      if (res && res.success && res.data && res.data.entities) {
        const serverEntities = res.data.entities;
        const changedEntities = [];

        for (const [entity, serverTs] of Object.entries(serverEntities)) {
          const lastTs = lastTimestampsRef.current[entity] || 0;
          if (lastTs > 0 && serverTs > lastTs) {
            changedEntities.push(entity);
          }
          lastTimestampsRef.current[entity] = serverTs;
        }

        if (changedEntities.length > 0) {
          // If product configuration / settings changed, immediately reload shared config
          if (changedEntities.includes('settings')) {
            reloadProductConfigFromBackend();
          }

          // Broadcast fine-grained events for listeners
          changedEntities.forEach((entity) => {
            window.dispatchEvent(new CustomEvent('app_sync_entity', { detail: { entity } }));
            if (onSyncEntity) {
              onSyncEntity(entity);
            }
          });

          // Also trigger general app_data_changed
          window.dispatchEvent(new Event('app_data_changed'));
        }
      }
    } catch {
      // Quiet background failure tolerance: network errors won't interrupt user typing
    } finally {
      isCheckingRef.current = false;
    }
  }, [enabled, onSyncEntity]);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    // 1. Initial check
    checkSync();

    // 2. Periodic heartbeat interval (10 seconds)
    const intervalId = setInterval(checkSync, 10000);

    // 3. Window focus and tab visibility listeners
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkSync();
      }
    };

    const handleFocus = () => {
      checkSync();
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 4. Cross-tab BroadcastChannel
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('va_data_sync_channel');
        broadcastChannelRef.current = bc;
        bc.onmessage = (event) => {
          if (event.data?.type === 'SYNC_NOW') {
            checkSync();
          }
        };
      }
    } catch {}

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.close();
      }
    };
  }, [checkSync, enabled]);

  // Helper to notify other tabs on this machine
  const notifyMutation = useCallback((entity) => {
    if (broadcastChannelRef.current) {
      try {
        broadcastChannelRef.current.postMessage({ type: 'SYNC_NOW', entity });
      } catch {}
    }
  }, []);

  return { checkSync, notifyMutation };
}

export default useDataSync;
