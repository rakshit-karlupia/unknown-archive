export type DifficultyLevel = 'beginner' | 'intermediate' | 'expert';

export type InvestigationSectionId =
  | 'briefing'
  | 'board'
  | 'timeline'
  | 'theories'
  | 'notebook'
  | 'verdict';

export type ClueStance = 'neutral' | 'supporting' | 'contradicting';

export type ConnectionRelation =
  | 'supports'
  | 'contradicts'
  | 'chronology'
  | 'corroborates';

export interface BoardNodePosition {
  x: number;
  y: number;
}

export interface EvidenceConnection {
  id: string;
  fromId: string;
  toId: string;
  relation: ConnectionRelation;
  note?: string;
}

export type NotebookEntryCategory =
  | 'observation'
  | 'discovery'
  | 'question'
  | 'theory'
  | 'reference';

export interface NotebookEntry {
  id: string;
  category: NotebookEntryCategory;
  content: string;
  linkedEvidenceIds: string[];
  linkedTimelineIds: string[];
  createdAt: string;
}

export interface UserTheory {
  id: string;
  title: string;
  baseTheoryId?: string;
  explanation: string;
  supportingEvidenceIds: string[];
  contradictingEvidenceIds: string[];
  timelineEventIds: string[];
  confidence: number;
  createdAt: string;
}

export interface FinalVerdictSubmission {
  proposedExplanation: string;
  keySupportingEvidenceIds: string[];
  contradictingEvidenceIds: string[];
  unansweredQuestions: string;
  confidence: number;
  writtenReasoning: string;
  submittedAt: string;
}

export interface TimelineReconstructionAttempt {
  orderedIds: string[];
  submittedAt: string;
  correctCount: number;
  totalCount: number;
  exactMatch: boolean;
}

export interface UnifiedEvidenceCard {
  id: string;
  kind: 'primary' | 'photograph' | 'document' | 'fact' | 'gap';
  title: string;
  classification: string;
  sourceLabel: string;
  dateLabel: string;
  summary: string;
  detailFinding?: string;
  imageUrl?: string;
  externalUrl?: string;
  sourceId?: string;
  relatedTimelineIds: string[];
}

export interface CaseProgressState {
  difficulty: DifficultyLevel;
  examinedEvidenceIds: string[];
  openedDocumentIds: string[];
  reviewedTimelineIds: string[];
  pinnedIds: string[];
  clueStances: Record<string, ClueStance>;
  clueNotes: Record<string, string>;
  nodePositions: Record<string, BoardNodePosition>;
  connections: EvidenceConnection[];
  notebookEntries: NotebookEntry[];
  userTheories: UserTheory[];
  evaluatedTheoryIds: string[];
  revealedHintLevel: number;
  reconstructionAttempt?: TimelineReconstructionAttempt;
  verdict?: FinalVerdictSubmission;
}

export interface ScoreBreakdownItem {
  label: string;
  points: number;
  maxPoints: number;
  detail: string;
}

export interface InvestigationScoreSummary {
  totalPoints: number;
  maxPoints: number;
  rankLabel: string;
  items: ScoreBreakdownItem[];
}
