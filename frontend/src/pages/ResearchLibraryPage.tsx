import { BookOpen, Database, ExternalLink, RotateCcw, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { fetchApiStatus, fetchSources, type ApiStatus } from '../api/client';
import { AIResearchAssistant } from '../components/AIResearchAssistant';
import { MYSTERIES, RESEARCH_SOURCES } from '../data';
import type { RecordTier, ResearchSource, SourceType } from '../types/archive';

const SOURCE_TYPES: SourceType[] = [
  'Scientific Paper',
  'Government Report',
  'Historical Document',
  'Declassified Record',
  'Archaeological Publication',
  'Original Photograph',
  'Satellite Imagery',
  'Research Dataset',
];

const RECORD_TIERS: RecordTier[] = [
  'Primary Record',
  'Peer-Reviewed Study',
  'Institutional Report',
  'Secondary Commentary',
];

export function ResearchLibraryPage() {
  const [searchParams] = useSearchParams();
  const [sources, setSources] = useState<ResearchSource[]>(RESEARCH_SOURCES);
  const [apiStatus, setApiStatus] = useState<ApiStatus | null>(null);

  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [sourceType, setSourceType] = useState<'' | SourceType>('');
  const [recordTier, setRecordTier] = useState<'' | RecordTier>('');
  const [mysterySlug, setMysterySlug] = useState('');

  useEffect(() => {
    void fetchSources().then(setSources);
    void fetchApiStatus().then(setApiStatus);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sources.filter((s) => {
      if (q) {
        const hay = `${s.title} ${s.authorOrOrg} ${s.summary} ${s.institutionTag}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (sourceType && s.sourceType !== sourceType) return false;
      if (recordTier && s.recordTier !== recordTier) return false;
      if (mysterySlug && !s.relatedMysterySlugs.includes(mysterySlug)) return false;
      return true;
    });
  }, [sources, query, sourceType, recordTier, mysterySlug]);

  const reset = () => {
    setQuery('');
    setSourceType('');
    setRecordTier('');
    setMysterySlug('');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-3xl">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#E5B66A]">
            Primary Records &amp; Peer-Reviewed Literature
          </span>
          <h1 className="mt-2 font-editorial text-4xl font-semibold text-white sm:text-5xl">
            Research Library
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[#A8B3CF] sm:text-base">
            Every claim in The Unknown Archive traces back to verifiable primary documents,
            peer-reviewed scientific papers, official investigation reports, and open research
            datasets. Original records are explicitly distinguished from secondary commentary.
          </p>
        </div>

        {apiStatus && (
          <div className="rounded-xl border border-white/10 bg-[#121A2B] px-4 py-2.5 text-xs text-[#A8B3CF]">
            <div className="flex items-center gap-2 font-semibold text-white">
              <Database className="h-3.5 w-3.5 text-[#6C9EFF]" />
              <span>
                {apiStatus.backendOnline ? 'Live FastAPI Archive Connected' : 'Local Verified Index'}
              </span>
            </div>
            <div className="mt-0.5 text-[11px]">{apiStatus.databaseMode}</div>
          </div>
        )}
      </div>

      {/* Filters */}
      <section className="rounded-2xl border border-white/10 bg-[#121A2B] p-5">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#6C9EFF]"
              aria-hidden="true"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search title, author, NASA, Nature..."
              aria-label="Search research library"
              className="w-full rounded-xl border border-white/12 bg-[#0B1020] py-2.5 pr-3 pl-10 text-sm text-white placeholder-[#7D89A8] focus:border-[#6C9EFF] focus:outline-none"
            />
          </div>

          <select
            value={sourceType}
            onChange={(e) => setSourceType(e.target.value as '' | SourceType)}
            aria-label="Filter by source type"
            className="rounded-xl border border-white/12 bg-[#0B1020] px-3 py-2.5 text-sm text-white"
          >
            <option value="">All Source Types</option>
            {SOURCE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <select
            value={recordTier}
            onChange={(e) => setRecordTier(e.target.value as '' | RecordTier)}
            aria-label="Filter by record classification"
            className="rounded-xl border border-white/12 bg-[#0B1020] px-3 py-2.5 text-sm text-white"
          >
            <option value="">Primary &amp; Secondary (All)</option>
            {RECORD_TIERS.map((tier) => (
              <option key={tier} value={tier}>
                {tier}
              </option>
            ))}
          </select>

          <select
            value={mysterySlug}
            onChange={(e) => setMysterySlug(e.target.value)}
            aria-label="Filter by related investigation"
            className="rounded-xl border border-white/12 bg-[#0B1020] px-3 py-2.5 text-sm text-white"
          >
            <option value="">All Related Mysteries</option>
            {MYSTERIES.map((m) => (
              <option key={m.slug} value={m.slug}>
                {m.title}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-white/8 pt-3 text-xs text-[#A8B3CF]">
          <span>
            Displaying <strong className="text-white">{filtered.length}</strong> of {sources.length}{' '}
            indexed records
          </span>
          {(query || sourceType || recordTier || mysterySlug) && (
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-1 text-[#E5B66A] hover:underline"
            >
              <RotateCcw className="h-3 w-3" />
              Reset filters
            </button>
          )}
        </div>
      </section>

      {/* Sources Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#121A2B] p-12 text-center">
          <BookOpen className="mx-auto h-8 w-8 text-[#6C9EFF]" />
          <h2 className="mt-3 font-editorial text-2xl font-semibold text-white">
            No Matching Records Found
          </h2>
          <p className="mt-1 text-sm text-[#A8B3CF]">
            Adjust your filter criteria or clear the search query.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {filtered.map((src) => (
            <article
              key={src.id}
              className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#121A2B] p-6 transition-colors hover:border-[#6C9EFF]/45"
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                  <span
                    className={`rounded-full px-2.5 py-0.5 font-semibold ${
                      src.recordTier === 'Primary Record'
                        ? 'bg-[#E5B66A]/15 text-[#E5B66A]'
                        : src.recordTier === 'Secondary Commentary'
                        ? 'bg-white/10 text-[#CBD6F0]'
                        : 'bg-[#6C9EFF]/15 text-[#6C9EFF]'
                    }`}
                  >
                    {src.recordTier}
                  </span>
                  <span className="text-[#A8B3CF]">
                    {src.sourceType} • {src.publicationDate}
                  </span>
                </div>

                <h2 className="mt-3 font-editorial text-2xl font-semibold leading-snug text-white">
                  {src.title}
                </h2>
                <p className="mt-1 text-xs font-medium text-[#E5B66A]">{src.authorOrOrg}</p>
                <p className="mt-3 text-sm leading-relaxed text-[#CBD6F0]">{src.summary}</p>
              </div>

              <div className="mt-5 space-y-3 border-t border-white/8 pt-4 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 text-[#A8B3CF]">
                  <span>Access: {src.accessInfo}</span>
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-semibold text-[#6C9EFF] hover:underline"
                  >
                    Open Original Record
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
                <div className="flex flex-wrap gap-2">
                  {src.relatedMysterySlugs.map((mSlug) => {
                    const m = MYSTERIES.find((item) => item.slug === mSlug);
                    return (
                      <Link
                        key={mSlug}
                        to={`/investigation/${mSlug}`}
                        className="rounded-lg border border-white/10 bg-[#0B1020] px-2.5 py-1 text-[11px] text-[#CBD6F0] hover:border-[#E5B66A]/50 hover:text-white"
                      >
                        Dossier: {m?.title ?? mSlug}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Grounded Global AI Research Assistant */}
      <AIResearchAssistant />
    </div>
  );
}
