import { useEffect, useState, useMemo } from 'react';
import { Assignment } from '@/types/assignment';

const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR71Z8tflSQ766x9J0dY1RCujrmPEKHPrH9q0uPmxF-CUq29W00jJuLc6jMpGMjoFhyKC4-KreB0J1j/pub?gid=1020515194&single=true&output=csv';

function parseCSV(csvText: string): Assignment[] {
  const lines = csvText
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  if (lines.length < 4) {
    return [];
  }

  const headerRowIndex = lines.findIndex(line => 
    line.toLowerCase().includes('date_pst')
  );

  if (headerRowIndex === -1) {
    return [];
  }

  function parseCsvLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
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

  const headers = parseCsvLine(lines[headerRowIndex])
    .map(h => h.toLowerCase().replace(/['"]+/g, '').trim());

  const rows: Assignment[] = [];
  for (let i = headerRowIndex + 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.replace(/,/g, '').trim().length === 0) continue;

    const values = parseCsvLine(line);
    const row: Assignment = {};
    
    headers.forEach((header, index) => {
      let value = values[index] || '';
      value = value.replace(/^"|"$/g, '').replace(/[\r\n\t]+/g, '').trim();
      row[header] = value;
    });
    
    if (row['date_pst'] && row['creator_id']) {
      rows.push(row);
    }
  }
  
  return rows;
}

export interface UpcomingDay {
  label: string;
  date: string;
  count: number;
  scheduled: boolean;
}

export function useUpcomingAssignments(creatorId: string | null) {
  const [allAssignments, setAllAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAllAssignments() {
      setLoading(true);
      try {
        const response = await fetch(CSV_URL);
        if (!response.ok) throw new Error('Failed to fetch');
        
        const csvText = await response.text();
        const parsed = parseCSV(csvText);
        setAllAssignments(parsed);
      } catch (err) {
        console.error('Error fetching upcoming assignments:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchAllAssignments();
  }, []);

  const upcomingDays = useMemo((): UpcomingDay[] => {
    const normalizedCreatorId = (creatorId || '').trim().toLowerCase();
    
    // Get dates for tomorrow, day+2, day+3 in PST
    const getDateString = (daysFromNow: number): string => {
      const date = new Date();
      date.setDate(date.getDate() + daysFromNow);
      return date.toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' });
    };

    const tomorrow = getDateString(1);
    const dayPlus2 = getDateString(2);
    const dayPlus3 = getDateString(3);

    console.log('Upcoming dates:', { tomorrow, dayPlus2, dayPlus3 });

    // Filter assignments by creator
    const creatorAssignments = allAssignments.filter(a => {
      const rowCreatorId = String(a['creator_id'] || '').trim().toLowerCase();
      return normalizedCreatorId === '' || rowCreatorId === normalizedCreatorId;
    });

    // Count assignments for each day
    const countForDate = (targetDate: string): number => {
      return creatorAssignments.filter(a => {
        const rowDate = String(a['date_pst'] || '').trim();
        return rowDate === targetDate;
      }).length;
    };

    const tomorrowCount = countForDate(tomorrow);
    const day2Count = countForDate(dayPlus2);
    const day3Count = countForDate(dayPlus3);

    console.log('Upcoming counts:', { tomorrowCount, day2Count, day3Count });

    return [
      { label: 'Tomorrow', date: tomorrow, count: tomorrowCount, scheduled: tomorrowCount > 0 },
      { label: 'In 2 days', date: dayPlus2, count: day2Count, scheduled: day2Count > 0 },
      { label: 'In 3 days', date: dayPlus3, count: day3Count, scheduled: day3Count > 0 },
    ];
  }, [allAssignments, creatorId]);

  return { upcomingDays, loading };
}
