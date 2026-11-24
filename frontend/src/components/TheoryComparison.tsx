import { AlertTriangle, BookOpen, Check, ExternalLink, X } from 'lucide-react';
import { getSourcesByIds } from '../data';
import type { CompetingTheory } from '../types/archive';

interface TheoryComparisonProps {
  theories: CompetingTheory[];
}

const ACCEPTANCE_STYLES: Record<CompetingTheory['scientificAcceptance'], string> = {
  'Strong Scientific Support': 'border-emerald-400/35 bg-emerald-500/10 text-emerald-300',
  'Plausible / Active Hypothesis': 'border-[#6C9EFF]/40 bg-[#6C9EFF]/10 text-[#6C9EFF]',
  'Contested / Inconclusive': 'border-[#E5B66A]/40 bg-[#E5B66A]/10 text-[#E5B66A]',
  'Largely Refuted / Unsupported': 'border-rose-400/35 bg-rose-500/10 text-rose-300',
};

export function TheoryComparison({ theories }: TheoryComparisonProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {theories.map((theory) => {
        const refs = getSourcesByIds(theory.sourceIds);
        return (
          <article
            key={theory.id}
            className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#0E1527] p-6"
          >
            <div>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h4 className="font-editorial text-2xl font-semibold text-white">
                  {theory.name}
                </h4>
                <span
                  className={`rounded-full border px-3 py-1 text-[11px] font-semibold tracking-wide ${
                    ACCEPTANCE_STYLES[theory.scientificAcceptance]
                  }`}
                >
                  {theory.scientificAcceptance}
                </span>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-[#D8E0F4]">{theory.claim}</p>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-emerald-400/20 bg-emerald-950/15 p-4">
                  <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-300">
                    <Check className="h-3.5 w-3.5" aria-hidden="true" />
                    Supporting Evidence
                  </div>
                  {theory.supportingEvidence.length === 0 ? (
                    <p className="mt-2 text-xs italic text-[#7D89A8]">
                      No verified empirical evidence supports this claim.
                    </p>
                  ) : (
                    <ul className="mt-2 space-y-2 text-xs leading-relaxed text-[#CBD6F0]">
                      {theory.supportingEvidence.map((item, idx) => (
                        <li key={idx} className="flex gap-2">
                          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="rounded-xl border border-rose-400/20 bg-rose-950/15 p-4">
                  <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-rose-300">
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                    Contradicting Evidence
                  </div>
                  {theory.contradictingEvidence.length === 0 ? (
                    <p className="mt-2 text-xs italic text-[#7D89A8]">
                      No major contradicting evidence recorded yet.
                    </p>
                  ) : (
                    <ul className="mt-2 space-y-2 text-xs leading-relaxed text-[#CBD6F0]">
                      {theory.contradictingEvidence.map((item, idx) => (
                        <li key={idx} className="flex gap-2">
                          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-white/8 bg-[#121A2B] p-3.5 text-xs text-[#A8B3CF]">
                <span className="inline-flex items-center gap-1.5 font-semibold text-[#E5B66A]">
                  <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                  Scientific Limitations:
                </span>{' '}
                {theory.scientificLimitations}
              </div>
            </div>

            {refs.length > 0 && (
              <div className="mt-5 border-t border-white/8 pt-4">
                <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#A8B3CF]">
                  <BookOpen className="h-3.5 w-3.5 text-[#6C9EFF]" aria-hidden="true" />
                  Source References
                </div>
                <div className="flex flex-wrap gap-2">
                  {refs.map((src) => (
                    <a
                      key={src.id}
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg border border-white/12 bg-[#121A2B] px-2.5 py-1 text-xs text-[#6C9EFF] hover:border-[#6C9EFF]/50 hover:text-white transition-colors"
                    >
                      <span className="max-w-[200px] truncate">{src.institutionTag}: {src.title}</span>
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
