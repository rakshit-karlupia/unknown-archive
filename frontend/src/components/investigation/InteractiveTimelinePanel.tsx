import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  FileSearch,
  GitCommitHorizontal,
  History,
  Layers,
  Shuffle,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { MysteryInvestigation, ResearchSource, TimelineEvent } from '../../types/archive';
import type {
  TimelineReconstructionAttempt,
  UnifiedEvidenceCard,
} from '../../types/investigation';

interface InteractiveTimelinePanelProps {
  mystery: MysteryInvestigation;
  sources: ResearchSource[];
  evidenceCards: UnifiedEvidenceCard[];
  reviewedTimelineIds: string[];
  highlightedEventId?: string | null;
  onClearHighlight?: () => void;
  reconstructionAttempt?: TimelineReconstructionAttempt;
  onMarkTimelineReviewed: (eventId: string) => void;
  onRecordReconstruction: (attempt: TimelineReconstructionAttempt) => void;
  onJumpToEvidence?: (cardId: string) => void;
}

type EventKindFilter = 'all' | 'discovery' | 'analysis' | 'official';
type SourceFilter = 'all' | 'with-record' | 'uncertain-date';
type ZoomLevel = 'compact' | 'standard' | 'detailed';

function isUncertainDateLabel(label: string): boolean {
  return /[–\-~?]|c\.|circa|ma\b|century|bce|bc\b|approx|or\b/i.test(label);
}

function classifyEventKind(ev: TimelineEvent): Exclude<EventKindFilter, 'all'> {
  const text = `${ev.title} ${ev.description} ${ev.significance}`.toLowerCase();
  if (/radar|dna|isotop|lab|analysis|study|survey|seismic|map|spectro|sonar/.test(text)) {
    return 'analysis';
  }
  if (/report|declassif|government|cia|navy|expedition|official|court|police|committee/.test(text)) {
    return 'official';
  }
  return 'discovery';
}

function deterministicShuffle(events: TimelineEvent[], seedOffset = 0): TimelineEvent[] {
  if (events.length <= 1) return [...events];
  const copy = [...events];
  // Rotate and swap deterministically so it is never identical to chronological order
  for (let i = copy.length - 1; i > 0; i--) {
    const j = (i * 7 + 3 + seedOffset) % (i + 1);
    const tmp = copy[i];
    copy[i] = copy[j];
    copy[j] = tmp;
  }
  const sameOrder = copy.every((e, idx) => e.id === events[idx].id);
  if (sameOrder && copy.length > 1) {
    const first = copy.shift()!;
    copy.push(first);
  }
  return copy;
}

export function InteractiveTimelinePanel({
  mystery,
  sources,
  evidenceCards,
  reviewedTimelineIds,
  highlightedEventId,
  onClearHighlight,
  reconstructionAttempt,
  onMarkTimelineReviewed,
  onRecordReconstruction,
  onJumpToEvidence,
}: InteractiveTimelinePanelProps) {
  const sortedEvents = useMemo(
    () => [...mystery.timeline].sort((a, b) => a.sortYear - b.sortYear),
    [mystery.timeline]
  );

  const [mode, setMode] = useState<'chronological' | 'reconstruction'>('chronological');
  const [zoom, setZoom] = useState<ZoomLevel>('standard');
  const [kindFilter, setKindFilter] = useState<EventKindFilter>('all');
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');
  const [expandAll, setExpandAll] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(
    sortedEvents[0]?.id ?? null
  );

  // Reconstruction state
  const [shuffleSeed, setShuffleSeed] = useState(0);
  const [userSequence, setUserSequence] = useState<TimelineEvent[]>(() =>
    deterministicShuffle(sortedEvents, 0)
  );
  const [showCorrectSequence, setShowCorrectSequence] = useState(false);

  useEffect(() => {
    setUserSequence(deterministicShuffle(sortedEvents, shuffleSeed));
    setShowCorrectSequence(false);
  }, [sortedEvents, shuffleSeed]);

  useEffect(() => {
    if (highlightedEventId && sortedEvents.some((e) => e.id === highlightedEventId)) {
      setMode('chronological');
      setSelectedEventId(highlightedEventId);
      onMarkTimelineReviewed(highlightedEventId);
      onClearHighlight?.();
    }
  }, [highlightedEventId, sortedEvents, onMarkTimelineReviewed, onClearHighlight]);

  const filteredEvents = useMemo(() => {
    return sortedEvents.filter((ev) => {
      if (kindFilter !== 'all' && classifyEventKind(ev) !== kindFilter) return false;
      if (sourceFilter === 'with-record' && !ev.associatedRecord) return false;
      if (sourceFilter === 'uncertain-date' && !isUncertainDateLabel(ev.yearLabel)) return false;
      return true;
    });
  }, [sortedEvents, kindFilter, sourceFilter]);

  const selectedEvent = useMemo(
    () => sortedEvents.find((e) => e.id === selectedEventId) ?? filteredEvents[0] ?? null,
    [sortedEvents, selectedEventId, filteredEvents]
  );

  const uncertainOrRangeEvents = useMemo(
    () => sortedEvents.filter((ev) => isUncertainDateLabel(ev.yearLabel)),
    [sortedEvents]
  );

  const getRelatedEvidence = (ev: TimelineEvent): UnifiedEvidenceCard[] => {
    const direct = evidenceCards.filter((c) => c.relatedTimelineIds.includes(ev.id));
    if (direct.length > 0) return direct;
    const lower = `${ev.title} ${ev.description} ${ev.associatedRecord ?? ''}`.toLowerCase();
    return evidenceCards.filter(
      (c) =>
        c.kind === 'primary' &&
        (lower.includes(c.dateLabel.toLowerCase()) ||
          c.title
            .toLowerCase()
            .split(/\s+/)
            .some((w) => w.length > 5 && lower.includes(w)))
    );
  };

  const getMatchingSources = (ev: TimelineEvent): ResearchSource[] => {
    const rec = (ev.associatedRecord ?? '').toLowerCase();
    const year = ev.yearLabel.match(/\d{4}/)?.[0] ?? '';
    const matched = sources.filter(
      (s) =>
        (rec && s.title.toLowerCase().includes(rec.slice(0, 12))) ||
        (year && s.publicationDate.includes(year))
    );
    return matched.length > 0 ? matched : sources.slice(0, 2);
  };

  const getConnectedEventIds = (ev: TimelineEvent): string[] => {
    const idx = sortedEvents.findIndex((e) => e.id === ev.id);
    const ids = new Set<string>();
    if (idx > 0) ids.add(sortedEvents[idx - 1].id);
    if (idx >= 0 && idx < sortedEvents.length - 1) ids.add(sortedEvents[idx + 1].id);
    if (ev.associatedRecord) {
      sortedEvents.forEach((other) => {
        if (other.id !== ev.id && other.associatedRecord === ev.associatedRecord) {
          ids.add(other.id);
        }
      });
    }
    return Array.from(ids);
  };

  const handleSelectEvent = (ev: TimelineEvent) => {
    setSelectedEventId(ev.id);
    onMarkTimelineReviewed(ev.id);
  };

  const moveSequenceItem = (index: number, delta: -1 | 1) => {
    const target = index + delta;
    if (target < 0 || target >= userSequence.length) return;
    setUserSequence((prev) => {
      const next = [...prev];
      const tmp = next[index];
      next[index] = next[target];
      next[target] = tmp;
      return next;
    });
  };

  const handleSubmitReconstruction = () => {
    let correctCount = 0;
    userSequence.forEach((ev, idx) => {
      const expected = sortedEvents[idx];
      if (expected && ev.sortYear === expected.sortYear) {
        correctCount += 1;
      }
    });
    const exactMatch = correctCount === sortedEvents.length;
    onRecordReconstruction({
      orderedIds: userSequence.map((e) => e.id),
      submittedAt: new Date().toISOString(),
      correctCount,
      totalCount: sortedEvents.length,
      exactMatch,
    });
  };

  if (sortedEvents.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-[#0F1420] p-10 text-center">
        <History className="mx-auto h-8 w-8 text-[#68748F]" />
        <h3 className="mt-3 font-editorial text-xl text-white">No Timeline Events Documented</h3>
        <p className="mt-1 text-xs text-[#9AA5BE]">
          No chronological milestones are currently indexed for this dossier.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Timeline Controls */}
      <div className="rounded-xl border border-white/10 bg-[#0F1420] p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex rounded-lg border border-white/12 bg-[#080B12] p-1 text-xs">
            <button
              type="button"
              onClick={() => setMode('chronological')}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 font-semibold transition-colors ${
                mode === 'chronological'
                  ? 'bg-[#D4A853] text-[#080B12]'
                  : 'text-[#9AA5BE] hover:text-white'
              }`}
            >
              <Calendar className="h-3.5 w-3.5" />
              Chronological Timeline
            </button>
            <button
              type="button"
              onClick={() => setMode('reconstruction')}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 font-semibold transition-colors ${
                mode === 'reconstruction'
                  ? 'bg-[#D4A853] text-[#080B12]'
                  : 'text-[#9AA5BE] hover:text-white'
              }`}
            >
              <Shuffle className="h-3.5 w-3.5" />
              Reconstruction Challenge
            </button>
          </div>

          <p className="text-xs text-[#9AA5BE]">
            {mode === 'chronological'
              ? 'Click any milestone on the left to inspect its sources and linked evidence on the right.'
              : 'Challenge: Dates are hidden. Reorder the shuffled events from earliest to latest and submit.'}
          </p>

          {mode === 'chronological' && (
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center rounded-lg border border-white/10 bg-[#080B12] p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() =>
                    setZoom((z) => (z === 'detailed' ? 'standard' : 'compact'))
                  }
                  aria-label="Zoom out timeline"
                  className="rounded p-1.5 text-[#9AA5BE] hover:text-white"
                >
                  <ZoomOut className="h-3.5 w-3.5" />
                </button>
                <span className="font-mono-archive px-2 text-[10px] uppercase text-[#CBD5E1]">
                  {zoom}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setZoom((z) => (z === 'compact' ? 'standard' : 'detailed'))
                  }
                  aria-label="Zoom in timeline"
                  className="rounded p-1.5 text-[#9AA5BE] hover:text-white"
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => setExpandAll((p) => !p)}
                className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-[#080B12] px-3 py-1.5 text-xs text-[#CBD5E1] hover:border-[#D4A853]/40"
              >
                {expandAll ? (
                  <>
                    <ChevronUp className="h-3.5 w-3.5" /> Collapse Descriptions
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3.5 w-3.5" /> Expand All
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {mode === 'chronological' && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/8 pt-3">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono-archive text-[10px] uppercase tracking-wider text-[#9AA5BE]">
                Event:
              </span>
              {(
                [
                  { id: 'all', label: 'All' },
                  { id: 'discovery', label: 'Field / Discovery' },
                  { id: 'analysis', label: 'Scientific Analysis' },
                  { id: 'official', label: 'Institutional' },
                ] as const
              ).map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setKindFilter(f.id)}
                  className={`rounded border px-2 py-1 text-[11px] ${
                    kindFilter === f.id
                      ? 'border-[#6C9EFF] bg-[#6C9EFF]/15 text-[#6C9EFF]'
                      : 'border-white/10 bg-[#080B12] text-[#9AA5BE] hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}

              <span className="font-mono-archive ml-2 text-[10px] uppercase tracking-wider text-[#9AA5BE]">
                Source:
              </span>
              {(
                [
                  { id: 'all', label: 'All' },
                  { id: 'with-record', label: 'Primary Record' },
                  { id: 'uncertain-date', label: 'Approximate / Range' },
                ] as const
              ).map((sf) => (
                <button
                  key={sf.id}
                  type="button"
                  onClick={() => setSourceFilter(sf.id)}
                  className={`rounded border px-2 py-1 text-[11px] ${
                    sourceFilter === sf.id
                      ? 'border-[#D4A853] bg-[#D4A853]/15 text-[#D4A853]'
                      : 'border-white/10 bg-[#080B12] text-[#9AA5BE] hover:text-white'
                  }`}
                >
                  {sf.label}
                </button>
              ))}
            </div>

            {/* Jump to significant events */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-mono-archive text-[10px] uppercase tracking-wider text-[#9AA5BE]">
                Jump:
              </span>
              {sortedEvents.slice(0, 5).map((ev) => (
                <button
                  key={`jump-${ev.id}`}
                  type="button"
                  onClick={() => handleSelectEvent(ev)}
                  className={`font-mono-archive rounded px-2 py-0.5 text-[10px] transition-colors ${
                    selectedEvent?.id === ev.id
                      ? 'bg-[#D4A853] text-[#080B12] font-semibold'
                      : 'bg-[#080B12] text-[#9AA5BE] hover:text-white'
                  }`}
                >
                  {ev.yearLabel}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {mode === 'chronological' ? (
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Left: Vertical Interactive Timeline */}
          <div className="lg:col-span-7 space-y-4">
            {filteredEvents.length === 0 ? (
              <div className="rounded-xl border border-white/10 bg-[#0F1420] p-8 text-center text-xs text-[#9AA5BE]">
                No timeline events match your active filters.
              </div>
            ) : (
              <div className="relative ml-3 border-l border-[#D4A853]/35 pl-6 space-y-4">
                {filteredEvents.map((ev) => {
                  const isSelected = selectedEvent?.id === ev.id;
                  const isConnected = selectedEvent
                    ? getConnectedEventIds(selectedEvent).includes(ev.id)
                    : false;
                  const reviewed = reviewedTimelineIds.includes(ev.id);
                  const uncertain = isUncertainDateLabel(ev.yearLabel);

                  return (
                    <button
                      key={ev.id}
                      type="button"
                      onClick={() => handleSelectEvent(ev)}
                      className={`relative block w-full rounded-xl border text-left transition-all ${
                        zoom === 'compact' ? 'p-3.5' : zoom === 'detailed' ? 'p-6' : 'p-4.5'
                      } ${
                        isSelected
                          ? 'border-[#D4A853] bg-[#141A29] shadow-lg'
                          : isConnected
                          ? 'border-[#6C9EFF]/45 bg-[#0F172A]'
                          : 'border-white/10 bg-[#0F1420] hover:border-white/25'
                      }`}
                    >
                      <span
                        className={`absolute -left-[31px] top-5 h-3 w-3 rounded-full border-2 border-[#080B12] ${
                          isSelected
                            ? 'bg-[#D4A853]'
                            : isConnected
                            ? 'bg-[#6C9EFF]'
                            : 'bg-[#68748F]'
                        }`}
                      />

                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono-archive rounded bg-[#D4A853]/15 px-2.5 py-0.5 text-xs font-semibold text-[#D4A853]">
                            {ev.yearLabel}
                          </span>
                          {uncertain && (
                            <span className="font-mono-archive rounded border border-amber-400/30 bg-amber-500/10 px-2 py-0.5 text-[9px] uppercase text-amber-300">
                              Approximate / Range
                            </span>
                          )}
                          {isConnected && !isSelected && (
                            <span className="font-mono-archive rounded bg-[#6C9EFF]/15 px-2 py-0.5 text-[9px] uppercase text-[#6C9EFF]">
                              Connected Milestone
                            </span>
                          )}
                        </div>

                        {reviewed && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400">
                            <CheckCircle2 className="h-3 w-3" /> Reviewed
                          </span>
                        )}
                      </div>

                      <h4 className="mt-2 font-editorial text-xl font-semibold text-white">
                        {ev.title}
                      </h4>

                      {(expandAll || zoom !== 'compact' || isSelected) && (
                        <p className="mt-1.5 text-xs leading-relaxed text-[#CBD5E1]">
                          {ev.description}
                        </p>
                      )}

                      {ev.associatedRecord && (
                        <div className="mt-2 font-mono-archive inline-flex items-center gap-1 text-[10px] text-[#6C9EFF]">
                          <BookOpen className="h-3 w-3" />
                          {ev.associatedRecord}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Conflicting / Uncertain Dates Panel */}
            {uncertainOrRangeEvents.length > 0 && (
              <section className="rounded-xl border border-amber-400/25 bg-[#0F1420] p-5">
                <div className="flex items-center gap-2 text-amber-300">
                  <AlertTriangle className="h-4 w-4" />
                  <h4 className="font-mono-archive text-xs font-semibold uppercase tracking-wider">
                    Approximate Dates &amp; Chronological Uncertainty
                  </h4>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-[#9AA5BE]">
                  Historical and geological records for this case include date ranges or
                  approximate periods. Rather than fabricating single-day precision, both boundaries
                  and their source records are preserved below:
                </p>
                <div className="mt-3 space-y-2">
                  {uncertainOrRangeEvents.map((ev) => (
                    <div
                      key={`unc-${ev.id}`}
                      className="rounded-lg border border-white/8 bg-[#080B12] p-3 text-xs"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <strong className="text-white">{ev.title}</strong>
                        <span className="font-mono-archive text-[#D4A853]">{ev.yearLabel}</span>
                      </div>
                      <p className="mt-1 text-[11px] text-[#9AA5BE]">
                        Source anchor: {ev.associatedRecord ?? 'General archival chronology'}.{' '}
                        {ev.significance}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right: Event Detail Panel */}
          <div className="lg:col-span-5">
            {selectedEvent ? (
              <aside className="sticky top-24 rounded-xl border border-white/12 bg-[#0F1420] p-6 space-y-5">
                <div>
                  <span className="font-mono-archive inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-[#6C9EFF]">
                    <GitCommitHorizontal className="h-3.5 w-3.5" />
                    Selected Milestone Dossier
                  </span>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="font-mono-archive rounded bg-[#D4A853]/15 px-2.5 py-0.5 text-xs font-semibold text-[#D4A853]">
                      {selectedEvent.yearLabel}
                    </span>
                    {isUncertainDateLabel(selectedEvent.yearLabel) && (
                      <span className="font-mono-archive text-[10px] text-amber-300">
                        (Range / Approximate)
                      </span>
                    )}
                  </div>
                  <h3 className="mt-2 font-editorial text-2xl font-semibold text-white">
                    {selectedEvent.title}
                  </h3>
                </div>

                <p className="text-sm leading-relaxed text-[#D8E0F4]">
                  {selectedEvent.description}
                </p>

                <div className="rounded-lg border border-white/8 bg-[#080B12] p-4 text-xs leading-relaxed text-[#CBD5E1]">
                  <strong className="font-mono-archive block text-[10px] uppercase tracking-wider text-[#D4A853] mb-1">
                    Historical Context &amp; Significance
                  </strong>
                  {selectedEvent.significance}
                </div>

                {/* Supporting Sources */}
                <div>
                  <div className="font-mono-archive text-[10px] font-semibold uppercase tracking-wider text-[#9AA5BE] mb-2">
                    Supporting Sources
                  </div>
                  <div className="space-y-2">
                    {selectedEvent.associatedRecord && (
                      <div className="rounded-lg border border-white/8 bg-[#080B12] px-3 py-2 text-xs text-[#6C9EFF]">
                        Primary Record: {selectedEvent.associatedRecord}
                      </div>
                    )}
                    {getMatchingSources(selectedEvent).map((src) => (
                      <a
                        key={src.id}
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between gap-2 rounded-lg border border-white/8 bg-[#080B12] px-3 py-2 text-xs text-[#CBD5E1] hover:border-[#D4A853]/50 hover:text-white"
                      >
                        <span className="truncate">
                          {src.title} ({src.publicationDate})
                        </span>
                        <ExternalLink className="h-3.5 w-3.5 shrink-0 text-[#6C9EFF]" />
                      </a>
                    ))}
                  </div>
                </div>

                {/* Related Evidence Links */}
                <div>
                  <div className="font-mono-archive text-[10px] font-semibold uppercase tracking-wider text-[#9AA5BE] mb-2">
                    Related Evidence Exhibits
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {getRelatedEvidence(selectedEvent).map((card) => (
                      <button
                        key={card.id}
                        type="button"
                        onClick={() => onJumpToEvidence?.(card.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#D4A853]/35 bg-[#D4A853]/10 px-3 py-1.5 text-xs font-medium text-[#D4A853] hover:bg-[#D4A853]/20"
                      >
                        <FileSearch className="h-3.5 w-3.5" />
                        {card.title}
                      </button>
                    ))}
                  </div>
                </div>
              </aside>
            ) : null}
          </div>
        </div>
      ) : (
        /* Timeline Reconstruction Mode */
        <div className="rounded-xl border border-white/12 bg-[#0F1420] p-6 space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <span className="font-mono-archive inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-[#D4A853]">
                <Layers className="h-3.5 w-3.5" />
                Chronological Reconstruction Challenge
              </span>
              <h3 className="mt-1 font-editorial text-2xl font-semibold text-white">
                Arrange Documented Events in Chronological Order
              </h3>
              <p className="mt-1 text-xs text-[#9AA5BE]">
                Dates are hidden while reconstructing. Move events up or down to establish the
                earliest-to-latest sequence based on historical context and records.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShuffleSeed((s) => s + 1)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/12 bg-[#080B12] px-3 py-2 text-xs text-[#CBD5E1] hover:border-[#D4A853]/50"
            >
              <Shuffle className="h-3.5 w-3.5 text-[#D4A853]" />
              Reshuffle Events
            </button>
          </div>

          <div className="space-y-2.5">
            {userSequence.map((ev, idx) => {
              const expected = sortedEvents[idx];
              const isChecked = Boolean(reconstructionAttempt);
              const isCorrectSlot = isChecked && expected && ev.sortYear === expected.sortYear;

              return (
                <div
                  key={ev.id}
                  className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4 ${
                    isChecked
                      ? isCorrectSlot
                        ? 'border-emerald-400/40 bg-emerald-950/15'
                        : 'border-rose-400/35 bg-rose-950/15'
                      : 'border-white/10 bg-[#080B12]'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <span className="font-mono-archive flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-[#0F1420] text-xs font-semibold text-[#D4A853]">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <h4 className="font-editorial text-lg font-semibold text-white">
                        {ev.title}
                      </h4>
                      <p className="mt-0.5 text-xs text-[#9AA5BE]">{ev.description}</p>
                      {ev.associatedRecord && (
                        <span className="font-mono-archive mt-1 inline-block text-[10px] text-[#6C9EFF]">
                          Record: {ev.associatedRecord}
                        </span>
                      )}
                      {isChecked && (
                        <div className="font-mono-archive mt-1.5 text-[11px] font-semibold">
                          {isCorrectSlot ? (
                            <span className="text-emerald-300">
                              ✓ Accurate position ({ev.yearLabel})
                            </span>
                          ) : (
                            <span className="text-rose-300">
                              ✗ Documented date: {ev.yearLabel}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveSequenceItem(idx, -1)}
                      aria-label={`Move ${ev.title} up`}
                      className="rounded-lg border border-white/12 bg-[#0F1420] p-2 text-[#CBD5E1] hover:border-[#D4A853]/50 disabled:opacity-30"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === userSequence.length - 1}
                      onClick={() => moveSequenceItem(idx, 1)}
                      aria-label={`Move ${ev.title} down`}
                      className="rounded-lg border border-white/12 bg-[#0F1420] p-2 text-[#CBD5E1] hover:border-[#D4A853]/50 disabled:opacity-30"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleSubmitReconstruction}
                className="inline-flex items-center gap-2 rounded-lg bg-[#D4A853] px-5 py-2.5 text-xs font-semibold text-[#080B12] hover:bg-[#e3ba68]"
              >
                <CheckCircle2 className="h-4 w-4" />
                Submit Proposed Sequence
              </button>

              {reconstructionAttempt && (
                <button
                  type="button"
                  onClick={() => setShowCorrectSequence((s) => !s)}
                  className="rounded-lg border border-white/15 bg-[#080B12] px-4 py-2.5 text-xs font-semibold text-[#CBD5E1] hover:border-[#D4A853]/50"
                >
                  {showCorrectSequence ? 'Hide Sourced Sequence' : 'Review Correct Sourced Sequence'}
                </button>
              )}
            </div>

            {reconstructionAttempt && (
              <div className="font-mono-archive text-xs text-[#E2E8F0]">
                Result:{' '}
                <strong className="text-[#D4A853]">
                  {reconstructionAttempt.correctCount}/{reconstructionAttempt.totalCount}
                </strong>{' '}
                accurately sequenced
              </div>
            )}
          </div>

          {showCorrectSequence && (
            <div className="mt-4 rounded-xl border border-emerald-400/25 bg-[#080B12] p-5 space-y-2.5">
              <div className="font-mono-archive text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
                Correct Sourced Chronological Sequence
              </div>
              {sortedEvents.map((ev, idx) => (
                <div
                  key={`corr-${ev.id}`}
                  className="flex flex-wrap items-baseline justify-between gap-2 border-b border-white/8 pb-2 text-xs last:border-none"
                >
                  <span className="text-white">
                    <strong className="font-mono-archive text-[#D4A853] mr-2">
                      {idx + 1}. [{ev.yearLabel}]
                    </strong>
                    {ev.title}
                  </span>
                  <span className="font-mono-archive text-[10px] text-[#9AA5BE]">
                    {ev.associatedRecord ?? 'Archive Chronology'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
