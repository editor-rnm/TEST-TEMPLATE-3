import { Assignment } from '@/types/assignment';
import { Card } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { FileText, VolumeX, Check, StickyNote, AlertTriangle, X, Copy } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Renders text with any URLs converted into clickable hyperlinks
function renderTextWithLinks(text: string) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  return parts.map((part, i) => {
    if (urlRegex.test(part)) {
      // Reset regex state since we used .test on a global regex
      urlRegex.lastIndex = 0;
      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline underline-offset-2 hover:text-primary/80 break-all"
          onClick={(e) => e.stopPropagation()}
        >
          {part}
        </a>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

interface AssignmentCardProps {
  assignment: Assignment;
  index: number;
  isFilmed: boolean;
  onToggleFilmed: (index: number) => void;
  creatorId?: string;
  creatorName?: string;
  assignmentDate?: string;
}

// Video style color mapping (case-insensitive)
function getVideoStyleColor(style: string): string {
  const normalizedStyle = style.toLowerCase().trim();
  
  switch (normalizedStyle) {
    case 'bof face':
      return 'bg-blue-500';
    case 'bof faceless':
      return 'bg-cyan-500';
    case 'mof':
      return 'bg-violet-500';
    case 'fashion account':
      return 'bg-pink-500';
    case 'crying':
      return 'bg-amber-500';
    case "i'm so mad":
    case 'im so mad':
      return 'bg-red-500';
    case 'do not box':
      return 'bg-orange-500';
    case 'fit to be mad':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
}

export function AssignmentCard({ assignment, index, isFilmed, onToggleFilmed, creatorId, creatorName, assignmentDate }: AssignmentCardProps) {
  const productName = assignment['product_name'] || 'Untitled Product';
  const videoStyle = assignment['video_style'] || '';
  const scriptName = assignment['script_name'] || '';
  const scriptContent = assignment['script_content'] || '';
  const assignmentOrder = assignment['assignment_order'] || '';
  const notes = assignment['notes'] || '';
  const productLink = assignment['product_link'] || '';
  const accountName = (assignment as any)['account_name'] || '';

  // Persist "missing product" state per assignment (so it survives reload)
  const missingKey = `missing-product-${creatorId || 'anon'}-${assignmentDate || ''}-${productName}-${assignmentOrder}`;
  const replacementKey = `${missingKey}::replacement`;
  const reportIdKey = `${missingKey}::reportId`;
  const extraKey = `extra-versions-${creatorId || 'anon'}-${assignmentDate || ''}-${productName}-${assignmentOrder}`;
  const extraCountKey = `${extraKey}::count`;
  const extraReportIdKey = `${extraKey}::reportId`;
  const [isMissing, setIsMissing] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(missingKey) === '1';
  });
  const [submitting, setSubmitting] = useState(false);
  const [reportId, setReportId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(reportIdKey);
  });
  const [replacement, setReplacement] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem(replacementKey) || '';
  });
  const [replacementDraft, setReplacementDraft] = useState<string>(replacement);
  const [savingReplacement, setSavingReplacement] = useState(false);
  const [undoing, setUndoing] = useState(false);

  // Extra versions filmed (banking)
  const [extraCount, setExtraCount] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    const v = parseInt(localStorage.getItem(extraCountKey) || '0', 10);
    return Number.isFinite(v) && v > 0 ? v : 0;
  });
  const [extraReportId, setExtraReportId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(extraReportIdKey);
  });
  const [extraDraft, setExtraDraft] = useState<string>(() =>
    extraCount > 0 ? String(extraCount) : ''
  );
  const [savingExtra, setSavingExtra] = useState(false);
  const hasExtras = extraCount > 0;
  
  // Check if script name is or contains a URL
  const scriptNameIsUrl = scriptName.trim().match(/^https?:\/\/[^\s]+$/);
  const hasScript = scriptName.trim().length > 0;
  const hasScriptContent = scriptContent.trim().length > 0;
  const hasVideoStyle = videoStyle.trim().length > 0;
  const hasOrder = assignmentOrder.trim().length > 0;
  const hasNotes = notes.trim().length > 0;
  const hasProductLink = productLink.trim().length > 0;

  const handleCheckboxChange = () => {
    onToggleFilmed(index);
  };

  const handleMissingToggle = async (checked: boolean) => {
    if (!checked || isMissing || submitting) return;
    setSubmitting(true);
    try {
      const newReportId = crypto.randomUUID();
      const { error: insertError } = await supabase
        .from('missing_product_reports')
        .insert({
          id: newReportId,
          creator_id: creatorId || null,
          creator_name: creatorName || null,
          account_name: accountName || null,
          product_name: productName,
          assignment_date: assignmentDate || null,
          video_style: videoStyle || null,
          assignment_order: assignmentOrder || null,
          notes: notes || null,
        });
      if (insertError) throw insertError;

      // Fire alert email — don't block UX on this
      supabase.functions.invoke('send-transactional-email', {
        body: {
          templateName: 'missing-product-alert',
          recipientEmail: 'annie.e.randle@gmail.com',
          idempotencyKey: `missing-${missingKey}-${Date.now()}`,
          templateData: {
            creatorName: creatorName || 'Unknown creator',
            accountName,
            productName,
            assignmentDate,
            videoStyle,
            assignmentOrder,
            notes,
            reportedAt: new Date().toISOString(),
          },
        },
      }).catch((err) => console.error('Email alert failed', err));

      localStorage.setItem(missingKey, '1');
      localStorage.setItem(reportIdKey, newReportId);
      setReportId(newReportId);
      setIsMissing(true);
      toast({
        title: 'Reported as missing',
        description: `Annie has been notified about "${productName}".`,
      });
    } catch (err) {
      console.error('Failed to report missing product', err);
      toast({
        title: 'Could not submit report',
        description: 'Please try again in a moment.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveReplacement = async () => {
    const value = replacementDraft.trim();
    if (!value || savingReplacement) return;
    setSavingReplacement(true);
    try {
      if (reportId) {
        const { error } = await supabase
          .from('missing_product_reports')
          .update({ replacement_product: value })
          .eq('id', reportId);
        if (error) throw error;
      }
      localStorage.setItem(replacementKey, value);
      setReplacement(value);
      toast({
        title: 'Replacement noted',
        description: `Recorded "${value}" as the replacement.`,
      });
    } catch (err) {
      console.error('Failed to save replacement', err);
      toast({
        title: 'Could not save replacement',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSavingReplacement(false);
    }
  };

  const handleUndoMissing = async () => {
    if (!isMissing || undoing) return;
    setUndoing(true);
    try {
      if (reportId) {
        const { error } = await supabase
          .from('missing_product_reports')
          .update({
            resolved_at: new Date().toISOString(),
            resolution_note: 'Reversed by creator',
          })
          .eq('id', reportId);
        if (error) throw error;
      }

      // Fire reversal email
      supabase.functions.invoke('send-transactional-email', {
        body: {
          templateName: 'missing-product-reversal',
          recipientEmail: 'annie.e.randle@gmail.com',
          idempotencyKey: `missing-reversal-${missingKey}-${Date.now()}`,
          templateData: {
            creatorName: creatorName || 'Unknown creator',
            accountName,
            productName,
            assignmentDate,
            videoStyle,
            assignmentOrder,
            resolutionNote: replacement
              ? `Was replaced with: ${replacement}`
              : 'Reversed by creator',
            reversedAt: new Date().toISOString(),
          },
        },
      }).catch((err) => console.error('Reversal email failed', err));

      localStorage.removeItem(missingKey);
      localStorage.removeItem(replacementKey);
      localStorage.removeItem(reportIdKey);
      setIsMissing(false);
      setReplacement('');
      setReplacementDraft('');
      setReportId(null);
      toast({
        title: 'Report reversed',
        description: `Annie has been notified that "${productName}" is found.`,
      });
    } catch (err) {
      console.error('Failed to reverse report', err);
      toast({
        title: 'Could not reverse report',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUndoing(false);
    }
  };

  const handleSaveExtra = async () => {
    const value = parseInt(extraDraft, 10);
    if (!Number.isFinite(value) || value < 1 || savingExtra) return;
    setSavingExtra(true);
    try {
      if (extraReportId) {
        const { error } = await supabase
          .from('extra_video_reports')
          .update({ extra_count: value })
          .eq('id', extraReportId);
        if (error) throw error;
      } else {
        const newId = crypto.randomUUID();
        const { error } = await supabase
          .from('extra_video_reports')
          .insert({
            id: newId,
            creator_id: creatorId || null,
            creator_name: creatorName || null,
            account_name: accountName || null,
            product_name: productName,
            assignment_date: assignmentDate || null,
            video_style: videoStyle || null,
            assignment_order: assignmentOrder || null,
            extra_count: value,
          });
        if (error) throw error;
        localStorage.setItem(extraReportIdKey, newId);
        setExtraReportId(newId);
      }
      localStorage.setItem(extraCountKey, String(value));
      setExtraCount(value);
      toast({
        title: 'Extra versions logged',
        description: `Recorded ${value} extra version${value === 1 ? '' : 's'} of "${productName}".`,
      });
    } catch (err) {
      console.error('Failed to log extra versions', err);
      toast({
        title: 'Could not save',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSavingExtra(false);
    }
  };

  const handleClearExtra = async () => {
    if (!hasExtras) return;
    try {
      if (extraReportId) {
        await supabase
          .from('extra_video_reports')
          .update({ extra_count: 0 })
          .eq('id', extraReportId);
      }
      localStorage.removeItem(extraCountKey);
      localStorage.removeItem(extraReportIdKey);
      setExtraCount(0);
      setExtraReportId(null);
      setExtraDraft('');
      toast({ title: 'Cleared', description: 'Extra versions removed.' });
    } catch (err) {
      console.error('Failed to clear extras', err);
    }
  };

  return (
    <Card 
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border/60 bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200 hover:border-border hover:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.08)]",
        isFilmed && "bg-emerald-50/40 dark:bg-emerald-950/10 border-emerald-200/70 dark:border-emerald-900/50",
        isMissing && "bg-amber-50/50 dark:bg-amber-950/10 border-amber-200/80 dark:border-amber-900/50"
      )}
    >
      {/* Subtle accent stripe for video style */}
      {hasVideoStyle && (
        <div className={cn("absolute left-0 top-0 bottom-0 w-[3px]", getVideoStyleColor(videoStyle))} aria-hidden />
      )}

      <div className="flex items-stretch">
        {/* Checkbox Column - tighter */}
        <button
          type="button"
          onClick={handleCheckboxChange}
          className={cn(
            "flex items-center justify-center px-3 py-3 transition-colors shrink-0",
            "hover:bg-muted/40",
            isFilmed && "bg-emerald-100/40 dark:bg-emerald-900/20"
          )}
          aria-label={`Mark ${productName} as filmed`}
        >
          <div
            className={cn(
              "h-6 w-6 rounded-md border-2 flex items-center justify-center transition-all",
              isFilmed
                ? "bg-emerald-500 border-emerald-500 shadow-sm"
                : "border-border bg-background group-hover:border-foreground/40"
            )}
          >
            {isFilmed && <Check className="h-4 w-4 text-white stroke-[3]" />}
          </div>
        </button>

        {/* Card Content - tighter padding */}
        <div className="flex-1 min-w-0 px-3.5 py-2.5">
          {/* Top row: order + title + notes */}
          <div className="flex items-start gap-2 mb-1.5">
            {hasOrder && (
              <span className="inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-md bg-foreground/5 text-foreground/70 text-[11px] font-semibold tabular-nums leading-none shrink-0 mt-0.5">
                {assignmentOrder}
              </span>
            )}
            <h3 className={cn(
              "flex-1 text-[15px] font-semibold leading-snug tracking-tight text-foreground min-w-0",
              isFilmed && "line-through text-muted-foreground"
            )}>
              {hasProductLink ? (
                <a
                  href={productLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline underline-offset-2 transition-colors"
                >
                  {productName}
                </a>
              ) : (
                productName
              )}
            </h3>
            {hasNotes && (
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className="inline-flex items-center gap-1.5 h-5 px-2 rounded-full bg-rose-50 dark:bg-rose-950/30 border border-rose-200/70 dark:border-rose-900/50 text-[10px] font-semibold uppercase tracking-wide text-rose-600 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-950/50 transition-colors shrink-0 mt-0.5"
                    aria-label="View filming note"
                  >
                    <StickyNote className="h-2.5 w-2.5" />
                    note
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-80 max-h-64 overflow-y-auto" side="top" align="end">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm border-b pb-2">📝 Filming Note</h4>
                    <p className="text-sm whitespace-pre-wrap text-muted-foreground">{renderTextWithLinks(notes)}</p>
                  </div>
                </PopoverContent>
              </Popover>
            )}
            {hasVideoStyle && (
              <span
                className="inline-flex items-center gap-1.5 h-5 px-2 rounded-full bg-muted/60 border border-border/60 text-[10px] font-medium uppercase tracking-wide text-muted-foreground shrink-0 mt-0.5"
                title={`Video style: ${videoStyle}`}
              >
                <span className={cn("h-1.5 w-1.5 rounded-full", getVideoStyleColor(videoStyle))} />
                {videoStyle}
              </span>
            )}
          </div>

          <div className="space-y-1.5">
            {/* Script + subtle missing-product trigger */}
            <div className="flex items-center gap-1.5">
              {/* Script Status */}
              {hasScript ? (
                <div className="flex items-start gap-2 px-2.5 py-1.5 bg-muted/40 rounded-md flex-1 min-w-0">
                  <FileText className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="flex-1">
                  {hasScriptContent ? (
                    <Popover>
                      <PopoverTrigger asChild>
                        <button 
                          className="text-[13px] text-foreground text-left hover:text-primary hover:underline cursor-pointer transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded truncate block w-full"
                          aria-label={`View script: ${scriptName}`}
                        >
                          {scriptNameIsUrl ? (
                            <a href={scriptName} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 hover:text-primary/80" onClick={e => e.stopPropagation()}>{scriptName}</a>
                          ) : scriptName}
                        </button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-80 max-h-64 overflow-y-auto"
                        side="top"
                        align="start"
                      >
                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm border-b pb-2">
                            📄 {scriptName}
                          </h4>
                          <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                            {renderTextWithLinks(scriptContent)}
                          </p>
                        </div>
                      </PopoverContent>
                    </Popover>
                  ) : (
                    <Popover>
                      <PopoverTrigger asChild>
                        <button 
                          className="text-[13px] text-foreground text-left hover:text-primary hover:underline cursor-pointer transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded truncate block w-full"
                          aria-label={`View script: ${scriptName}`}
                        >
                          {scriptNameIsUrl ? (
                            <a href={scriptName} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 hover:text-primary/80" onClick={e => e.stopPropagation()}>{scriptName}</a>
                          ) : scriptName}
                        </button>
                      </PopoverTrigger>
                      <PopoverContent 
                        className="w-72"
                        side="top"
                        align="start"
                      >
                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm border-b pb-2">
                            📄 {scriptName}
                          </h4>
                          <p className="text-sm text-muted-foreground italic">
                            Script text not available
                          </p>
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-muted/30 rounded-md flex-1 min-w-0">
                  <VolumeX className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="text-[13px] font-medium text-muted-foreground">No Script</span>
                </div>
              )}

              {/* Extra versions — subtle icon trigger (left of missing) */}
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      "shrink-0 inline-flex items-center justify-center h-7 rounded-md transition-colors",
                      hasExtras
                        ? "px-2 gap-1 text-[11px] font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-100/70 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50"
                        : "w-7 text-muted-foreground/50 hover:text-indigo-600 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/20"
                    )}
                    title="Log extra versions filmed"
                    aria-label={`Log extra versions for ${productName}`}
                  >
                    <Copy className="h-3.5 w-3.5" />
                    {hasExtras && <span>+{extraCount}</span>}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-64" side="top" align="end">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-semibold">Extra versions filmed</h4>
                      {hasExtras && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 px-1.5 text-[11px] text-muted-foreground"
                          onClick={handleClearExtra}
                        >
                          <X className="h-3 w-3 mr-0.5" />
                          Clear
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Banking extras for future posts? Log how many additional versions you filmed.
                    </p>
                    <div className="flex items-center gap-1.5">
                      <Input
                        type="number"
                        min={1}
                        max={50}
                        value={extraDraft}
                        onChange={(e) => setExtraDraft(e.target.value)}
                        placeholder="e.g. 2"
                        className="h-8 text-xs"
                      />
                      <Button
                        type="button"
                        size="sm"
                        className="h-8 px-2.5 text-[11px]"
                        onClick={handleSaveExtra}
                        disabled={
                          savingExtra ||
                          !extraDraft.trim() ||
                          parseInt(extraDraft, 10) < 1 ||
                          parseInt(extraDraft, 10) === extraCount
                        }
                      >
                        {savingExtra ? '…' : extraCount > 0 ? 'Update' : 'Save'}
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Missing product — subtle icon trigger */}
              {!isMissing ? (
                <button
                  type="button"
                  onClick={() => handleMissingToggle(true)}
                  disabled={submitting}
                  className="shrink-0 inline-flex items-center justify-center h-7 w-7 rounded-md text-muted-foreground/50 hover:text-amber-600 hover:bg-amber-50/60 dark:hover:bg-amber-950/20 transition-colors"
                  title="Report missing product"
                  aria-label={`Report missing: ${productName}`}
                >
                  <AlertTriangle className="h-3.5 w-3.5" />
                </button>
              ) : (
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="shrink-0 inline-flex items-center gap-1 h-7 px-2 rounded-md text-[11px] font-medium text-amber-700 dark:text-amber-300 bg-amber-100/70 dark:bg-amber-900/30 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors"
                      aria-label="Missing product details"
                    >
                      <AlertTriangle className="h-3 w-3" />
                      Missing
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72" side="top" align="end">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-sm font-semibold">Missing product</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 px-1.5 text-[11px] text-muted-foreground"
                          onClick={handleUndoMissing}
                          disabled={undoing}
                        >
                          <X className="h-3 w-3 mr-0.5" />
                          {undoing ? 'Undoing…' : 'Undo'}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Annie has been notified. Optionally note what you replaced it with.
                      </p>
                      <div className="flex items-center gap-1.5">
                        <Input
                          value={replacementDraft}
                          onChange={(e) => setReplacementDraft(e.target.value)}
                          placeholder="Replaced with…"
                          className="h-8 text-xs"
                          maxLength={200}
                        />
                        <Button
                          type="button"
                          size="sm"
                          className="h-8 px-2.5 text-[11px]"
                          onClick={handleSaveReplacement}
                          disabled={
                            savingReplacement ||
                            !replacementDraft.trim() ||
                            replacementDraft.trim() === replacement
                          }
                        >
                          {savingReplacement
                            ? '…'
                            : replacement && replacement === replacementDraft.trim()
                            ? 'Saved'
                            : 'Save'}
                        </Button>
                      </div>
                      {replacement && (
                        <p className="text-[11px] text-muted-foreground">
                          Saved: <span className="font-medium text-foreground">{replacement}</span>
                        </p>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
