import {
  AlertTriangle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  FileText,
  Shuffle,
} from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { TimelineEvent } from '../types/archive';

interface TimelineExplorerProps {
  events: TimelineEvent[];
  mysteryTitle: string;
  mysterySlug?: string;
}

function isApproximateDate(label: string): boolean {
  return /[–\-~?]|c\.|circa|ma\b|century|bce|bc\b|approx|or\b/i.test(label);
}

export function TimelineExplorer({
  events,
  mysteryTitle,
  mysterySlug,
}: TimelineExplorerProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (events.length === 0) return null;

  const active = events[activeIndex] ?? events[0];
  const uncertain = isApproximateDate(active.yearLabel);

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0E1527] p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6C9EFF]">
            Interactive Chronology
          </span>
          <h4 className="font-editorial text-xl font-semibold text-white">
            Timeline Explorer — {mysteryTitle}
          </h4>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {mysterySlug && (
            <Link
              to={`/investigation-room?case=${mysterySlug}&section=timeline`}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#D4A853]/40 bg-[#D4A853]/12 px-3 py-1.5 text-xs font-semibold text-[#D4A853] hover:bg-[#D4A853]/20"
            >
              <Shuffle className="h-3.5 w-3.5" />
              Reconstruct in Room
            </Link>
          )}
          <button
            type="button"
            disabled={activeIndex === 0}
            onClick={() => setActiveIndex((i) => Math.max(0, i - 1))}
            aria-label="Previous timeline milestone"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/12 bg-[#121A2B] text-white transition-colors hover:border-[#6C9EFF]/50 disabled:opacity-35"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="px-2 text-xs font-medium text-[#A8B3CF]">
            {activeIndex + 1} / {events.length}
          </span>
          <button
            type="button"
            disabled={activeIndex === events.length - 1}
            onClick={() => setActiveIndex((i) => Math.min(events.length - 1, i + 1))}
            aria-label="Next timeline milestone"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/12 bg-[#121A2B] text-white transition-colors hover:border-[#6C9EFF]/50 disabled:opacity-35"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Horizontal year selector */}
      <div className="mt-5 flex items-center gap-2 overflow-x-auto pb-2" role="tablist">
        {events.map((ev, idx) => {
          const selected = idx === activeIndex;
          return (
            <button
              key={ev.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setActiveIndex(idx)}
              className={`shrink-0 rounded-xl border px-3.5 py-2 text-left transition-all ${
                selected
                  ? 'border-[#E5B66A]/65 bg-[#E5B66A]/12 text-white'
                  : 'border-white/10 bg-[#121A2B] text-[#A8B3CF] hover:border-[#6C9EFF]/40 hover:text-white'
              }`}
            >
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#E5B66A]">
                {ev.yearLabel}
              </div>
              <div className="mt-0.5 max-w-[170px] truncate text-xs font-medium">{ev.title}</div>
            </button>
          );
        })}
      </div>

      {/* Active milestone detail */}
      <div className="mt-5 rounded-xl border border-white/10 bg-[#121A2B] p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#6C9EFF]/12 px-3 py-1 text-xs font-semibold text-[#6C9EFF]">
              <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
              {active.yearLabel}
            </span>
            {uncertain && (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-amber-300">
                <AlertTriangle className="h-3 w-3" />
                Approximate / Date Range
              </span>
            )}
          </div>
          {active.associatedRecord && (
            <span className="inline-flex items-center gap-1.5 text-xs text-[#E5B66A]">
              <FileText className="h-3.5 w-3.5" aria-hidden="true" />
              {active.associatedRecord}
            </span>
          )}
        </div>
        <h5 className="mt-3 font-editorial text-2xl font-semibold text-white">{active.title}</h5>
        <p className="mt-2 text-sm leading-relaxed text-[#D8E0F4]">{active.description}</p>
        <div className="mt-4 rounded-lg border border-white/8 bg-[#0B1020]/70 px-3.5 py-2.5 text-xs text-[#A8B3CF]">
          <span className="font-semibold text-white">Historical Significance: </span>
          {active.significance}
        </div>
      </div>
    </div>
  );
}
