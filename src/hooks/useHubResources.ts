import { useEffect, useState } from 'react';

// Hub_Resources tab from the same Google Sheet - GID: 528090500
const HUB_RESOURCES_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR71Z8tflSQ766x9J0dY1RCujrmPEKHPrH9q0uPmxF-CUq29W00jJuLc6jMpGMjoFhyKC4-KreB0J1j/pub?gid=528090500&single=true&output=csv';

export interface HubResource {
  type: string;
  title: string;
  content: string;
  link: string;
  date_posted: string;
}

function parseCSV(csvText: string): HubResource[] {
  const lines = csvText
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  if (lines.length < 2) {
    console.log('Hub Resources: No data rows found');
    return [];
  }

  // Find header row containing 'type'
  const headerRowIndex = lines.findIndex(line => 
    line.toLowerCase().includes('type') && line.toLowerCase().includes('title')
  );

  if (headerRowIndex === -1) {
    console.log('Hub Resources: Could not find header row');
    return [];
  }

  // Parse CSV line handling quoted values
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

  const rows: HubResource[] = [];
  for (let i = headerRowIndex + 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    const row: Record<string, string> = {};
    
    headers.forEach((header, index) => {
      let value = values[index] || '';
      value = value.replace(/^"|"$/g, '').replace(/[\r\n\t]+/g, '').trim();
      row[header] = value;
    });

    if (row['type'] && row['title']) {
      rows.push({
        type: row['type'] || '',
        title: row['title'] || '',
        content: row['content'] || '',
        link: row['link'] || '',
        date_posted: row['date_posted'] || '',
      });
    }
  }

  return rows;
}

export function useHubResources() {
  const [resources, setResources] = useState<HubResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchResources() {
      setLoading(true);
      setError(null);

      try {
        console.log('=== HUB RESOURCES LOADING ===');
        console.log('Fetching Hub_Resources from GID: 528090500');
        const response = await fetch(HUB_RESOURCES_CSV_URL);

        if (!response.ok) {
          throw new Error(`Failed to fetch Hub Resources: ${response.status}`);
        }

        const csvText = await response.text();
        console.log(`Hub_Resources CSV length: ${csvText.length} characters`);
        console.log('Hub_Resources CSV preview:', csvText.substring(0, 200));
        
        const allResources = parseCSV(csvText);
        
        const updateCount = allResources.filter(r => r.type.toLowerCase() === 'update').length;
        const bonusCount = allResources.filter(r => r.type.toLowerCase() === 'bonus').length;
        const resourceCount = allResources.filter(r => r.type.toLowerCase() === 'resource').length;
        
        console.log(`Parsed Hub_Resources: ${updateCount} updates, ${resourceCount} resources, ${bonusCount} bonus items`);
        console.log(`Hub Resources loaded: ${allResources.length} items found`);
        
        setResources(allResources);
      } catch (err: any) {
        console.error('Error loading Hub Resources:', err);
        setError(err.message || 'Failed to load hub resources');
      } finally {
        setLoading(false);
      }
    }

    fetchResources();
  }, []);

  // Get updates sorted by date (newest first)
  const updates = resources
    .filter(r => r.type.toLowerCase() === 'update')
    .sort((a, b) => {
      if (!a.date_posted || !b.date_posted) return 0;
      return new Date(b.date_posted).getTime() - new Date(a.date_posted).getTime();
    })
    .slice(0, 3);

  // Get bonus opportunities
  const bonusOpportunities = resources.filter(r => r.type.toLowerCase() === 'bonus');

  // Get resource items for the Resources section
  const resourceItems = resources.filter(r => r.type.toLowerCase() === 'resource');

  console.log(`Hub Resources: ${updates.length} updates, ${resourceItems.length} resources found`);

  return { resources, updates, bonusOpportunities, resourceItems, loading, error };
}
