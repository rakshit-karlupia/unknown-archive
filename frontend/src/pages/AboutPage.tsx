import { BookCheck, Compass, Database, ExternalLink, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EvidenceBadge } from '../components/EvidenceBadge';
import { EVIDENCE_DEFINITIONS, TRUSTED_INSTITUTIONS } from '../data';
import type { EvidenceStatus } from '../types/archive';

const STATUS_KEYS: EvidenceStatus[] = ['VERIFIED', 'UNRESOLVED', 'DEBATED', 'UNSUPPORTED'];

export function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 space-y-12">
      <header className="max-w-3xl">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6C9EFF]">
          Editorial Charter &amp; Methodology
        </span>
        <h1 className="mt-2 font-editorial text-4xl font-semibold text-white sm:text-5xl">
          Make the Unknown Understandable
        </h1>
        <p className="mt-4 text-base leading-relaxed text-[#CBD6F0]">
          THE UNKNOWN ARCHIVE is a digital museum and scientific discovery platform dedicated to
          investigating humanity’s enduring mysteries without sensationalism. Whether examining
          subglacial Antarctic lakes, relativistic spacetime, or Himalayan bioarchaeology, we
          separate verified facts from open questions and unsupported speculation.
        </p>
      </header>

      {/* Evidence Classification Methodology */}
      <section className="rounded-2xl border border-white/10 bg-[#121A2B] p-7">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="h-5 w-5 text-[#E5B66A]" />
          <h2 className="font-editorial text-3xl font-semibold text-white">
            Evidence Classification System
          </h2>
        </div>
        <p className="mt-2 text-sm text-[#A8B3CF]">
          Every investigation carries an explicit classification explaining why it was assigned. We
          never label an unexplained event as supernatural.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {STATUS_KEYS.map((key) => (
            <div
              key={key}
              className="rounded-xl border border-white/10 bg-[#0B1020] p-5 space-y-2.5"
            >
              <EvidenceBadge status={key} size="md" />
              <p className="text-sm leading-relaxed text-[#CBD6F0]">
                {EVIDENCE_DEFINITIONS[key].description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Research Principles */}
      <section className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-[#121A2B] p-6">
          <BookCheck className="h-6 w-6 text-[#6C9EFF]" />
          <h3 className="mt-4 font-editorial text-2xl font-semibold text-white">
            Primary Sources First
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-[#A8B3CF]">
            Historical logs, radar datasets, ancient texts, and peer-reviewed publications are cited
            directly—and never fabricated.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#121A2B] p-6">
          <Compass className="h-6 w-6 text-[#E5B66A]" />
          <h3 className="mt-4 font-editorial text-2xl font-semibold text-white">
            Balanced Theory Audits
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-[#A8B3CF]">
            Competing explanations display supporting evidence, contradicting evidence, and real
            scientific limitations without invented percentages.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#121A2B] p-6">
          <Database className="h-6 w-6 text-[#6C9EFF]" />
          <h3 className="mt-4 font-editorial text-2xl font-semibold text-white">
            PostGIS &amp; Open APIs
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-[#A8B3CF]">
            Built with React, TypeScript, MapLibre GL JS, Chart.js, Three.js, and a Python FastAPI
            + PostgreSQL/PostGIS geospatial backend.
          </p>
        </div>
      </section>

      {/* Trusted Institutions */}
      <section className="rounded-2xl border border-white/10 bg-[#121A2B] p-7">
        <h2 className="font-editorial text-3xl font-semibold text-white">
          Institutional &amp; Scientific Integrations
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {TRUSTED_INSTITUTIONS.map((inst) => (
            <a
              key={inst.name}
              href={inst.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start justify-between gap-3 rounded-xl border border-white/10 bg-[#0B1020] p-4 hover:border-[#6C9EFF]/50 transition-colors"
            >
              <div>
                <div className="text-sm font-semibold text-white">{inst.fullName}</div>
                <div className="mt-1 text-xs text-[#A8B3CF]">{inst.focus}</div>
              </div>
              <ExternalLink className="h-4 w-4 shrink-0 text-[#6C9EFF]" />
            </a>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/explore"
            className="rounded-xl bg-[#E5B66A] px-5 py-2.5 text-sm font-semibold text-[#0B1020]"
          >
            Explore Investigations
          </Link>
          <Link
            to="/library"
            className="rounded-xl border border-white/15 bg-[#0B1020] px-5 py-2.5 text-sm font-semibold text-white hover:border-[#6C9EFF]"
          >
            Browse Research Library
          </Link>
        </div>
      </section>
    </div>
  );
}
