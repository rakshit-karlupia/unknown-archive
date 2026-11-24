import { ArrowRight, LayoutGrid, List, RotateCcw, Search, Star } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { fetchCategories, fetchMysteries } from '../api/client';
import { EvidenceBadge } from '../components/EvidenceBadge';
import { MysteryCard } from '../components/MysteryCard';
import { CATEGORIES, EVIDENCE_DEFINITIONS, MYSTERIES } from '../data';
import type { CategoryInfo, EvidenceStatus, MysteryInvestigation } from '../types/archive';

const EVIDENCE_OPTIONS: Array<{ value: '' | EvidenceStatus; label: string }> = [
  { value: '', label: 'All Ratings' },
  { value: 'VERIFIED', label: 'Verified Fact' },
  { value: 'UNRESOLVED', label: 'Open Mystery' },
  { value: 'DEBATED', label: 'Debated' },
  { value: 'UNSUPPORTED', label: 'No Proof / Myth' },
];

const PAGE_SIZE = 18;

export function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mysteries, setMysteries] = useState<MysteryInvestigation[]>(MYSTERIES);
  const [categories, setCategories] = useState<CategoryInfo[]>(CATEGORIES);

  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [category, setCategory] = useState(searchParams.get('category') ?? '');
  const [evidenceStatus, setEvidenceStatus] = useState<'' | EvidenceStatus>(
    (searchParams.get('status') as '' | EvidenceStatus) ?? ''
  );
  const [region, setRegion] = useState(searchParams.get('region') ?? '');
  const [sortBy, setSortBy] = useState<'popular' | 'recent'>('popular');
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const [visibleLimit, setVisibleLimit] = useState(PAGE_SIZE);

  useEffect(() => {
    void fetchMysteries().then(setMysteries);
    void fetchCategories().then(setCategories);
  }, []);

  useEffect(() => {
    const catParam = searchParams.get('category') ?? '';
    const qParam = searchParams.get('q') ?? '';
    const statusParam = (searchParams.get('status') as '' | EvidenceStatus) ?? '';
    if (catParam !== category) setCategory(catParam);
    if (qParam !== query && qParam !== '') setQuery(qParam);
    if (statusParam !== evidenceStatus) setEvidenceStatus(statusParam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    setVisibleLimit(PAGE_SIZE);
  }, [query, category, evidenceStatus, region, sortBy]);

  const regions = useMemo(
    () => Array.from(new Set(mysteries.map((m) => m.region))).sort(),
    [mysteries]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = mysteries.filter((m) => {
      if (q) {
        const hay = `${m.title} ${m.subtitle} ${m.summary} ${m.locationName}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (
        category &&
        m.category !== category &&
        !m.secondaryCategories?.includes(category as CategoryInfo['slug'])
      ) {
        return false;
      }
      if (evidenceStatus && m.evidenceStatus !== evidenceStatus) return false;
      if (region && m.region !== region) return false;
      return true;
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'recent') return b.updatedAt.localeCompare(a.updatedAt);
      return b.popularityScore - a.popularityScore;
    });
  }, [mysteries, query, category, evidenceStatus, region, sortBy]);

  const hasActiveFilter = Boolean(query || category || evidenceStatus || region);
  const displayed = hasActiveFilter ? filtered : filtered.slice(0, visibleLimit);

  const spotlight =
    mysteries.find((m) => m.slug === 'antarctica-beneath-the-ice') ?? mysteries[0];

  const resetFilters = () => {
    setQuery('');
    setCategory('');
    setEvidenceStatus('');
    setRegion('');
    setSortBy('popular');
    setSearchParams({});
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-3xl">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6C9EFF]">
          Investigative Index
        </span>
        <h1 className="mt-2 font-editorial text-4xl font-semibold text-white sm:text-5xl">
          Explore Mysteries
        </h1>
        <p className="mt-3 text-base leading-relaxed text-[#CBD6F0]">
          Browse {mysteries.length} structured dossiers across secret operations, time anomalies,
          secret societies, unsolved disappearances, and science. Click any category or rating pill
          below to filter instantly.
        </p>
      </div>

      {/* Featured Spotlight */}
      {spotlight && !hasActiveFilter && (
        <section className="mt-9 overflow-hidden rounded-2xl border border-white/12 bg-[#121A2B]">
          <div className="grid lg:grid-cols-12">
            <div className="relative lg:col-span-5 min-h-[230px]">
              <img
                src={spotlight.heroImage}
                alt={spotlight.imageAlt}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#121A2B]/90 hidden lg:block" />
            </div>
            <div className="flex flex-col justify-center p-7 sm:p-9 lg:col-span-7">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E5B66A]/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#E5B66A]">
                  <Star className="h-3.5 w-3.5" aria-hidden="true" />
                  Featured Spotlight
                </span>
                <EvidenceBadge status={spotlight.evidenceStatus} showPlainLabel />
              </div>
              <h2 className="mt-4 text-2xl sm:text-3xl font-bold text-white">
                {spotlight.title}
              </h2>
              <p className="mt-2 text-[15px] leading-relaxed text-[#D8E2F6]">
                {spotlight.summary}
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <Link
                  to={`/investigation/${spotlight.slug}`}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#6C9EFF] px-5 py-2.5 text-sm font-semibold text-[#0B1020] hover:opacity-90 transition-opacity"
                >
                  Open Investigation
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <span className="text-xs text-[#B8C4E0]">
                  {spotlight.locationName} · {spotlight.readingTimeMinutes} min read
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Quick Category Pills */}
      <section aria-label="Quick category filter" className="mt-8 space-y-3">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCategory('')}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              category === ''
                ? 'border-[#E5B66A] bg-[#E5B66A] text-[#0B1020]'
                : 'border-white/12 bg-[#121A2B] text-[#CBD6F0] hover:border-[#6C9EFF]/50 hover:text-white'
            }`}
          >
            All Categories ({mysteries.length})
          </button>
          {categories.map((c) => {
            const active = category === c.slug;
            return (
              <button
                key={c.slug}
                type="button"
                onClick={() => setCategory(active ? '' : c.slug)}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                  active
                    ? 'border-[#6C9EFF] bg-[#6C9EFF] text-[#0B1020] font-semibold'
                    : 'border-white/12 bg-[#121A2B] text-[#CBD6F0] hover:border-[#6C9EFF]/50 hover:text-white'
                }`}
              >
                {c.number}. {c.name}
              </button>
            );
          })}
        </div>

        {/* Quick Evidence Rating Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#B8C4E0] mr-1">
            Evidence Rating:
          </span>
          {EVIDENCE_OPTIONS.map((opt) => {
            const active = evidenceStatus === opt.value;
            const dot = opt.value ? EVIDENCE_DEFINITIONS[opt.value].dotColor : undefined;
            return (
              <button
                key={opt.label}
                type="button"
                onClick={() => setEvidenceStatus(opt.value)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  active
                    ? 'border-[#E5B66A] bg-[#E5B66A]/15 text-[#E5B66A]'
                    : 'border-white/10 bg-[#0B1020] text-[#B8C4E0] hover:border-white/25 hover:text-white'
                }`}
              >
                {dot && (
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: dot }}
                    aria-hidden="true"
                  />
                )}
                {opt.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Filter & Controls Toolbar */}
      <section
        aria-label="Search and sort mysteries"
        className="mt-5 rounded-2xl border border-white/10 bg-[#121A2B] p-4 sm:p-5"
      >
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <div className="relative lg:col-span-2">
            <Search
              className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#6C9EFF]"
              aria-hidden="true"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by mystery name, location, or keyword (e.g., Area 51, Titor, Roanoke)..."
              aria-label="Search mysteries by title or location"
              className="w-full rounded-xl border border-white/12 bg-[#0B1020] py-2.5 pr-3 pl-10 text-sm text-white placeholder-[#7D89A8] focus:border-[#6C9EFF] focus:outline-none"
            />
          </div>

          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            aria-label="Filter by geographical region"
            className="rounded-xl border border-white/12 bg-[#0B1020] px-3 py-2.5 text-sm text-white focus:border-[#6C9EFF] focus:outline-none"
          >
            <option value="">All Regions</option>
            {regions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'popular' | 'recent')}
            aria-label="Sort investigations"
            className="rounded-xl border border-white/12 bg-[#0B1020] px-3 py-2.5 text-sm text-white focus:border-[#6C9EFF] focus:outline-none"
          >
            <option value="popular">Sort: Most Explored</option>
            <option value="recent">Sort: Recently Updated</option>
          </select>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/8 pt-3.5 text-xs">
          <div className="flex items-center gap-3 text-[#CBD6F0]">
            <span>
              Showing <strong className="text-white">{displayed.length}</strong> of{' '}
              <strong className="text-white">{filtered.length}</strong> matching dossiers
            </span>
            {hasActiveFilter && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1 font-semibold text-[#E5B66A] hover:underline"
              >
                <RotateCcw className="h-3 w-3" />
                Reset filters
              </button>
            )}
          </div>

          <div className="inline-flex rounded-lg border border-white/12 bg-[#0B1020] p-0.5">
            <button
              type="button"
              onClick={() => setLayout('grid')}
              aria-label="Grid view"
              aria-pressed={layout === 'grid'}
              className={`rounded-md p-1.5 transition-colors ${
                layout === 'grid' ? 'bg-[#1A2642] text-[#6C9EFF]' : 'text-[#A8B3CF]'
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setLayout('list')}
              aria-label="List view"
              aria-pressed={layout === 'list'}
              className={`rounded-md p-1.5 transition-colors ${
                layout === 'list' ? 'bg-[#1A2642] text-[#6C9EFF]' : 'text-[#A8B3CF]'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-white/10 bg-[#121A2B] p-12 text-center">
          <h3 className="text-2xl font-bold text-white">No matching investigations found</h3>
          <p className="mt-2 text-sm text-[#B8C4E0]">
            Try clearing one or more filters or broadening your search keyword.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#6C9EFF] px-5 py-2.5 text-sm font-semibold text-[#0B1020]"
          >
            <RotateCcw className="h-4 w-4" />
            Show all {mysteries.length} investigations
          </button>
        </div>
      ) : (
        <>
          {layout === 'grid' ? (
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {displayed.map((m) => (
                <MysteryCard key={m.slug} mystery={m} layout="grid" />
              ))}
            </div>
          ) : (
            <div className="mt-8 space-y-5">
              {displayed.map((m) => (
                <MysteryCard key={m.slug} mystery={m} layout="list" />
              ))}
            </div>
          )}

          {!hasActiveFilter && visibleLimit < filtered.length && (
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setVisibleLimit((v) => v + PAGE_SIZE)}
                className="rounded-xl border border-[#6C9EFF]/45 bg-[#121A2B] px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-[#6C9EFF] hover:bg-[#18243C]"
              >
                Load {Math.min(PAGE_SIZE, filtered.length - visibleLimit)} More Dossiers
              </button>
              <button
                type="button"
                onClick={() => setVisibleLimit(filtered.length)}
                className="rounded-xl border border-white/12 bg-[#0B1020] px-5 py-3 text-sm font-medium text-[#E5B66A] hover:border-[#E5B66A]/45"
              >
                Show All ({filtered.length})
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
