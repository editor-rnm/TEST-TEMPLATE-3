import { useState, useCallback, useEffect } from 'react';
import { HubResource } from './useHubResources';

function generateUpdateKey(creatorId: string | null, update: HubResource): string {
  const safeCreator = creatorId || 'anonymous';
  const safeTitle = update.title.replace(/\s+/g, '_').slice(0, 30);
  const safeDate = update.date_posted || 'nodate';
  return `update_read_${safeCreator}_${safeTitle}_${safeDate}`;
}

export function useUpdateReadStatus(creatorId: string | null, updates: HubResource[]) {
  const [readStatus, setReadStatus] = useState<Record<string, boolean>>({});

  // Load saved states on initialization
  useEffect(() => {
    const loadedStatus: Record<string, boolean> = {};
    
    updates.forEach((update) => {
      const key = generateUpdateKey(creatorId, update);
      try {
        const saved = localStorage.getItem(key);
        if (saved === 'true') {
          loadedStatus[key] = true;
        }
      } catch (err) {
        console.warn('Failed to read localStorage:', err);
      }
    });
    
    setReadStatus(loadedStatus);
  }, [creatorId, updates]);

  const isRead = useCallback((update: HubResource): boolean => {
    const key = generateUpdateKey(creatorId, update);
    return readStatus[key] === true;
  }, [creatorId, readStatus]);

  const markAsRead = useCallback((update: HubResource) => {
    const key = generateUpdateKey(creatorId, update);
    
    setReadStatus(prev => ({
      ...prev,
      [key]: true
    }));

    try {
      localStorage.setItem(key, 'true');
    } catch (err) {
      console.warn('Failed to save to localStorage:', err);
    }
  }, [creatorId]);

  return { isRead, markAsRead };
}
