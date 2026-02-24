import { cn } from '@/lib/utils';

const statusConfig: Record<string, { label: string; className: string }> = {
  PENDING_PAYMENT: { label: 'Pending', className: 'bg-warning/15 text-warning border-warning/30' },
  PAID: { label: 'Paid', className: 'bg-success/15 text-success border-success/30' },
  FAILED: { label: 'Failed', className: 'bg-destructive/15 text-destructive border-destructive/30' },
  CANCELLED: { label: 'Cancelled', className: 'bg-muted text-muted-foreground border-border' },
  FULFILLED: { label: 'Fulfilled', className: 'bg-primary/15 text-primary border-primary/30' },
};

const StatusBadge = ({ status }: { status: string }) => {
  const config = statusConfig[status] || { label: status, className: 'bg-muted text-muted-foreground' };
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border', config.className)}>
      {config.label}
    </span>
  );
};

export default StatusBadge;
