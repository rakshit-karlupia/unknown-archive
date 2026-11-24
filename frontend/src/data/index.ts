import { CATEGORIES, RECENT_DISCOVERIES, TRUSTED_INSTITUTIONS } from './categories';
import { MYSTERIES_EXTRA_PART_1 } from './mysteriesExtraPart1';
import { MYSTERIES_EXTRA_PART_2 } from './mysteriesExtraPart2';
import { MYSTERIES_PART_1 } from './mysteriesPart1';
import { MYSTERIES_PART_2 } from './mysteriesPart2';
import { RESEARCH_SOURCES as BASE_RESEARCH_SOURCES } from './sources';
import { NEW_RESEARCH_SOURCES } from './sourcesExtra';
import type {
  AssistantCitation,
  AssistantResponse,
  CategorySlug,
  EvidenceStatus,
  MysteryInvestigation,
  ResearchSource,
} from '../types/archive';

export const MYSTERIES: MysteryInvestigation[] = [
  ...MYSTERIES_PART_1,
  ...MYSTERIES_PART_2,
  ...MYSTERIES_EXTRA_PART_1,
  ...MYSTERIES_EXTRA_PART_2,
];

export const RESEARCH_SOURCES: ResearchSource[] = [
  ...BASE_RESEARCH_SOURCES,
  ...NEW_RESEARCH_SOURCES,
];

export { CATEGORIES, RECENT_DISCOVERIES, TRUSTED_INSTITUTIONS };

export function getMysteryBySlug(slug: string): MysteryInvestigation | undefined {
  return MYSTERIES.find((m) => m.slug === slug);
}

export function getCategoryBySlug(slug: CategorySlug) {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function getSourcesForMystery(mystery: MysteryInvestigation): ResearchSource[] {
  const idSet = new Set(mystery.sourceIds);
  return RESEARCH_SOURCES.filter(
    (s) => idSet.has(s.id) || s.relatedMysterySlugs.includes(mystery.slug)
  );
}

export function getSourcesByIds(ids: string[]): ResearchSource[] {
  const idSet = new Set(ids);
  return RESEARCH_SOURCES.filter((s) => idSet.has(s.id));
}

export const EVIDENCE_DEFINITIONS: Record<
  EvidenceStatus,
  {
    label: string;
    plainLabel: string;
    description: string;
    colorClass: string;
    badgeBg: string;
    dotColor: string;
  }
> = {
  VERIFIED: {
    label: 'VERIFIED',
    plainLabel: 'Verified Fact',
    description: 'Supported by reliable documentation or repeatable scientific evidence.',
    colorClass: 'text-emerald-300 border-emerald-400/35 bg-emerald-500/10',
    badgeBg: '#10B981',
    dotColor: '#34D399',
  },
  UNRESOLVED: {
    label: 'UNRESOLVED',
    plainLabel: 'Open Mystery',
    description: 'A real phenomenon or historical event with important unanswered questions.',
    colorClass: 'text-[#6C9EFF] border-[#6C9EFF]/40 bg-[#6C9EFF]/10',
    badgeBg: '#6C9EFF',
    dotColor: '#6C9EFF',
  },
  DEBATED: {
    label: 'DEBATED',
    plainLabel: 'Debated',
    description: 'Competing interpretations exist and the evidence is inconclusive.',
    colorClass: 'text-[#E5B66A] border-[#E5B66A]/40 bg-[#E5B66A]/10',
    badgeBg: '#E5B66A',
    dotColor: '#E5B66A',
  },
  UNSUPPORTED: {
    label: 'UNSUPPORTED',
    plainLabel: 'No Proof / Myth',
    description: 'No reliable evidence currently supports the claim.',
    colorClass: 'text-rose-300 border-rose-400/35 bg-rose-500/10',
    badgeBg: '#F43F5E',
    dotColor: '#FB7185',
  },
};

export function generateGroundedAssistantReply(
  query: string,
  mysterySlug?: string
): AssistantResponse {
  const q = query.trim().toLowerCase();
  const targetMystery =
    (mysterySlug && getMysteryBySlug(mysterySlug)) ||
    MYSTERIES.find(
      (m) =>
        q.includes(m.title.toLowerCase()) ||
        q.includes(m.slug.replace(/-/g, ' ')) ||
        m.slug.split('-').some((part) => part.length > 4 && q.includes(part))
    );

  if (!targetMystery) {
    const matchedSources = RESEARCH_SOURCES.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.summary.toLowerCase().includes(q) ||
        s.authorOrOrg.toLowerCase().includes(q)
    ).slice(0, 4);

    if (matchedSources.length > 0) {
      const citations: AssistantCitation[] = matchedSources.map((s) => ({
        sourceId: s.id,
        title: s.title,
        authorOrOrg: s.authorOrOrg,
        publicationDate: s.publicationDate,
        url: s.url,
        recordTier: s.recordTier,
      }));
      return {
        answer: `Across The Unknown Archive's indexed research library, ${matchedSources.length} primary or peer-reviewed records match your query:\n\n${matchedSources
          .map((s) => `• **${s.title}** (${s.authorOrOrg}): ${s.summary}`)
          .join('\n')}`,
        confidenceNote: 'Grounded strictly in indexed Research Library documents.',
        citations,
        suggestedQuestions: [
          'What happened in Area 51?',
          'What is the strongest evidence for Somerton Man?',
          'Where can I find original documents for MKUltra?',
        ],
      };
    }

    return {
      answer: `I could not match your question to a specific mystery dossier or indexed archive record. Please name one of our ${MYSTERIES.length} investigations (such as Area 51, MKUltra, Franklin Expedition, Voynich Manuscript, John Titor, Illuminati, Dyatlov Pass, or Dark Matter) or ask from inside an investigation page.`,
      confidenceNote: 'No speculation generated outside indexed sources.',
      missingEvidenceNotice:
        'Insufficient match in the indexed archive to provide a source-grounded answer for that query.',
      citations: [],
      suggestedQuestions: [
        'What happened in the Wow! Signal?',
        'What do scientists believe about Dyatlov Pass?',
        'Which theories about Atlantis have been disproven?',
      ],
    };
  }

  const sources = getSourcesForMystery(targetMystery);
  const citations: AssistantCitation[] = sources.map((s) => ({
    sourceId: s.id,
    title: s.title,
    authorOrOrg: s.authorOrOrg,
    publicationDate: s.publicationDate,
    url: s.url,
    recordTier: s.recordTier,
  }));

  const isDisprovenQ =
    q.includes('disproven') || q.includes('refuted') || q.includes('false') || q.includes('myth');
  const isDocsQ =
    q.includes('document') ||
    q.includes('original') ||
    q.includes('source') ||
    q.includes('paper') ||
    q.includes('where');
  const isEvidenceQ =
    q.includes('strongest evidence') || q.includes('evidence') || q.includes('proof') || q.includes('know');
  const isScientistsQ =
    q.includes('scientist') || q.includes('believe') || q.includes('consensus') || q.includes('theory');

  let answer = '';
  let missingEvidenceNotice: string | undefined;

  if (isDisprovenQ) {
    const refuted = targetMystery.competingTheories.filter(
      (t) =>
        t.scientificAcceptance === 'Largely Refuted / Unsupported' ||
        t.scientificAcceptance === 'Contested / Inconclusive'
    );
    if (refuted.length === 0) {
      answer = `In **${targetMystery.title}**, none of the major competing scientific hypotheses in our index are classified as completely refuted—rather, they remain active or limited by current data. ${targetMystery.finalAssessment}`;
      missingEvidenceNotice =
        'No formally refuted theories are listed in this dossier; open scientific gaps remain.';
    } else {
      answer = `For **${targetMystery.title}**, the following claims lack empirical support or are contradicted by primary evidence:\n\n${refuted
        .map(
          (t) =>
            `• **${t.name}** (${t.scientificAcceptance}): ${t.contradictingEvidence.join(' ') || t.scientificLimitations}`
        )
        .join('\n')}`;
    }
  } else if (isDocsQ) {
    if (sources.length === 0) {
      missingEvidenceNotice = 'No indexed original documents exist for this query.';
      answer = 'Evidence missing in current index.';
    } else {
      answer = `Original records and peer-reviewed studies indexed for **${targetMystery.title}** include:\n\n${sources
        .map(
          (s) =>
            `• **[${s.recordTier}] ${s.title}** — ${s.authorOrOrg} (${s.publicationDate}). ${s.summary}`
        )
        .join('\n')}`;
    }
  } else if (isEvidenceQ) {
    answer = `The strongest verified findings for **${targetMystery.title}** (Status: **${targetMystery.evidenceStatus}**) come from ${targetMystery.originalEvidence.length} primary evidence records:\n\n${targetMystery.whatWeKnow
      .slice(0, 3)
      .map((f) => `• ${f}`)
      .join('\n')}\n\n**Primary Evidence:** ${targetMystery.originalEvidence
      .map((e) => `${e.title} (${e.date}) — ${e.measurementOrFinding}`)
      .join(' | ')}`;
  } else if (isScientistsQ) {
    const leading = targetMystery.competingTheories[0];
    answer = `Scientific assessment for **${targetMystery.title}** classifies it as **${targetMystery.evidenceStatus}**: ${targetMystery.evidenceRationale}\n\nLeading scientific interpretation: **${leading.name}** (${leading.scientificAcceptance}) — ${leading.claim}\n\n**What remains unknown:** ${targetMystery.whatRemainsUnknown[0] ?? 'See open questions section.'}`;
  } else {
    answer = `**${targetMystery.title}** (${targetMystery.overview.when} — ${targetMystery.overview.where}):\n\n${targetMystery.overview.what}\n\n${targetMystery.overview.narrative}\n\n**Evidence Classification (${targetMystery.evidenceStatus}):** ${targetMystery.evidenceRationale}`;
  }

  if (targetMystery.whatRemainsUnknown.length > 0 && !missingEvidenceNotice) {
    missingEvidenceNotice = `Open evidence gaps: ${targetMystery.whatRemainsUnknown[0]}`;
  }

  return {
    answer,
    confidenceNote: `Synthesized exclusively from ${citations.length} indexed archive record(s) for ${targetMystery.title}.`,
    missingEvidenceNotice,
    citations,
    suggestedQuestions: [
      `What happened in ${targetMystery.title}?`,
      `What is the strongest evidence for ${targetMystery.title}?`,
      `What do scientists believe about ${targetMystery.title}?`,
      `Which theories have been disproven for ${targetMystery.title}?`,
      `Where can I find original documents for ${targetMystery.title}?`,
    ],
  };
}
