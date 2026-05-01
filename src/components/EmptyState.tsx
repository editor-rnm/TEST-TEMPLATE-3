import { Calendar, AlertCircle } from 'lucide-react';

interface EmptyStateProps {
  creatorId: string | null;
}

function capitalizeCreatorName(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

export function EmptyState({ creatorId }: EmptyStateProps) {
  const displayName = creatorId ? capitalizeCreatorName(creatorId) : null;
  
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="rounded-full bg-primary/10 p-4 mb-4">
        <Calendar className="h-8 w-8 text-primary" />
      </div>
      <h3 className="text-lg font-semibold mb-2">
        {displayName 
          ? `You're all clear for today, ${displayName}! 🎉`
          : 'No assignments today'}
      </h3>
      <p className="text-muted-foreground text-sm max-w-xs">
        {creatorId 
          ? 'No assignments scheduled. Enjoy your day!'
          : 'Add a ?creator_id= parameter to the URL to filter by creator.'}
      </p>
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="rounded-full bg-destructive/10 p-4 mb-4">
        <AlertCircle className="h-8 w-8 text-destructive" />
      </div>
      <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
      <p className="text-muted-foreground text-sm max-w-xs">{message}</p>
    </div>
  );
}
