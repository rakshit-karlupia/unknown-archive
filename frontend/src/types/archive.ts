export type EvidenceStatus = 'VERIFIED' | 'UNRESOLVED' | 'DEBATED' | 'UNSUPPORTED';

export type CategorySlug =
  | 'secret-operations'
  | 'time-anomalies'
  | 'strange-encounters'
  | 'secret-societies'
  | 'strange-signals'
  | 'unknown-creatures'
  | 'hidden-earth'
  | 'lost-civilizations'
  | 'ufo-and-extraterrestrial'
  | 'disappearances'
  | 'secret-experiments'
  | 'scientific-mysteries';

export type SourceType =
  | 'Scientific Paper'
  | 'Government Report'
  | 'Historical Document'
  | 'Declassified Record'
  | 'Archaeological Publication'
  | 'Original Photograph'
  | 'Satellite Imagery'
  | 'Research Dataset';

export type RecordTier =
  | 'Primary Record'
  | 'Peer-Reviewed Study'
  | 'Institutional Report'
  | 'Secondary Commentary';

export interface CategoryInfo {
  slug: CategorySlug;
  number: string;
  name: string;
  tagline: string;
  description: string;
  disciplines: string[];
  accentColor: string;
  image: string;
}

export interface TimelineEvent {
  id: string;
  yearLabel: string;
  sortYear: number;
  title: string;
  description: string;
  significance: string;
  associatedRecord?: string;
}

export interface CompetingTheory {
  id: string;
  name: string;
  claim: string;
  supportingEvidence: string[];
  contradictingEvidence: string[];
  scientificLimitations: string;
  scientificAcceptance:
    | 'Strong Scientific Support'
    | 'Plausible / Active Hypothesis'
    | 'Contested / Inconclusive'
    | 'Largely Refuted / Unsupported';
  sourceIds: string[];
}

export interface OriginalEvidenceItem {
  title: string;
  recordType: RecordTier;
  date: string;
  origin: string;
  description: string;
  measurementOrFinding: string;
  sourceId: string;
}

export interface ChartDatasetSpec {
  title: string;
  subtitle: string;
  type: 'line' | 'bar';
  labels: string[];
  datasetLabel: string;
  data: number[];
  unit: string;
  sourceNote: string;
}

export interface ThreeSceneSpec {
  mode:
    | 'subglacial-radar'
    | 'bathymetric-trench'
    | 'spacetime-cone'
    | 'antikythera-gears'
    | 'galactic-halo';
  title: string;
  caption: string;
}

export interface ResearchSource {
  id: string;
  title: string;
  authorOrOrg: string;
  publicationDate: string;
  sourceType: SourceType;
  recordTier: RecordTier;
  url: string;
  accessInfo: string;
  summary: string;
  institutionTag: string;
  relatedMysterySlugs: string[];
}

export interface MysteryInvestigation {
  slug: string;
  title: string;
  subtitle: string;
  summary: string;
  category: CategorySlug;
  secondaryCategories?: CategorySlug[];
  evidenceStatus: EvidenceStatus;
  evidenceRationale: string;
  region: string;
  locationName: string;
  coordinates: {
    lat: number;
    lng: number;
    precisionLabel: string;
  };
  readingTimeMinutes: number;
  popularityScore: number;
  updatedAt: string;
  featured: boolean;
  heroImage: string;
  imageAlt: string;
  overview: {
    what: string;
    where: string;
    when: string;
    narrative: string;
  };
  whyMysterious: string[];
  timeline: TimelineEvent[];
  whatWeKnow: string[];
  originalEvidence: OriginalEvidenceItem[];
  competingTheories: CompetingTheory[];
  scientificInvestigation: {
    methods: string[];
    narrative: string;
    chart?: ChartDatasetSpec;
    threeScene?: ThreeSceneSpec;
  };
  whatRemainsUnknown: string[];
  finalAssessment: string;
  sourceIds: string[];
}

export interface RecentDiscovery {
  id: string;
  title: string;
  date: string;
  institution: string;
  summary: string;
  relatedMysterySlug: string;
  sourceUrl: string;
  discipline: string;
}

export interface AssistantCitation {
  sourceId: string;
  title: string;
  authorOrOrg: string;
  publicationDate: string;
  url: string;
  recordTier: RecordTier;
}

export interface AssistantResponse {
  answer: string;
  confidenceNote: string;
  missingEvidenceNotice?: string;
  citations: AssistantCitation[];
  suggestedQuestions: string[];
}
