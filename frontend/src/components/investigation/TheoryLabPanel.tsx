import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  FileSearch,
  FlaskConical,
  Plus,
  Scale,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { TheoryComparison } from '../TheoryComparison';
import type { CompetingTheory, TimelineEvent } from '../../types/archive';
import type { UnifiedEvidenceCard, UserTheory } from '../../types/investigation';

interface TheoryLabPanelProps {
  caseTitle: string;
  documentedTheories: CompetingTheory[];
  userTheories: UserTheory[];
  evaluatedTheoryIds: string[];
  evidenceCards: UnifiedEvidenceCard[];
  timeline: TimelineEvent[];
  onSaveUserTheory: (theory: Omit<UserTheory, 'id' | 'createdAt'>) => void;
  onDeleteUserTheory: (id: string) => void;
  onMarkTheoryEvaluated: (id: string) => void;
  onJumpToEvidence: (cardId: string) => void;
  onJumpToTimeline: (eventId: string) => void;
}

export function TheoryLabPanel({
  caseTitle,
  documentedTheories,
  userTheories,
  evaluatedTheoryIds,
  evidenceCards,
  timeline,
  onSaveUserTheory,
  onDeleteUserTheory,
  onMarkTheoryEvaluated,
  onJumpToEvidence,
  onJumpToTimeline,
}: TheoryLabPanelProps) {
  const [baseTheoryId, setBaseTheoryId] = useState<string>('custom');
  const [title, setTitle] = useState('');
  const [explanation, setExplanation] = useState('');
  const [supportingIds, setSupportingIds] = useState<string[]>([]);
  const [contradictingIds, setContradictingIds] = useState<string[]>([]);
  const [timelineIds, setTimelineIds] = useState<string[]>([]);
  const [confidence, setConfidence] = useState(50);

  const handleSelectBaseTheory = (id: string) => {
    setBaseTheoryId(id);
    if (id === 'custom') {
      setTitle('');
      setExplanation('');
      return;
    }
    const found = documentedTheories.find((t) => t.id === id);
    if (found) {
      onMarkTheoryEvaluated(found.id);
      setTitle(`Evaluation: ${found.name}`);
      setExplanation(found.claim);
    }
  };

  const toggleId = (list: string[], setList: (next: string[]) => void, id: string) => {
    setList(list.includes(id) ? list.filter((i) => i !== id) : [...list, id]);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !explanation.trim()) return;
    onSaveUserTheory({
      title: title.trim(),
      baseTheoryId: baseTheoryId === 'custom' ? undefined : baseTheoryId,
      explanation: explanation.trim(),
      supportingEvidenceIds: supportingIds,
      contradictingEvidenceIds: contradictingIds,
      timelineEventIds: timelineIds,
      confidence,
    });
    setTitle('');
    setExplanation('');
    setSupportingIds([]);
    setContradictingIds([]);
    setTimelineIds([]);
    setConfidence(50);
    setBaseTheoryId('custom');
  };

  return (
    <div className="space-y-8">
      {/* Theory Builder Workspace */}
      <div className="grid gap-6 lg:grid-cols-12">
        <form
          onSubmit={handleSave}
          className="lg:col-span-6 rounded-xl border border-white/10 bg-[#0F1420] p-6 space-y-4"
        >
          <div>
            <span className="font-mono-archive inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-[#D4A853]">
              <FlaskConical className="h-3.5 w-3.5" aria-hidden="true" />
              Theory Builder
            </span>
            <h3 className="mt-1 font-editorial text-2xl font-semibold text-white">
              Construct or Test an Explanation
            </h3>
            <p className="mt-1 text-xs text-[#9AA5BE]">
              Start from a documented hypothesis or draft your own. Personal theories are stored as
              unverified working hypotheses, never as established historical fact.
            </p>
          </div>

          <div>
            <label
              htmlFor="base-theory-select"
              className="font-mono-archive block text-[10px] uppercase tracking-wider text-[#9AA5BE] mb-1.5"
            >
              Starting Framework
            </label>
            <select
              id="base-theory-select"
              value={baseTheoryId}
              onChange={(e) => handleSelectBaseTheory(e.target.value)}
              className="w-full rounded-lg border border-white/15 bg-[#080B12] px-3 py-2 text-xs text-white focus:border-[#D4A853] focus:outline-none"
            >
              <option value="custom">Create Personal Theory from Scratch</option>
              {documentedTheories.map((t) => (
                <option key={t.id} value={t.id}>
                  Evaluate Existing: {t.name} ({t.scientificAcceptance})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="theory-title"
              className="font-mono-archive block text-[10px] uppercase tracking-wider text-[#9AA5BE] mb-1.5"
            >
              Theory Name
            </label>
            <input
              id="theory-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Localized Microclimate / Instrument Drift Hypothesis"
              className="w-full rounded-lg border border-white/15 bg-[#080B12] px-3 py-2 text-sm text-white placeholder-[#68748F] focus:border-[#D4A853] focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="theory-explanation"
              className="font-mono-archive block text-[10px] uppercase tracking-wider text-[#9AA5BE] mb-1.5"
            >
              Proposed Explanation
            </label>
            <textarea
              id="theory-explanation"
              rows={3}
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Explain how the evidence fits together and what remains uncertain..."
              className="w-full rounded-lg border border-white/15 bg-[#080B12] p-3 text-xs text-white placeholder-[#68748F] focus:border-[#D4A853] focus:outline-none"
            />
          </div>

          {/* Attach Supporting Evidence */}
          <div>
            <div className="font-mono-archive text-[10px] uppercase tracking-wider text-emerald-300 mb-1.5">
              Attach Supporting Evidence ({supportingIds.length})
            </div>
            <div className="flex max-h-24 flex-wrap gap-1.5 overflow-y-auto pr-1">
              {evidenceCards.map((c) => {
                const active = supportingIds.includes(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleId(supportingIds, setSupportingIds, c.id)}
                    className={`rounded border px-2 py-1 text-[11px] transition-colors ${
                      active
                        ? 'border-emerald-400/50 bg-emerald-500/15 text-emerald-200'
                        : 'border-white/10 bg-[#080B12] text-[#9AA5BE] hover:text-white'
                    }`}
                  >
                    {c.title}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Attach Contradicting Evidence */}
          <div>
            <div className="font-mono-archive text-[10px] uppercase tracking-wider text-rose-300 mb-1.5">
              Attach Contradicting Evidence ({contradictingIds.length})
            </div>
            <div className="flex max-h-24 flex-wrap gap-1.5 overflow-y-auto pr-1">
              {evidenceCards.map((c) => {
                const active = contradictingIds.includes(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleId(contradictingIds, setContradictingIds, c.id)}
                    className={`rounded border px-2 py-1 text-[11px] transition-colors ${
                      active
                        ? 'border-rose-400/50 bg-rose-500/15 text-rose-200'
                        : 'border-white/10 bg-[#080B12] text-[#9AA5BE] hover:text-white'
                    }`}
                  >
                    {c.title}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Attach Timeline Events */}
          <div>
            <div className="font-mono-archive text-[10px] uppercase tracking-wider text-[#6C9EFF] mb-1.5">
              Attach Timeline Events ({timelineIds.length})
            </div>
            <div className="flex max-h-24 flex-wrap gap-1.5 overflow-y-auto pr-1">
              {timeline.map((ev) => {
                const active = timelineIds.includes(ev.id);
                return (
                  <button
                    key={ev.id}
                    type="button"
                    onClick={() => toggleId(timelineIds, setTimelineIds, ev.id)}
                    className={`rounded border px-2 py-1 text-[11px] transition-colors ${
                      active
                        ? 'border-[#6C9EFF]/50 bg-[#6C9EFF]/15 text-[#6C9EFF]'
                        : 'border-white/10 bg-[#080B12] text-[#9AA5BE] hover:text-white'
                    }`}
                  >
                    {ev.yearLabel}: {ev.title}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Confidence Level */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-mono-archive text-[10px] uppercase tracking-wider text-[#9AA5BE]">
                Investigator Confidence Level
              </span>
              <span className="font-mono-archive font-semibold text-[#D4A853]">{confidence}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={confidence}
              onChange={(e) => setConfidence(Number(e.target.value))}
              className="w-full accent-[#D4A853]"
            />
          </div>

          <button
            type="submit"
            disabled={!title.trim() || !explanation.trim()}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#D4A853] px-4 py-2.5 text-xs font-semibold text-[#080B12] hover:bg-[#e3ba68] disabled:opacity-40"
          >
            <Plus className="h-4 w-4" />
            Save Investigator Theory
          </button>
        </form>

        {/* Saved Investigator Theories */}
        <div className="lg:col-span-6 space-y-4">
          <div className="rounded-xl border border-white/10 bg-[#0F1420] p-5">
            <div className="flex items-center justify-between gap-2">
              <div>
                <span className="font-mono-archive text-[10px] font-semibold uppercase tracking-widest text-[#6C9EFF]">
                  Investigator Hypotheses
                </span>
                <h3 className="font-editorial text-2xl font-semibold text-white">
                  Your Working Theories ({userTheories.length})
                </h3>
              </div>
              <span className="font-mono-archive text-[10px] text-[#9AA5BE]">
                Evaluated Existing: {evaluatedTheoryIds.length}/{documentedTheories.length}
              </span>
            </div>

            {userTheories.length === 0 ? (
              <div className="mt-4 rounded-lg border border-white/8 bg-[#080B12] p-6 text-center text-xs text-[#9AA5BE]">
                No personal hypotheses saved yet. Select an existing theory or build your own on the
                left to compare evidence weights.
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {userTheories.map((ut) => (
                  <article
                    key={ut.id}
                    className="rounded-xl border border-[#D4A853]/30 bg-[#080B12] p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-mono-archive inline-flex items-center gap-1 rounded border border-[#D4A853]/35 bg-[#D4A853]/10 px-2 py-0.5 text-[9px] font-semibold uppercase text-[#D4A853]">
                          <AlertTriangle className="h-2.5 w-2.5" />
                          Investigator Hypothesis (Unverified)
                        </span>
                        <h4 className="mt-1.5 font-editorial text-xl font-semibold text-white">
                          {ut.title}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono-archive rounded bg-white/5 px-2 py-0.5 text-[10px] text-[#CBD5E1]">
                          {ut.confidence}% conf.
                        </span>
                        <button
                          type="button"
                          onClick={() => onDeleteUserTheory(ut.id)}
                          aria-label="Delete theory"
                          className="rounded p-1 text-[#68748F] hover:text-rose-400"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="mt-2 text-xs leading-relaxed text-[#CBD5E1]">{ut.explanation}</p>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {ut.supportingEvidenceIds.map((eid) => {
                        const card = evidenceCards.find((c) => c.id === eid);
                        if (!card) return null;
                        return (
                          <button
                            key={`sup-${eid}`}
                            type="button"
                            onClick={() => onJumpToEvidence(eid)}
                            className="inline-flex items-center gap-1 rounded border border-emerald-400/35 bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-300"
                          >
                            <FileSearch className="h-2.5 w-2.5" />
                            + {card.title}
                          </button>
                        );
                      })}
                      {ut.contradictingEvidenceIds.map((eid) => {
                        const card = evidenceCards.find((c) => c.id === eid);
                        if (!card) return null;
                        return (
                          <button
                            key={`con-${eid}`}
                            type="button"
                            onClick={() => onJumpToEvidence(eid)}
                            className="inline-flex items-center gap-1 rounded border border-rose-400/35 bg-rose-500/10 px-2 py-0.5 text-[10px] text-rose-300"
                          >
                            <FileSearch className="h-2.5 w-2.5" />
                            − {card.title}
                          </button>
                        );
                      })}
                      {ut.timelineEventIds.map((tid) => {
                        const ev = timeline.find((t) => t.id === tid);
                        if (!ev) return null;
                        return (
                          <button
                            key={`tl-${tid}`}
                            type="button"
                            onClick={() => onJumpToTimeline(tid)}
                            className="inline-flex items-center gap-1 rounded border border-[#6C9EFF]/35 bg-[#6C9EFF]/10 px-2 py-0.5 text-[10px] text-[#6C9EFF]"
                          >
                            <Calendar className="h-2.5 w-2.5" />
                            {ev.yearLabel}
                          </button>
                        );
                      })}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          {/* Quick Mark Existing Theories Evaluated */}
          <div className="rounded-xl border border-white/10 bg-[#0F1420] p-5">
            <div className="font-mono-archive text-[10px] font-semibold uppercase tracking-widest text-[#9AA5BE] mb-3">
              Documented Theories Audit Checklist
            </div>
            <div className="space-y-2">
              {documentedTheories.map((t) => {
                const done = evaluatedTheoryIds.includes(t.id);
                return (
                  <div
                    key={t.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-white/8 bg-[#080B12] px-3 py-2 text-xs"
                  >
                    <span className="font-medium text-white">{t.name}</span>
                    <button
                      type="button"
                      onClick={() => onMarkTheoryEvaluated(t.id)}
                      className={`inline-flex items-center gap-1 rounded px-2.5 py-1 text-[11px] font-semibold ${
                        done
                          ? 'bg-emerald-500/15 text-emerald-300'
                          : 'border border-white/12 bg-[#0F1420] text-[#CBD5E1] hover:border-[#D4A853]/50'
                      }`}
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      {done ? 'Evaluated' : 'Mark Reviewed'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Documented Theory Comparison Matrix */}
      <section className="rounded-xl border border-white/10 bg-[#0F1420] p-6">
        <div className="mb-5 flex items-center gap-2">
          <Scale className="h-5 w-5 text-[#D4A853]" />
          <div>
            <span className="font-mono-archive text-[10px] font-semibold uppercase tracking-widest text-[#D4A853]">
              Comparative Matrix &amp; Evidence Audit
            </span>
            <h3 className="font-editorial text-2xl font-semibold text-white">
              Documented Theories — {caseTitle}
            </h3>
          </div>
        </div>
        <TheoryComparison theories={documentedTheories} />
      </section>
    </div>
  );
}
