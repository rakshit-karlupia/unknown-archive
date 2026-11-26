import {
  ArrowRight,
  BookMarked,
  Calendar,
  FileText,
  FlaskConical,
  FolderKanban,
  Lightbulb,
  MapPin,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { EvidenceBadge } from '../components/EvidenceBadge';
import { CaseBriefingPanel } from '../components/investigation/CaseBriefingPanel';
import { EvidenceBoardPanel } from '../components/investigation/EvidenceBoardPanel';
import { FinalVerdictPanel } from '../components/investigation/FinalVerdictPanel';
import { HintSystemDrawer } from '../components/investigation/HintSystemDrawer';
import { InteractiveTimelinePanel } from '../components/investigation/InteractiveTimelinePanel';
import { InvestigationProgressBar } from '../components/investigation/InvestigationProgressBar';
import { PersonalNotebookPanel } from '../components/investigation/PersonalNotebookPanel';
import { TheoryLabPanel } from '../components/investigation/TheoryLabPanel';
import {
  MYSTERIES,
  getCategoryBySlug,
  getMysteryBySlug,
  getSourcesForMystery,
} from '../data';
import { useInvestigationState } from '../hooks/useInvestigationState';
import type { MysteryInvestigation } from '../types/archive';
import type { InvestigationSectionId } from '../types/investigation';

const ROOM_SECTIONS: {
  id: InvestigationSectionId;
  number: string;
  label: string;
  icon: typeof FileText;
}[] = [
  { id: 'briefing', number: '01', label: 'Case Briefing', icon: FileText },
  { id: 'board', number: '02', label: 'Evidence Board', icon: FolderKanban },
  { id: 'timeline', number: '03', label: 'Interactive Timeline', icon: Calendar },
  { id: 'theories', number: '04', label: 'Theory Lab', icon: FlaskConical },
  { id: 'notebook', number: '05', label: 'Personal Notebook', icon: BookMarked },
  { id: 'verdict', number: '06', label: 'Final Verdict', icon: ShieldCheck },
];

export function InvestigationRoomPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSlug = searchParams.get('case') || MYSTERIES[0].slug;
  const initialSectionParam = searchParams.get('section') as InvestigationSectionId | null;

  const [selectedSlug, setSelectedSlug] = useState(initialSlug);
  const [activeSection, setActiveSection] = useState<InvestigationSectionId>(
    initialSectionParam && ROOM_SECTIONS.some((s) => s.id === initialSectionParam)
      ? initialSectionParam
      : 'briefing'
  );
  const [hintsOpen, setHintsOpen] = useState(false);
  const [highlightedCardId, setHighlightedCardId] = useState<string | null>(null);
  const [highlightedEventId, setHighlightedEventId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
  };

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const paramSlug = searchParams.get('case');
    if (paramSlug && getMysteryBySlug(paramSlug)) {
      setSelectedSlug(paramSlug);
    }
    const sec = searchParams.get('section') as InvestigationSectionId | null;
    if (sec && ROOM_SECTIONS.some((s) => s.id === sec)) {
      setActiveSection(sec);
    }
  }, [searchParams]);

  const mystery: MysteryInvestigation = useMemo(
    () => getMysteryBySlug(selectedSlug) ?? MYSTERIES[0],
    [selectedSlug]
  );

  const category = getCategoryBySlug(mystery.category);
  const sources = useMemo(() => getSourcesForMystery(mystery), [mystery]);

  const {
    state,
    evidenceCards,
    scoreSummary,
    setDifficulty,
    markEvidenceExamined,
    markTimelineReviewed,
    togglePin,
    setClueStance,
    setClueNote,
    setNodePosition,
    addConnection,
    removeConnection,
    addNotebookEntry,
    deleteNotebookEntry,
    saveUserTheory,
    deleteUserTheory,
    markTheoryEvaluated,
    revealNextHint,
    recordReconstructionAttempt,
    submitFinalVerdict,
    resetCaseProgress,
  } = useInvestigationState(mystery, sources);

  const relatedMysteries = useMemo(
    () =>
      MYSTERIES.filter(
        (m) =>
          m.slug !== mystery.slug &&
          (m.category === mystery.category ||
            mystery.secondaryCategories?.includes(m.category) ||
            m.region === mystery.region)
      ).slice(0, 4),
    [mystery]
  );

  const handleSelectCase = (slug: string) => {
    setSelectedSlug(slug);
    setSearchParams({ case: slug });
    setActiveSection('briefing');
    setHighlightedCardId(null);
    setHighlightedEventId(null);
  };

  const navigateSection = (section: InvestigationSectionId) => {
    setActiveSection(section);
    setSearchParams({ case: mystery.slug, section });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleJumpToEvidence = (cardId: string) => {
    setHighlightedCardId(cardId);
    navigateSection('board');
  };

  const handleJumpToTimelineEvent = (eventId: string) => {
    setHighlightedEventId(eventId);
    navigateSection('timeline');
  };

  const totalDocumentsCount = evidenceCards.filter((c) => c.kind === 'document').length;

  return (
    <div className="min-h-screen bg-[#080B12] pb-20">
      {/* Top Room Header */}
      <section className="border-b border-white/10 bg-[#0B0F1A]">
        <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <div className="font-mono-archive inline-flex items-center gap-2 rounded border border-[#D4A853]/35 bg-[#0F1420] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-[#D4A853]">
                <FolderKanban className="h-3.5 w-3.5" aria-hidden="true" />
                Unknown Archive 2.0 // Interactive Detective Workstation
              </div>
              <h1 className="mt-3 font-editorial text-3xl font-semibold text-white sm:text-4xl">
                Investigation Room
              </h1>
              <p className="mt-1.5 max-w-2xl text-sm text-[#9AA5BE]">
                Examine primary records, map clue connections, reconstruct historical timelines, and
                submit evidence-grounded conclusions.
              </p>
            </div>

            {/* Case Selector & Hint Controls */}
            <div className="flex flex-wrap items-end gap-3 w-full sm:w-auto">
              <div className="w-full sm:w-72">
                <label
                  htmlFor="room-case-select"
                  className="font-mono-archive block text-[10px] font-semibold uppercase tracking-wider text-[#9AA5BE] mb-1.5"
                >
                  Active Case File
                </label>
                <select
                  id="room-case-select"
                  value={mystery.slug}
                  onChange={(e) => handleSelectCase(e.target.value)}
                  className="w-full rounded-lg border border-white/15 bg-[#080B12] px-3 py-2.5 text-sm text-white focus:border-[#D4A853] focus:outline-none"
                >
                  {MYSTERIES.map((m) => (
                    <option key={m.slug} value={m.slug}>
                      {m.title} ({m.evidenceStatus})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => setHintsOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#D4A853]/40 bg-[#D4A853]/10 px-3.5 py-2.5 text-xs font-semibold text-[#D4A853] hover:bg-[#D4A853]/20"
              >
                <Lightbulb className="h-4 w-4" />
                Hints ({state.revealedHintLevel})
              </button>

              <button
                type="button"
                onClick={resetCaseProgress}
                title="Reset local progress for this case"
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/12 bg-[#0F1420] px-3 py-2.5 text-xs text-[#9AA5BE] hover:border-rose-400/40 hover:text-white"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset Case
              </button>
            </div>
          </div>

          {/* Active Case Summary Strip */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/10 bg-[#0F1420] p-4">
            <div className="flex items-center gap-4 min-w-0">
              <img
                src={mystery.heroImage}
                alt={mystery.imageAlt}
                className="h-14 w-20 shrink-0 rounded-lg border border-white/10 object-cover"
              />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono-archive text-[10px] font-semibold uppercase tracking-wider text-[#6C9EFF]">
                    {category ? `${category.number}. ${category.name}` : mystery.category}
                  </span>
                  <EvidenceBadge status={mystery.evidenceStatus} />
                  <span className="font-mono-archive rounded border border-white/10 bg-[#080B12] px-2 py-0.5 text-[10px] uppercase text-[#D4A853]">
                    {state.difficulty}
                  </span>
                </div>
                <h2 className="mt-1 truncate font-editorial text-xl font-semibold text-white">
                  {mystery.title}
                </h2>
                <div className="font-mono-archive flex flex-wrap items-center gap-3 text-[11px] text-[#9AA5BE]">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-[#D4A853]" />
                    {mystery.locationName}
                  </span>
                  <span>· {evidenceCards.length} Exhibits</span>
                  <span>· {mystery.timeline.length} Events</span>
                  <span>· {mystery.competingTheories.length} Theories</span>
                </div>
              </div>
            </div>

            <Link
              to={`/investigation/${mystery.slug}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-[#080B12] px-4 py-2 text-xs font-semibold text-[#CBD5E1] hover:border-[#D4A853]/50 hover:text-white"
            >
              Read Full Dossier
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* 6-Section Room Navigation */}
          <nav
            aria-label="Investigation Room Sections"
            className="mt-5 flex flex-wrap gap-2"
            role="tablist"
          >
            {ROOM_SECTIONS.map((sec) => {
              const Icon = sec.icon;
              const active = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => navigateSection(sec.id)}
                  className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-semibold transition-colors ${
                    active
                      ? 'border-[#D4A853] bg-[#D4A853]/15 text-[#D4A853]'
                      : 'border-white/10 bg-[#0F1420] text-[#9AA5BE] hover:border-white/25 hover:text-white'
                  }`}
                >
                  <span className="font-mono-archive text-[10px] opacity-75">{sec.number}</span>
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  {sec.label}
                </button>
              );
            })}
          </nav>

          {/* Progress Tracker */}
          <div className="mt-4">
            <InvestigationProgressBar
              state={state}
              totalEvidence={evidenceCards.length}
              totalDocuments={totalDocumentsCount}
              totalTimeline={mystery.timeline.length}
              totalTheories={mystery.competingTheories.length}
              scoreSummary={scoreSummary}
              onNavigateSection={navigateSection}
            />
          </div>
        </div>
      </section>

      {/* Active Workspace Section */}
      <div className="mx-auto mt-8 max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
        {activeSection === 'briefing' && (
          <CaseBriefingPanel
            mystery={mystery}
            category={category}
            evidenceCount={evidenceCards.length}
            sourceCount={sources.length}
            difficulty={state.difficulty}
            onChangeDifficulty={setDifficulty}
            onStartInvestigation={navigateSection}
            verdictSubmitted={Boolean(state.verdict)}
          />
        )}

        {activeSection === 'board' && (
          <EvidenceBoardPanel
            caseSlug={mystery.slug}
            evidenceCards={evidenceCards}
            timeline={mystery.timeline}
            state={state}
            highlightedCardId={highlightedCardId}
            onClearHighlight={() => setHighlightedCardId(null)}
            onExamineCard={(cardId, isDoc) => {
              const already = state.examinedEvidenceIds.includes(cardId);
              markEvidenceExamined(cardId, isDoc);
              if (!already) {
                showToast(isDoc ? 'Source document opened (+15 pts)' : 'Evidence examined (+10 pts)');
              }
            }}
            onTogglePin={(cardId) => {
              togglePin(cardId);
              showToast(
                state.pinnedIds.includes(cardId) ? 'Clue unpinned' : 'Clue pinned to top priority'
              );
            }}
            onSetStance={(cardId, stance) => {
              setClueStance(cardId, stance);
              showToast(`Clue marked as ${stance}`);
            }}
            onSetNote={setClueNote}
            onSetNodePosition={setNodePosition}
            onAddConnection={(fromId, toId, relation) => {
              addConnection(fromId, toId, relation);
              showToast(`Clue connection mapped (${relation})`);
            }}
            onRemoveConnection={removeConnection}
            onJumpToTimelineEvent={handleJumpToTimelineEvent}
            onAddToNotebook={(entry) => {
              addNotebookEntry(entry);
              showToast('Logged to Personal Notebook');
            }}
          />
        )}

        {activeSection === 'timeline' && (
          <InteractiveTimelinePanel
            mystery={mystery}
            sources={sources}
            evidenceCards={evidenceCards}
            reviewedTimelineIds={state.reviewedTimelineIds}
            highlightedEventId={highlightedEventId}
            onClearHighlight={() => setHighlightedEventId(null)}
            reconstructionAttempt={state.reconstructionAttempt}
            onMarkTimelineReviewed={markTimelineReviewed}
            onRecordReconstruction={(attempt) => {
              recordReconstructionAttempt(attempt);
              showToast(
                `Timeline checked: ${attempt.correctCount}/${attempt.totalCount} accurate`
              );
            }}
            onJumpToEvidence={handleJumpToEvidence}
          />
        )}

        {activeSection === 'theories' && (
          <TheoryLabPanel
            caseTitle={mystery.title}
            documentedTheories={mystery.competingTheories}
            userTheories={state.userTheories}
            evaluatedTheoryIds={state.evaluatedTheoryIds}
            evidenceCards={evidenceCards}
            timeline={mystery.timeline}
            onSaveUserTheory={(t) => {
              saveUserTheory(t);
              showToast('Working theory saved to Theory Lab');
            }}
            onDeleteUserTheory={deleteUserTheory}
            onMarkTheoryEvaluated={(id) => {
              markTheoryEvaluated(id);
              showToast('Theory marked as evaluated');
            }}
            onJumpToEvidence={handleJumpToEvidence}
            onJumpToTimeline={handleJumpToTimelineEvent}
          />
        )}

        {activeSection === 'notebook' && (
          <PersonalNotebookPanel
            caseTitle={mystery.title}
            entries={state.notebookEntries}
            evidenceCards={evidenceCards}
            timeline={mystery.timeline}
            onAddEntry={(entry) => {
              addNotebookEntry(entry);
              showToast('Notebook entry saved');
            }}
            onDeleteEntry={deleteNotebookEntry}
            onJumpToEvidence={handleJumpToEvidence}
            onJumpToTimeline={handleJumpToTimelineEvent}
          />
        )}

        {activeSection === 'verdict' && (
          <FinalVerdictPanel
            mystery={mystery}
            evidenceCards={evidenceCards}
            existingVerdict={state.verdict}
            scoreSummary={scoreSummary}
            onSubmitVerdict={(verdict) => {
              submitFinalVerdict(verdict);
              showToast('Final Verdict submitted — Archive findings unsealed');
            }}
          />
        )}

        {/* Section-to-Section Flow Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#0F1420] px-5 py-4">
          <span className="text-xs text-[#9AA5BE]">
            Currently in <strong className="text-white">{ROOM_SECTIONS.find((s) => s.id === activeSection)?.label}</strong> · Progress is saved automatically in your browser.
          </span>
          {activeSection !== 'verdict' && (
            <button
              type="button"
              onClick={() => {
                const idx = ROOM_SECTIONS.findIndex((s) => s.id === activeSection);
                const next = ROOM_SECTIONS[idx + 1];
                if (next) navigateSection(next.id);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#D4A853] px-4 py-2 text-xs font-semibold text-[#080B12] hover:bg-[#e3ba68]"
            >
              Next: {ROOM_SECTIONS[ROOM_SECTIONS.findIndex((s) => s.id === activeSection) + 1]?.label}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Related Investigations Switcher */}
        {relatedMysteries.length > 0 && (
          <section className="rounded-xl border border-white/10 bg-[#0F1420] p-6">
            <div className="mb-4">
              <span className="font-mono-archive text-[10px] font-semibold uppercase tracking-widest text-[#D4A853]">
                Cross-Referenced Files
              </span>
              <h2 className="font-editorial text-2xl font-semibold text-white">
                Related Investigations
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {relatedMysteries.map((rel) => (
                <div
                  key={rel.slug}
                  className="flex flex-col justify-between rounded-lg border border-white/10 bg-[#080B12] p-4"
                >
                  <div>
                    <EvidenceBadge status={rel.evidenceStatus} />
                    <h3 className="mt-2 font-editorial text-lg font-semibold text-white">
                      {rel.title}
                    </h3>
                    <p className="mt-1 text-xs text-[#9AA5BE] line-clamp-2">{rel.summary}</p>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-2 border-t border-white/8 pt-3 text-xs">
                    <button
                      type="button"
                      onClick={() => handleSelectCase(rel.slug)}
                      className="font-semibold text-[#D4A853] hover:underline"
                    >
                      Open in Room
                    </button>
                    <Link
                      to={`/investigation/${rel.slug}`}
                      className="text-[#6C9EFF] hover:underline"
                    >
                      Dossier →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <HintSystemDrawer
        open={hintsOpen}
        onClose={() => setHintsOpen(false)}
        mystery={mystery}
        sources={sources}
        evidenceCards={evidenceCards}
        state={state}
        onRevealHint={revealNextHint}
        onJumpToSection={navigateSection}
      />

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 rounded-xl border border-[#D4A853]/50 bg-[#0F1420]/95 px-4 py-3 text-xs font-semibold text-[#D4A853] shadow-2xl backdrop-blur-xs"
        >
          {toast}
        </div>
      )}
    </div>
  );
}
