import {
  AlertTriangle,
  Award,
  CheckCircle2,
  FileCheck2,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import { useState } from 'react';
import { EvidenceBadge } from '../EvidenceBadge';
import type { MysteryInvestigation } from '../../types/archive';
import type {
  FinalVerdictSubmission,
  InvestigationScoreSummary,
  UnifiedEvidenceCard,
} from '../../types/investigation';

interface FinalVerdictPanelProps {
  mystery: MysteryInvestigation;
  evidenceCards: UnifiedEvidenceCard[];
  existingVerdict?: FinalVerdictSubmission;
  scoreSummary: InvestigationScoreSummary;
  onSubmitVerdict: (verdict: FinalVerdictSubmission) => void;
}

export function FinalVerdictPanel({
  mystery,
  evidenceCards,
  existingVerdict,
  scoreSummary,
  onSubmitVerdict,
}: FinalVerdictPanelProps) {
  const [proposedExplanation, setProposedExplanation] = useState(
    existingVerdict?.proposedExplanation ?? ''
  );
  const [keySupportingIds, setKeySupportingIds] = useState<string[]>(
    existingVerdict?.keySupportingEvidenceIds ?? []
  );
  const [contradictingIds, setContradictingIds] = useState<string[]>(
    existingVerdict?.contradictingEvidenceIds ?? []
  );
  const [unansweredQuestions, setUnansweredQuestions] = useState(
    existingVerdict?.unansweredQuestions ?? ''
  );
  const [confidence, setConfidence] = useState(existingVerdict?.confidence ?? 55);
  const [writtenReasoning, setWrittenReasoning] = useState(
    existingVerdict?.writtenReasoning ?? ''
  );

  const toggleId = (list: string[], setList: (next: string[]) => void, id: string) => {
    setList(list.includes(id) ? list.filter((i) => i !== id) : [...list, id]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposedExplanation.trim() || !writtenReasoning.trim()) return;
    onSubmitVerdict({
      proposedExplanation: proposedExplanation.trim(),
      keySupportingEvidenceIds: keySupportingIds,
      contradictingEvidenceIds: contradictingIds,
      unansweredQuestions: unansweredQuestions.trim(),
      confidence,
      writtenReasoning: writtenReasoning.trim(),
      submittedAt: new Date().toISOString(),
    });
  };

  const isUnresolved = mystery.evidenceStatus !== 'VERIFIED';

  return (
    <div className="space-y-8">
      {/* Submission Form */}
      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-white/12 bg-[#0F1420] p-6 sm:p-8 space-y-5"
      >
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <span className="font-mono-archive inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-[#D4A853]">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Final Case Assessment
            </span>
            <h2 className="mt-1 font-editorial text-3xl font-semibold text-white">
              Submit Your Investigation Verdict
            </h2>
            <p className="mt-1 text-xs text-[#9AA5BE]">
              Your score reflects methodological rigor — primary sources examined, contradictions
              identified, and uncertainty acknowledged — not guessing a single predetermined answer.
            </p>
          </div>
          {existingVerdict && (
            <span className="font-mono-archive inline-flex items-center gap-1.5 rounded-md border border-emerald-400/35 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300">
              <CheckCircle2 className="h-4 w-4" />
              Verdict Recorded
            </span>
          )}
        </div>

        <div>
          <label
            htmlFor="verdict-explanation"
            className="font-mono-archive block text-[10px] uppercase tracking-wider text-[#9AA5BE] mb-1.5"
          >
            1. Proposed Explanation
          </label>
          <input
            id="verdict-explanation"
            type="text"
            required
            value={proposedExplanation}
            onChange={(e) => setProposedExplanation(e.target.value)}
            placeholder="Summarize your strongest evidence-backed conclusion..."
            className="w-full rounded-lg border border-white/15 bg-[#080B12] px-3.5 py-2.5 text-sm text-white placeholder-[#68748F] focus:border-[#D4A853] focus:outline-none"
          />
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <div className="font-mono-archive text-[10px] uppercase tracking-wider text-emerald-300 mb-2">
              2. Most Important Supporting Evidence ({keySupportingIds.length})
            </div>
            <div className="flex max-h-36 flex-wrap gap-1.5 overflow-y-auto rounded-lg border border-white/8 bg-[#080B12] p-3">
              {evidenceCards.map((c) => {
                const active = keySupportingIds.includes(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleId(keySupportingIds, setKeySupportingIds, c.id)}
                    className={`rounded border px-2 py-1 text-[11px] text-left transition-colors ${
                      active
                        ? 'border-emerald-400/50 bg-emerald-500/15 text-emerald-200'
                        : 'border-white/10 bg-[#0F1420] text-[#9AA5BE] hover:text-white'
                    }`}
                  >
                    {c.title}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="font-mono-archive text-[10px] uppercase tracking-wider text-rose-300 mb-2">
              3. Contradicting or Limiting Evidence ({contradictingIds.length})
            </div>
            <div className="flex max-h-36 flex-wrap gap-1.5 overflow-y-auto rounded-lg border border-white/8 bg-[#080B12] p-3">
              {evidenceCards.map((c) => {
                const active = contradictingIds.includes(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleId(contradictingIds, setContradictingIds, c.id)}
                    className={`rounded border px-2 py-1 text-[11px] text-left transition-colors ${
                      active
                        ? 'border-rose-400/50 bg-rose-500/15 text-rose-200'
                        : 'border-white/10 bg-[#0F1420] text-[#9AA5BE] hover:text-white'
                    }`}
                  >
                    {c.title}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div>
          <label
            htmlFor="verdict-questions"
            className="font-mono-archive block text-[10px] uppercase tracking-wider text-[#9AA5BE] mb-1.5"
          >
            4. Remaining Unanswered Questions / Evidentiary Gaps
          </label>
          <textarea
            id="verdict-questions"
            rows={2}
            value={unansweredQuestions}
            onChange={(e) => setUnansweredQuestions(e.target.value)}
            placeholder="What facts cannot yet be established from available primary sources?"
            className="w-full rounded-lg border border-white/15 bg-[#080B12] p-3 text-xs text-white placeholder-[#68748F] focus:border-[#D4A853] focus:outline-none"
          />
        </div>

        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-mono-archive text-[10px] uppercase tracking-wider text-[#9AA5BE]">
              5. Confidence Level
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

        <div>
          <label
            htmlFor="verdict-reasoning"
            className="font-mono-archive block text-[10px] uppercase tracking-wider text-[#9AA5BE] mb-1.5"
          >
            6. Written Reasoning
          </label>
          <textarea
            id="verdict-reasoning"
            rows={4}
            required
            value={writtenReasoning}
            onChange={(e) => setWrittenReasoning(e.target.value)}
            placeholder="Synthesize why your supporting evidence outweighs alternatives and how you account for contradictions..."
            className="w-full rounded-lg border border-white/15 bg-[#080B12] p-3 text-sm text-white placeholder-[#68748F] focus:border-[#D4A853] focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={!proposedExplanation.trim() || !writtenReasoning.trim()}
          className="inline-flex items-center gap-2 rounded-lg bg-[#D4A853] px-6 py-3 text-xs font-semibold text-[#080B12] hover:bg-[#e3ba68] disabled:opacity-40"
        >
          <ShieldCheck className="h-4 w-4" />
          {existingVerdict ? 'Update Verdict & Refresh Audit' : 'Submit Verdict & Unseal Findings'}
        </button>
      </form>

      {/* Revealed Documented Findings & Transparent Score */}
      {existingVerdict && (
        <div className="space-y-6">
          {isUnresolved && (
            <div className="flex items-start gap-3 rounded-xl border border-[#D4A853]/40 bg-[#D4A853]/10 p-5">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#D4A853]" />
              <div>
                <h3 className="font-editorial text-xl font-semibold text-white">
                  Unresolved Historical Mystery — No Definitive Answer Established
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-[#F5E7CA]">
                  This case is classified as <strong>{mystery.evidenceStatus}</strong>. Primary
                  sources do not establish a single conclusive explanation; recognizing this
                  uncertainty is essential to rigorous historical and scientific analysis.
                </p>
              </div>
            </div>
          )}

          {/* Score Breakdown */}
          <section className="rounded-xl border border-white/12 bg-[#0F1420] p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <Award className="h-6 w-6 text-[#D4A853]" />
                <div>
                  <span className="font-mono-archive text-[10px] uppercase tracking-widest text-[#D4A853]">
                    Transparent Methodology Audit
                  </span>
                  <h3 className="font-editorial text-2xl font-semibold text-white">
                    {scoreSummary.rankLabel} — {scoreSummary.totalPoints} / {scoreSummary.maxPoints}{' '}
                    pts
                  </h3>
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {scoreSummary.items.map((item) => (
                <div
                  key={item.label}
                  className="rounded-lg border border-white/8 bg-[#080B12] p-3.5"
                >
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-medium text-white">{item.label}</span>
                    <span className="font-mono-archive font-semibold text-[#D4A853]">
                      {item.points}/{item.maxPoints}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-[#9AA5BE]">{item.detail}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Documented Archive Findings */}
          <section className="rounded-xl border border-white/12 bg-[#0F1420] p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="font-mono-archive text-[10px] font-semibold uppercase tracking-widest text-[#6C9EFF]">
                  Unsealed Case Assessment
                </span>
                <h3 className="mt-1 font-editorial text-2xl font-semibold text-white">
                  Documented Findings &amp; Strongest Explanations
                </h3>
              </div>
              <EvidenceBadge status={mystery.evidenceStatus} />
            </div>

            <div className="rounded-xl border border-white/10 bg-[#080B12] p-5 text-sm leading-relaxed text-[#E2E8F0]">
              <p className="font-semibold text-[#D4A853] mb-2">Archive Final Assessment</p>
              <p>{mystery.finalAssessment}</p>
              <p className="mt-3 text-xs text-[#9AA5BE]">{mystery.evidenceRationale}</p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="rounded-xl border border-emerald-400/20 bg-emerald-950/15 p-5">
                <div className="font-mono-archive mb-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-emerald-300">
                  <FileCheck2 className="h-4 w-4" />
                  Established Facts
                </div>
                <ul className="space-y-2 text-xs leading-relaxed text-[#CBD5E1]">
                  {mystery.whatWeKnow.map((fact, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                      <span>{fact}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-[#D4A853]/25 bg-[#080B12] p-5">
                <div className="font-mono-archive mb-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#D4A853]">
                  <ShieldAlert className="h-4 w-4" />
                  Documented Gaps &amp; Competing Explanations
                </div>
                <ul className="space-y-2 text-xs leading-relaxed text-[#F5E7CA]">
                  {mystery.whatRemainsUnknown.map((gap, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#D4A853]" />
                      <span>{gap}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
