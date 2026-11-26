import {
  ArrowRight,
  Bookmark,
  LayoutGrid,
  List,
  RotateCcw,
  Search,
  SearchX,
  Star,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { fetchCategories, fetchMysteries } from '../api/client';
import { EvidenceBadge } from '../components/EvidenceBadge';
import { MysteryCard } from '../components/MysteryCard';
import { CATEGORIES, EVIDENCE_DEFINITIONS, MYSTERIES } from '../data';
import { useBookmarks } from '../hooks/useBookmarks';
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
  const { bookmarks } = useBookmarks();

  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [category, setCategory] = useState(searchParams.get('category') ?? '');
  const [evidenceStatus, setEvidenceStatus] = useState<'' | EvidenceStatus>(
    (searchParams.get('status') as '' | EvidenceStatus) ?? ''
  );
  const [region, setRegion] = useState(searchParams.get('region') ?? '');
  const [onlyBookmarked, setOnlyBookmarked] = useState(false);
  const [sortBy, setSortBy] = useState<'popular' | 'recent' | 'title'>(
    (searchParams.get('sort') as 'popular' | 'recent' | 'title') ?? 'popular'
  );
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
  }, [query, category, evidenceStatus, region, sortBy, onlyBookmarked]);

  const regions = useMemo(
    () => Array.from(new Set(mysteries.map((m) => m.region))).sort(),
    [mysteries]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = mysteries.filter((m) => {
      if (onlyBookmarked && !bookmarks.includes(m.slug)) return false;
      if (q) {
        const hay = `${m.title} ${m.subtitle} ${m.summary} ${m.locationName} ${m.region}`.toLowerCase();
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
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      return b.popularityScore - a.popularityScore;
    });
  }, [mysteries, query, category, evidenceStatus, region, sortBy, onlyBookmarked, bookmarks]);

  const hasActiveFilter = Boolean(query || category || evidenceStatus || region || onlyBookmarked);
  const displayed = hasActiveFilter ? filtered : filtered.slice(0, visibleLimit);

  const spotlight =
    mysteries.find((m) => m.slug === 'antarctica-beneath-the-ice') ?? mysteries[0];

  const resetFilters = () => {
    setQuery('');
    setCategory('');
    setEvidenceStatus('');
    setRegion('');
    setOnlyBookmarked(false);
    setSortBy('popular');
    setSearchParams({});
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-3xl">
        <span className="font-mono-archive text-[11px] font-semibold uppercase tracking-[0.18em] text-[#D4A853]">
          Investigative Case Index // {mysteries.length} Files
        </span>
        <h1 className="mt-2 font-editorial text-4xl font-semibold text-white sm:text-5xl">
          Explore Mysteries
        </h1>
        <p className="mt-3 text-base leading-relaxed text-[#CBD5E1]">
          Search and filter {mysteries.length} structured dossiers across classified operations,
          time anomalies, secret societies, unsolved disappearances, and science.
        </p>
      </div>

      {/* Featured Spotlight */}
      {spotlight && !hasActiveFilter && (
        <section className="mt-9 overflow-hidden rounded-xl border border-white/12 bg-[#0F1420]">
          <div className="grid lg:grid-cols-12">
            <div className="relative lg:col-span-5 min-h-[230px] bg-[#080B12]">
              <img
                src={spotlight.heroImage}
                alt={spotlight.imageAlt}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#0F1420]/95 hidden lg:block" />
            </div>
            <div className="flex flex-col justify-center p-7 sm:p-9 lg:col-span-7">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-mono-archive inline-flex items-center gap-1.5 rounded-md border border-[#D4A853]/35 bg-[#D4A853]/12 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#D4A853]">
                  <Star className="h-3.5 w-3.5" aria-hidden="true" />
                  Featured Case File
                </span>
                <EvidenceBadge status={spotlight.evidenceStatus} showPlainLabel />
              </div>
              <h2 className="mt-4 font-editorial text-2xl sm:text-3xl font-semibold text-white">
                {spotlight.title}
              </h2>
              <p className="mt-2 text-sm sm:text-[15px] leading-relaxed text-[#CBD5E1]">
                {spotlight.summary}
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <Link
                  to={`/investigation/${spotlight.slug}`}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#D4A853] px-5 py-2.5 text-sm font-semibold text-[#080B12] hover:bg-[#e3ba68] transition-colors"
                >
                  Open Investigation
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <span className="font-mono-archive text-xs text-[#9AA5BE]">
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
            className={`rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors ${
              category === ''
                ? 'border-[#D4A853] bg-[#D4A853] text-[#080B12]'
                : 'border-white/12 bg-[#0F1420] text-[#CBD5E1] hover:border-[#D4A853]/50 hover:text-white'
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
                className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                  active
                    ? 'border-[#6C9EFF] bg-[#6C9EFF] text-[#080B12] font-semibold'
                    : 'border-white/12 bg-[#0F1420] text-[#CBD5E1] hover:border-[#6C9EFF]/50 hover:text-white'
                }`}
              >
                {c.number}. {c.name}
              </button>
            );
          })}
        </div>

        {/* Quick Evidence Rating Pills + Bookmark Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono-archive text-[11px] font-semibold uppercase tracking-wider text-[#9AA5BE] mr-1">
            Classification:
          </span>
          {EVIDENCE_OPTIONS.map((opt) => {
            const active = evidenceStatus === opt.value;
            const dot = opt.value ? EVIDENCE_DEFINITIONS[opt.value].dotColor : undefined;
            return (
              <button
                key={opt.label}
                type="button"
                onClick={() => setEvidenceStatus(opt.value)}
                className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1 text-xs font-medium transition-colors ${
                  active
                    ? 'border-[#D4A853] bg-[#D4A853]/15 text-[#D4A853]'
                    : 'border-white/10 bg-[#080B12] text-[#9AA5BE] hover:border-white/25 hover:text-white'
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

          <button
            type="button"
            onClick={() => setOnlyBookmarked((v) => !v)}
            className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1 text-xs font-medium transition-colors ${
              onlyBookmarked
                ? 'border-[#D4A853] bg-[#D4A853]/15 text-[#D4A853]'
                : 'border-white/10 bg-[#080B12] text-[#9AA5BE] hover:border-white/25 hover:text-white'
            }`}
          >
            <Bookmark className={`h-3 w-3 ${onlyBookmarked ? 'fill-current' : ''}`} />
            Saved ({bookmarks.length})
          </button>
        </div>
      </section>

      {/* Filter & Controls Toolbar */}
      <section
        aria-label="Search and sort mysteries"
        className="mt-5 rounded-xl border border-white/10 bg-[#0F1420] p-4 sm:p-5"
      >
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <div className="relative lg:col-span-2">
            <Search
              className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#D4A853]"
              aria-hidden="true"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter by title, location, region, or keyword (e.g., Area 51, Titor, Roanoke)..."
              aria-label="Search mysteries by title or location"
              className="w-full rounded-lg border border-white/12 bg-[#080B12] py-2.5 pr-3 pl-10 text-sm text-white placeholder-[#68748F] focus:border-[#D4A853] focus:outline-none"
            />
          </div>

          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            aria-label="Filter by geographical region"
            className="rounded-lg border border-white/12 bg-[#080B12] px-3 py-2.5 text-sm text-white focus:border-[#D4A853] focus:outline-none"
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
            onChange={(e) => setSortBy(e.target.value as 'popular' | 'recent' | 'title')}
            aria-label="Sort investigations"
            className="rounded-lg border border-white/12 bg-[#080B12] px-3 py-2.5 text-sm text-white focus:border-[#D4A853] focus:outline-none"
          >
            <option value="popular">Sort: Most Explored</option>
            <option value="recent">Sort: Recently Updated</option>
            <option value="title">Sort: Alphabetical (A–Z)</option>
          </select>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/8 pt-3.5 text-xs">
          <div className="flex items-center gap-3 text-[#CBD5E1]">
            <span className="font-mono-archive">
              SHOWING <strong className="text-white">{displayed.length}</strong> /{' '}
              <strong className="text-white">{filtered.length}</strong> MATCHING FILES
            </span>
            {hasActiveFilter && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1 font-semibold text-[#D4A853] hover:underline"
              >
                <RotateCcw className="h-3 w-3" />
                Clear all filters
              </button>
            )}
          </div>

          <div className="inline-flex rounded-lg border border-white/12 bg-[#080B12] p-0.5">
            <button
              type="button"
              onClick={() => setLayout('grid')}
              aria-label="Grid view"
              aria-pressed={layout === 'grid'}
              className={`rounded-md p-1.5 transition-colors ${
                layout === 'grid' ? 'bg-[#171F31] text-[#D4A853]' : 'text-[#9AA5BE]'
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
                layout === 'list' ? 'bg-[#171F31] text-[#D4A853]' : 'text-[#9AA5BE]'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="mt-12 rounded-xl border border-white/10 bg-[#0F1420] p-12 text-center">
          <SearchX className="mx-auto h-10 w-10 text-[#E05252]" aria-hidden="true" />
          <h3 className="mt-3 font-editorial text-2xl font-semibold text-white">
            No Matching Case Files Found
          </h3>
          <p className="mt-2 max-w-md mx-auto text-sm text-[#9AA5BE]">
            No dossiers matched your current combination of search terms, region, or evidence
            classification filters.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {['Area 51', 'Somerton Man', 'MKUltra', 'Voynich'].map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => {
                  resetFilters();
                  setQuery(term);
                }}
                className="rounded-md border border-white/12 bg-[#080B12] px-3 py-1.5 text-xs text-[#CBD5E1] hover:border-[#D4A853]/50 hover:text-white"
              >
                Try &ldquo;{term}&rdquo;
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#D4A853] px-5 py-2.5 text-sm font-semibold text-[#080B12]"
          >
            <RotateCcw className="h-4 w-4" />
            Reset &amp; Show All {mysteries.length} Files
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
                className="rounded-lg border border-[#D4A853]/45 bg-[#0F1420] px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-[#D4A853] hover:bg-[#151C2C]"
              >
                Load {Math.min(PAGE_SIZE, filtered.length - visibleLimit)} More Dossiers
              </button>
              <button
                type="button"
                onClick={() => setVisibleLimit(filtered.length)}
                className="rounded-lg border border-white/12 bg-[#080B12] px-5 py-3 text-sm font-medium text-[#D4A853] hover:border-[#D4A853]/45"
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
