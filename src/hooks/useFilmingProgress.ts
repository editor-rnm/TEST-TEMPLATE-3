import { useState, useCallback, useEffect } from 'react';

function getStorageKey(creatorId: string | null, todayDateString: string, assignmentId: string): string {
  return `assignment_filmed_${creatorId || 'unknown'}_${todayDateString}_${assignmentId}`;
}

function getTodayDateString(): string {
  return new Date().toLocaleDateString('en-CA', {
    timeZone: 'America/Los_Angeles'
  });
}

export function useFilmingProgress(creatorId: string | null, totalAssignments: number) {
  const [filmedSet, setFilmedSet] = useState<Set<string>>(new Set());
  const todayDateString = getTodayDateString();

  // Load initial state from localStorage
  useEffect(() => {
    const filmed = new Set<string>();
    for (let i = 0; i < totalAssignments; i++) {
      const key = getStorageKey(creatorId, todayDateString, String(i));
      try {
        if (localStorage.getItem(key) === 'true') {
          filmed.add(String(i));
        }
      } catch (e) {
        console.warn('localStorage read error:', e);
      }
    }
    setFilmedSet(filmed);
    console.log('Filming progress loaded:', filmed.size, 'of', totalAssignments);
  }, [creatorId, todayDateString, totalAssignments]);

  const isFilmed = useCallback((index: number): boolean => {
    return filmedSet.has(String(index));
  }, [filmedSet]);

  const toggleFilmed = useCallback((index: number) => {
    const key = getStorageKey(creatorId, todayDateString, String(index));
    const indexStr = String(index);
    
    setFilmedSet(prev => {
      const newSet = new Set(prev);
      if (newSet.has(indexStr)) {
        newSet.delete(indexStr);
        try {
          localStorage.removeItem(key);
        } catch (e) {
          console.warn('localStorage remove error:', e);
        }
      } else {
        newSet.add(indexStr);
        try {
          localStorage.setItem(key, 'true');
        } catch (e) {
          console.warn('localStorage write error:', e);
        }
      }
      console.log('Filming progress updated:', newSet.size, 'of', totalAssignments);
      return newSet;
    });
  }, [creatorId, todayDateString, totalAssignments]);

  const filmedCount = filmedSet.size;
  const allFilmed = totalAssignments > 0 && filmedCount === totalAssignments;

  return {
    isFilmed,
    toggleFilmed,
    filmedCount,
    allFilmed,
    totalAssignments
  };
}
