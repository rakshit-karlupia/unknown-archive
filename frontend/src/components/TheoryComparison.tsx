import { AlertTriangle, BookOpen, Check, Columns3, ExternalLink, Layers, X } from 'lucide-react';
import { useState } from 'react';
import { getSourcesByIds } from '../data';
import type { CompetingTheory } from '../types/archive';

interface TheoryComparisonProps {
  theories: CompetingTheory[];
}

const ACCEPTANCE_STYLES: Record<CompetingTheory['scientificAcceptance'], string> = {
  'Strong Scientific Support': 'border-emerald-400/35 bg-emerald-500/10 text-emerald-300',
  'Plausible / Active Hypothesis': 'border-[#6C9EFF]/40 bg-[#6C9EFF]/10 text-[#6C9EFF]',
  'Contested / Inconclusive': 'border-[#D4A853]/40 bg-[#D4A853]/10 text-[#D4A853]',
  'Largely Refuted / Unsupported': 'border-rose-400/35 bg-rose-500/10 text-rose-300',
};

export function TheoryComparison({ theories }: TheoryComparisonProps) {
  const [viewMode, setViewMode] = useState<'cards' | 'matrix'>('cards');
  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    theories.slice(0, 2).map((t) => t.id)
  );

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const comparedTheories =
    selectedIds.length > 0
      ? theories.filter((t) => selectedIds.includes(t.id))
      : theories.slice(0, 2);

  return (
    <div className="space-y-4">
      {theories.length > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 bg-[#080B12] px-4 py-2.5">
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#9AA5BE]">
            <span className="font-mono-archive uppercase tracking-wider text-[#D4A853]">
              Compare Theories:
            </span>
            {theories.map((t) => {
              const active = selectedIds.includes(t.id);
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => toggleSelect(t.id)}
                  className={`rounded-md border px-2.5 py-1 text-xs transition-colors ${
                    active
                      ? 'border-[#D4A853]/50 bg-[#D4A853]/12 text-white'
                      : 'border-white/10 bg-[#0F1420] text-[#9AA5BE] hover:text-white'
                  }`}
                >
                  {t.name}
                </button>
              );
            })}
          </div>

          <div className="inline-flex rounded-md border border-white/10 bg-[#0F1420] p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1 transition-colors ${
                viewMode === 'cards' ? 'bg-[#1A2234] text-[#D4A853]' : 'text-[#9AA5BE]'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              Cards
            </button>
            <button
              type="button"
              onClick={() => setViewMode('matrix')}
              className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1 transition-colors ${
                viewMode === 'matrix' ? 'bg-[#1A2234] text-[#D4A853]' : 'text-[#9AA5BE]'
              }`}
            >
              <Columns3 className="h-3.5 w-3.5" />
              Side-by-Side
            </button>
          </div>
        </div>
      )}

      {viewMode === 'matrix' && comparedTheories.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#080B12]">
          <table className="w-full min-w-[640px] border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-[#0F1420]">
                <th className="font-mono-archive w-40 p-4 text-[11px] uppercase tracking-wider text-[#9AA5BE]">
                  Dimension
                </th>
                {comparedTheories.map((t) => (
                  <th key={t.id} className="p-4 align-top">
                    <div className="font-editorial text-lg font-semibold text-white">{t.name}</div>
                    <span
                      className={`font-mono-archive mt-1.5 inline-block rounded border px-2 py-0.5 text-[10px] font-semibold ${
                        ACCEPTANCE_STYLES[t.scientificAcceptance]
                      }`}
                    >
                      {t.scientificAcceptance}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/8">
              <tr>
                <td className="font-mono-archive p-4 align-top font-semibold uppercase tracking-wider text-[#D4A853]">
                  Core Claim
                </td>
                {comparedTheories.map((t) => (
                  <td key={t.id} className="p-4 align-top leading-relaxed text-[#CBD5E1]">
                    {t.claim}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="font-mono-archive p-4 align-top font-semibold uppercase tracking-wider text-emerald-300">
                  Supporting Evidence
                </td>
                {comparedTheories.map((t) => (
                  <td key={t.id} className="p-4 align-top">
                    {t.supportingEvidence.length === 0 ? (
                      <span className="italic text-[#68748F]">None documented</span>
                    ) : (
                      <ul className="space-y-1.5 text-[#CBD5E1]">
                        {t.supportingEvidence.map((item, idx) => (
                          <li key={idx} className="flex gap-2">
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="font-mono-archive p-4 align-top font-semibold uppercase tracking-wider text-rose-300">
                  Contradicting Evidence
                </td>
                {comparedTheories.map((t) => (
                  <td key={t.id} className="p-4 align-top">
                    {t.contradictingEvidence.length === 0 ? (
                      <span className="italic text-[#68748F]">None recorded</span>
                    ) : (
                      <ul className="space-y-1.5 text-[#CBD5E1]">
                        {t.contradictingEvidence.map((item, idx) => (
                          <li key={idx} className="flex gap-2">
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="font-mono-archive p-4 align-top font-semibold uppercase tracking-wider text-[#9AA5BE]">
                  Limitations
                </td>
                {comparedTheories.map((t) => (
                  <td key={t.id} className="p-4 align-top leading-relaxed text-[#9AA5BE]">
                    {t.scientificLimitations}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {theories.map((theory) => {
            const refs = getSourcesByIds(theory.sourceIds);
            return (
              <article
                key={theory.id}
                className="flex flex-col justify-between rounded-xl border border-white/10 bg-[#080B12] p-6"
              >
                <div>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h4 className="font-editorial text-2xl font-semibold text-white">
                      {theory.name}
                    </h4>
                    <span
                      className={`font-mono-archive rounded border px-2.5 py-0.5 text-[10px] font-semibold tracking-wide ${
                        ACCEPTANCE_STYLES[theory.scientificAcceptance]
                      }`}
                    >
                      {theory.scientificAcceptance}
                    </span>
                  </div>

                  <p className="mt-3 text-sm leading-relaxed text-[#CBD5E1]">{theory.claim}</p>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-lg border border-emerald-400/20 bg-emerald-950/15 p-4">
                      <div className="font-mono-archive flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-emerald-300">
                        <Check className="h-3.5 w-3.5" aria-hidden="true" />
                        Supporting
                      </div>
                      {theory.supportingEvidence.length === 0 ? (
                        <p className="mt-2 text-xs italic text-[#68748F]">
                          No verified empirical evidence supports this claim.
                        </p>
                      ) : (
                        <ul className="mt-2 space-y-2 text-xs leading-relaxed text-[#CBD5E1]">
                          {theory.supportingEvidence.map((item, idx) => (
                            <li key={idx} className="flex gap-2">
                              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="rounded-lg border border-rose-400/20 bg-rose-950/15 p-4">
                      <div className="font-mono-archive flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-rose-300">
                        <X className="h-3.5 w-3.5" aria-hidden="true" />
                        Contradicting
                      </div>
                      {theory.contradictingEvidence.length === 0 ? (
                        <p className="mt-2 text-xs italic text-[#68748F]">
                          No major contradicting evidence recorded yet.
                        </p>
                      ) : (
                        <ul className="mt-2 space-y-2 text-xs leading-relaxed text-[#CBD5E1]">
                          {theory.contradictingEvidence.map((item, idx) => (
                            <li key={idx} className="flex gap-2">
                              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 rounded-lg border border-white/8 bg-[#0F1420] p-3.5 text-xs text-[#9AA5BE]">
                    <span className="inline-flex items-center gap-1.5 font-semibold text-[#D4A853]">
                      <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                      Scientific Limitations:
                    </span>{' '}
                    {theory.scientificLimitations}
                  </div>
                </div>

                {refs.length > 0 && (
                  <div className="mt-5 border-t border-white/8 pt-4">
                    <div className="font-mono-archive mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#9AA5BE]">
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
                          className="inline-flex items-center gap-1 rounded-md border border-white/12 bg-[#0F1420] px-2.5 py-1 text-xs text-[#6C9EFF] hover:border-[#D4A853]/50 hover:text-white transition-colors"
                        >
                          <span className="max-w-[210px] truncate">
                            {src.institutionTag}: {src.title}
                          </span>
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
      )}
    </div>
  );
}
