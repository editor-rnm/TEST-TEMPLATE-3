import { VATask } from '@/types/va-task';
import { VATaskCard } from '@/components/VATaskCard';

interface VAAccountGroupProps {
  accountName: string;
  tasks: VATask[];
  globalIndices: number[];
  videoNumbers: number[];
  isPosted: (index: number) => boolean;
  onTogglePosted: (index: number) => void;
  showCheckboxes?: boolean;
}

export function VAAccountGroup({
  accountName,
  tasks,
  globalIndices,
  videoNumbers,
  isPosted,
  onTogglePosted,
  showCheckboxes = true,
}: VAAccountGroupProps) {
  return (
    <div className="space-y-2">
      <div className="px-1 py-1.5">
        <h3 className="font-bold text-sm text-foreground">{accountName}</h3>
        <p className="text-xs text-muted-foreground">
          {tasks.length} video{tasks.length !== 1 ? 's' : ''} · Post in order from top to bottom ↓
        </p>
      </div>
      <div className="space-y-2">
        {tasks.map((task, i) => (
          <VATaskCard
            key={globalIndices[i]}
            task={task}
            index={globalIndices[i]}
            videoNumber={videoNumbers[i]}
            isPosted={isPosted(globalIndices[i])}
            onTogglePosted={onTogglePosted}
            showCheckbox={showCheckboxes}
          />
        ))}
      </div>
    </div>
  );
}
