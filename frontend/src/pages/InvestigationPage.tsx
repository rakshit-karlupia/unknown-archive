import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Compass,
  ExternalLink,
  FileCheck2,
  HelpCircle,
  MapPin,
  Microscope,
  Scale,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchMysteryBySlug } from '../api/client';
import { AIResearchAssistant } from '../components/AIResearchAssistant';
import { EvidenceBadge } from '../components/EvidenceBadge';
import { ScientificCharts } from '../components/ScientificCharts';
import { TheoryComparison } from '../components/TheoryComparison';
import { ThreeVisualizer } from '../components/ThreeVisualizer';
import { TimelineExplorer } from '../components/TimelineExplorer';
import {
  EVIDENCE_DEFINITIONS,
  getCategoryBySlug,
  getMysteryBySlug,
  getSourcesForMystery,
} from '../data';
import type { MysteryInvestigation } from '../types/archive';

interface CollapsibleSectionProps {
  id: string;
  number: string;
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function CollapsibleSection({
  id,
  number,
  title,
  open,
  onToggle,
  children,
}: CollapsibleSectionProps) {
  return (
    <section
      id={id}
      className="scroll-mt-24 rounded-2xl border border-white/10 bg-[#121A2B]/95 overflow-hidden"
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-white/[0.03]"
      >
        <div className="flex items-center gap-3.5">
          <span className="rounded-lg border border-[#6C9EFF]/35 bg-[#0B1020] px-2.5 py-1 text-xs font-bold tracking-wider text-[#6C9EFF]">
            {number}
          </span>
          <h2 className="text-xl font-bold text-white sm:text-2xl">{title}</h2>
        </div>
        {open ? (
          <ChevronUp className="h-5 w-5 shrink-0 text-[#B8C4E0]" />
        ) : (
          <ChevronDown className="h-5 w-5 shrink-0 text-[#B8C4E0]" />
        )}
      </button>
      {open && <div className="border-t border-white/8 px-6 py-6">{children}</div>}
    </section>
  );
}

const SECTION_LINKS = [
  { id: 'sec-01', label: '01 Overview' },
  { id: 'sec-02', label: '02 Mystery' },
  { id: 'sec-03', label: '03 Timeline' },
  { id: 'sec-04', label: '04 Facts' },
  { id: 'sec-05', label: '05 Evidence' },
  { id: 'sec-06', label: '06 Theories' },
  { id: 'sec-07', label: '07 Science' },
  { id: 'sec-08', label: '08 Unknowns' },
  { id: 'sec-09', label: '09 Verdict' },
  { id: 'sec-10', label: '10 Sources' },
];

export function InvestigationPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const [mystery, setMystery] = useState<MysteryInvestigation | undefined>(() =>
    getMysteryBySlug(slug)
  );
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    window.scrollTo(0, 0);
    setMystery(getMysteryBySlug(slug));
    setOpenMap({});
    void fetchMysteryBySlug(slug).then((data) => {
      if (data) setMystery(data);
    });
  }, [slug]);

  if (!mystery) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-editorial text-4xl font-semibold text-white">
          Investigation Not Found
        </h1>
        <p className="mt-3 text-sm text-[#B8C4E0]">
          The requested dossier does not exist in our current archive index.
        </p>
        <Link
          to="/explore"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#6C9EFF] px-5 py-2.5 text-sm font-semibold text-[#0B1020]"
        >
          <ArrowLeft className="h-4 w-4" />
          Return to Explore
        </Link>
      </div>
    );
  }

  const category = getCategoryBySlug(mystery.category);
  const sources = getSourcesForMystery(mystery);
  const statusMeta = EVIDENCE_DEFINITIONS[mystery.evidenceStatus];

  const isSectionOpen = (id: string) => openMap[id] ?? true;
  const toggleSection = (id: string) =>
    setOpenMap((prev) => ({ ...prev, [id]: !(prev[id] ?? true) }));
  const setAllOpen = (val: boolean) => {
    const next: Record<string, boolean> = {};
    SECTION_LINKS.forEach((s) => {
      next[s.id] = val;
    });
    setOpenMap(next);
  };

  return (
    <article className="bg-[#0B1020] pb-24">
      {/* Header Banner */}
      <header className="relative isolate overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 -z-10">
          <img
            src={mystery.heroImage}
            alt={mystery.imageAlt}
            className="h-full w-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B1020] via-[#0B1020]/80 to-[#0B1020]/60" />
        </div>

        <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-18 lg:px-8">
          <Link
            to="/explore"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#D8E2F6] hover:text-[#E5B66A] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Explore Mysteries
          </Link>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              to={`/explore?category=${mystery.category}`}
              className="rounded-full border border-white/15 bg-[#121A2B]/90 px-3.5 py-1 text-xs font-semibold text-[#6C9EFF] hover:border-[#6C9EFF]"
            >
              {category ? `${category.number}. ${category.name}` : mystery.category}
            </Link>
            <EvidenceBadge status={mystery.evidenceStatus} showPlainLabel size="md" />
          </div>

          <h1 className="mt-4 font-editorial text-4xl font-semibold leading-tight text-white sm:text-5xl">
            {mystery.title}
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-[#D8E2F6] sm:text-lg">
            {mystery.subtitle}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-5 text-xs text-[#CBD6F0]">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-[#E5B66A]" aria-hidden="true" />
              {mystery.locationName}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Compass className="h-3.5 w-3.5 text-[#6C9EFF]" aria-hidden="true" />
              {mystery.coordinates.precisionLabel}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-[#6C9EFF]" aria-hidden="true" />
              {mystery.readingTimeMinutes} min investigation read
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="mx-auto mt-8 max-w-4xl space-y-6 px-4 sm:px-6 lg:px-8">
        {/* AT-A-GLANCE PLAIN-ENGLISH SUMMARY BOX */}
        <section
          aria-label="At a glance summary"
          className="rounded-2xl border border-[#6C9EFF]/35 bg-[#121A2B] p-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-[#E5B66A]" aria-hidden="true" />
              <h2 className="text-lg font-bold text-white">At a Glance — Quick Verdict</h2>
            </div>
            <EvidenceBadge status={mystery.evidenceStatus} showPlainLabel />
          </div>
          <p className="mt-4 text-[15px] leading-[1.7] text-[#E6ECF8]">
            <strong className="text-white">{statusMeta.plainLabel}: </strong>
            {mystery.evidenceRationale}
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 text-sm">
            <div className="rounded-xl border border-white/8 bg-[#0B1020] p-3.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#E5B66A]">
                Key Proven Fact
              </span>
              <p className="mt-1 text-sm leading-relaxed text-[#D8E2F6]">
                {mystery.whatWeKnow[0]}
              </p>
            </div>
            <div className="rounded-xl border border-white/8 bg-[#0B1020] p-3.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6C9EFF]">
                What Remains Open
              </span>
              <p className="mt-1 text-sm leading-relaxed text-[#D8E2F6]">
                {mystery.whatRemainsUnknown[0] ?? 'See Section 08.'}
              </p>
            </div>
          </div>
        </section>

        {/* QUICK JUMP NAVIGATION */}
        <nav
          aria-label="Dossier sections"
          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#101729] px-4 py-3"
        >
          <div className="flex flex-wrap gap-1.5">
            {SECTION_LINKS.map((sec) => (
              <a
                key={sec.id}
                href={`#${sec.id}`}
                onClick={() => {
                  if (!isSectionOpen(sec.id)) toggleSection(sec.id);
                }}
                className="rounded-lg border border-white/8 bg-[#0B1020] px-2.5 py-1 text-xs font-medium text-[#CBD6F0] transition-colors hover:border-[#6C9EFF]/50 hover:text-white"
              >
                {sec.label}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => setAllOpen(true)}
              className="text-[#6C9EFF] hover:underline"
            >
              Expand all
            </button>
            <span className="text-white/25">|</span>
            <button
              type="button"
              onClick={() => setAllOpen(false)}
              className="text-[#B8C4E0] hover:underline"
            >
              Collapse all
            </button>
          </div>
        </nav>

        {/* 1. MYSTERY OVERVIEW */}
        <CollapsibleSection
          id="sec-01"
          number="01"
          title="Mystery Overview"
          open={isSectionOpen('sec-01')}
          onToggle={() => toggleSection('sec-01')}
        >
          <div className="grid gap-4 sm:grid-cols-3 mb-6">
            <div className="rounded-xl border border-white/8 bg-[#0B1020] p-4">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#E5B66A]">
                What Happened
              </span>
              <p className="mt-1.5 text-sm leading-relaxed text-[#DCE5F7]">
                {mystery.overview.what}
              </p>
            </div>
            <div className="rounded-xl border border-white/8 bg-[#0B1020] p-4">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6C9EFF]">
                Where
              </span>
              <p className="mt-1.5 text-sm leading-relaxed text-[#DCE5F7]">
                {mystery.overview.where}
              </p>
            </div>
            <div className="rounded-xl border border-white/8 bg-[#0B1020] p-4">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#E5B66A]">
                When
              </span>
              <p className="mt-1.5 text-sm leading-relaxed text-[#DCE5F7]">
                {mystery.overview.when}
              </p>
            </div>
          </div>
          <p className="text-[15px] sm:text-base leading-[1.75] text-[#E6ECF8]">
            {mystery.overview.narrative}
          </p>
        </CollapsibleSection>

        {/* 2. WHY IS IT MYSTERIOUS? */}
        <CollapsibleSection
          id="sec-02"
          number="02"
          title="Why Is It Mysterious?"
          open={isSectionOpen('sec-02')}
          onToggle={() => toggleSection('sec-02')}
        >
          <ul className="space-y-3">
            {mystery.whyMysterious.map((q, idx) => (
              <li
                key={idx}
                className="flex items-start gap-3 rounded-xl border border-white/8 bg-[#0B1020]/85 p-4 text-[15px] leading-relaxed text-[#E6ECF8]"
              >
                <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#E5B66A]" aria-hidden="true" />
                <span>{q}</span>
              </li>
            ))}
          </ul>
        </CollapsibleSection>

        {/* 3. HISTORICAL TIMELINE */}
        <CollapsibleSection
          id="sec-03"
          number="03"
          title="Historical Timeline"
          open={isSectionOpen('sec-03')}
          onToggle={() => toggleSection('sec-03')}
        >
          <TimelineExplorer events={mystery.timeline} mysteryTitle={mystery.title} />
        </CollapsibleSection>

        {/* 4. WHAT WE KNOW */}
        <CollapsibleSection
          id="sec-04"
          number="04"
          title="What We Know"
          open={isSectionOpen('sec-04')}
          onToggle={() => toggleSection('sec-04')}
        >
          <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-[#6C9EFF]">
            Established Historical &amp; Scientific Facts
          </p>
          <ul className="space-y-3">
            {mystery.whatWeKnow.map((fact, idx) => (
              <li
                key={idx}
                className="flex items-start gap-3 rounded-xl border border-emerald-400/20 bg-emerald-950/15 p-4 text-[15px] leading-relaxed text-[#E6ECF8]"
              >
                <FileCheck2
                  className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400"
                  aria-hidden="true"
                />
                <span>{fact}</span>
              </li>
            ))}
          </ul>
        </CollapsibleSection>

        {/* 5. ORIGINAL EVIDENCE */}
        <CollapsibleSection
          id="sec-05"
          number="05"
          title="Original Evidence"
          open={isSectionOpen('sec-05')}
          onToggle={() => toggleSection('sec-05')}
        >
          <div className="grid gap-4 md:grid-cols-2">
            {mystery.originalEvidence.map((item, idx) => {
              const linked = sources.find((s) => s.id === item.sourceId);
              return (
                <div
                  key={idx}
                  className="flex flex-col justify-between rounded-xl border border-white/10 bg-[#0B1020] p-5"
                >
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="rounded-md bg-[#6C9EFF]/15 px-2.5 py-0.5 font-semibold text-[#6C9EFF]">
                        {item.recordType}
                      </span>
                      <span className="text-[#B8C4E0]">{item.date}</span>
                    </div>
                    <h3 className="mt-3 text-lg font-bold text-white">{item.title}</h3>
                    <p className="mt-1 text-xs font-semibold text-[#E5B66A]">{item.origin}</p>
                    <p className="mt-2.5 text-sm leading-relaxed text-[#CBD6F0]">
                      {item.description}
                    </p>
                    <div className="mt-3 rounded-lg border border-white/8 bg-[#121A2B] p-3 text-sm text-[#E6ECF8]">
                      <strong className="text-[#6C9EFF]">Key Finding: </strong>
                      {item.measurementOrFinding}
                    </div>
                  </div>
                  {linked && (
                    <a
                      href={linked.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#E5B66A] hover:underline"
                    >
                      Verify original source ({linked.institutionTag})
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </CollapsibleSection>

        {/* 6. COMPETING THEORIES */}
        <CollapsibleSection
          id="sec-06"
          number="06"
          title="Competing Theories"
          open={isSectionOpen('sec-06')}
          onToggle={() => toggleSection('sec-06')}
        >
          <p className="mb-5 text-sm leading-relaxed text-[#CBD6F0]">
            Leading explanations presented side by side—weighing supporting observations,
            contradicting evidence, and current scientific limitations without guesswork.
          </p>
          <TheoryComparison theories={mystery.competingTheories} />
        </CollapsibleSection>

        {/* 7. SCIENTIFIC INVESTIGATION */}
        <CollapsibleSection
          id="sec-07"
          number="07"
          title="Scientific Investigation"
          open={isSectionOpen('sec-07')}
          onToggle={() => toggleSection('sec-07')}
        >
          <div className="flex flex-wrap gap-2 mb-5">
            {mystery.scientificInvestigation.methods.map((method) => (
              <span
                key={method}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#6C9EFF]/35 bg-[#0B1020] px-3 py-1 text-xs font-medium text-[#D8E2F6]"
              >
                <Microscope className="h-3.5 w-3.5 text-[#6C9EFF]" aria-hidden="true" />
                {method}
              </span>
            ))}
          </div>
          <p className="text-[15px] leading-[1.75] text-[#E6ECF8] mb-6">
            {mystery.scientificInvestigation.narrative}
          </p>
          <div className="space-y-6">
            {mystery.scientificInvestigation.chart && (
              <ScientificCharts spec={mystery.scientificInvestigation.chart} />
            )}
            {mystery.scientificInvestigation.threeScene && (
              <ThreeVisualizer spec={mystery.scientificInvestigation.threeScene} />
            )}
          </div>
        </CollapsibleSection>

        {/* 8. WHAT REMAINS UNKNOWN */}
        <CollapsibleSection
          id="sec-08"
          number="08"
          title="What Remains Unknown"
          open={isSectionOpen('sec-08')}
          onToggle={() => toggleSection('sec-08')}
        >
          <ul className="space-y-2.5">
            {mystery.whatRemainsUnknown.map((gap, idx) => (
              <li
                key={idx}
                className="flex items-start gap-3 rounded-xl border border-[#E5B66A]/25 bg-[#E5B66A]/8 p-4 text-[15px] leading-relaxed text-[#F5E7CA]"
              >
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#E5B66A]" />
                <span>{gap}</span>
              </li>
            ))}
          </ul>
        </CollapsibleSection>

        {/* 9. FINAL EVIDENCE ASSESSMENT */}
        <CollapsibleSection
          id="sec-09"
          number="09"
          title="Final Evidence Assessment"
          open={isSectionOpen('sec-09')}
          onToggle={() => toggleSection('sec-09')}
        >
          <div className="rounded-xl border border-white/10 bg-[#0B1020] p-6">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Scale className="h-5 w-5 text-[#E5B66A]" aria-hidden="true" />
              <span className="text-xs font-semibold uppercase tracking-wider text-[#B8C4E0]">
                Assigned Classification:
              </span>
              <EvidenceBadge status={mystery.evidenceStatus} showPlainLabel size="md" />
            </div>
            <p className="text-[15px] leading-relaxed text-[#D8E2F6] mb-4">
              <strong className="text-white">Why this label was assigned: </strong>
              {mystery.evidenceRationale}
            </p>
            <div className="border-t border-white/10 pt-4 text-base leading-[1.7] text-white">
              {mystery.finalAssessment}
            </div>
          </div>
        </CollapsibleSection>

        {/* 10. SOURCES AND REFERENCES */}
        <CollapsibleSection
          id="sec-10"
          number="10"
          title="Sources and References"
          open={isSectionOpen('sec-10')}
          onToggle={() => toggleSection('sec-10')}
        >
          <p className="mb-4 text-sm text-[#B8C4E0]">
            Primary records, peer-reviewed journal articles, and official institutional reports
            supporting this dossier:
          </p>
          <ul className="space-y-3">
            {sources.map((src) => (
              <li key={src.id}>
                <a
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#0B1020] p-4 transition-colors hover:border-[#6C9EFF]/50"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="rounded bg-[#6C9EFF]/15 px-2 py-0.5 font-semibold text-[#6C9EFF]">
                        {src.recordTier}
                      </span>
                      <span className="rounded bg-white/8 px-2 py-0.5 text-[#D8E2F6]">
                        {src.sourceType}
                      </span>
                      <span className="text-[#B8C4E0]">{src.publicationDate}</span>
                    </div>
                    <h4 className="mt-2 text-sm font-semibold text-white">{src.title}</h4>
                    <p className="mt-0.5 text-xs font-medium text-[#E5B66A]">{src.authorOrOrg}</p>
                    <p className="mt-1 text-xs text-[#B8C4E0]">{src.accessInfo}</p>
                  </div>
                  <ExternalLink className="h-4 w-4 shrink-0 text-[#6C9EFF]" />
                </a>
              </li>
            ))}
          </ul>
        </CollapsibleSection>

        {/* Grounded AI Research Assistant scoped to this mystery */}
        <div className="pt-4">
          <AIResearchAssistant mysterySlug={mystery.slug} mysteryTitle={mystery.title} />
        </div>
      </div>
    </article>
  );
}
