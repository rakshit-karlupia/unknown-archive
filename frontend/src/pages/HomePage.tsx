import { motion } from 'framer-motion';
import {
  ArrowRight,
  Compass,
  ExternalLink,
  Microscope,
  SearchCheck,
  Sparkles,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchCategories, fetchDiscoveries, fetchMysteries } from '../api/client';
import { EvidenceBadge } from '../components/EvidenceBadge';
import { MysteryCard } from '../components/MysteryCard';
import {
  CATEGORIES,
  EVIDENCE_DEFINITIONS,
  MYSTERIES,
  RECENT_DISCOVERIES,
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
  'bermuda-triangle',
  'time-travel',
  'lost-city-of-atlantis',
  'wow-signal',
  'dyatlov-pass',
];

const EVIDENCE_ORDER: EvidenceStatus[] = ['VERIFIED', 'UNRESOLVED', 'DEBATED', 'UNSUPPORTED'];

const STAGES = [
  {
    step: '01',
    title: 'Discover the mystery',
    description:
      'Every dossier starts in plain English—stating what happened, where and when it occurred, and why ordinary explanations initially fell short.',
    icon: Compass,
  },
  {
    step: '02',
    title: 'Examine the evidence',
    description:
      'We separate verified measurements, original archives, and physical telemetry from rumor—comparing competing theories side by side.',
    icon: SearchCheck,
  },
  {
    step: '03',
    title: 'Understand what science knows',
    description:
      'Instead of mystery for mystery’s sake, we translate peer-reviewed physics, archaeology, and forensics into clear, trustworthy verdicts.',
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

  const featuredMysteries = FEATURED_SLUGS.map((slug) =>
    mysteries.find((m) => m.slug === slug)
  ).filter((m): m is MysteryInvestigation => Boolean(m));

  return (
    <div className="bg-[#0B1020]">
      {/* HERO SECTION */}
      <section className="relative isolate overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 -z-10">
          <img
            src="/images/hero-archive.svg"
            alt="Cinematic composite of Antarctic glacial ice shelves, deep abyssal ocean waves, and deep space nebula."
            className="h-full w-full object-cover object-center opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B1020]/60 via-[#0B1020]/75 to-[#0B1020]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B1020]/90 via-[#0B1020]/55 to-transparent" />
        </div>

        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-[#6C9EFF]/35 bg-[#121A2B]/90 px-3.5 py-1.5 text-xs font-medium tracking-[0.14em] uppercase text-[#6C9EFF] backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-[#E5B66A]" aria-hidden="true" />
              Make the unknown understandable
            </div>

            <h1 className="mt-5 font-editorial text-4xl font-semibold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
              THE WORLD IS FULL OF QUESTIONS WE HAVEN&apos;T ANSWERED.
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-relaxed text-[#D8E2F6] sm:text-lg">
              Explore {mysteries.length} structured investigations across secret operations, time
              anomalies, disappearances, secret societies, and frontier science—separating verified
              history from unsupported myth.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/explore"
                className="inline-flex items-center gap-2 rounded-xl bg-[#E5B66A] px-6 py-3.5 text-sm font-semibold text-[#0B1020] transition-all hover:bg-[#f0c57e]"
              >
                Explore All {mysteries.length} Dossiers
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                to="/map"
                className="inline-flex items-center gap-2 rounded-xl border border-[#6C9EFF]/45 bg-[#121A2B]/90 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:border-[#6C9EFF] hover:bg-[#18243C]"
              >
                Global Mystery Map
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* A. EXHIBITION CATEGORY GRID (12-CATEGORY LAYOUT) */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <h2 className="font-ui text-2xl font-extrabold uppercase tracking-[0.06em] text-white sm:text-3xl">
              THE UNKNOWN ARCHIVE
            </h2>
            <p className="mt-1.5 text-sm font-medium uppercase tracking-[0.14em] text-[#B8C4E0]">
              EXPLORE THE WORLD&apos;S UNANSWERED QUESTIONS
            </p>
          </div>
          <Link
            to="/categories"
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/12 bg-[#121A2B] px-4 py-2 text-sm font-medium text-[#E5B66A] transition-colors hover:border-[#E5B66A]/50 hover:text-white"
          >
            Browse full category index
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-x-8 gap-y-11 md:grid-cols-2">
          {categories.map((cat) => {
            const count = mysteries.filter(
              (m) => m.category === cat.slug || m.secondaryCategories?.includes(cat.slug)
            ).length;
            return (
              <Link
                key={cat.slug}
                to={`/explore?category=${cat.slug}`}
                className="group block focus:outline-none"
              >
                <div className="overflow-hidden rounded-2xl border border-white/12 bg-[#121A2B] aspect-[16/10] shadow-[0_12px_32px_rgba(0,0,0,0.4)] transition-all duration-300 group-hover:border-[#6C9EFF]/60 group-hover:shadow-[0_18px_42px_rgba(0,0,0,0.6)]">
                  <img
                    src={cat.image}
                    alt={`${cat.number}. ${cat.name} — ${cat.tagline}`}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="mt-4 flex items-baseline justify-between gap-3">
                  <h3 className="text-xl font-bold tracking-tight text-white transition-colors group-hover:text-[#E5B66A] sm:text-2xl">
                    {cat.number}. {cat.name}
                  </h3>
                  <span className="shrink-0 rounded-full border border-white/10 bg-[#121A2B] px-2.5 py-0.5 text-xs font-medium text-[#6C9EFF] group-hover:border-[#6C9EFF]/45">
                    {count} {count === 1 ? 'dossier' : 'dossiers'}
                  </span>
                </div>
                <p className="mt-1.5 text-[15px] leading-relaxed text-[#C2CDE4]">{cat.tagline}</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* B. PLAIN-ENGLISH EVIDENCE GUIDE STRIP */}
      <section className="border-y border-white/10 bg-[#101729]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6C9EFF]">
                Easy-to-Read Rating System
              </span>
              <h2 className="mt-1 text-2xl font-bold text-white">
                How to Read Evidence Labels
              </h2>
            </div>
            <Link to="/about" className="text-sm font-medium text-[#E5B66A] hover:underline">
              Read full methodology →
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {EVIDENCE_ORDER.map((status) => {
              const def = EVIDENCE_DEFINITIONS[status];
              return (
                <Link
                  key={status}
                  to={`/explore?status=${status}`}
                  className="rounded-2xl border border-white/10 bg-[#0B1020] p-5 transition-colors hover:border-[#6C9EFF]/45"
                >
                  <EvidenceBadge status={status} showPlainLabel />
                  <p className="mt-3 text-sm leading-relaxed text-[#CBD6F0]">{def.description}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* C. FEATURED MYSTERIES */}
      <section className="mx-auto max-w-7xl px-4 py-18 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#E5B66A]">
              Curated Investigations
            </span>
            <h2 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
              Featured Dossiers
            </h2>
            <p className="mt-2 max-w-2xl text-[15px] text-[#B8C4E0]">
              Six foundational investigations spanning polar geophysics, deep space, relativistic
              physics, and forensic history.
            </p>
          </div>
          <Link
            to="/explore"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#6C9EFF] hover:text-white transition-colors"
          >
            View all {mysteries.length} investigations
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featuredMysteries.map((mystery) => (
            <MysteryCard key={mystery.slug} mystery={mystery} />
          ))}
        </div>
      </section>

      {/* D. RECENT DISCOVERIES */}
      <section className="border-y border-white/8 bg-[#121A2B]/55">
        <div className="mx-auto max-w-7xl px-4 py-18 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#E5B66A]">
                Peer-Reviewed Updates
              </span>
              <h2 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
                Recent Discoveries
              </h2>
              <p className="mt-2 max-w-2xl text-[15px] text-[#B8C4E0]">
                Newly published papers and observational breakthroughs reshaping long-standing
                mysteries.
              </p>
            </div>
            <Link
              to="/library"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#6C9EFF] hover:text-white transition-colors"
            >
              Search Research Library
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {discoveries.slice(0, 3).map((item) => (
              <article
                key={item.id}
                className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#0B1020] p-6 transition-colors hover:border-[#6C9EFF]/40"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-semibold uppercase tracking-wider text-[#6C9EFF]">
                      {item.discipline}
                    </span>
                    <span className="text-[#B8C4E0]">{item.date}</span>
                  </div>
                  <h3 className="mt-3 text-xl font-bold leading-snug text-white">{item.title}</h3>
                  <p className="mt-2 text-xs font-semibold text-[#E5B66A]">{item.institution}</p>
                  <p className="mt-3 text-sm leading-relaxed text-[#CBD6F0]">{item.summary}</p>
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-white/8 pt-4 text-xs">
                  <Link
                    to={`/investigation/${item.relatedMysterySlug}`}
                    className="font-semibold text-white hover:text-[#E5B66A] transition-colors"
                  >
                    Open Investigation →
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

      {/* E. HOW WE INVESTIGATE */}
      <section className="mx-auto max-w-7xl px-4 py-18 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6C9EFF]">
            Editorial &amp; Scientific Method
          </span>
          <h2 className="mt-2 text-3xl font-bold text-white sm:text-4xl">How We Investigate</h2>
          <p className="mt-2 text-[15px] text-[#B8C4E0]">
            Every dossier follows a clear three-stage workflow designed to replace rumor with
            plain-English, verifiable inquiry.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {STAGES.map((stage) => {
            const Icon = stage.icon;
            return (
              <div
                key={stage.step}
                className="rounded-2xl border border-white/10 bg-[#121A2B] p-7"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#6C9EFF]/35 bg-[#0B1020] text-[#6C9EFF]">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="text-2xl font-bold text-[#E5B66A]/75">{stage.step}</span>
                </div>
                <h3 className="mt-5 text-xl font-bold text-white">{stage.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-[#CBD6F0]">{stage.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* F. RESEARCH SOURCES */}
      <section className="border-t border-white/10 bg-[#0E1528]">
        <div className="mx-auto max-w-7xl px-4 py-18 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#E5B66A]">
              Institutional Foundations
            </span>
            <h2 className="mt-2 text-3xl font-bold text-white sm:text-4xl">Research Sources</h2>
            <p className="mt-2 text-[15px] text-[#B8C4E0]">
              All evidence classifications and citations are grounded in open public repositories and
              peer-reviewed literature.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TRUSTED_INSTITUTIONS.map((inst) => (
              <a
                key={inst.name}
                href={inst.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col justify-between rounded-2xl border border-white/10 bg-[#121A2B]/90 p-5 transition-colors hover:border-[#6C9EFF]/50"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold tracking-wider text-white group-hover:text-[#E5B66A] transition-colors">
                      {inst.name}
                    </span>
                    <ExternalLink className="h-3.5 w-3.5 text-[#6C9EFF]" />
                  </div>
                  <p className="mt-1 text-xs font-medium text-[#D8E2F6]">{inst.fullName}</p>
                  <p className="mt-2 text-sm leading-relaxed text-[#B8C4E0]">{inst.focus}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
