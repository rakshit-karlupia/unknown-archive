import {
  BookMarked,
  Calendar,
  Download,
  FileSearch,
  Info,
  Plus,
  Trash2,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import type { TimelineEvent } from '../../types/archive';
import type {
  NotebookEntry,
  NotebookEntryCategory,
  UnifiedEvidenceCard,
} from '../../types/investigation';

interface PersonalNotebookPanelProps {
  caseTitle: string;
  entries: NotebookEntry[];
  evidenceCards: UnifiedEvidenceCard[];
  timeline: TimelineEvent[];
  onAddEntry: (entry: Omit<NotebookEntry, 'id' | 'createdAt'>) => void;
  onDeleteEntry: (id: string) => void;
  onJumpToEvidence: (cardId: string) => void;
  onJumpToTimeline: (eventId: string) => void;
}

const CATEGORY_META: Record<
  NotebookEntryCategory,
  { label: string; badgeClass: string }
> = {
  observation: {
    label: 'Observation',
    badgeClass: 'border-[#6C9EFF]/40 bg-[#6C9EFF]/10 text-[#6C9EFF]',
  },
  discovery: {
    label: 'Discovery',
    badgeClass: 'border-emerald-400/40 bg-emerald-500/10 text-emerald-300',
  },
  question: {
    label: 'Open Question',
    badgeClass: 'border-rose-400/40 bg-rose-500/10 text-rose-300',
  },
  theory: {
    label: 'Working Theory',
    badgeClass: 'border-[#D4A853]/40 bg-[#D4A853]/10 text-[#D4A853]',
  },
  reference: {
    label: 'Evidence Ref',
    badgeClass: 'border-white/20 bg-white/5 text-[#CBD5E1]',
  },
};

export function PersonalNotebookPanel({
  caseTitle,
  entries,
  evidenceCards,
  timeline,
  onAddEntry,
  onDeleteEntry,
  onJumpToEvidence,
  onJumpToTimeline,
}: PersonalNotebookPanelProps) {
  const [category, setCategory] = useState<NotebookEntryCategory>('observation');
  const [content, setContent] = useState('');
  const [linkedEvidenceIds, setLinkedEvidenceIds] = useState<string[]>([]);
  const [linkedTimelineIds, setLinkedTimelineIds] = useState<string[]>([]);
  const [filterCat, setFilterCat] = useState<'all' | NotebookEntryCategory>('all');

  const filteredEntries = useMemo(
    () => (filterCat === 'all' ? entries : entries.filter((e) => e.category === filterCat)),
    [entries, filterCat]
  );

  const toggleEv = (id: string) => {
    setLinkedEvidenceIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleTl = (id: string) => {
    setLinkedTimelineIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    onAddEntry({
      category,
      content: content.trim(),
      linkedEvidenceIds,
      linkedTimelineIds,
    });
    setContent('');
    setLinkedEvidenceIds([]);
    setLinkedTimelineIds([]);
  };

  const handleExport = () => {
    const lines = [
      `# Unknown Archive — Investigator Notebook`,
      `Case: ${caseTitle}`,
      `Exported: ${new Date().toLocaleString()}`,
      '',
      ...entries.map((entry) => {
        const evNames = entry.linkedEvidenceIds
          .map((id) => evidenceCards.find((c) => c.id === id)?.title)
          .filter(Boolean)
          .join(', ');
        const tlNames = entry.linkedTimelineIds
          .map((id) => timeline.find((t) => t.id === id)?.title)
          .filter(Boolean)
          .join(', ');
        return [
          `## [${CATEGORY_META[entry.category].label}] ${new Date(entry.createdAt).toLocaleString()}`,
          entry.content,
          evNames ? `Linked Evidence: ${evNames}` : '',
          tlNames ? `Linked Timeline: ${tlNames}` : '',
          '',
        ]
          .filter(Boolean)
          .join('\n');
      }),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notebook-${caseTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      {/* Left: Note Composer */}
      <form
        onSubmit={handleSubmit}
        className="lg:col-span-5 rounded-xl border border-white/10 bg-[#0F1420] p-6 space-y-4 h-fit"
      >
        <div>
          <span className="font-mono-archive text-[10px] font-semibold uppercase tracking-widest text-[#D4A853]">
            Case Field Log
          </span>
          <h3 className="mt-1 font-editorial text-2xl font-semibold text-white">
            Record Entry
          </h3>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(CATEGORY_META) as NotebookEntryCategory[]).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                category === cat
                  ? CATEGORY_META[cat].badgeClass
                  : 'border-white/10 bg-[#080B12] text-[#9AA5BE] hover:text-white'
              }`}
            >
              {CATEGORY_META[cat].label}
            </button>
          ))}
        </div>

        <div>
          <label
            htmlFor="notebook-content"
            className="font-mono-archive block text-[10px] uppercase tracking-wider text-[#9AA5BE] mb-1.5"
          >
            Notes / Observations
          </label>
          <textarea
            id="notebook-content"
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write observations, unresolved anomalies, or cross-references..."
            className="w-full rounded-lg border border-white/12 bg-[#080B12] p-3 text-sm text-white placeholder-[#68748F] focus:border-[#D4A853] focus:outline-none"
          />
        </div>

        <div>
          <div className="font-mono-archive text-[10px] uppercase tracking-wider text-[#9AA5BE] mb-1.5">
            Attach Evidence References
          </div>
          <div className="flex max-h-28 flex-wrap gap-1.5 overflow-y-auto pr-1">
            {evidenceCards.map((card) => {
              const selected = linkedEvidenceIds.includes(card.id);
              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => toggleEv(card.id)}
                  className={`rounded border px-2 py-1 text-[11px] transition-colors ${
                    selected
                      ? 'border-[#D4A853] bg-[#D4A853]/15 text-[#D4A853]'
                      : 'border-white/10 bg-[#080B12] text-[#9AA5BE] hover:text-white'
                  }`}
                >
                  {card.title}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div className="font-mono-archive text-[10px] uppercase tracking-wider text-[#9AA5BE] mb-1.5">
            Attach Timeline Events
          </div>
          <div className="flex max-h-28 flex-wrap gap-1.5 overflow-y-auto pr-1">
            {timeline.map((ev) => {
              const selected = linkedTimelineIds.includes(ev.id);
              return (
                <button
                  key={ev.id}
                  type="button"
                  onClick={() => toggleTl(ev.id)}
                  className={`rounded border px-2 py-1 text-[11px] transition-colors ${
                    selected
                      ? 'border-[#6C9EFF] bg-[#6C9EFF]/15 text-[#6C9EFF]'
                      : 'border-white/10 bg-[#080B12] text-[#9AA5BE] hover:text-white'
                  }`}
                >
                  {ev.yearLabel}: {ev.title}
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="submit"
          disabled={!content.trim()}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#D4A853] px-4 py-2.5 text-xs font-semibold text-[#080B12] hover:bg-[#e3ba68] disabled:opacity-40"
        >
          <Plus className="h-4 w-4" />
          Save Notebook Entry
        </button>

        <div className="flex items-start gap-2 rounded-lg border border-white/8 bg-[#080B12] p-3 text-[11px] text-[#9AA5BE]">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#6C9EFF]" />
          <span>
            Saved locally in your browser&apos;s storage for this device. No cross-device cloud
            sync is active.
          </span>
        </div>
      </form>

      {/* Right: Saved Entries */}
      <div className="lg:col-span-7 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#0F1420] p-4">
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setFilterCat('all')}
              className={`rounded-md border px-2.5 py-1 text-xs ${
                filterCat === 'all'
                  ? 'border-[#D4A853] bg-[#D4A853]/15 text-[#D4A853]'
                  : 'border-white/10 bg-[#080B12] text-[#9AA5BE]'
              }`}
            >
              All ({entries.length})
            </button>
            {(Object.keys(CATEGORY_META) as NotebookEntryCategory[]).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFilterCat(cat)}
                className={`rounded-md border px-2.5 py-1 text-xs ${
                  filterCat === cat
                    ? CATEGORY_META[cat].badgeClass
                    : 'border-white/10 bg-[#080B12] text-[#9AA5BE]'
                }`}
              >
                {CATEGORY_META[cat].label}
              </button>
            ))}
          </div>

          {entries.length > 0 && (
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/12 bg-[#080B12] px-3 py-1.5 text-xs text-[#CBD5E1] hover:border-[#D4A853]/50"
            >
              <Download className="h-3.5 w-3.5 text-[#D4A853]" />
              Export Notes
            </button>
          )}
        </div>

        {filteredEntries.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-[#0F1420] p-10 text-center">
            <BookMarked className="mx-auto h-8 w-8 text-[#68748F]" />
            <h4 className="mt-3 font-editorial text-xl text-white">Notebook Empty</h4>
            <p className="mt-1 text-xs text-[#9AA5BE]">
              Log observations, contradictions, or questions as you examine exhibits and timeline
              milestones.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredEntries.map((entry) => (
              <article
                key={entry.id}
                className="rounded-xl border border-white/10 bg-[#0F1420] p-5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`font-mono-archive rounded border px-2 py-0.5 text-[10px] font-semibold uppercase ${
                      CATEGORY_META[entry.category].badgeClass
                    }`}
                  >
                    {CATEGORY_META[entry.category].label}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono-archive text-[10px] text-[#68748F]">
                      {new Date(entry.createdAt).toLocaleString()}
                    </span>
                    <button
                      type="button"
                      onClick={() => onDeleteEntry(entry.id)}
                      aria-label="Delete notebook entry"
                      className="rounded p-1 text-[#68748F] hover:text-rose-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <p className="mt-3 text-sm leading-relaxed text-[#E2E8F0] whitespace-pre-line">
                  {entry.content}
                </p>

                {(entry.linkedEvidenceIds.length > 0 || entry.linkedTimelineIds.length > 0) && (
                  <div className="mt-3 flex flex-wrap gap-1.5 border-t border-white/8 pt-3">
                    {entry.linkedEvidenceIds.map((eid) => {
                      const card = evidenceCards.find((c) => c.id === eid);
                      if (!card) return null;
                      return (
                        <button
                          key={eid}
                          type="button"
                          onClick={() => onJumpToEvidence(eid)}
                          className="inline-flex items-center gap-1 rounded border border-[#D4A853]/35 bg-[#D4A853]/10 px-2 py-0.5 text-[11px] text-[#D4A853] hover:bg-[#D4A853]/20"
                        >
                          <FileSearch className="h-3 w-3" />
                          {card.title}
                        </button>
                      );
                    })}
                    {entry.linkedTimelineIds.map((tid) => {
                      const ev = timeline.find((t) => t.id === tid);
                      if (!ev) return null;
                      return (
                        <button
                          key={tid}
                          type="button"
                          onClick={() => onJumpToTimeline(tid)}
                          className="inline-flex items-center gap-1 rounded border border-[#6C9EFF]/35 bg-[#6C9EFF]/10 px-2 py-0.5 text-[11px] text-[#6C9EFF] hover:bg-[#6C9EFF]/20"
                        >
                          <Calendar className="h-3 w-3" />
                          {ev.yearLabel}: {ev.title}
                        </button>
                      );
                    })}
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
