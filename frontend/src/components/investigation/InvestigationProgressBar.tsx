import {
  ArrowRight,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Compass,
  FileSearch,
  GitBranch,
  Scale,
  ShieldCheck,
} from 'lucide-react';
import type {
  CaseProgressState,
  InvestigationScoreSummary,
  InvestigationSectionId,
} from '../../types/investigation';

interface InvestigationProgressBarProps {
  state: CaseProgressState;
  totalEvidence: number;
  totalDocuments: number;
  totalTimeline: number;
  totalTheories: number;
  scoreSummary: InvestigationScoreSummary;
  onNavigateSection: (section: InvestigationSectionId) => void;
}

export function InvestigationProgressBar({
  state,
  totalEvidence,
  totalDocuments,
  totalTimeline,
  totalTheories,
  scoreSummary,
  onNavigateSection,
}: InvestigationProgressBarProps) {
  const verdictDone = Boolean(state.verdict);
  const items: {
    label: string;
    value: string;
    done: boolean;
    icon: typeof FileSearch;
    target: InvestigationSectionId;
  }[] = [
    {
      label: 'Evidence Read',
      value: `${state.examinedEvidenceIds.length}/${totalEvidence}`,
      done: state.examinedEvidenceIds.length > 0,
      icon: FileSearch,
      target: 'board',
    },
    {
      label: 'Sources Opened',
      value: `${state.openedDocumentIds.length}/${totalDocuments}`,
      done: state.openedDocumentIds.length > 0,
      icon: BookOpen,
      target: 'board',
    },
    {
      label: 'Timeline Viewed',
      value: `${state.reviewedTimelineIds.length}/${totalTimeline}`,
      done: state.reviewedTimelineIds.length > 0,
      icon: Calendar,
      target: 'timeline',
    },
    {
      label: 'Clues Linked',
      value: `${state.connections.length}`,
      done: state.connections.length > 0,
      icon: GitBranch,
      target: 'board',
    },
    {
      label: 'Theories Tested',
      value: `${state.evaluatedTheoryIds.length + state.userTheories.length}/${Math.max(1, totalTheories)}`,
      done: state.evaluatedTheoryIds.length > 0 || state.userTheories.length > 0,
      icon: Scale,
      target: 'theories',
    },
    {
      label: 'Final Verdict',
      value: verdictDone ? 'Submitted' : 'Pending',
      done: verdictDone,
      icon: ShieldCheck,
      target: 'verdict',
    },
  ];

  const completedSteps = items.filter((i) => i.done).length;
  const pct = Math.round((completedSteps / items.length) * 100);

  const nextRecommendation: { text: string; cta: string; target: InvestigationSectionId } =
    state.examinedEvidenceIds.length === 0
      ? {
          text: 'Start by opening an exhibit on the Evidence Board to inspect primary findings.',
          cta: 'Inspect Evidence',
          target: 'board',
        }
      : state.connections.length === 0
      ? {
          text: 'Connect two related clues on the Evidence Board to map how they support or contradict.',
          cta: 'Connect Clues',
          target: 'board',
        }
      : state.reviewedTimelineIds.length === 0
      ? {
          text: 'Explore the Interactive Timeline or try Reconstruction Mode to verify chronology.',
          cta: 'Open Timeline',
          target: 'timeline',
        }
      : state.evaluatedTheoryIds.length === 0 && state.userTheories.length === 0
      ? {
          text: 'Compare competing explanations or build your own hypothesis in the Theory Lab.',
          cta: 'Open Theory Lab',
          target: 'theories',
        }
      : !verdictDone
      ? {
          text: 'Ready to conclude? Submit your evidence-backed reasoning in Final Verdict to unseal archive findings.',
          cta: 'Submit Verdict',
          target: 'verdict',
        }
      : {
          text: 'Case verdict recorded! Review your methodology score or explore related investigations below.',
          cta: 'Review Verdict',
          target: 'verdict',
        };

  return (
    <div className="rounded-xl border border-white/10 bg-[#0F1420] p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="font-mono-archive text-[10px] font-semibold uppercase tracking-widest text-[#D4A853]">
            Case Progress
          </span>
          <span className="font-mono-archive rounded border border-white/10 bg-[#080B12] px-2 py-0.5 text-[10px] text-[#CBD5E1]">
            {completedSteps}/{items.length} Steps ({pct}%)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Award className="h-4 w-4 text-[#D4A853]" aria-hidden="true" />
          <span className="font-mono-archive text-xs text-[#CBD5E1]">
            <strong className="text-[#D4A853]">{scoreSummary.totalPoints}</strong> /{' '}
            {scoreSummary.maxPoints} pts
          </span>
          <span className="font-mono-archive hidden sm:inline-block rounded bg-[#D4A853]/12 px-2 py-0.5 text-[10px] font-semibold text-[#D4A853]">
            {scoreSummary.rankLabel}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#080B12]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#6C9EFF] via-[#D4A853] to-emerald-400 transition-all duration-300"
          style={{ width: `${Math.max(4, pct)}%` }}
        />
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => onNavigateSection(item.target)}
              className={`flex items-center justify-between gap-2 rounded-lg border px-2.5 py-2 text-left transition-colors ${
                item.done
                  ? 'border-emerald-400/25 bg-emerald-950/15 text-white hover:border-emerald-400/45'
                  : 'border-white/8 bg-[#080B12] text-[#9AA5BE] hover:border-[#D4A853]/40 hover:text-white'
              }`}
            >
              <div className="min-w-0">
                <div className="truncate text-[10px] font-medium">{item.label}</div>
                <div className="font-mono-archive mt-0.5 text-xs font-semibold text-[#D4A853]">
                  {item.value}
                </div>
              </div>
              {item.done ? (
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" aria-hidden="true" />
              ) : (
                <Icon className="h-3.5 w-3.5 shrink-0 text-[#68748F]" aria-hidden="true" />
              )}
            </button>
          );
        })}
      </div>

      {/* Dynamic Next Step Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#D4A853]/25 bg-[#080B12] px-3.5 py-2.5 text-xs">
        <div className="flex items-center gap-2 text-[#CBD5E1]">
          <Compass className="h-4 w-4 shrink-0 text-[#D4A853]" aria-hidden="true" />
          <span>
            <strong className="text-white">Next Step:</strong> {nextRecommendation.text}
          </span>
        </div>
        <button
          type="button"
          onClick={() => onNavigateSection(nextRecommendation.target)}
          className="inline-flex items-center gap-1 rounded-md bg-[#D4A853]/15 px-3 py-1 text-[11px] font-semibold text-[#D4A853] hover:bg-[#D4A853]/25 transition-colors"
        >
          {nextRecommendation.cta}
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
