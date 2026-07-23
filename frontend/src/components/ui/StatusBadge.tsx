import { cn, getStatusColor, getStatusLabel } from '../../lib/utils';

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn('px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide', getStatusColor(status))}>
      {getStatusLabel(status)}
    </span>
  );
}
