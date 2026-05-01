import { useEffect, useState, useMemo, useCallback } from 'react';
import { VATask } from '@/types/va-task';

const VA_TASKS_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR71Z8tflSQ766x9J0dY1RCujrmPEKHPrH9q0uPmxF-CUq29W00jJuLc6jMpGMjoFhyKC4-KreB0J1j/pub?gid=711470626&single=true&output=csv';

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '\"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function splitCsvIntoRows(csvText: string): string[] {
  const rows: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    if (char === '"') {
      inQuotes = !inQuotes;
      current += char;
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && csvText[i + 1] === '\n') i++; // skip \r\n
      const trimmed = current.trim();
      if (trimmed.length > 0) rows.push(trimmed);
      current = '';
    } else {
      current += char;
    }
  }
  const trimmed = current.trim();
  if (trimmed.length > 0) rows.push(trimmed);
  return rows;
}

function parseVACSV(csvText: string): VATask[] {
  const lines = splitCsvIntoRows(csvText);

  if (lines.length < 2) {
    console.warn('VA CSV has insufficient lines');
    return [];
  }

  // Find header row containing 'va_id'
  const headerRowIndex = lines.findIndex(line =>
    line.toLowerCase().includes('va_id')
  );

  if (headerRowIndex === -1) {
    console.warn('Could not find VA_Tasks header row containing \"va_id\"');
    return [];
  }

  const headers = parseCsvLine(lines[headerRowIndex])
    .map(h => h.toLowerCase().replace(/['"]+/g, '').trim());

  console.log('VA Tasks headers:', headers);

  const rows: VATask[] = [];
  for (let i = headerRowIndex + 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.replace(/,/g, '').trim().length === 0) continue;

    const values = parseCsvLine(line);
    const row: VATask = {} as VATask;

    headers.forEach((header, index) => {
      let value = values[index] || '';
      value = value.replace(/^"|"$/g, '').replace(/[\r\n\t]+/g, '').trim();
      row[header] = value;
    });



    if (row['date_pst'] && row['va_id']) {
      rows.push(row);
    }
  }

  return rows;
}

export function getTodayPST(): string {
  return new Date().toLocaleDateString('en-CA', {
    timeZone: 'America/Los_Angeles'
  });
}

export function getYesterdayPST(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toLocaleDateString('en-CA', {
    timeZone: 'America/Los_Angeles'
  });
}

export function getTomorrowPST(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toLocaleDateString('en-CA', {
    timeZone: 'America/Los_Angeles'
  });
}

export function useVATasks(vaId: string | null) {
  const [allRows, setAllRows] = useState<VATask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refetch = useCallback(() => setRefreshKey(prev => prev + 1), []);

  useEffect(() => {
    async function fetchTasks() {
      if (!vaId) {
        setAllRows([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.log('=== VA TASKS LOADING ===');
        console.log('VA ID:', vaId);

        const url = `${VA_TASKS_CSV_URL}&cachebust=${Date.now()}`;
        console.log('VA_Tasks CSV URL:', url);

        const response = await fetch(url, { cache: 'no-store' });
        if (!response.ok) {
          console.warn('VA_Tasks fetch failed with status:', response.status);
          setAllRows([]);
          setLoading(false);
          return;
        }

        const csvText = await response.text();
        if (!csvText.toLowerCase().includes('va_id')) {
          console.warn('VA_Tasks tab does not contain expected headers.');
          setAllRows([]);
          setLoading(false);
          return;
        }

        const parsed = parseVACSV(csvText);
        console.log(`VA_Tasks data fetched: ${parsed.length} rows`);
        const normalizedVaId = vaId.trim().toLowerCase();

        const filtered = parsed.filter(row => {
          const rowVaId = String(row['va_id'] || '').trim().toLowerCase();
          return rowVaId === normalizedVaId;
        });

        // Sort by posting_order
        filtered.sort((a, b) => {
          const orderA = parseInt(a['posting_order'] || '999', 10);
          const orderB = parseInt(b['posting_order'] || '999', 10);
          return orderA - orderB;
        });

        console.log(`Filtered for va_id=${normalizedVaId}: ${filtered.length} total rows`);
        setAllRows(filtered);
      } catch (err: any) {
        console.error('Error loading VA tasks:', err);
        setError(err.message || 'Failed to load VA tasks');
      } finally {
        setLoading(false);
      }
    }

    fetchTasks();
  }, [vaId, refreshKey]);

  const todayPST = getTodayPST();
  const yesterdayPST = getYesterdayPST();
  const tomorrowPST = getTomorrowPST();

  const todayTasks = useMemo(() =>
    allRows.filter(row => String(row['date_pst'] || '').trim() === todayPST),
    [allRows, todayPST]
  );

  const yesterdayTasks = useMemo(() =>
    allRows.filter(row => String(row['date_pst'] || '').trim() === yesterdayPST),
    [allRows, yesterdayPST]
  );

  const tomorrowTasks = useMemo(() =>
    allRows.filter(row => String(row['date_pst'] || '').trim() === tomorrowPST),
    [allRows, tomorrowPST]
  );

  return { todayTasks, yesterdayTasks, tomorrowTasks, loading, error, refetch };
}

export function useVAPostingProgress(vaId: string | null, totalTasks: number, dateKey?: string) {
  const [postedSet, setPostedSet] = useState<Set<string>>(new Set());
  const targetDate = dateKey || getTodayPST();

  // Clean old entries on mount (keep last 7 days)
  useEffect(() => {
    try {
      const keys = Object.keys(localStorage);
      const vaKeys = keys.filter(k => k.startsWith('va_posted_'));
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const cutoff = sevenDaysAgo.toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' });
      
      vaKeys.forEach(key => {
        const parts = key.split('_');
        const datepart = parts[3] || '';
        if (datepart < cutoff) {
          localStorage.removeItem(key);
        }
      });
    } catch (e) {
      console.warn('localStorage cleanup error:', e);
    }
  }, []);

  // Load state
  useEffect(() => {
    const posted = new Set<string>();
    for (let i = 0; i < totalTasks; i++) {
      const key = `va_posted_${vaId}_${targetDate}_${i}`;
      try {
        if (localStorage.getItem(key) === 'true') {
          posted.add(String(i));
        }
      } catch (e) { /* ignore */ }
    }
    setPostedSet(posted);
  }, [vaId, targetDate, totalTasks]);

  const isPosted = useCallback((index: number): boolean => {
    return postedSet.has(String(index));
  }, [postedSet]);

  const togglePosted = useCallback((index: number) => {
    const key = `va_posted_${vaId}_${targetDate}_${index}`;
    const indexStr = String(index);

    setPostedSet(prev => {
      const newSet = new Set(prev);
      if (newSet.has(indexStr)) {
        newSet.delete(indexStr);
        try { localStorage.removeItem(key); } catch {}
      } else {
        newSet.add(indexStr);
        try { localStorage.setItem(key, 'true'); } catch {}
      }
      return newSet;
    });
  }, [vaId, targetDate]);

  const postedCount = postedSet.size;
  const allPosted = totalTasks > 0 && postedCount === totalTasks;

  return { isPosted, togglePosted, postedCount, allPosted };
}
