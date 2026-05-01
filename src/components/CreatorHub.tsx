import { useMemo, useCallback, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Assignment } from '@/types/assignment';
import { useHubResources } from '@/hooks/useHubResources';
import { useUpcomingAssignments } from '@/hooks/useUpcomingAssignments';
import { useUpdateReadStatus } from '@/hooks/useUpdateReadStatus';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  CalendarDays, 
  CalendarCheck, 
  BookOpen, 
  Bell, 
  ExternalLink,
  FileText,
  Camera,
  Film,
  FolderOpen,
  Gift
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CreatorHubProps {
  creatorName: string | null;
  assignments: Assignment[];
  onGoToAssignments: () => void;
}

// Icon mapping for resource tiles
const RESOURCE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'MOF Guidelines': FileText,
  'Snapchat Guidelines': Camera,
  'Reference Examples': Film,
  'Google Drive': FolderOpen,
};

// Expected resource titles in order
const RESOURCE_ORDER = ['MOF Guidelines', 'Snapchat Guidelines', 'Reference Examples', 'Google Drive'];

export function CreatorHub({ creatorName, assignments, onGoToAssignments }: CreatorHubProps) {
  const { updates, bonusOpportunities, resourceItems, loading: resourcesLoading } = useHubResources();
  const { upcomingDays, loading: upcomingLoading } = useUpcomingAssignments(creatorName);
  const { isRead, markAsRead } = useUpdateReadStatus(creatorName, updates);

  const displayName = useMemo(() => {
    if (!creatorName) return 'Creator';
    return creatorName.charAt(0).toUpperCase() + creatorName.slice(1).toLowerCase();
  }, [creatorName]);

  // Bonus completion tracking
  const [bonusCompleted, setBonusCompleted] = useState<Record<string, { by: string; at: string }>>({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem('bonus_completed');
      if (saved) setBonusCompleted(JSON.parse(saved));
    } catch {}
  }, []);

  const toggleBonusComplete = useCallback((bonusTitle: string) => {
    setBonusCompleted(prev => {
      const key = bonusTitle.replace(/\s+/g, '_').slice(0, 50);
      const next = { ...prev };
      if (next[key]) {
        delete next[key];
      } else {
        next[key] = { by: displayName, at: new Date().toISOString() };
      }
      try { localStorage.setItem('bonus_completed', JSON.stringify(next)); } catch {}
      return next;
    });
  }, [displayName]);

  const isBonusDone = useCallback((bonusTitle: string) => {
    const key = bonusTitle.replace(/\s+/g, '_').slice(0, 50);
    return bonusCompleted[key] || null;
  }, [bonusCompleted]);

  const stats = useMemo(() => {
    const totalAssignments = assignments.length;
    const uniqueProducts = new Set(assignments.map(a => a['product_name'])).size;
    const accountCount = new Set(assignments.map(a => a['account_name'])).size;
    return { totalAssignments, uniqueProducts, accountCount };
  }, [assignments]);

  // Map resource items by title for easy lookup
  const resourceMap = useMemo(() => {
    const map: Record<string, { link: string }> = {};
    resourceItems.forEach(item => {
      map[item.title] = { link: item.link };
    });
    console.log(`Resources loaded: ${resourceItems.length} items found`);
    return map;
  }, [resourceItems]);

  // Build ordered resources with icons
  const orderedResources = useMemo(() => {
    return RESOURCE_ORDER.map(title => {
      const Icon = RESOURCE_ICONS[title] || FileText;
      const resource = resourceMap[title];
      return {
        title,
        Icon,
        link: resource?.link || '',
        hasLink: Boolean(resource?.link)
      };
    });
  }, [resourceMap]);

  // Handle update click
  const handleUpdateClick = useCallback((update: typeof updates[0]) => {
    markAsRead(update);
    if (update.link) {
      window.open(update.link, '_blank', 'noopener,noreferrer');
    }
  }, [markAsRead]);

  // Format date for display (e.g., "Jan 30")
  const formatDate = (dateStr: string): string => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="text-center py-6">
        <h2 className="text-2xl font-bold text-foreground">
          Welcome back, {displayName}! 🎬
        </h2>
        <p className="text-sm text-muted-foreground mt-2 italic tracking-wide">
          Your personalized workspace for assignments, resources, and updates
        </p>
      </div>

      {/* Grid Layout for Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Today's Assignments Card */}
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onGoToAssignments}>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Today's Assignments</CardTitle>
            </div>
            <CardDescription>Your work for today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* FIX 1: Tight horizontal layout for number + "assignments" */}
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-foreground">{stats.totalAssignments}</span>
                <span className="text-lg text-muted-foreground">assignments</span>
              </div>
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>{stats.uniqueProducts} products</span>
                <span>•</span>
                <span>{stats.accountCount} accounts</span>
              </div>
              <Button variant="outline" size="sm" className="w-full mt-2 gap-2">
                <ExternalLink className="h-4 w-4" />
                View Assignments
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Work Card - With real data */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <CalendarCheck className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Upcoming Work</CardTitle>
            </div>
            <CardDescription>Next 3 days preview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingLoading ? (
                <div className="text-sm text-muted-foreground">Loading...</div>
              ) : (
                upcomingDays.map((day, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                    <span className="text-sm text-foreground">{day.label}</span>
                    <div className="flex items-center gap-2">
                      {day.scheduled ? (
                        <span className="text-sm font-medium text-foreground">
                          {day.count} assignment{day.count !== 1 ? 's' : ''}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground italic">
                          Not yet scheduled
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Bonus Opportunities Card - Dynamic from Hub_Resources */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">💰 Bonus Opportunities</CardTitle>
            </div>
            <CardDescription>Optional videos for extra earnings</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            {resourcesLoading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : bonusOpportunities.length > 0 ? (
              <div className="space-y-3">
                {bonusOpportunities.map((bonus, index) => {
                  const done = isBonusDone(bonus.title);
                  return (
                    <div key={index} className={`space-y-2 p-3 rounded-lg border transition-all ${done ? 'bg-muted/40 border-border/50 opacity-70' : 'bg-background border-border'}`}>
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={!!done}
                          onCheckedChange={() => toggleBonusComplete(bonus.title)}
                          className="mt-0.5"
                          aria-label={`Mark "${bonus.title}" as completed`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${done ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{bonus.title}</p>
                          {bonus.content && (
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{bonus.content}</p>
                          )}
                          <div className="flex items-center justify-between mt-1.5">
                            <div className="flex items-center gap-2">
                              {bonus.date_posted && (
                                <span className="text-xs text-muted-foreground/70">
                                  Posted: {formatDate(bonus.date_posted)}
                                </span>
                              )}
                              {done && (
                                <span className="text-xs text-primary/70 font-medium">
                                  ✓ Done by {done.by}
                                </span>
                              )}
                            </div>
                            {bonus.link && (
                              <a 
                                href={bonus.link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline font-medium"
                              >
                                Example Video →
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Check back soon for bonus video opportunities and extra earning chances!
              </p>
            )}
          </CardContent>
        </Card>

        {/* Resources Card - Dynamic from Hub_Resources */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Resources</CardTitle>
            </div>
            <CardDescription>Guides and references</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {orderedResources.map((resource, index) => {
                const IconComponent = resource.Icon;
                return resource.hasLink ? (
                  <a
                    key={index}
                    href={resource.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg bg-muted/50 hover:bg-muted hover:scale-[1.02] hover:shadow-md transition-all duration-200 text-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 min-h-[80px]"
                    aria-label={`Open ${resource.title} in new tab`}
                  >
                    <IconComponent className="h-5 w-5 text-primary" />
                    <span className="text-xs font-medium text-foreground">{resource.title}</span>
                  </a>
                ) : (
                  <div
                    key={index}
                    className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg bg-muted/30 text-center opacity-60 cursor-not-allowed min-h-[80px]"
                    aria-label={`${resource.title} - not available`}
                  >
                    <IconComponent className="h-5 w-5 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground">{resource.title}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Updates Card - Connected to Hub_Resources with Read/Unread */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Updates</CardTitle>
            </div>
            <CardDescription>Recent announcements, important updates, and other information</CardDescription>
          </CardHeader>
          <CardContent>
            {resourcesLoading ? (
              <div className="text-sm text-muted-foreground">Loading updates...</div>
            ) : updates.length === 0 ? (
              <div className="text-sm text-muted-foreground py-4 text-center">
                No recent updates - check back soon!
              </div>
            ) : (
              <div className="space-y-1">
                {updates.map((update, index) => {
                  const read = isRead(update);
                  return (
                    <button
                      key={index}
                      onClick={() => handleUpdateClick(update)}
                      className="w-full flex items-start gap-3 py-3 px-2 border-b border-border/50 last:border-0 text-left hover:bg-muted/50 rounded-md transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 min-h-[44px]"
                      aria-label={`${read ? 'Read' : 'Unread'} update: ${update.title}${update.link ? ' - opens in new tab' : ''}`}
                    >
                      {/* Read/Unread indicator */}
                      <div 
                        className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 transition-all duration-200 ${
                          read 
                            ? 'bg-muted-foreground/30 border border-muted-foreground/40' 
                            : 'bg-primary'
                        }`}
                        aria-hidden="true"
                      />
                      <div className={`flex-1 min-w-0 transition-opacity duration-200 ${read ? 'opacity-70' : ''}`}>
                        <p className={`text-sm text-foreground ${read ? '' : 'font-medium'} ${update.link ? 'hover:text-primary hover:underline' : ''}`}>
                          {update.title}
                        </p>
                        {update.content && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {update.content}
                          </p>
                        )}
                        {update.date_posted && (
                          <p className="text-xs text-muted-foreground/70 mt-1">
                            {formatDate(update.date_posted)}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
