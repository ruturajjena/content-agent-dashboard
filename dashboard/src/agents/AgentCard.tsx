import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type AgentStatus = 'active' | 'attention';

const statusMap: Record<AgentStatus, { label: string; variant: 'good' | 'warn'; dot: string }> = {
  active: { label: 'Active', variant: 'good', dot: 'bg-good' },
  attention: { label: 'Needs data', variant: 'warn', dot: 'bg-warn' },
};

/**
 * Shared shell for every agent module — icon, name, live status, headline,
 * and a body slot. Keeps all five panels visually consistent.
 */
export function AgentCard({
  icon: Icon,
  name,
  tagline,
  status,
  headline,
  iconClass,
  children,
}: {
  icon: LucideIcon;
  name: string;
  tagline: string;
  status: AgentStatus;
  headline: string;
  /** Full literal Tailwind classes for the icon chip, e.g. 'bg-accent/15 text-accent'. */
  iconClass: string;
  children: ReactNode;
}) {
  const s = statusMap[status];
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
            iconClass,
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold tracking-tight">{name}</h3>
            <Badge variant={s.variant}>
              <span className={cn('h-1.5 w-1.5 rounded-full', s.dot)} />
              {s.label}
            </Badge>
          </div>
          <p className="text-xs text-muted">{tagline}</p>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="mb-3 text-sm text-text/90">{headline}</p>
        {children}
      </CardContent>
    </Card>
  );
}

/** Small labelled section used inside agent bodies. */
export function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mt-3 first:mt-0">
      <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted">
        {label}
      </div>
      {children}
    </div>
  );
}
