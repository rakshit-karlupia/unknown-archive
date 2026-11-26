import { Compass, Eye, HelpCircle, Lightbulb, Lock, X } from 'lucide-react';
import type { MysteryInvestigation, ResearchSource } from '../../types/archive';
import type {
  CaseProgressState,
  InvestigationSectionId,
  UnifiedEvidenceCard,
} from '../../types/investigation';

interface HintSystemDrawerProps {
  open: boolean;
  onClose: () => void;
  mystery: MysteryInvestigation;
  sources: ResearchSource[];
  evidenceCards: UnifiedEvidenceCard[];
  state: CaseProgressState;
  onRevealHint: () => void;
  onJumpToSection: (section: InvestigationSectionId) => void;
}

export function HintSystemDrawer({
  open,
  onClose,
  mystery,
  sources,
  evidenceCards,
  state,
  onRevealHint,
  onJumpToSection,
}: HintSystemDrawerProps) {
  if (!open) return null;

  const maxHints =
    state.difficulty === 'beginner' ? 3 : state.difficulty === 'intermediate' ? 2 : 1;

  const unexaminedCard = evidenceCards.find(
    (c) => !state.examinedEvidenceIds.includes(c.id) && c.kind !== 'gap'
  );
  const unopenedSource = sources.find(
    (s) => !state.openedDocumentIds.includes(`doc-${s.id}`)
  );
  const unreviewedEvent = mystery.timeline.find(
    (t) => !state.reviewedTimelineIds.includes(t.id)
  );

  const hints = [
    {
      level: 1,
      title: 'Overlooked Evidence Lead',
      target: 'board' as InvestigationSectionId,
      targetLabel: 'Open Evidence Board',
      body: unexaminedCard
        ? `You haven't inspected "${unexaminedCard.title}" (${unexaminedCard.classification}) from ${unexaminedCard.sourceLabel}. Check its specific findings and see whether it supports or contradicts the leading claims.`
        : `All currently loaded evidence cards have been inspected. Try connecting two clues that share a date or location, or flag any anomalies as contradicting.`,
    },
    {
      level: 2,
      title: 'Primary Source Verification',
      target: 'board' as InvestigationSectionId,
      targetLabel: 'Inspect Source Documents',
      body: unopenedSource
        ? `Consider opening the ${unopenedSource.recordTier} "${unopenedSource.title}" (${unopenedSource.authorOrOrg}, ${unopenedSource.publicationDate}). Primary records often reveal methodological limits not obvious in summaries.`
        : `You've opened the indexed sources. Compare how their publication dates align with the documented timeline and watch for gaps in ${mystery.whatRemainsUnknown[0] ?? 'unanswered questions'}.`,
    },
    {
      level: 3,
      title: 'Chronological Anchor',
      target: 'timeline' as InvestigationSectionId,
      targetLabel: 'Jump to Timeline',
      body: unreviewedEvent
        ? `Examine the milestone "${unreviewedEvent.title}" (${unreviewedEvent.yearLabel}). Notice its historical significance and verify which evidence records corroborate it.`
        : `Try Timeline Reconstruction Mode to test your grasp of how the documented milestones unfolded chronologically.`,
    },
  ];

  const availableHints = hints.slice(0, maxHints);

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label="Investigation Hint System"
    >
      <div className="flex h-full w-full max-w-md flex-col border-l border-white/15 bg-[#0B0F1A] p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <span className="font-mono-archive inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-[#D4A853]">
              <Lightbulb className="h-3.5 w-3.5" aria-hidden="true" />
              Archival Guidance // {state.difficulty.toUpperCase()}
            </span>
            <h2 className="mt-1 font-editorial text-2xl font-semibold text-white">
              Investigation Hints
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close hint drawer"
            className="rounded-lg border border-white/10 bg-[#0F1420] p-2 text-[#9AA5BE] hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-3 text-xs leading-relaxed text-[#9AA5BE]">
          Optional hints point toward overlooked records, sources, and timeline anchors without
          revealing the final documented assessment. Your active difficulty ({state.difficulty})
          permits up to <strong className="text-white">{maxHints}</strong> hint level(s).
        </p>

        <div className="mt-5 flex-1 space-y-4 overflow-y-auto pr-1">
          {availableHints.map((hint) => {
            const unlocked = state.revealedHintLevel >= hint.level;
            return (
              <div
                key={hint.level}
                className={`rounded-xl border p-4 ${
                  unlocked
                    ? 'border-[#D4A853]/40 bg-[#0F1420]'
                    : 'border-white/10 bg-[#080B12]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono-archive text-[10px] font-semibold uppercase tracking-wider text-[#6C9EFF]">
                    Hint Level {hint.level} · {hint.title}
                  </span>
                  {!unlocked && <Lock className="h-3.5 w-3.5 text-[#68748F]" aria-hidden="true" />}
                </div>

                {unlocked ? (
                  <>
                    <p className="mt-2 text-xs leading-relaxed text-[#E2E8F0]">{hint.body}</p>
                    <button
                      type="button"
                      onClick={() => {
                        onJumpToSection(hint.target);
                        onClose();
                      }}
                      className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#D4A853] hover:underline"
                    >
                      <Compass className="h-3.5 w-3.5" />
                      {hint.targetLabel}
                    </button>
                  </>
                ) : (
                  <p className="mt-2 text-xs italic text-[#68748F]">
                    Locked — reveal when you need a methodological nudge.
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-4 border-t border-white/10 pt-4">
          {state.revealedHintLevel < maxHints ? (
            <button
              type="button"
              onClick={onRevealHint}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#D4A853] px-4 py-2.5 text-xs font-semibold text-[#080B12] hover:bg-[#e3ba68]"
            >
              <Eye className="h-4 w-4" />
              Reveal Hint Level {state.revealedHintLevel + 1}
            </button>
          ) : (
            <div className="flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-[#0F1420] px-4 py-2.5 text-xs text-[#9AA5BE]">
              <HelpCircle className="h-4 w-4 text-[#D4A853]" />
              All {maxHints} hint level(s) for {state.difficulty} mode unlocked.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
