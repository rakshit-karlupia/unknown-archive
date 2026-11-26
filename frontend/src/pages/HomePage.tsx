import { motion } from 'framer-motion';
import {
  ArrowRight,
  Compass,
  Database,
  ExternalLink,
  Flame,
  FolderKanban,
  Globe2,
  Microscope,
  SearchCheck,
  ShieldAlert,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchCategories, fetchDiscoveries, fetchMysteries } from '../api/client';
import { ArchiveBackground } from '../components/ArchiveBackground';
import { EvidenceBadge } from '../components/EvidenceBadge';
import { MysteryCard } from '../components/MysteryCard';
import {
  CATEGORIES,
  EVIDENCE_DEFINITIONS,
  MYSTERIES,
  RECENT_DISCOVERIES,
  RESEARCH_SOURCES,
  TRUSTED_INSTITUTIONS,
} from '../data';
import type {
  CategoryInfo,
  EvidenceStatus,
  MysteryInvestigation,
  RecentDiscovery,
} from '../types/archive';

const FEATURED_SLUGS = [
  'antarctica-beneath-the-ice',
  'area-51',
  'somerton-man',
  'lost-city-of-atlantis',
  'wow-signal',
  'dyatlov-pass',
];

const EVIDENCE_ORDER: EvidenceStatus[] = ['VERIFIED', 'UNRESOLVED', 'DEBATED', 'UNSUPPORTED'];

const STAGES = [
  {
    step: '01',
    title: 'Isolate the Record',
    description:
      'Every dossier begins with primary documentation—stating what happened, exact coordinates, dates, and why ordinary explanations initially fell short.',
    icon: Compass,
  },
  {
    step: '02',
    title: 'Audit the Evidence',
    description:
      'We separate verified measurements, declassified records, and physical telemetry from rumor—comparing competing theories side by side.',
    icon: SearchCheck,
  },
  {
    step: '03',
    title: 'Establish the Verdict',
    description:
      'Rather than mystifying facts, we translate peer-reviewed physics, archaeology, and forensics into clear, source-cited classifications.',
    icon: Microscope,
  },
];

export function HomePage() {
  const [mysteries, setMysteries] = useState<MysteryInvestigation[]>(MYSTERIES);
  const [categories, setCategories] = useState<CategoryInfo[]>(CATEGORIES);
  const [discoveries, setDiscoveries] = useState<RecentDiscovery[]>(RECENT_DISCOVERIES);

  useEffect(() => {
    void fetchMysteries().then(setMysteries);
    void fetchCategories().then(setCategories);
    void fetchDiscoveries().then(setDiscoveries);
  }, []);

  const featuredMysteries = useMemo(
    () =>
      FEATURED_SLUGS.map((slug) => mysteries.find((m) => m.slug === slug)).filter(
        (m): m is MysteryInvestigation => Boolean(m)
      ),
    [mysteries]
  );

  const popularMysteries = useMemo(
    () => [...mysteries].sort((a, b) => b.popularityScore - a.popularityScore).slice(0, 3),
    [mysteries]
  );

  const stats = useMemo(() => {
    const verified = mysteries.filter((m) => m.evidenceStatus === 'VERIFIED').length;
    const unresolved = mysteries.filter((m) => m.evidenceStatus === 'UNRESOLVED').length;
    return [
      { label: 'Indexed Dossiers', value: mysteries.length, code: 'ARC-TOTAL' },
      { label: 'Primary & Peer Sources', value: RESEARCH_SOURCES.length, code: 'SRC-VER' },
      { label: 'Unresolved Cases', value: unresolved, code: 'OPEN-INV' },
      { label: 'Verified Historical/Sci', value: verified, code: 'CONFIRMED' },
    ];
  }, [mysteries]);

  return (
    <div className="bg-[#080B12]">
      {/* HERO SECTION */}
      <section className="relative isolate overflow-hidden border-b border-white/10">
        <ArchiveBackground />
        <div className="absolute inset-0 -z-20">
          <img
            src="/images/hero-archive.svg"
            alt="Archival composite of polar ice shelves, abyssal ocean trenches, and deep space telemetry."
            className="h-full w-full object-cover object-center opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#080B12]/70 via-[#080B12]/80 to-[#080B12]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#080B12] via-[#080B12]/75 to-transparent" />
        </div>

        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-22 lg:px-8 lg:py-26">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 rounded-md border border-[#D4A853]/35 bg-[#0F1420]/90 px-3 py-1.5 text-[11px] font-medium tracking-[0.16em] uppercase text-[#D4A853] backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-[#E05252]" aria-hidden="true" />
              <span className="font-mono-archive">DECLASSIFIED RESEARCH ARCHIVE // ACTIVE</span>
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.08 }}
              className="mt-5 font-editorial text-4xl font-semibold leading-[1.06] tracking-tight text-white sm:text-5xl lg:text-6xl"
            >
              THE WORLD IS FULL OF QUESTIONS WE HAVEN&apos;T ANSWERED.
            </motion.h1>

            <p className="mt-5 max-w-2xl text-base leading-relaxed text-[#CBD5E1] sm:text-lg">
              Examine {mysteries.length} structured case files across classified operations, time
              anomalies, unsolved disappearances, secret societies, and frontier science—separating
              documented history from unsupported myth.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3.5">
              <Link
                to="/explore"
                className="inline-flex items-center gap-2 rounded-lg bg-[#D4A853] px-6 py-3 text-sm font-semibold text-[#080B12] transition-colors hover:bg-[#e3ba68]"
              >
                Enter Case Index ({mysteries.length})
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                to="/investigation-room"
                className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-[#0F1420]/90 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:border-[#D4A853]/60 hover:bg-[#141B2B]"
              >
                <FolderKanban className="h-4 w-4 text-[#D4A853]" aria-hidden="true" />
                Investigation Room
              </Link>
              <Link
                to="/map"
                className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-[#0F1420]/90 px-5 py-3 text-sm font-semibold text-[#CBD5E1] backdrop-blur-sm transition-colors hover:border-[#6C9EFF]/60 hover:text-white"
              >
                <Globe2 className="h-4 w-4 text-[#6C9EFF]" aria-hidden="true" />
                Global Map
              </Link>
            </div>
          </motion.div>

          {/* LIVE ARCHIVE TELEMETRY / STATS BAR */}
          <div className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map((item) => (
              <div
                key={item.code}
                className="rounded-lg border border-white/10 bg-[#0F1420]/85 px-4 py-3.5 backdrop-blur-sm"
              >
                <div className="font-mono-archive flex items-center justify-between text-[10px] tracking-widest text-[#68748F]">
                  <span>{item.code}</span>
                  <Database className="h-3 w-3 text-[#D4A853]/70" aria-hidden="true" />
                </div>
                <div className="mt-1.5 font-mono-archive text-2xl font-bold text-white sm:text-3xl">
                  {item.value}
                </div>
                <div className="mt-0.5 text-xs text-[#9AA5BE]">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED INVESTIGATIONS */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <span className="font-mono-archive text-[11px] font-semibold uppercase tracking-[0.18em] text-[#D4A853]">
              Priority Case Files
            </span>
            <h2 className="mt-1.5 font-editorial text-3xl font-semibold text-white sm:text-4xl">
              Featured Investigations
            </h2>
            <p className="mt-1.5 max-w-2xl text-sm text-[#9AA5BE]">
              Six foundational dossiers spanning classified facilities, forensic cold cases, deep
              space signals, and polar geophysics.
            </p>
          </div>
          <Link
            to="/explore"
            className="font-mono-archive inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#D4A853] hover:text-white transition-colors"
          >
            View all {mysteries.length} dossiers
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featuredMysteries.map((mystery) => (
            <MysteryCard key={mystery.slug} mystery={mystery} />
          ))}
        </div>
      </section>

      {/* POPULAR INVESTIGATIONS */}
      <section className="border-y border-white/10 bg-[#0B0F1A]">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="font-mono-archive inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#E05252]">
                <Flame className="h-3.5 w-3.5" aria-hidden="true" />
                High-Interest Files
              </span>
              <h2 className="mt-1.5 font-editorial text-3xl font-semibold text-white">
                Most Explored Investigations
              </h2>
            </div>
            <Link
              to="/explore?sort=popular"
              className="font-mono-archive inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#9AA5BE] hover:text-[#D4A853] transition-colors"
            >
              Browse by popularity
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-7 grid gap-6 md:grid-cols-3">
            {popularMysteries.map((mystery) => (
              <MysteryCard key={mystery.slug} mystery={mystery} />
            ))}
          </div>
        </div>
      </section>

      {/* EVIDENCE RATING GUIDE STRIP */}
      <section className="border-b border-white/10 bg-[#080B12]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
            <div>
              <span className="font-mono-archive text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6C9EFF]">
                Classification Protocol
              </span>
              <h2 className="mt-1 font-editorial text-2xl font-semibold text-white sm:text-3xl">
                How to Read Evidence Labels
              </h2>
            </div>
            <Link
              to="/about"
              className="font-mono-archive text-xs font-medium uppercase tracking-wider text-[#D4A853] hover:underline"
            >
              Full Methodology →
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {EVIDENCE_ORDER.map((status) => {
              const def = EVIDENCE_DEFINITIONS[status];
              return (
                <Link
                  key={status}
                  to={`/explore?status=${status}`}
                  className="rounded-lg border border-white/10 bg-[#0F1420] p-5 transition-colors hover:border-[#D4A853]/45"
                >
                  <EvidenceBadge status={status} showPlainLabel />
                  <p className="mt-3 text-sm leading-relaxed text-[#CBD5E1]">{def.description}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* EXHIBITION CATEGORY GRID (12-CATEGORY LAYOUT) */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <span className="font-mono-archive text-[11px] font-semibold uppercase tracking-[0.18em] text-[#D4A853]">
              12 Research Divisions
            </span>
            <h2 className="mt-1.5 font-editorial text-3xl font-semibold text-white sm:text-4xl">
              Investigation Categories
            </h2>
          </div>
          <Link
            to="/categories"
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/12 bg-[#0F1420] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#D4A853] transition-colors hover:border-[#D4A853]/50 hover:text-white"
          >
            Browse full index
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-9 grid grid-cols-1 gap-x-7 gap-y-9 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => {
            const count = mysteries.filter(
              (m) => m.category === cat.slug || m.secondaryCategories?.includes(cat.slug)
            ).length;
            return (
              <Link
                key={cat.slug}
                to={`/explore?category=${cat.slug}`}
                className="group block rounded-xl border border-white/10 bg-[#0F1420] overflow-hidden transition-colors hover:border-[#D4A853]/45 focus:outline-none"
              >
                <div className="relative aspect-[16/9] overflow-hidden bg-[#080B12]">
                  <img
                    src={cat.image}
                    alt={`${cat.number}. ${cat.name} — ${cat.tagline}`}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F1420] via-transparent to-transparent opacity-80" />
                  <span className="font-mono-archive absolute bottom-2.5 left-3 rounded border border-white/15 bg-[#080B12]/85 px-2 py-0.5 text-[10px] font-semibold text-[#D4A853]">
                    DIV-{cat.number}
                  </span>
                </div>
                <div className="p-5">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-editorial text-xl font-semibold text-white transition-colors group-hover:text-[#D4A853]">
                      {cat.name}
                    </h3>
                    <span className="font-mono-archive shrink-0 text-[11px] text-[#6C9EFF]">
                      {count} {count === 1 ? 'file' : 'files'}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#9AA5BE] line-clamp-2">
                    {cat.tagline}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* RECENT DISCOVERIES */}
      <section className="border-y border-white/10 bg-[#0B0F1A]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="font-mono-archive text-[11px] font-semibold uppercase tracking-[0.18em] text-[#D4A853]">
                Peer-Reviewed Updates
              </span>
              <h2 className="mt-1.5 font-editorial text-3xl font-semibold text-white sm:text-4xl">
                Recent Discoveries
              </h2>
              <p className="mt-1.5 max-w-2xl text-sm text-[#9AA5BE]">
                Newly published papers and observational breakthroughs reshaping long-standing
                investigations.
              </p>
            </div>
            <Link
              to="/library"
              className="font-mono-archive inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#6C9EFF] hover:text-white transition-colors"
            >
              Search Research Library
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {discoveries.slice(0, 3).map((item) => (
              <article
                key={item.id}
                className="flex flex-col justify-between rounded-xl border border-white/10 bg-[#0F1420] p-6 transition-colors hover:border-[#D4A853]/40"
              >
                <div>
                  <div className="font-mono-archive flex items-center justify-between gap-2 text-[11px]">
                    <span className="font-semibold uppercase tracking-wider text-[#6C9EFF]">
                      {item.discipline}
                    </span>
                    <span className="text-[#9AA5BE]">{item.date}</span>
                  </div>
                  <h3 className="mt-3 font-editorial text-xl font-semibold leading-snug text-white">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-xs font-semibold text-[#D4A853]">{item.institution}</p>
                  <p className="mt-3 text-sm leading-relaxed text-[#CBD5E1]">{item.summary}</p>
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-white/8 pt-4 text-xs">
                  <Link
                    to={`/investigation/${item.relatedMysterySlug}`}
                    className="font-mono-archive font-semibold uppercase tracking-wider text-white hover:text-[#D4A853] transition-colors"
                  >
                    Open File →
                  </Link>
                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[#6C9EFF] hover:underline"
                  >
                    Source
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* HOW WE INVESTIGATE */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <span className="font-mono-archive text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6C9EFF]">
            Editorial &amp; Scientific Method
          </span>
          <h2 className="mt-1.5 font-editorial text-3xl font-semibold text-white sm:text-4xl">
            Investigative Protocol
          </h2>
          <p className="mt-2 text-sm text-[#9AA5BE]">
            Every dossier follows a strict three-stage workflow designed to replace speculation with
            verifiable inquiry.
          </p>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {STAGES.map((stage) => {
            const Icon = stage.icon;
            return (
              <div
                key={stage.step}
                className="rounded-xl border border-white/10 bg-[#0F1420] p-6"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#D4A853]/35 bg-[#080B12] text-[#D4A853]">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="font-mono-archive text-xl font-bold text-[#68748F]">
                    {stage.step}
                  </span>
                </div>
                <h3 className="mt-5 font-editorial text-2xl font-semibold text-white">
                  {stage.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#CBD5E1]">{stage.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* RESEARCH SOURCES */}
      <section className="border-t border-white/10 bg-[#0B0F1A]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <span className="font-mono-archive inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#D4A853]">
                <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />
                Institutional Foundations
              </span>
              <h2 className="mt-1.5 font-editorial text-3xl font-semibold text-white sm:text-4xl">
                Primary Research Sources
              </h2>
              <p className="mt-1.5 text-sm text-[#9AA5BE]">
                All evidence classifications and citations are grounded in open public repositories
                and peer-reviewed literature.
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TRUSTED_INSTITUTIONS.map((inst) => (
              <a
                key={inst.name}
                href={inst.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col justify-between rounded-xl border border-white/10 bg-[#0F1420] p-5 transition-colors hover:border-[#D4A853]/45"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono-archive text-xs font-bold tracking-wider text-white group-hover:text-[#D4A853] transition-colors">
                      {inst.name}
                    </span>
                    <ExternalLink className="h-3.5 w-3.5 text-[#6C9EFF]" />
                  </div>
                  <p className="mt-1 text-xs font-medium text-[#CBD5E1]">{inst.fullName}</p>
                  <p className="mt-2 text-sm leading-relaxed text-[#9AA5BE]">{inst.focus}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
