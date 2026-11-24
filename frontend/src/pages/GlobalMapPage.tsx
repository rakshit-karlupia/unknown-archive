import {
  ArrowRight,
  Filter,
  Globe2,
  MapPin,
  Minus,
  Plus,
  RotateCcw,
  Search,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchCategories, fetchMysteries } from '../api/client';
import { EvidenceBadge } from '../components/EvidenceBadge';
import { CATEGORIES, EVIDENCE_DEFINITIONS, MYSTERIES } from '../data';
import { WORLD_COUNTRIES } from '../data/worldMapPaths';
import type { CategoryInfo, EvidenceStatus, MysteryInvestigation } from '../types/archive';

const BASE_W = 1000;
const BASE_H = 500;

interface ViewBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

const DEFAULT_VB: ViewBox = { x: 0, y: 0, w: BASE_W, h: BASE_H };

// Equirectangular projection matching Natural Earth conversion: lng/lat -> SVG (x, y)
function project(lat: number, lng: number): { x: number; y: number } {
  const x = ((lng + 180) / 360) * BASE_W;
  const y = ((90 - lat) / 180) * BASE_H;
  return { x, y };
}

function clampViewBox(vb: ViewBox): ViewBox {
  const w = Math.max(80, Math.min(BASE_W, vb.w));
  const h = w * (BASE_H / BASE_W);
  const x = Math.max(0, Math.min(BASE_W - w, vb.x));
  const y = Math.max(0, Math.min(BASE_H - h, vb.y));
  return { x, y, w, h };
}

function focusOnCoords(lat: number, lng: number, zoomFactor = 3.2): ViewBox {
  const { x, y } = project(lat, lng);
  const w = BASE_W / zoomFactor;
  const h = BASE_H / zoomFactor;
  return clampViewBox({ x: x - w / 2, y: y - h / 2, w, h });
}

const REGION_PRESETS: Array<{ label: string; vb: ViewBox }> = [
  { label: 'Global', vb: DEFAULT_VB },
  { label: 'North America', vb: focusOnCoords(39, -98, 2.6) },
  { label: 'Europe', vb: focusOnCoords(49, 12, 3.8) },
  { label: 'South Asia', vb: focusOnCoords(24, 78, 3.6) },
  { label: 'East Asia & Pacific', vb: focusOnCoords(12, 130, 2.3) },
  { label: 'Antarctica', vb: focusOnCoords(-77, 80, 2.5) },
];

const STATUS_COLOR: Record<EvidenceStatus, string> = {
  VERIFIED: '#4ADE80',
  UNRESOLVED: '#6C9EFF',
  DEBATED: '#E5B66A',
  UNSUPPORTED: '#F87171',
};

const STATUS_LABELS: Record<EvidenceStatus, string> = {
  VERIFIED: 'Confirmed evidence',
  UNRESOLVED: 'Under investigation',
  DEBATED: 'Contested claims',
  UNSUPPORTED: 'No credible evidence',
};

export function GlobalMapPage() {
  const [mysteries, setMysteries] = useState<MysteryInvestigation[]>(MYSTERIES);
  const [categories, setCategories] = useState<CategoryInfo[]>(CATEGORIES);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'' | EvidenceStatus>('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<MysteryInvestigation | null>(MYSTERIES[0]);
  const [hovered, setHovered] = useState<MysteryInvestigation | null>(null);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [vb, setVb] = useState<ViewBox>(DEFAULT_VB);
  const [isDragging, setIsDragging] = useState(false);

  const svgRef = useRef<SVGSVGElement>(null);
  const dragStartRef = useRef<{ clientX: number; clientY: number; vb: ViewBox } | null>(null);

  useEffect(() => {
    void fetchMysteries().then(setMysteries);
    void fetchCategories().then(setCategories);
  }, []);

  const visibleMysteries = useMemo(() => {
    return mysteries.filter((m) => {
      if (
        categoryFilter &&
        m.category !== categoryFilter &&
        !m.secondaryCategories?.includes(categoryFilter as CategoryInfo['slug'])
      )
        return false;
      if (statusFilter && m.evidenceStatus !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !m.title.toLowerCase().includes(q) &&
          !m.locationName.toLowerCase().includes(q) &&
          !(m.region ?? '').toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [mysteries, categoryFilter, statusFilter, search]);

  const zoomScale = BASE_W / vb.w;

  const zoomBy = (factor: number, centerX = vb.x + vb.w / 2, centerY = vb.y + vb.h / 2) => {
    setVb((prev) => {
      const nextW = prev.w / factor;
      const nextH = prev.h / factor;
      const rx = (centerX - prev.x) / prev.w;
      const ry = (centerY - prev.y) / prev.h;
      return clampViewBox({
        x: centerX - rx * nextW,
        y: centerY - ry * nextH,
        w: nextW,
        h: nextH,
      });
    });
  };

  const handleWheel = (e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const rx = (e.clientX - rect.left) / rect.width;
    const ry = (e.clientY - rect.top) / rect.height;
    const cx = vb.x + rx * vb.w;
    const cy = vb.y + ry * vb.h;
    const factor = e.deltaY < 0 ? 1.25 : 0.8;
    zoomBy(factor, cx, cy);
  };

  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (e.button !== 0) return;
    dragStartRef.current = { clientX: e.clientX, clientY: e.clientY, vb };
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const start = dragStartRef.current;
    const svg = svgRef.current;
    if (!start || !svg) return;
    const moved = Math.hypot(e.clientX - start.clientX, e.clientY - start.clientY);
    if (!isDragging && moved < 4) return;
    if (!isDragging) setIsDragging(true);
    const rect = svg.getBoundingClientRect();
    const dx = ((e.clientX - start.clientX) / rect.width) * start.vb.w;
    const dy = ((e.clientY - start.clientY) / rect.height) * start.vb.h;
    setVb(clampViewBox({ ...start.vb, x: start.vb.x - dx, y: start.vb.y - dy }));
  };

  const endDrag = () => {
    setIsDragging(false);
    dragStartRef.current = null;
  };

  const handleDotHover = (
    e: React.MouseEvent<SVGGElement>,
    m: MysteryInvestigation
  ) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    setTooltipPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setHovered(m);
  };

  const clearFilters = () => {
    setCategoryFilter('');
    setStatusFilter('');
    setSearch('');
  };

  const hasFilters = !!(categoryFilter || statusFilter || search);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6C9EFF]">
            Geospatial Investigation Atlas · Natural Earth Vector Projection
          </span>
          <h1 className="mt-2 font-editorial text-4xl font-semibold text-white sm:text-5xl">
            Global Mystery Map
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[#A8B3CF]">
            Accurate geographic coordinates of every investigation in the archive — scroll to
            zoom, drag to pan, or jump to a region below.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-[#A8B3CF]">
          {Object.entries(STATUS_LABELS).map(([status, label]) => (
            <span key={status} className="inline-flex items-center gap-1.5">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full ring-2 ring-[#0B1020]"
                style={{ backgroundColor: STATUS_COLOR[status as EvidenceStatus] }}
              />
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Filters & Region Presets */}
      <div className="mt-6 rounded-2xl border border-white/10 bg-[#121A2B] p-4 space-y-3">
        <div className="grid gap-3 md:grid-cols-4">
          <div className="relative md:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A8B3CF]" />
            <input
              type="text"
              placeholder="Search by name, location or region…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#0B1020] py-2 pl-9 pr-4 text-sm text-white placeholder-[#4A5568] focus:border-[#6C9EFF]/60 focus:outline-none"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            aria-label="Filter by category"
            className="rounded-xl border border-white/10 bg-[#0B1020] px-3 py-2 text-sm text-white"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as '' | EvidenceStatus)}
            aria-label="Filter by evidence status"
            className="rounded-xl border border-white/10 bg-[#0B1020] px-3 py-2 text-sm text-white"
          >
            <option value="">All Classifications</option>
            <option value="VERIFIED">Verified</option>
            <option value="UNRESOLVED">Unresolved</option>
            <option value="DEBATED">Debated</option>
            <option value="UNSUPPORTED">Unsupported</option>
          </select>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#A8B3CF] mr-1">
              Region:
            </span>
            {REGION_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => setVb(preset.vb)}
                className="rounded-full border border-white/10 bg-[#0B1020] px-3 py-1 text-xs text-[#CBD6F0] hover:border-[#6C9EFF]/55 hover:text-white transition-colors"
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-xs text-[#A8B3CF]">
              <Globe2 className="h-4 w-4 text-[#6C9EFF]" />
              Showing <strong className="text-white">{visibleMysteries.length}</strong> of{' '}
              {mysteries.length}
            </span>
            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-[#0B1020] px-3 py-1 text-xs text-[#A8B3CF] hover:text-white transition-colors"
              >
                <X className="h-3 w-3" />
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Map + Sidebar */}
      <div className="mt-6 grid gap-6 lg:grid-cols-12">
        {/* SVG World Map */}
        <div className="relative lg:col-span-8">
          <div className="relative h-[520px] w-full overflow-hidden rounded-2xl border border-white/12 bg-[#060C1A] select-none">
            <svg
              ref={svgRef}
              viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
              preserveAspectRatio="xMidYMid meet"
              onWheel={handleWheel}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={endDrag}
              onMouseLeave={endDrag}
              className={`h-full w-full ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
              aria-label="Accurate world map of mystery locations"
            >
              <defs>
                <radialGradient id="oceanGrad" cx="50%" cy="50%" r="80%">
                  <stop offset="0%" stopColor="#0E1C38" />
                  <stop offset="100%" stopColor="#060C1A" />
                </radialGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <rect x="0" y="0" width={BASE_W} height={BASE_H} fill="url(#oceanGrad)" />

              {/* Graticule grid lines */}
              {[-60, -30, 0, 30, 60].map((lat) => {
                const y = ((90 - lat) / 180) * BASE_H;
                return (
                  <line
                    key={`lat-${lat}`}
                    x1="0"
                    y1={y}
                    x2={BASE_W}
                    y2={y}
                    stroke="#1A2744"
                    strokeWidth={(lat === 0 ? 1.0 : 0.5) / zoomScale}
                    strokeDasharray={lat === 0 ? undefined : `${4 / zoomScale} ${6 / zoomScale}`}
                  />
                );
              })}
              {[-150, -120, -90, -60, -30, 0, 30, 60, 90, 120, 150].map((lng) => {
                const x = ((lng + 180) / 360) * BASE_W;
                return (
                  <line
                    key={`lng-${lng}`}
                    x1={x}
                    y1="0"
                    x2={x}
                    y2={BASE_H}
                    stroke="#1A2744"
                    strokeWidth={(lng === 0 ? 0.8 : 0.5) / zoomScale}
                    strokeDasharray={`${4 / zoomScale} ${6 / zoomScale}`}
                  />
                );
              })}

              {/* Accurate Natural Earth 110m countries */}
              {WORLD_COUNTRIES.map((country, idx) => (
                <path
                  key={`${country.name}-${idx}`}
                  d={country.d}
                  fill={hoveredCountry === country.name ? '#1D2F4F' : '#152238'}
                  stroke="#273C63"
                  strokeWidth={0.55 / zoomScale}
                  onMouseEnter={() => setHoveredCountry(country.name)}
                  onMouseLeave={() => setHoveredCountry(null)}
                />
              ))}

              {/* Lat labels */}
              {[
                { label: '60°N', lat: 60 },
                { label: '0°', lat: 0 },
                { label: '60°S', lat: -60 },
              ].map(({ label, lat }) => (
                <text
                  key={label}
                  x={vb.x + 8 / zoomScale}
                  y={((90 - lat) / 180) * BASE_H - 3 / zoomScale}
                  fontSize={9 / zoomScale}
                  fill="#3B537A"
                  fontFamily="system-ui"
                  pointerEvents="none"
                >
                  {label}
                </text>
              ))}

              {/* Mystery markers (scale-invariant size) */}
              {visibleMysteries.map((m) => {
                const { x, y } = project(m.coordinates.lat, m.coordinates.lng);
                const color = STATUS_COLOR[m.evidenceStatus];
                const isSelected = selected?.slug === m.slug;
                const isHovered = hovered?.slug === m.slug;
                const baseR = (isSelected ? 6.5 : isHovered ? 5.5 : 4.2) / zoomScale;

                return (
                  <g
                    key={m.slug}
                    style={{ cursor: 'pointer' }}
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelected(m);
                    }}
                    onMouseEnter={(e) => handleDotHover(e, m)}
                    onMouseLeave={() => setHovered(null)}
                  >
                    {(isSelected || isHovered) && (
                      <circle
                        cx={x}
                        cy={y}
                        r={(isSelected ? 13 : 9.5) / zoomScale}
                        fill={color}
                        opacity={0.22}
                        pointerEvents="none"
                      />
                    )}
                    <circle
                      cx={x}
                      cy={y}
                      r={baseR}
                      fill={color}
                      stroke="#060C1A"
                      strokeWidth={(isSelected ? 1.8 : 1.1) / zoomScale}
                      filter={isSelected ? 'url(#glow)' : undefined}
                      pointerEvents="none"
                    />
                    {/* Larger transparent hit target so markers are easy to click */}
                    <circle
                      cx={x}
                      cy={y}
                      r={11 / zoomScale}
                      fill="transparent"
                    />
                  </g>
                );
              })}
            </svg>

            {/* Zoom controls */}
            <div className="absolute top-3 right-3 flex flex-col gap-1.5">
              <button
                type="button"
                onClick={() => zoomBy(1.45)}
                aria-label="Zoom in"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-[#0B1020]/90 text-white hover:border-[#6C9EFF]/60 transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => zoomBy(1 / 1.45)}
                aria-label="Zoom out"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-[#0B1020]/90 text-white hover:border-[#6C9EFF]/60 transition-colors"
              >
                <Minus className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setVb(DEFAULT_VB)}
                aria-label="Reset map zoom"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-[#0B1020]/90 text-[#A8B3CF] hover:text-white hover:border-[#6C9EFF]/60 transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Country badge */}
            {hoveredCountry && !hovered && (
              <div className="pointer-events-none absolute top-3 left-3 rounded-lg border border-white/10 bg-[#060C1A]/90 px-2.5 py-1 text-[11px] font-medium text-[#CBD6F0]">
                {hoveredCountry}
              </div>
            )}

            {/* Hover tooltip */}
            {hovered && (
              <div
                className="pointer-events-none absolute z-20 w-56 rounded-xl border border-white/15 bg-[#0F1829]/95 p-3 shadow-xl backdrop-blur-sm"
                style={{
                  left: Math.min(tooltipPos.x + 14, 520),
                  top: Math.max(tooltipPos.y - 65, 8),
                }}
              >
                <div className="text-[10px] font-semibold uppercase tracking-widest text-[#E5B66A]">
                  {hovered.evidenceStatus}
                </div>
                <div className="mt-0.5 text-sm font-semibold leading-snug text-white">
                  {hovered.title}
                </div>
                <div className="mt-0.5 text-[11px] text-[#A8B3CF] truncate">
                  {hovered.locationName}
                </div>
                <div className="mt-1 inline-flex items-center gap-1 text-[11px] text-[#6C9EFF]">
                  <MapPin className="h-3 w-3 shrink-0" />
                  {hovered.coordinates.lat.toFixed(2)}°,{' '}
                  {hovered.coordinates.lng.toFixed(2)}°
                </div>
              </div>
            )}

            {/* Map legend & zoom level */}
            <div className="absolute bottom-3 right-3 rounded-xl border border-white/10 bg-[#060C1A]/90 px-3 py-2 backdrop-blur-sm">
              <div className="mb-1 flex items-center justify-between gap-3 text-[9px] font-semibold uppercase tracking-widest text-[#6E7A94]">
                <span>Evidence</span>
                <span>{zoomScale.toFixed(1)}×</span>
              </div>
              {(Object.entries(STATUS_COLOR) as [EvidenceStatus, string][]).map(
                ([status, color]) => (
                  <div key={status} className="flex items-center gap-2 text-[10px] text-[#A8B3CF]">
                    <span
                      className="inline-block h-2 w-2 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    {status}
                  </div>
                )
              )}
            </div>
          </div>

          <p className="mt-2 text-center text-[11px] text-[#6E7A94]">
            Scroll to zoom · Drag to pan · Click any marker or directory entry to inspect coordinates
          </p>
        </div>

        {/* Right sidebar */}
        <aside className="lg:col-span-4 flex flex-col gap-4">
          {selected && (
            <div className="rounded-2xl border border-[#6C9EFF]/30 bg-[#121A2B] p-5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#E5B66A]">
                  Selected Investigation
                </span>
                <EvidenceBadge status={selected.evidenceStatus} />
              </div>
              <h2 className="mt-2 font-editorial text-xl font-semibold leading-snug text-white">
                {selected.title}
              </h2>
              <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-[#6C9EFF]">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                {selected.coordinates.precisionLabel} ({selected.coordinates.lat.toFixed(2)}°,{' '}
                {selected.coordinates.lng.toFixed(2)}°)
              </p>
              <p className="mt-3 text-xs leading-relaxed text-[#CBD6F0] line-clamp-4">
                {selected.summary}
              </p>
              <Link
                to={`/investigation/${selected.slug}`}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#E5B66A] px-4 py-2.5 text-xs font-semibold text-[#0B1020] hover:opacity-90 transition-opacity"
              >
                Open Full Investigation
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}

          {/* Coordinate directory */}
          <div className="flex-1 overflow-hidden rounded-2xl border border-white/10 bg-[#121A2B]">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#A8B3CF]">
                <Filter className="inline h-3.5 w-3.5 mr-1 text-[#6C9EFF]" />
                Coordinate Directory
              </span>
              <span className="rounded-full bg-[#6C9EFF]/15 px-2 py-0.5 text-[10px] font-semibold text-[#6C9EFF]">
                {visibleMysteries.length}
              </span>
            </div>
            <ul className="max-h-[320px] overflow-y-auto divide-y divide-white/5">
              {visibleMysteries.map((m) => (
                <li key={m.slug}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelected(m);
                      setVb(focusOnCoords(m.coordinates.lat, m.coordinates.lng, Math.max(zoomScale, 3.2)));
                    }}
                    className={`flex w-full items-center justify-between gap-2 px-4 py-3 text-left transition-colors hover:bg-white/5 ${
                      selected?.slug === m.slug ? 'bg-[#18233C]' : ''
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="truncate text-xs font-semibold text-white">
                        {m.title}
                      </div>
                      <div className="truncate text-[11px] text-[#A8B3CF]">
                        {m.coordinates.lat.toFixed(2)}°,{' '}
                        {m.coordinates.lng.toFixed(2)}° · {m.region}
                      </div>
                    </div>
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-[#0B1020]"
                      style={{
                        backgroundColor:
                          EVIDENCE_DEFINITIONS[m.evidenceStatus].dotColor,
                      }}
                    />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
