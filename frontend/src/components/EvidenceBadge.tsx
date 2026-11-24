import { CheckCircle2, HelpCircle, Scale, ShieldAlert } from 'lucide-react';
import { EVIDENCE_DEFINITIONS } from '../data';
import type { EvidenceStatus } from '../types/archive';

interface EvidenceBadgeProps {
  status: EvidenceStatus;
  showDescription?: boolean;
  showPlainLabel?: boolean;
  size?: 'sm' | 'md';
}

const ICONS: Record<EvidenceStatus, typeof CheckCircle2> = {
  VERIFIED: CheckCircle2,
  UNRESOLVED: HelpCircle,
  DEBATED: Scale,
  UNSUPPORTED: ShieldAlert,
};

export function EvidenceBadge({
  status,
  showDescription = false,
  showPlainLabel = false,
  size = 'sm',
}: EvidenceBadgeProps) {
  const meta = EVIDENCE_DEFINITIONS[status];
  const Icon = ICONS[status];

  return (
    <div className="inline-flex flex-col gap-1.5">
      <span
        title={meta.description}
        className={`inline-flex items-center gap-1.5 rounded-full border font-semibold tracking-wider uppercase ${
          meta.colorClass
        } ${size === 'sm' ? 'px-2.5 py-0.5 text-[11px]' : 'px-3.5 py-1 text-xs'}`}
      >
        <Icon className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} aria-hidden="true" />
        <span>{meta.label}</span>
        {showPlainLabel && (
          <span className="font-normal normal-case tracking-normal opacity-90">
            · {meta.plainLabel}
          </span>
        )}
      </span>
      {showDescription && (
        <p className="text-sm text-[#CBD6F0] leading-relaxed">{meta.description}</p>
      )}
    </div>
  );
}
