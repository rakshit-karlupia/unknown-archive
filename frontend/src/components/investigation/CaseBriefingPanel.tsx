import {
  ArrowRight,
  Calendar,
  Compass,
  FileSearch,
  Lock,
  MapPin,
  ShieldAlert,
  SlidersHorizontal,
} from 'lucide-react';
import { EvidenceBadge } from '../EvidenceBadge';
import type { CategoryInfo, MysteryInvestigation } from '../../types/archive';
import type { DifficultyLevel, InvestigationSectionId } from '../../types/investigation';

interface CaseBriefingPanelProps {
  mystery: MysteryInvestigation;
  category?: CategoryInfo;
  evidenceCount: number;
  sourceCount: number;
  difficulty: DifficultyLevel;
  onChangeDifficulty: (level: DifficultyLevel) => void;
  onStartInvestigation: (section: InvestigationSectionId) => void;
  verdictSubmitted: boolean;
}

const DIFFICULTY_META: {
  id: DifficultyLevel;
  label: string;
  subtitle: string;
  details: string[];
}[] = [
  {
    id: 'beginner',
    label: 'Beginner',
    subtitle: 'Guided Inquiry',
    details: [
      'Up to 3 hint levels available',
      'Focused evidence & source subset',
      'Clear methodological prompts',
    ],
  },
  {
    id: 'intermediate',
    label: 'Intermediate',
    subtitle: 'Standard Analyst',
    details: [
      'Up to 2 hint levels available',
      'Full evidence & indexed sources',
      'Full theory comparison & timeline',
    ],
  },
  {
    id: 'expert',
    label: 'Expert',
    subtitle: 'Lead Forensic Desk',
    details: [
      'Minimal guidance (1 hint level)',
      'Complete dossier + unresolved gaps',
      'Full chronological reconstruction',
    ],
  },
];

export function CaseBriefingPanel({
  mystery,
  category,
  evidenceCount,
  sourceCount,
  difficulty,
  onChangeDifficulty,
  onStartInvestigation,
  verdictSubmitted,
}: CaseBriefingPanelProps) {
  return (
    <div className="space-y-6">
      {/* Main Case Briefing Header */}
      <section className="rounded-xl border border-white/12 bg-[#0F1420] p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="font-mono-archive rounded border border-[#D4A853]/35 bg-[#080B12] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-[#D4A853]">
                CASE BRIEFING // {mystery.slug.toUpperCase()}
              </span>
              {category && (
                <span className="font-mono-archive text-[11px] uppercase tracking-wider text-[#6C9EFF]">
                  {category.number}. {category.name}
                </span>
              )}
              <EvidenceBadge status={mystery.evidenceStatus} />
            </div>

            <h2 className="mt-4 font-editorial text-3xl font-semibold text-white sm:text-4xl">
              {mystery.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#CBD5E1]">{mystery.subtitle}</p>
          </div>

          <div className="w-full sm:w-56 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-[#080B12]">
            <img
              src={mystery.heroImage}
              alt={mystery.imageAlt}
              className="h-36 w-full object-cover"
            />
            <div className="px-3 py-2 font-mono-archive text-[10px] text-[#9AA5BE]">
              EXHIBIT 00 // PRIMARY VISUAL
            </div>
          </div>
        </div>

        {/* Metadata Strip */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-white/8 bg-[#080B12] p-3.5">
            <div className="font-mono-archive flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[#9AA5BE]">
              <MapPin className="h-3.5 w-3.5 text-[#D4A853]" aria-hidden="true" />
              Location
            </div>
            <div className="mt-1 text-xs font-medium text-white">{mystery.locationName}</div>
            <div className="font-mono-archive mt-0.5 text-[10px] text-[#68748F]">
              {mystery.coordinates.precisionLabel}
            </div>
          </div>

          <div className="rounded-lg border border-white/8 bg-[#080B12] p-3.5">
            <div className="font-mono-archive flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[#9AA5BE]">
              <Calendar className="h-3.5 w-3.5 text-[#6C9EFF]" aria-hidden="true" />
              Documented Period
            </div>
            <div className="mt-1 text-xs font-medium text-white">{mystery.overview.when}</div>
          </div>

          <div className="rounded-lg border border-white/8 bg-[#080B12] p-3.5">
            <div className="font-mono-archive flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[#9AA5BE]">
              <FileSearch className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
              Available Evidence
            </div>
            <div className="mt-1 text-xs font-medium text-white">
              {evidenceCount} Board Exhibits · {sourceCount} Sources
            </div>
            <div className="font-mono-archive mt-0.5 text-[10px] text-[#68748F]">
              {mystery.timeline.length} Timeline Milestones
            </div>
          </div>

          <div className="rounded-lg border border-white/8 bg-[#080B12] p-3.5">
            <div className="font-mono-archive flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[#9AA5BE]">
              <ShieldAlert className="h-3.5 w-3.5 text-[#E5B66A]" aria-hidden="true" />
              Final Assessment
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-[#E5B66A]">
              <Lock className="h-3.5 w-3.5" aria-hidden="true" />
              {verdictSubmitted ? 'Unsealed in Final Verdict' : 'Sealed Until Verdict'}
            </div>
            <div className="font-mono-archive mt-0.5 text-[10px] text-[#68748F]">
              Investigate independently first
            </div>
          </div>
        </div>
      </section>

      {/* Historical Background & Investigation Objective */}
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-white/10 bg-[#0F1420] p-6">
          <span className="font-mono-archive text-[10px] font-semibold uppercase tracking-widest text-[#6C9EFF]">
            Historical Background
          </span>
          <h3 className="mt-1 font-editorial text-2xl font-semibold text-white">
            Case Context &amp; Setting
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-[#D8E0F4]">{mystery.overview.what}</p>
          <p className="mt-3 text-sm leading-relaxed text-[#9AA5BE]">{mystery.overview.narrative}</p>
        </section>

        <section className="rounded-xl border border-white/10 bg-[#0F1420] p-6">
          <span className="font-mono-archive text-[10px] font-semibold uppercase tracking-widest text-[#D4A853]">
            Investigation Objective
          </span>
          <h3 className="mt-1 font-editorial text-2xl font-semibold text-white">
            Key Questions to Resolve
          </h3>
          <p className="mt-2 text-xs text-[#9AA5BE]">
            Examine primary records, reconstruct the chronological sequence, and weigh competing
            explanations against contradicting evidence before submitting your final verdict.
          </p>
          <ul className="mt-4 space-y-2.5">
            {mystery.whyMysterious.map((q, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 rounded-lg border border-white/8 bg-[#080B12] p-3 text-xs leading-relaxed text-[#E2E8F0]"
              >
                <Compass className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#D4A853]" aria-hidden="true" />
                <span>{q}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Difficulty Selector */}
      <section className="rounded-xl border border-white/10 bg-[#0F1420] p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <span className="font-mono-archive inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-[#D4A853]">
              <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
              Investigation Difficulty
            </span>
            <h3 className="mt-1 font-editorial text-2xl font-semibold text-white">
              Select Analytical Mode
            </h3>
          </div>
          <button
            type="button"
            onClick={() => onStartInvestigation('board')}
            className="inline-flex items-center gap-2 rounded-lg bg-[#D4A853] px-5 py-2.5 text-xs font-semibold text-[#080B12] hover:bg-[#e3ba68] transition-colors"
          >
            Enter Evidence Board
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {DIFFICULTY_META.map((lvl) => {
            const active = difficulty === lvl.id;
            return (
              <button
                key={lvl.id}
                type="button"
                onClick={() => onChangeDifficulty(lvl.id)}
                className={`rounded-xl border p-4 text-left transition-all ${
                  active
                    ? 'border-[#D4A853] bg-[#151C2C] shadow-lg'
                    : 'border-white/10 bg-[#080B12] hover:border-white/25'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-editorial text-xl font-semibold text-white">
                    {lvl.label}
                  </span>
                  <span
                    className={`font-mono-archive rounded px-2 py-0.5 text-[10px] font-semibold uppercase ${
                      active
                        ? 'bg-[#D4A853]/20 text-[#D4A853]'
                        : 'bg-white/5 text-[#9AA5BE]'
                    }`}
                  >
                    {lvl.subtitle}
                  </span>
                </div>
                <ul className="mt-3 space-y-1.5 text-xs text-[#9AA5BE]">
                  {lvl.details.map((d) => (
                    <li key={d} className="flex items-center gap-2">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          active ? 'bg-[#D4A853]' : 'bg-[#68748F]'
                        }`}
                      />
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
