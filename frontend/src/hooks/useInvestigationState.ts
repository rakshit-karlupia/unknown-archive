import { useCallback, useEffect, useMemo, useState } from 'react';
import type { MysteryInvestigation, ResearchSource } from '../types/archive';
import type {
  BoardNodePosition,
  CaseProgressState,
  ClueStance,
  ConnectionRelation,
  DifficultyLevel,
  EvidenceConnection,
  FinalVerdictSubmission,
  InvestigationScoreSummary,
  NotebookEntry,
  TimelineReconstructionAttempt,
  UnifiedEvidenceCard,
  UserTheory,
} from '../types/investigation';

const STORAGE_PREFIX = 'ua_investigation_room_v2:';

function createDefaultState(): CaseProgressState {
  return {
    difficulty: 'intermediate',
    examinedEvidenceIds: [],
    openedDocumentIds: [],
    reviewedTimelineIds: [],
    pinnedIds: [],
    clueStances: {},
    clueNotes: {},
    nodePositions: {},
    connections: [],
    notebookEntries: [],
    userTheories: [],
    evaluatedTheoryIds: [],
    revealedHintLevel: 0,
  };
}

function loadCaseState(slug: string): CaseProgressState {
  try {
    const raw = window.localStorage.getItem(`${STORAGE_PREFIX}${slug}`);
    if (!raw) return createDefaultState();
    const parsed = JSON.parse(raw) as Partial<CaseProgressState>;
    return {
      ...createDefaultState(),
      ...parsed,
    };
  } catch {
    return createDefaultState();
  }
}

function saveCaseState(slug: string, state: CaseProgressState): void {
  try {
    window.localStorage.setItem(`${STORAGE_PREFIX}${slug}`, JSON.stringify(state));
  } catch {
    // Ignore quota or storage restriction errors silently.
  }
}

export function buildUnifiedEvidenceCards(
  mystery: MysteryInvestigation,
  sources: ResearchSource[],
  difficulty: DifficultyLevel
): UnifiedEvidenceCard[] {
  const cards: UnifiedEvidenceCard[] = [];

  const matchTimelineIds = (text: string): string[] => {
    const lower = text.toLowerCase();
    return mystery.timeline
      .filter((ev) => {
        const yearDigits = ev.yearLabel.match(/\d{4}/)?.[0];
        const recordMatch =
          ev.associatedRecord &&
          (lower.includes(ev.associatedRecord.toLowerCase()) ||
            ev.associatedRecord
              .toLowerCase()
              .split(/\s+/)
              .some((w) => w.length > 4 && lower.includes(w)));
        const titleMatch = ev.title
          .toLowerCase()
          .split(/\s+/)
          .some((w) => w.length > 5 && lower.includes(w));
        const yearMatch = yearDigits ? lower.includes(yearDigits) : false;
        return Boolean(recordMatch || titleMatch || yearMatch);
      })
      .map((ev) => ev.id);
  };

  // Primary photographic exhibit
  cards.push({
    id: 'photo-hero',
    kind: 'photograph',
    title: `Visual Exhibit: ${mystery.title}`,
    classification: 'Archival Photograph / Visualization',
    sourceLabel: mystery.locationName,
    dateLabel: mystery.updatedAt,
    summary: mystery.imageAlt,
    detailFinding: `Geographic coordinates: ${mystery.coordinates.precisionLabel}`,
    imageUrl: mystery.heroImage,
    relatedTimelineIds: mystery.timeline.slice(0, 1).map((t) => t.id),
  });

  // Primary evidence records
  const evidenceLimit =
    difficulty === 'beginner' ? Math.min(3, mystery.originalEvidence.length) : mystery.originalEvidence.length;

  mystery.originalEvidence.slice(0, evidenceLimit).forEach((ev, idx) => {
    const matchedSrc = sources.find((s) => s.id === ev.sourceId);
    cards.push({
      id: `ev-${idx}`,
      kind: 'primary',
      title: ev.title,
      classification: ev.recordType,
      sourceLabel: ev.origin,
      dateLabel: ev.date,
      summary: ev.description,
      detailFinding: ev.measurementOrFinding,
      externalUrl: matchedSrc?.url,
      sourceId: ev.sourceId,
      relatedTimelineIds: matchTimelineIds(`${ev.title} ${ev.date} ${ev.origin} ${ev.description}`),
    });
  });

  // Indexed documents (for intermediate & expert, or first 2 for beginner)
  const docLimit = difficulty === 'beginner' ? 2 : sources.length;
  sources.slice(0, docLimit).forEach((src) => {
    cards.push({
      id: `doc-${src.id}`,
      kind: 'document',
      title: src.title,
      classification: `${src.recordTier} · ${src.sourceType}`,
      sourceLabel: src.authorOrOrg,
      dateLabel: src.publicationDate,
      summary: src.summary,
      detailFinding: src.accessInfo,
      externalUrl: src.url,
      sourceId: src.id,
      relatedTimelineIds: matchTimelineIds(`${src.title} ${src.publicationDate} ${src.summary}`),
    });
  });

  // Verified facts summary card
  if (mystery.whatWeKnow.length > 0) {
    cards.push({
      id: 'facts-summary',
      kind: 'fact',
      title: 'Documented Baseline Observations',
      classification: 'Verified Record Summary',
      sourceLabel: 'Archive Synthesis',
      dateLabel: mystery.updatedAt,
      summary: mystery.whatWeKnow.slice(0, 3).join(' • '),
      detailFinding: mystery.whatWeKnow.join('\n'),
      relatedTimelineIds: mystery.timeline.slice(0, 2).map((t) => t.id),
    });
  }

  // Unresolved gaps / witness & anomaly gaps (especially emphasized in expert mode)
  if (mystery.whatRemainsUnknown.length > 0) {
    cards.push({
      id: 'gaps-summary',
      kind: 'gap',
      title: 'Unresolved Questions & Contradictions',
      classification: 'Open Evidentiary Gap',
      sourceLabel: 'Case Audit',
      dateLabel: mystery.evidenceStatus,
      summary: mystery.whatRemainsUnknown.slice(0, 3).join(' • '),
      detailFinding: mystery.whatRemainsUnknown.join('\n'),
      relatedTimelineIds: mystery.timeline.slice(-1).map((t) => t.id),
    });
  }

  return cards;
}

export function useInvestigationState(
  mystery: MysteryInvestigation,
  sources: ResearchSource[]
) {
  const [state, setState] = useState<CaseProgressState>(() => loadCaseState(mystery.slug));

  useEffect(() => {
    setState(loadCaseState(mystery.slug));
  }, [mystery.slug]);

  const updateState = useCallback(
    (updater: (prev: CaseProgressState) => CaseProgressState) => {
      setState((prev) => {
        const next = updater(prev);
        saveCaseState(mystery.slug, next);
        return next;
      });
    },
    [mystery.slug]
  );

  const evidenceCards = useMemo(
    () => buildUnifiedEvidenceCards(mystery, sources, state.difficulty),
    [mystery, sources, state.difficulty]
  );

  const setDifficulty = useCallback(
    (difficulty: DifficultyLevel) => {
      updateState((prev) => ({ ...prev, difficulty }));
    },
    [updateState]
  );

  const markEvidenceExamined = useCallback(
    (cardId: string, isDocument = false) => {
      updateState((prev) => ({
        ...prev,
        examinedEvidenceIds: prev.examinedEvidenceIds.includes(cardId)
          ? prev.examinedEvidenceIds
          : [...prev.examinedEvidenceIds, cardId],
        openedDocumentIds:
          isDocument && !prev.openedDocumentIds.includes(cardId)
            ? [...prev.openedDocumentIds, cardId]
            : prev.openedDocumentIds,
      }));
    },
    [updateState]
  );

  const markTimelineReviewed = useCallback(
    (eventId: string) => {
      updateState((prev) => ({
        ...prev,
        reviewedTimelineIds: prev.reviewedTimelineIds.includes(eventId)
          ? prev.reviewedTimelineIds
          : [...prev.reviewedTimelineIds, eventId],
      }));
    },
    [updateState]
  );

  const togglePin = useCallback(
    (cardId: string) => {
      updateState((prev) => ({
        ...prev,
        pinnedIds: prev.pinnedIds.includes(cardId)
          ? prev.pinnedIds.filter((id) => id !== cardId)
          : [...prev.pinnedIds, cardId],
      }));
    },
    [updateState]
  );

  const setClueStance = useCallback(
    (cardId: string, stance: ClueStance) => {
      updateState((prev) => ({
        ...prev,
        clueStances: { ...prev.clueStances, [cardId]: stance },
      }));
    },
    [updateState]
  );

  const setClueNote = useCallback(
    (cardId: string, note: string) => {
      updateState((prev) => ({
        ...prev,
        clueNotes: { ...prev.clueNotes, [cardId]: note },
      }));
    },
    [updateState]
  );

  const setNodePosition = useCallback(
    (cardId: string, position: BoardNodePosition) => {
      updateState((prev) => ({
        ...prev,
        nodePositions: { ...prev.nodePositions, [cardId]: position },
      }));
    },
    [updateState]
  );

  const addConnection = useCallback(
    (fromId: string, toId: string, relation: ConnectionRelation, note?: string) => {
      if (fromId === toId) return;
      updateState((prev) => {
        const exists = prev.connections.some(
          (c) =>
            (c.fromId === fromId && c.toId === toId) ||
            (c.fromId === toId && c.toId === fromId)
        );
        if (exists) return prev;
        const conn: EvidenceConnection = {
          id: `conn-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          fromId,
          toId,
          relation,
          note,
        };
        return { ...prev, connections: [...prev.connections, conn] };
      });
    },
    [updateState]
  );

  const removeConnection = useCallback(
    (connectionId: string) => {
      updateState((prev) => ({
        ...prev,
        connections: prev.connections.filter((c) => c.id !== connectionId),
      }));
    },
    [updateState]
  );

  const addNotebookEntry = useCallback(
    (entry: Omit<NotebookEntry, 'id' | 'createdAt'>) => {
      updateState((prev) => ({
        ...prev,
        notebookEntries: [
          {
            ...entry,
            id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            createdAt: new Date().toISOString(),
          },
          ...prev.notebookEntries,
        ],
      }));
    },
    [updateState]
  );

  const deleteNotebookEntry = useCallback(
    (id: string) => {
      updateState((prev) => ({
        ...prev,
        notebookEntries: prev.notebookEntries.filter((n) => n.id !== id),
      }));
    },
    [updateState]
  );

  const saveUserTheory = useCallback(
    (theory: Omit<UserTheory, 'id' | 'createdAt'>) => {
      updateState((prev) => ({
        ...prev,
        userTheories: [
          {
            ...theory,
            id: `utheory-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            createdAt: new Date().toISOString(),
          },
          ...prev.userTheories,
        ],
      }));
    },
    [updateState]
  );

  const deleteUserTheory = useCallback(
    (id: string) => {
      updateState((prev) => ({
        ...prev,
        userTheories: prev.userTheories.filter((t) => t.id !== id),
      }));
    },
    [updateState]
  );

  const markTheoryEvaluated = useCallback(
    (theoryId: string) => {
      updateState((prev) => ({
        ...prev,
        evaluatedTheoryIds: prev.evaluatedTheoryIds.includes(theoryId)
          ? prev.evaluatedTheoryIds
          : [...prev.evaluatedTheoryIds, theoryId],
      }));
    },
    [updateState]
  );

  const revealNextHint = useCallback(() => {
    const maxForDifficulty =
      state.difficulty === 'beginner' ? 3 : state.difficulty === 'intermediate' ? 2 : 1;
    updateState((prev) => ({
      ...prev,
      revealedHintLevel: Math.min(maxForDifficulty, prev.revealedHintLevel + 1),
    }));
  }, [state.difficulty, updateState]);

  const recordReconstructionAttempt = useCallback(
    (attempt: TimelineReconstructionAttempt) => {
      updateState((prev) => ({
        ...prev,
        reconstructionAttempt: attempt,
      }));
    },
    [updateState]
  );

  const submitFinalVerdict = useCallback(
    (verdict: FinalVerdictSubmission) => {
      updateState((prev) => ({
        ...prev,
        verdict,
      }));
    },
    [updateState]
  );

  const resetCaseProgress = useCallback(() => {
    const fresh = createDefaultState();
    saveCaseState(mystery.slug, fresh);
    setState(fresh);
  }, [mystery.slug]);

  // Transparent scoring system (rewards methodology & evidence use, never blind guessing)
  const scoreSummary: InvestigationScoreSummary = useMemo(() => {
    const primaryExaminedPts = Math.min(40, state.examinedEvidenceIds.length * 10);
    const docsOpenedPts = Math.min(30, state.openedDocumentIds.length * 15);
    const contradictionCount =
      Object.values(state.clueStances).filter((s) => s === 'contradicting').length +
      state.connections.filter((c) => c.relation === 'contradicts').length +
      (state.verdict?.contradictingEvidenceIds.length ?? 0);
    const contradictionPts = Math.min(30, contradictionCount * 15);
    const connectionPts = Math.min(40, state.connections.length * 10);
    const timelineAccuracyPts = state.reconstructionAttempt
      ? Math.round(
          (state.reconstructionAttempt.correctCount /
            Math.max(1, state.reconstructionAttempt.totalCount)) *
            40
        )
      : 0;
    const theoryPts = Math.min(
      30,
      state.userTheories.filter(
        (t) => t.supportingEvidenceIds.length > 0 && t.explanation.trim().length > 15
      ).length * 15
    );
    const uncertaintyRecognized =
      Boolean(state.verdict?.unansweredQuestions.trim()) ||
      state.notebookEntries.some((n) => n.category === 'question') ||
      (mystery.evidenceStatus !== 'VERIFIED' &&
        state.verdict !== undefined &&
        state.verdict.confidence <= 85);
    const uncertaintyPts = uncertaintyRecognized ? 20 : 0;
    const verdictPts =
      state.verdict &&
      state.verdict.keySupportingEvidenceIds.length > 0 &&
      state.verdict.writtenReasoning.trim().length >= 25
        ? 20
        : 0;

    const items = [
      {
        label: 'Primary Evidence Examined',
        points: primaryExaminedPts,
        maxPoints: 40,
        detail: `${state.examinedEvidenceIds.length} evidence card(s) inspected`,
      },
      {
        label: 'Source Documents Opened',
        points: docsOpenedPts,
        maxPoints: 30,
        detail: `${state.openedDocumentIds.length} archival source(s) opened`,
      },
      {
        label: 'Contradictions Identified',
        points: contradictionPts,
        maxPoints: 30,
        detail: `${contradictionCount} contradicting signal(s) flagged`,
      },
      {
        label: 'Clue Connections Mapped',
        points: connectionPts,
        maxPoints: 40,
        detail: `${state.connections.length} board connection(s) established`,
      },
      {
        label: 'Timeline Reconstruction',
        points: timelineAccuracyPts,
        maxPoints: 40,
        detail: state.reconstructionAttempt
          ? `${state.reconstructionAttempt.correctCount}/${state.reconstructionAttempt.totalCount} events accurately sequenced`
          : 'Not yet attempted',
      },
      {
        label: 'Evidence-Backed Theories',
        points: theoryPts,
        maxPoints: 30,
        detail: `${state.userTheories.length} investigator hypothesis recorded`,
      },
      {
        label: 'Epistemic Rigor & Uncertainty',
        points: uncertaintyPts + verdictPts,
        maxPoints: 40,
        detail: 'Rewards documenting open questions & evidence-grounded reasoning',
      },
    ];

    const totalPoints = items.reduce((sum, i) => sum + i.points, 0);
    const maxPoints = items.reduce((sum, i) => sum + i.maxPoints, 0);
    const ratio = totalPoints / maxPoints;
    const rankLabel =
      ratio >= 0.85
        ? 'Lead Archival Analyst'
        : ratio >= 0.6
        ? 'Senior Case Investigator'
        : ratio >= 0.3
        ? 'Field Researcher'
        : 'Junior Archivist';

    return { totalPoints, maxPoints, rankLabel, items };
  }, [mystery.evidenceStatus, state]);

  return {
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
  };
}
