import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Check } from 'lucide-react';

interface CompletionButtonProps {
  creatorId: string | null;
}

function getStorageKey(creatorId: string | null, dateString: string): string {
  return `uploads_complete_${creatorId || 'all'}_${dateString}`;
}

function getTodayDateString(): string {
  return new Date().toLocaleDateString('en-CA', {
    timeZone: 'America/Los_Angeles'
  });
}

interface CompletionData {
  completedAt: string;
  confirmedBy: string;
}

export function CompletionButton({ creatorId }: CompletionButtonProps) {
  const [completionData, setCompletionData] = useState<CompletionData | null>(null);
  const todayDateString = getTodayDateString();
  const storageKey = getStorageKey(creatorId, todayDateString);

  // Check localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        setCompletionData(JSON.parse(stored));
      } catch {
        // Invalid data, clear it
        localStorage.removeItem(storageKey);
      }
    }
  }, [storageKey]);

  const handleComplete = () => {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'America/Los_Angeles'
    });
    const dateString = now.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      timeZone: 'America/Los_Angeles'
    });

    const data: CompletionData = {
      completedAt: `${timeString} on ${dateString}`,
      confirmedBy: creatorId || 'Unknown'
    };

    localStorage.setItem(storageKey, JSON.stringify(data));
    setCompletionData(data);
  };

  if (completionData) {
    return (
      <div className="mt-8 pt-6 border-t border-border">
        <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-semibold">All uploads confirmed complete!</span>
          </div>
          <div className="mt-2 text-sm text-green-600 dark:text-green-500 space-y-1">
            <p>Completed at {completionData.completedAt}</p>
            <p>Confirmed by: {completionData.confirmedBy}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 pt-6 border-t border-border">
      <div className="flex justify-center">
        <Button
          onClick={handleComplete}
          size="lg"
          className="w-full sm:w-auto sm:min-w-[280px] min-h-[44px] bg-green-600 hover:bg-green-700 text-white font-semibold py-6 text-base transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Check className="h-5 w-5 mr-2" />
          Mark All Uploads Complete
        </Button>
      </div>
    </div>
  );
}
