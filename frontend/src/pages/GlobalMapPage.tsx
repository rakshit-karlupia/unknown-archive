import {
  ArrowRight,
  Crosshair,
  Filter,
  FolderKanban,
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
import { CATEGORIES, EVIDENCE_DEFINITIONS, MYSTERIES, getCategoryBySlug } from '../data';
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
  VERIFIED: '#34D399',
  UNRESOLVED: '#6C9EFF',
  DEBATED: '#D4A853',
  UNSUPPORTED: '#E05252',
};

export function GlobalMapPage() {
  const [mysteries, setMysteries] = useState<MysteryInvestigation[]>(MYSTERIES);
  const [categories, setCategories] = useState<CategoryInfo[]>(CATEGORIES);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'' | EvidenceStatus>('');
  const [search, setSearch] = useState('');
  const [colorMode, setColorMode] = useState<'status' | 'category'>('status');
  const [selected, setSelected] = useState<MysteryInvestigation | null>(MYSTERIES[0]);
  const [popupOpen, setPopupOpen] = useState(false);
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

  const getMarkerColor = (m: MysteryInvestigation) => {
    if (colorMode === 'category') {
      const cat = getCategoryBySlug(m.category);
      return cat?.accentColor ?? '#D4A853';
    }
    return STATUS_COLOR[m.evidenceStatus];
  };

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

  const handleDotHover = (e: React.MouseEvent<SVGGElement>, m: MysteryInvestigation) => {
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
          <span className="font-mono-archive text-[11px] font-semibold uppercase tracking-[0.18em] text-[#D4A853]">
            Geospatial Investigation Atlas // Natural Earth 110m
          </span>
          <h1 className="mt-2 font-editorial text-4xl font-semibold text-white sm:text-5xl">
            Global Mystery Map
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[#9AA5BE]">
            Verified archive coordinates across every dossier. Scroll to zoom, drag to pan, or
            select any marker to inspect its case file.
          </p>
        </div>

        <div className="inline-flex rounded-lg border border-white/12 bg-[#0F1420] p-1 text-xs">
          <button
            type="button"
            onClick={() => setColorMode('status')}
            className={`rounded-md px-3 py-1.5 font-medium transition-colors ${
              colorMode === 'status' ? 'bg-[#1A2234] text-[#D4A853]' : 'text-[#9AA5BE] hover:text-white'
            }`}
          >
            Color by Evidence
          </button>
          <button
            type="button"
            onClick={() => setColorMode('category')}
            className={`rounded-md px-3 py-1.5 font-medium transition-colors ${
              colorMode === 'category' ? 'bg-[#1A2234] text-[#D4A853]' : 'text-[#9AA5BE] hover:text-white'
            }`}
          >
            Color by Category
          </button>
        </div>
      </div>

      {/* Filters & Region Presets */}
      <div className="mt-6 rounded-xl border border-white/10 bg-[#0F1420] p-4 space-y-3">
        <div className="grid gap-3 md:grid-cols-4">
          <div className="relative md:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#D4A853]" />
            <input
              type="text"
              placeholder="Search by investigation name, location, or region…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-white/12 bg-[#080B12] py-2 pl-9 pr-4 text-sm text-white placeholder-[#68748F] focus:border-[#D4A853]/60 focus:outline-none"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            aria-label="Filter by category"
            className="rounded-lg border border-white/12 bg-[#080B12] px-3 py-2 text-sm text-white"
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
            className="rounded-lg border border-white/12 bg-[#080B12] px-3 py-2 text-sm text-white"
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
            <span className="font-mono-archive text-[10px] font-semibold uppercase tracking-wider text-[#9AA5BE] mr-1">
              Region:
            </span>
            {REGION_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => setVb(preset.vb)}
                className="rounded-md border border-white/10 bg-[#080B12] px-2.5 py-1 text-xs text-[#CBD5E1] hover:border-[#D4A853]/55 hover:text-white transition-colors"
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <span className="font-mono-archive inline-flex items-center gap-1.5 text-xs text-[#9AA5BE]">
              <Globe2 className="h-4 w-4 text-[#6C9EFF]" />
              <strong className="text-white">{visibleMysteries.length}</strong> / {mysteries.length}
            </span>
            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-[#080B12] px-2.5 py-1 text-xs text-[#D4A853] hover:text-white transition-colors"
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
          <div className="relative h-[440px] sm:h-[540px] w-full overflow-hidden rounded-xl border border-white/12 bg-[#05080F] select-none">
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
                  <stop offset="0%" stopColor="#0C1322" />
                  <stop offset="100%" stopColor="#05080F" />
                </radialGradient>
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
                    stroke="#172033"
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
                    stroke="#172033"
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
                  fill={hoveredCountry === country.name ? '#1C263B' : '#121927'}
                  stroke="#273550"
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
                  fill="#4A5D82"
                  fontFamily="monospace"
                  pointerEvents="none"
                >
                  {label}
                </text>
              ))}

              {/* Mystery markers (scale-invariant size) */}
              {visibleMysteries.map((m) => {
                const { x, y } = project(m.coordinates.lat, m.coordinates.lng);
                const color = getMarkerColor(m);
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
                      setPopupOpen(true);
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
                      stroke="#05080F"
                      strokeWidth={(isSelected ? 1.8 : 1.1) / zoomScale}
                      pointerEvents="none"
                    />
                    <circle cx={x} cy={y} r={11 / zoomScale} fill="transparent" />
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
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-[#080B12]/90 text-white hover:border-[#D4A853]/60 transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => zoomBy(1 / 1.45)}
                aria-label="Zoom out"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-[#080B12]/90 text-white hover:border-[#D4A853]/60 transition-colors"
              >
                <Minus className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setVb(DEFAULT_VB)}
                aria-label="Reset map zoom"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-[#080B12]/90 text-[#9AA5BE] hover:text-white hover:border-[#D4A853]/60 transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Country badge */}
            {hoveredCountry && !hovered && (
              <div className="font-mono-archive pointer-events-none absolute top-3 left-3 rounded-md border border-white/10 bg-[#080B12]/90 px-2.5 py-1 text-[11px] font-medium text-[#CBD5E1]">
                {hoveredCountry}
              </div>
            )}

            {/* Hover tooltip */}
            {hovered && (
              <div
                className="pointer-events-none absolute z-20 w-56 rounded-lg border border-white/15 bg-[#0F1420]/95 p-3 shadow-xl backdrop-blur-sm"
                style={{
                  left: Math.min(tooltipPos.x + 14, 520),
                  top: Math.max(tooltipPos.y - 65, 8),
                }}
              >
                <div className="font-mono-archive text-[10px] font-semibold uppercase tracking-widest text-[#D4A853]">
                  {hovered.evidenceStatus}
                </div>
                <div className="mt-0.5 text-sm font-semibold leading-snug text-white">
                  {hovered.title}
                </div>
                <div className="mt-0.5 text-[11px] text-[#9AA5BE] truncate">
                  {hovered.locationName}
                </div>
                <div className="font-mono-archive mt-1 inline-flex items-center gap-1 text-[11px] text-[#6C9EFF]">
                  <MapPin className="h-3 w-3 shrink-0" />
                  {hovered.coordinates.lat.toFixed(2)}°, {hovered.coordinates.lng.toFixed(2)}°
                </div>
              </div>
            )}

            {/* Interactive Marker Popup Card */}
            {popupOpen && selected && (
              <div className="absolute bottom-3 left-3 z-20 w-72 sm:w-80 rounded-xl border border-[#D4A853]/40 bg-[#0F1420]/95 p-4 shadow-2xl backdrop-blur-md">
                <div className="flex items-start justify-between gap-2">
                  <EvidenceBadge status={selected.evidenceStatus} />
                  <button
                    type="button"
                    onClick={() => setPopupOpen(false)}
                    aria-label="Close popup"
                    className="rounded p-1 text-[#9AA5BE] hover:bg-white/10 hover:text-white"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <h3 className="mt-2 font-editorial text-lg font-semibold text-white">
                  {selected.title}
                </h3>
                <p className="font-mono-archive mt-0.5 text-[11px] text-[#D4A853]">
                  {selected.locationName} · {selected.coordinates.lat.toFixed(2)}°,{' '}
                  {selected.coordinates.lng.toFixed(2)}°
                </p>
                <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[#CBD5E1]">
                  {selected.summary}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <Link
                    to={`/investigation/${selected.slug}`}
                    className="inline-flex flex-1 items-center justify-center gap-1 rounded-md bg-[#D4A853] px-3 py-1.5 text-xs font-semibold text-[#080B12] hover:bg-[#e3ba68]"
                  >
                    Open Dossier
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                  <button
                    type="button"
                    onClick={() =>
                      setVb(focusOnCoords(selected.coordinates.lat, selected.coordinates.lng, 4.2))
                    }
                    title="Center & zoom on marker"
                    className="rounded-md border border-white/15 bg-[#080B12] p-1.5 text-[#CBD5E1] hover:border-[#D4A853]"
                  >
                    <Crosshair className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Map legend & zoom level */}
            <div className="absolute bottom-3 right-3 rounded-lg border border-white/10 bg-[#080B12]/90 px-3 py-2 backdrop-blur-sm">
              <div className="font-mono-archive mb-1 flex items-center justify-between gap-3 text-[9px] font-semibold uppercase tracking-widest text-[#68748F]">
                <span>{colorMode === 'status' ? 'Evidence' : 'Category'}</span>
                <span>{zoomScale.toFixed(1)}×</span>
              </div>
              {colorMode === 'status' ? (
                (Object.entries(STATUS_COLOR) as [EvidenceStatus, string][]).map(
                  ([status, color]) => (
                    <div key={status} className="flex items-center gap-2 text-[10px] text-[#9AA5BE]">
                      <span
                        className="inline-block h-2 w-2 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      {status}
                    </div>
                  )
                )
              ) : (
                <div className="text-[10px] text-[#9AA5BE]">
                  Colored by 12 research divisions
                </div>
              )}
            </div>
          </div>

          <p className="font-mono-archive mt-2 text-center text-[11px] text-[#68748F]">
            Scroll to zoom · Drag to pan · Click any marker or directory entry to inspect
          </p>
        </div>

        {/* Right sidebar */}
        <aside className="lg:col-span-4 flex flex-col gap-4">
          {selected && (
            <div className="overflow-hidden rounded-xl border border-[#D4A853]/35 bg-[#0F1420]">
              <div className="relative h-36 bg-[#080B12]">
                <img
                  src={selected.heroImage}
                  alt={selected.imageAlt}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F1420] via-transparent to-transparent" />
              </div>
              <div className="p-5 -mt-4 relative">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono-archive text-[10px] font-semibold uppercase tracking-wider text-[#D4A853]">
                    Selected Investigation
                  </span>
                  <EvidenceBadge status={selected.evidenceStatus} />
                </div>
                <h2 className="mt-2 font-editorial text-2xl font-semibold leading-snug text-white">
                  {selected.title}
                </h2>
                <p className="font-mono-archive mt-1 inline-flex items-center gap-1.5 text-[11px] text-[#6C9EFF]">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  {selected.coordinates.precisionLabel} ({selected.coordinates.lat.toFixed(2)}°,{' '}
                  {selected.coordinates.lng.toFixed(2)}°)
                </p>
                <p className="mt-3 text-xs leading-relaxed text-[#CBD5E1] line-clamp-3">
                  {selected.summary}
                </p>
                <div className="mt-4 flex gap-2">
                  <Link
                    to={`/investigation/${selected.slug}`}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#D4A853] px-3 py-2.5 text-xs font-semibold text-[#080B12] hover:bg-[#e3ba68] transition-colors"
                  >
                    Open Dossier
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <Link
                    to={`/investigation-room?case=${selected.slug}`}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/15 bg-[#080B12] px-3 py-2.5 text-xs font-medium text-[#CBD5E1] hover:border-[#D4A853]/50 hover:text-white"
                  >
                    <FolderKanban className="h-3.5 w-3.5 text-[#D4A853]" />
                    Board
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Coordinate directory */}
          <div className="flex-1 overflow-hidden rounded-xl border border-white/10 bg-[#0F1420]">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <span className="font-mono-archive text-[11px] font-semibold uppercase tracking-wider text-[#9AA5BE]">
                <Filter className="inline h-3.5 w-3.5 mr-1 text-[#D4A853]" />
                Coordinate Directory
              </span>
              <span className="font-mono-archive rounded bg-[#D4A853]/15 px-2 py-0.5 text-[10px] font-semibold text-[#D4A853]">
                {visibleMysteries.length}
              </span>
            </div>
            <ul className="max-h-[300px] overflow-y-auto divide-y divide-white/5">
              {visibleMysteries.map((m) => (
                <li key={m.slug}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelected(m);
                      setPopupOpen(true);
                      setVb(focusOnCoords(m.coordinates.lat, m.coordinates.lng, Math.max(zoomScale, 3.2)));
                    }}
                    className={`flex w-full items-center justify-between gap-2 px-4 py-3 text-left transition-colors hover:bg-white/[0.04] ${
                      selected?.slug === m.slug ? 'bg-[#161D2D]' : ''
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="truncate text-xs font-semibold text-white">{m.title}</div>
                      <div className="font-mono-archive truncate text-[10px] text-[#9AA5BE]">
                        {m.coordinates.lat.toFixed(2)}°, {m.coordinates.lng.toFixed(2)}° · {m.region}
                      </div>
                    </div>
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-[#080B12]"
                      style={{
                        backgroundColor: EVIDENCE_DEFINITIONS[m.evidenceStatus].dotColor,
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
