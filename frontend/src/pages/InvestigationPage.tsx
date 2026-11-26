import {
  ArrowLeft,
  Bookmark,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Compass,
  ExternalLink,
  Eye,
  FileCheck2,
  FolderKanban,
  HelpCircle,
  MapPin,
  Maximize2,
  Microscope,
  Scale,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchMysteryBySlug } from '../api/client';
import { AIResearchAssistant } from '../components/AIResearchAssistant';
import { EvidenceBadge } from '../components/EvidenceBadge';
import { MysteryCard } from '../components/MysteryCard';
import { ScientificCharts } from '../components/ScientificCharts';
import { TheoryComparison } from '../components/TheoryComparison';
import { ThreeVisualizer } from '../components/ThreeVisualizer';
import { TimelineExplorer } from '../components/TimelineExplorer';
import {
  EVIDENCE_DEFINITIONS,
  MYSTERIES,
  getCategoryBySlug,
  getMysteryBySlug,
  getSourcesForMystery,
} from '../data';
import { useBookmarks } from '../hooks/useBookmarks';
import type { MysteryInvestigation, ResearchSource } from '../types/archive';

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
      className="scroll-mt-24 rounded-xl border border-white/10 bg-[#0F1420] overflow-hidden"
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left transition-colors hover:bg-white/[0.02]"
      >
        <div className="flex items-center gap-3.5">
          <span className="font-mono-archive rounded border border-[#D4A853]/35 bg-[#080B12] px-2.5 py-1 text-[11px] font-bold tracking-wider text-[#D4A853]">
            {number}
          </span>
          <h2 className="font-editorial text-2xl font-semibold text-white">{title}</h2>
        </div>
        {open ? (
          <ChevronUp className="h-5 w-5 shrink-0 text-[#9AA5BE]" />
        ) : (
          <ChevronDown className="h-5 w-5 shrink-0 text-[#9AA5BE]" />
        )}
      </button>
      {open && <div className="border-t border-white/8 px-6 py-6">{children}</div>}
    </section>
  );
}

const SECTION_LINKS = [
  { id: 'sec-01', label: '01 Overview' },
  { id: 'sec-02', label: '02 Context' },
  { id: 'sec-03', label: '03 Timeline' },
  { id: 'sec-04', label: '04 Facts' },
  { id: 'sec-05', label: '05 Evidence' },
  { id: 'sec-06', label: '06 Theories' },
  { id: 'sec-07', label: '07 Science' },
  { id: 'sec-08', label: '08 Unknowns' },
  { id: 'sec-09', label: '09 Verdict' },
  { id: 'sec-10', label: '10 Sources' },
  { id: 'sec-11', label: '11 Related' },
];

export function InvestigationPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const [mystery, setMystery] = useState<MysteryInvestigation | undefined>(() =>
    getMysteryBySlug(slug)
  );
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({});
  const [expandedEvidence, setExpandedEvidence] = useState<Record<number, boolean>>({});
  const [previewSource, setPreviewSource] = useState<ResearchSource | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const { isBookmarked, toggleBookmark } = useBookmarks();

  useEffect(() => {
    window.scrollTo(0, 0);
    setMystery(getMysteryBySlug(slug));
    setOpenMap({});
    setExpandedEvidence({});
    setPreviewSource(null);
    setLightboxOpen(false);
    void fetchMysteryBySlug(slug).then((data) => {
      if (data) setMystery(data);
    });
  }, [slug]);

  const relatedMysteries = useMemo(() => {
    if (!mystery) return [];
    return MYSTERIES.filter(
      (m) =>
        m.slug !== mystery.slug &&
        (m.category === mystery.category ||
          mystery.secondaryCategories?.includes(m.category) ||
          m.region === mystery.region)
    ).slice(0, 3);
  }, [mystery]);

  if (!mystery) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-editorial text-4xl font-semibold text-white">
          Investigation Not Found
        </h1>
        <p className="mt-3 text-sm text-[#9AA5BE]">
          The requested dossier does not exist in our current archive index.
        </p>
        <Link
          to="/explore"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#D4A853] px-5 py-2.5 text-sm font-semibold text-[#080B12]"
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
  const saved = isBookmarked(mystery.slug);
  const caseCode = `CASE-${mystery.slug.slice(0, 6).toUpperCase()}`;

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
    <article className="bg-[#080B12] pb-24">
      {/* CASE FILE HEADER */}
      <header className="relative isolate overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 -z-10">
          <img
            src={mystery.heroImage}
            alt={mystery.imageAlt}
            className="h-full w-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080B12] via-[#080B12]/85 to-[#080B12]/65" />
        </div>

        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link
              to="/explore"
              className="font-mono-archive inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#9AA5BE] hover:text-[#D4A853] transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Case Index
            </Link>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => toggleBookmark(mystery.slug)}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  saved
                    ? 'border-[#D4A853]/60 bg-[#D4A853]/15 text-[#D4A853]'
                    : 'border-white/15 bg-[#0F1420]/90 text-[#CBD5E1] hover:border-[#D4A853]/50'
                }`}
              >
                <Bookmark className={`h-3.5 w-3.5 ${saved ? 'fill-current' : ''}`} />
                {saved ? 'Saved Dossier' : 'Bookmark'}
              </button>
              <Link
                to={`/investigation-room?case=${mystery.slug}`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#6C9EFF]/40 bg-[#0F1420]/90 px-3 py-1.5 text-xs font-semibold text-[#6C9EFF] hover:border-[#6C9EFF] hover:text-white transition-colors"
              >
                <FolderKanban className="h-3.5 w-3.5" />
                Open in Investigation Room
              </Link>
            </div>
          </div>

          <div className="mt-7 grid gap-8 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="font-mono-archive rounded border border-[#D4A853]/35 bg-[#0F1420]/90 px-2.5 py-0.5 text-[11px] font-semibold tracking-wider text-[#D4A853]">
                  {caseCode}
                </span>
                <Link
                  to={`/explore?category=${mystery.category}`}
                  className="rounded border border-white/15 bg-[#0F1420]/90 px-2.5 py-0.5 text-xs font-medium text-[#CBD5E1] hover:border-[#D4A853]/50"
                >
                  {category ? `${category.number}. ${category.name}` : mystery.category}
                </Link>
                <EvidenceBadge status={mystery.evidenceStatus} showPlainLabel size="md" />
              </div>

              <h1 className="mt-4 font-editorial text-4xl font-semibold leading-tight text-white sm:text-5xl">
                {mystery.title}
              </h1>
              <p className="mt-3 max-w-3xl text-base leading-relaxed text-[#CBD5E1] sm:text-lg">
                {mystery.subtitle}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-5 text-xs text-[#9AA5BE]">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-[#D4A853]" aria-hidden="true" />
                  {mystery.locationName}
                </span>
                <span className="font-mono-archive inline-flex items-center gap-1.5">
                  <Compass className="h-3.5 w-3.5 text-[#6C9EFF]" aria-hidden="true" />
                  {mystery.coordinates.lat.toFixed(2)}°, {mystery.coordinates.lng.toFixed(2)}° (
                  {mystery.coordinates.precisionLabel})
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-[#6C9EFF]" aria-hidden="true" />
                  {mystery.readingTimeMinutes} min read · Updated {mystery.updatedAt}
                </span>
              </div>
            </div>

            {/* Visual Exhibit Thumbnail */}
            <div className="lg:col-span-4">
              <button
                type="button"
                onClick={() => setLightboxOpen(true)}
                className="group relative block w-full overflow-hidden rounded-xl border border-white/15 bg-[#0F1420] text-left"
              >
                <img
                  src={mystery.heroImage}
                  alt={mystery.imageAlt}
                  className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <div className="flex items-center justify-between border-t border-white/10 bg-[#080B12]/90 px-3 py-2 text-[11px] text-[#9AA5BE]">
                  <span className="font-mono-archive truncate">EXHIBIT-01 // {mystery.title}</span>
                  <span className="inline-flex items-center gap-1 text-[#D4A853]">
                    <Maximize2 className="h-3 w-3" />
                    Inspect
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN TWO-COLUMN DOSSIER LAYOUT */}
      <div className="mx-auto mt-8 max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-12">
          {/* STICKY SECTION NAVIGATION SIDEBAR (Desktop) */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-22 space-y-4">
              <nav
                aria-label="Dossier sections"
                className="rounded-xl border border-white/10 bg-[#0F1420] p-4"
              >
                <div className="font-mono-archive mb-3 flex items-center justify-between border-b border-white/8 pb-2.5 text-[10px] font-semibold uppercase tracking-widest text-[#D4A853]">
                  <span>Case Sections</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setAllOpen(true)}
                      className="text-[#6C9EFF] hover:underline"
                    >
                      All
                    </button>
                    <button
                      type="button"
                      onClick={() => setAllOpen(false)}
                      className="text-[#9AA5BE] hover:underline"
                    >
                      Min
                    </button>
                  </div>
                </div>
                <ul className="space-y-1">
                  {SECTION_LINKS.map((sec) => (
                    <li key={sec.id}>
                      <a
                        href={`#${sec.id}`}
                        onClick={() => {
                          if (!isSectionOpen(sec.id)) toggleSection(sec.id);
                        }}
                        className="font-mono-archive block rounded-md px-2.5 py-1.5 text-xs text-[#9AA5BE] transition-colors hover:bg-white/[0.04] hover:text-[#D4A853]"
                      >
                        {sec.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="rounded-xl border border-white/10 bg-[#0F1420] p-4 text-xs">
                <div className="font-mono-archive text-[10px] font-semibold uppercase tracking-widest text-[#9AA5BE]">
                  Dossier Metadata
                </div>
                <dl className="mt-3 space-y-2">
                  <div className="flex justify-between gap-2">
                    <dt className="text-[#68748F]">Region</dt>
                    <dd className="text-right text-white">{mystery.region}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-[#68748F]">Sources</dt>
                    <dd className="font-mono-archive text-right text-[#6C9EFF]">
                      {sources.length} indexed
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-[#68748F]">Theories</dt>
                    <dd className="font-mono-archive text-right text-[#D4A853]">
                      {mystery.competingTheories.length} audited
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </aside>

          {/* MAIN CONTENT COLUMN */}
          <div className="lg:col-span-9 space-y-6">
            {/* AT-A-GLANCE QUICK VERDICT */}
            <section
              aria-label="At a glance summary"
              className="rounded-xl border border-[#D4A853]/30 bg-[#0F1420] p-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-[#D4A853]" aria-hidden="true" />
                  <h2 className="font-editorial text-xl font-semibold text-white">
                    At a Glance — Quick Verdict
                  </h2>
                </div>
                <EvidenceBadge status={mystery.evidenceStatus} showPlainLabel />
              </div>
              <p className="mt-4 text-[15px] leading-[1.7] text-[#E2E8F0]">
                <strong className="text-white">{statusMeta.plainLabel}: </strong>
                {mystery.evidenceRationale}
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 text-sm">
                <div className="rounded-lg border border-white/8 bg-[#080B12] p-3.5">
                  <span className="font-mono-archive text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
                    Key Proven Fact
                  </span>
                  <p className="mt-1 text-sm leading-relaxed text-[#CBD5E1]">
                    {mystery.whatWeKnow[0]}
                  </p>
                </div>
                <div className="rounded-lg border border-white/8 bg-[#080B12] p-3.5">
                  <span className="font-mono-archive text-[10px] font-semibold uppercase tracking-wider text-[#6C9EFF]">
                    What Remains Open
                  </span>
                  <p className="mt-1 text-sm leading-relaxed text-[#CBD5E1]">
                    {mystery.whatRemainsUnknown[0] ?? 'See Section 08.'}
                  </p>
                </div>
              </div>
            </section>

            {/* Mobile Sticky Quick Jump Bar */}
            <nav
              aria-label="Mobile section navigation"
              className="lg:hidden sticky top-16 z-30 flex items-center gap-2 overflow-x-auto rounded-lg border border-white/10 bg-[#0F1420]/95 px-3 py-2.5 backdrop-blur-md"
            >
              {SECTION_LINKS.map((sec) => (
                <a
                  key={sec.id}
                  href={`#${sec.id}`}
                  onClick={() => {
                    if (!isSectionOpen(sec.id)) toggleSection(sec.id);
                  }}
                  className="font-mono-archive shrink-0 rounded border border-white/10 bg-[#080B12] px-2.5 py-1 text-[11px] text-[#CBD5E1] hover:border-[#D4A853]/50"
                >
                  {sec.label}
                </a>
              ))}
            </nav>

            {/* 1. INVESTIGATION OVERVIEW */}
            <CollapsibleSection
              id="sec-01"
              number="01"
              title="Investigation Overview"
              open={isSectionOpen('sec-01')}
              onToggle={() => toggleSection('sec-01')}
            >
              <div className="grid gap-4 sm:grid-cols-3 mb-6">
                <div className="rounded-lg border border-white/8 bg-[#080B12] p-4">
                  <span className="font-mono-archive text-[10px] font-semibold uppercase tracking-wider text-[#D4A853]">
                    What Happened
                  </span>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#CBD5E1]">
                    {mystery.overview.what}
                  </p>
                </div>
                <div className="rounded-lg border border-white/8 bg-[#080B12] p-4">
                  <span className="font-mono-archive text-[10px] font-semibold uppercase tracking-wider text-[#6C9EFF]">
                    Where
                  </span>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#CBD5E1]">
                    {mystery.overview.where}
                  </p>
                </div>
                <div className="rounded-lg border border-white/8 bg-[#080B12] p-4">
                  <span className="font-mono-archive text-[10px] font-semibold uppercase tracking-wider text-[#D4A853]">
                    When
                  </span>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#CBD5E1]">
                    {mystery.overview.when}
                  </p>
                </div>
              </div>
              <p className="text-[15px] sm:text-base leading-[1.75] text-[#E2E8F0]">
                {mystery.overview.narrative}
              </p>
            </CollapsibleSection>

            {/* 2. BACKGROUND & HISTORICAL CONTEXT */}
            <CollapsibleSection
              id="sec-02"
              number="02"
              title="Background & Historical Context"
              open={isSectionOpen('sec-02')}
              onToggle={() => toggleSection('sec-02')}
            >
              <ul className="space-y-3">
                {mystery.whyMysterious.map((q, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-3 rounded-lg border border-white/8 bg-[#080B12] p-4 text-[15px] leading-relaxed text-[#E2E8F0]"
                  >
                    <HelpCircle
                      className="mt-0.5 h-4 w-4 shrink-0 text-[#D4A853]"
                      aria-hidden="true"
                    />
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </CollapsibleSection>

            {/* 3. TIMELINE OF EVENTS */}
            <CollapsibleSection
              id="sec-03"
              number="03"
              title="Timeline of Events"
              open={isSectionOpen('sec-03')}
              onToggle={() => toggleSection('sec-03')}
            >
              <TimelineExplorer
                events={mystery.timeline}
                mysteryTitle={mystery.title}
                mysterySlug={mystery.slug}
              />
            </CollapsibleSection>

            {/* 4. ESTABLISHED FACTS */}
            <CollapsibleSection
              id="sec-04"
              number="04"
              title="Verified Facts & Observations"
              open={isSectionOpen('sec-04')}
              onToggle={() => toggleSection('sec-04')}
            >
              <p className="font-mono-archive mb-4 text-[11px] font-semibold uppercase tracking-wider text-emerald-300">
                Documented Historical &amp; Scientific Findings
              </p>
              <ul className="space-y-3">
                {mystery.whatWeKnow.map((fact, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-3 rounded-lg border border-emerald-400/20 bg-emerald-950/15 p-4 text-[15px] leading-relaxed text-[#E2E8F0]"
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

            {/* 5. EXPANDABLE ORIGINAL EVIDENCE PANELS */}
            <CollapsibleSection
              id="sec-05"
              number="05"
              title="Evidence & Primary Records"
              open={isSectionOpen('sec-05')}
              onToggle={() => toggleSection('sec-05')}
            >
              <div className="grid gap-4 md:grid-cols-2">
                {mystery.originalEvidence.map((item, idx) => {
                  const linked = sources.find((s) => s.id === item.sourceId);
                  const isOpen = expandedEvidence[idx] ?? true;
                  return (
                    <div
                      key={idx}
                      className="flex flex-col justify-between rounded-lg border border-white/10 bg-[#080B12] p-5"
                    >
                      <div>
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                          <span className="font-mono-archive rounded bg-[#6C9EFF]/15 px-2 py-0.5 text-[11px] font-semibold text-[#6C9EFF]">
                            {item.recordType}
                          </span>
                          <span className="font-mono-archive text-[#9AA5BE]">{item.date}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedEvidence((prev) => ({ ...prev, [idx]: !isOpen }))
                          }
                          className="mt-3 flex w-full items-start justify-between gap-2 text-left"
                        >
                          <h3 className="font-editorial text-xl font-semibold text-white">
                            {item.title}
                          </h3>
                          {isOpen ? (
                            <ChevronUp className="mt-1 h-4 w-4 shrink-0 text-[#9AA5BE]" />
                          ) : (
                            <ChevronDown className="mt-1 h-4 w-4 shrink-0 text-[#9AA5BE]" />
                          )}
                        </button>
                        <p className="mt-1 text-xs font-semibold text-[#D4A853]">{item.origin}</p>
                        {isOpen && (
                          <>
                            <p className="mt-2.5 text-sm leading-relaxed text-[#CBD5E1]">
                              {item.description}
                            </p>
                            <div className="mt-3 rounded-md border border-white/8 bg-[#0F1420] p-3 text-sm text-[#E2E8F0]">
                              <strong className="text-[#6C9EFF]">Key Finding: </strong>
                              {item.measurementOrFinding}
                            </div>
                          </>
                        )}
                      </div>
                      {linked && (
                        <button
                          type="button"
                          onClick={() => setPreviewSource(linked)}
                          className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#D4A853] hover:underline"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Preview Source ({linked.institutionTag})
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </CollapsibleSection>

            {/* 6. EXISTING THEORIES */}
            <CollapsibleSection
              id="sec-06"
              number="06"
              title="Existing Theories & Comparison"
              open={isSectionOpen('sec-06')}
              onToggle={() => toggleSection('sec-06')}
            >
              <p className="mb-5 text-sm leading-relaxed text-[#CBD5E1]">
                Competing explanations presented side by side—weighing supporting observations,
                contradicting evidence, and scientific limitations without invented probabilities.
              </p>
              <TheoryComparison theories={mystery.competingTheories} />
            </CollapsibleSection>

            {/* 7. SCIENTIFIC EXPLANATIONS */}
            <CollapsibleSection
              id="sec-07"
              number="07"
              title="Scientific Explanations & Data"
              open={isSectionOpen('sec-07')}
              onToggle={() => toggleSection('sec-07')}
            >
              <div className="flex flex-wrap gap-2 mb-5">
                {mystery.scientificInvestigation.methods.map((method) => (
                  <span
                    key={method}
                    className="inline-flex items-center gap-1.5 rounded-md border border-[#6C9EFF]/35 bg-[#080B12] px-3 py-1 text-xs font-medium text-[#CBD5E1]"
                  >
                    <Microscope className="h-3.5 w-3.5 text-[#6C9EFF]" aria-hidden="true" />
                    {method}
                  </span>
                ))}
              </div>
              <p className="text-[15px] leading-[1.75] text-[#E2E8F0] mb-6">
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
                    className="flex items-start gap-3 rounded-lg border border-[#D4A853]/25 bg-[#D4A853]/8 p-4 text-[15px] leading-relaxed text-[#F5E7CA]"
                  >
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#D4A853]" />
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
              <div className="rounded-lg border border-white/10 bg-[#080B12] p-6">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <Scale className="h-5 w-5 text-[#D4A853]" aria-hidden="true" />
                  <span className="font-mono-archive text-xs font-semibold uppercase tracking-wider text-[#9AA5BE]">
                    Assigned Classification:
                  </span>
                  <EvidenceBadge status={mystery.evidenceStatus} showPlainLabel size="md" />
                </div>
                <p className="text-[15px] leading-relaxed text-[#CBD5E1] mb-4">
                  <strong className="text-white">Rationale: </strong>
                  {mystery.evidenceRationale}
                </p>
                <div className="border-t border-white/10 pt-4 text-base leading-[1.7] text-white">
                  {mystery.finalAssessment}
                </div>
              </div>
            </CollapsibleSection>

            {/* 10. SUPPORTING SOURCES & PREVIEW */}
            <CollapsibleSection
              id="sec-10"
              number="10"
              title="Supporting Sources & References"
              open={isSectionOpen('sec-10')}
              onToggle={() => toggleSection('sec-10')}
            >
              <p className="mb-4 text-sm text-[#9AA5BE]">
                Primary records, peer-reviewed journal articles, and official institutional reports.
                Select any source to inspect its archival preview or open the original record.
              </p>
              <ul className="space-y-3">
                {sources.map((src) => (
                  <li
                    key={src.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-white/10 bg-[#080B12] p-4 transition-colors hover:border-[#D4A853]/45"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-mono-archive rounded bg-[#6C9EFF]/15 px-2 py-0.5 text-[11px] font-semibold text-[#6C9EFF]">
                          {src.recordTier}
                        </span>
                        <span className="rounded bg-white/8 px-2 py-0.5 text-[#CBD5E1]">
                          {src.sourceType}
                        </span>
                        <span className="font-mono-archive text-[#9AA5BE]">
                          {src.publicationDate}
                        </span>
                      </div>
                      <h4 className="mt-2 text-sm font-semibold text-white">{src.title}</h4>
                      <p className="mt-0.5 text-xs font-medium text-[#D4A853]">
                        {src.authorOrOrg}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPreviewSource(src)}
                        className="inline-flex items-center gap-1 rounded-md border border-white/12 bg-[#0F1420] px-2.5 py-1.5 text-xs text-[#CBD5E1] hover:border-[#D4A853]/50 hover:text-white"
                      >
                        <Eye className="h-3.5 w-3.5 text-[#D4A853]" />
                        Preview
                      </button>
                      <a
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-md border border-[#6C9EFF]/35 bg-[#6C9EFF]/10 px-2.5 py-1.5 text-xs font-semibold text-[#6C9EFF] hover:bg-[#6C9EFF]/20"
                      >
                        Open
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            </CollapsibleSection>

            {/* 11. RELATED INVESTIGATIONS */}
            {relatedMysteries.length > 0 && (
              <CollapsibleSection
                id="sec-11"
                number="11"
                title="Related Investigations"
                open={isSectionOpen('sec-11')}
                onToggle={() => toggleSection('sec-11')}
              >
                <div className="grid gap-5 md:grid-cols-3">
                  {relatedMysteries.map((rel) => (
                    <MysteryCard key={rel.slug} mystery={rel} />
                  ))}
                </div>
              </CollapsibleSection>
            )}

            {/* Grounded AI Research Assistant scoped to this mystery */}
            <div className="pt-2">
              <AIResearchAssistant mysterySlug={mystery.slug} mysteryTitle={mystery.title} />
            </div>
          </div>
        </div>
      </div>

      {/* SOURCE PREVIEW MODAL */}
      {previewSource && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Source preview"
          onClick={() => setPreviewSource(null)}
        >
          <div
            className="w-full max-w-lg rounded-xl border border-[#D4A853]/35 bg-[#0F1420] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <span className="font-mono-archive text-[10px] font-semibold uppercase tracking-widest text-[#D4A853]">
                  {previewSource.recordTier} · {previewSource.sourceType}
                </span>
                <h3 className="mt-1 font-editorial text-2xl font-semibold text-white">
                  {previewSource.title}
                </h3>
                <p className="mt-1 text-xs text-[#6C9EFF]">
                  {previewSource.authorOrOrg} ({previewSource.publicationDate})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewSource(null)}
                aria-label="Close source preview"
                className="rounded-md p-1.5 text-[#9AA5BE] hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-[#CBD5E1]">{previewSource.summary}</p>
            <div className="mt-4 rounded-lg border border-white/8 bg-[#080B12] p-3 text-xs text-[#9AA5BE]">
              <strong className="text-white">Archival Access: </strong>
              {previewSource.accessInfo}
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setPreviewSource(null)}
                className="rounded-lg border border-white/12 px-4 py-2 text-xs text-[#CBD5E1] hover:text-white"
              >
                Close
              </button>
              <a
                href={previewSource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#D4A853] px-4 py-2 text-xs font-semibold text-[#080B12]"
              >
                Open External Record
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* EXHIBIT LIGHTBOX MODAL */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Exhibit inspection"
          onClick={() => setLightboxOpen(false)}
        >
          <div
            className="relative max-w-4xl w-full overflow-hidden rounded-xl border border-white/15 bg-[#0F1420]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              aria-label="Close exhibit viewer"
              className="absolute top-3 right-3 z-10 rounded-lg border border-white/20 bg-[#080B12]/90 p-2 text-white hover:border-[#D4A853]"
            >
              <X className="h-4 w-4" />
            </button>
            <img
              src={mystery.heroImage}
              alt={mystery.imageAlt}
              className="max-h-[75vh] w-full object-contain bg-[#080B12]"
            />
            <div className="border-t border-white/10 p-4">
              <div className="font-mono-archive text-[11px] text-[#D4A853]">
                EXHIBIT-01 // {mystery.title}
              </div>
              <p className="mt-1 text-xs text-[#CBD5E1]">{mystery.imageAlt}</p>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
