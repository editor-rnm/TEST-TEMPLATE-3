import { Assignment } from '@/types/assignment';
import { AssignmentCard } from '@/components/AssignmentCard';
import { Building2 } from 'lucide-react';

interface AccountGroupProps {
  accountName: string;
  assignments: Assignment[];
  globalIndices: number[];
  isFilmed: (index: number) => boolean;
  onToggleFilmed: (index: number) => void;
  creatorId?: string | null;
  creatorName?: string | null;
  assignmentDate?: string;
}

export function AccountGroup({ 
  accountName, 
  assignments, 
  globalIndices,
  isFilmed,
  onToggleFilmed,
  creatorId,
  creatorName,
  assignmentDate,
}: AccountGroupProps) {
  return (
    <div className="space-y-2">
      {/* Account Header — sleek inline */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
          <h2 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">
            {accountName}
          </h2>
        </div>
        <span className="text-[11px] text-muted-foreground tabular-nums">
          {assignments.length}
        </span>
      </div>

      {/* Assignment Cards */}
      <div className="space-y-1.5">
        {assignments.map((assignment, localIndex) => (
          <AssignmentCard 
            key={globalIndices[localIndex]} 
            assignment={assignment}
            index={globalIndices[localIndex]}
            isFilmed={isFilmed(globalIndices[localIndex])}
            onToggleFilmed={onToggleFilmed}
            creatorId={creatorId || undefined}
            creatorName={creatorName || undefined}
            assignmentDate={assignmentDate}
          />
        ))}
      </div>
    </div>
  );
}
