import { useState, useCallback } from 'react';
import { VATask } from '@/types/va-task';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Copy, Check, Download, StickyNote } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface VATaskCardProps {
  task: VATask;
  index: number;
  videoNumber: number;
  isPosted: boolean;
  onTogglePosted: (index: number) => void;
  showCheckbox?: boolean;
}

function getStatusColor(status: string): string {
  switch (status.toLowerCase().trim()) {
    case 'posted':
      return 'bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30';
    case 'ready to post':
    case 'ready_to_post':
      return 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/30';
    case 'review_needed':
    case 'review needed':
      return 'bg-destructive/15 text-destructive border-destructive/30';
    case 'pending':
    default:
      return 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/30';
  }
}

function formatPostingDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr + 'T12:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function VATaskCard({ task, index, videoNumber, isPosted, onTogglePosted, showCheckbox = true }: VATaskCardProps) {
  const [copied, setCopied] = useState(false);

  const productName = task['product_name'] || 'Untitled Product';
  const creatorName = task['creator_name'] || '';
  const captionText = task['caption_text'] || '';
  const productLink = task['product_link'] || '';
  const videoFileLink = task['video_file_link'] || '';
  const postingDate = task['posting_date'] || '';
  const postingOrder = task['posting_order'] || '';
  const notes = task['notes'] || '';
  const hasNotes = notes.trim().length > 0;


  const vaStatus = isPosted ? 'Posted' : (task['va_status'] || task['VA_status'] || 'pending');

  const todayPST = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' });
  const isPostingToday = false; // Always show posting date

  const handleCopyCaption = useCallback(async () => {
    if (!captionText) return;
    try {
      await navigator.clipboard.writeText(captionText);
      setCopied(true);
      toast({ title: '✓ Caption copied!' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = captionText;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        setCopied(true);
        toast({ title: '✓ Caption copied!' });
        setTimeout(() => setCopied(false), 2000);
      } catch {
        toast({ title: 'Failed to copy', variant: 'destructive' });
      }
    }
  }, [captionText]);

  return (
    <Card
      className={cn(
        'transition-all duration-200',
        isPosted && 'opacity-60 bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
      )}
    >
      <div className="flex items-start gap-3 p-3">
        {/* Checkbox */}
        {showCheckbox && (
          <Checkbox
            checked={isPosted}
            onCheckedChange={() => onTogglePosted(index)}
            className="mt-1 h-5 w-5 rounded border-2 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
            aria-label={`Mark Video #${videoNumber} as posted`}
          />
        )}

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Title row */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-base text-foreground">Video #{videoNumber}</span>
            <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0', getStatusColor(vaStatus))}>
              {vaStatus}
            </Badge>
            {!isPostingToday && (
              <span className="text-[10px] text-primary font-medium">
                Post on: {formatPostingDate(postingDate)}
              </span>
            )}
          </div>

          {/* Product & Creator */}
          <div className="space-y-0.5">
            {productLink ? (
              <a
                href={productLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-primary hover:underline"
              >
                {productName}
              </a>
            ) : (
              <p className="text-sm font-medium text-foreground">{productName}</p>
            )}
            {creatorName && <p className="text-[11px] text-muted-foreground">Creator: {creatorName}</p>}
          </div>

          {/* Caption with inline copy */}
          {captionText && (
            <div className="flex items-start gap-2 border border-border rounded bg-muted/30 p-2">
              <p className="text-xs whitespace-pre-wrap text-foreground flex-1 max-h-[80px] overflow-y-auto">{captionText}</p>
              <button
                onClick={handleCopyCaption}
                className="shrink-0 p-1 rounded hover:bg-muted transition-colors"
                aria-label="Copy caption"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-green-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </button>
            </div>
          )}

          {/* Notes */}
          {hasNotes && (
            <div className="flex items-start gap-2 border border-amber-200 dark:border-amber-800/50 rounded bg-amber-50 dark:bg-amber-950/30 p-2">
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className="flex items-start gap-2 text-left w-full hover:opacity-80 cursor-pointer transition-opacity focus:outline-none"
                    aria-label="View note"
                  >
                    <StickyNote className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                    <span className="text-xs text-amber-800 dark:text-amber-300 font-medium">📝 Note attached — tap to read</span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-72 max-h-48 overflow-y-auto" side="top" align="start">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm border-b pb-2">📝 Note</h4>
                    <p className="text-sm whitespace-pre-wrap text-muted-foreground">{notes}</p>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          )}

          {/* Video download */}
          {videoFileLink && (
            <a
              href={videoFileLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <Download className="h-3 w-3" />
              Download Video
            </a>
          )}
        </div>
      </div>
    </Card>
  );
}
