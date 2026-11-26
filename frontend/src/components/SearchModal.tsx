import { ArrowRight, BookOpen, Compass, Search, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MYSTERIES, RESEARCH_SOURCES, getCategoryBySlug } from '../data';
import { EvidenceBadge } from './EvidenceBadge';

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

const SUGGESTED_QUERIES = [
  'Area 51',
  'Somerton Man',
  'MKUltra',
  'Voynich Manuscript',
  'Antarctica',
  'John Titor',
];

function HighlightText({ text, query }: { text: string; query: string }) {
  const q = query.trim();
  if (!q) return <>{text}</>;
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
  return (
    <>
      {parts.map((part, idx) =>
        part.toLowerCase() === q.toLowerCase() ? (
          <mark
            key={idx}
            className="rounded bg-[#D4A853]/25 px-0.5 text-[#FDE68A]"
          >
            {part}
          </mark>
        ) : (
          <span key={idx}>{part}</span>
        )
      )}
    </>
  );
}

export function SearchModal({ open, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 40);
    } else {
      setQuery('');
      setActiveIndex(0);
    }
  }, [open]);

  const { matchedMysteries, matchedSources } = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return {
        matchedMysteries: MYSTERIES.slice(0, 5),
        matchedSources: RESEARCH_SOURCES.slice(0, 3),
      };
    }
    return {
      matchedMysteries: MYSTERIES.filter((m) => {
        const cat = getCategoryBySlug(m.category);
        const hay = [
          m.title,
          m.subtitle,
          m.summary,
          m.locationName,
          m.region,
          cat?.name ?? '',
          ...m.scientificInvestigation.methods,
          m.overview.what,
        ]
          .join(' ')
          .toLowerCase();
        return hay.includes(q);
      }).slice(0, 6),
      matchedSources: RESEARCH_SOURCES.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.authorOrOrg.toLowerCase().includes(q) ||
          s.summary.toLowerCase().includes(q) ||
          s.institutionTag.toLowerCase().includes(q)
      ).slice(0, 4),
    };
  }, [query]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (matchedMysteries.length === 0) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % matchedMysteries.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((prev) => (prev - 1 + matchedMysteries.length) % matchedMysteries.length);
      } else if (e.key === 'Enter') {
        const target = matchedMysteries[activeIndex];
        if (target) {
          e.preventDefault();
          onClose();
          navigate(`/investigation/${target.slug}`);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose, matchedMysteries, activeIndex, navigate]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-[#04060A]/85 px-4 pt-16 sm:pt-20 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Global archive search"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-xl border border-white/15 bg-[#0F1420] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3.5">
          <Search className="h-5 w-5 text-[#D4A853]" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search dossiers, categories, locations, methods, or papers..."
            className="w-full bg-transparent text-sm text-white placeholder-[#68748F] focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear search query"
              className="rounded px-2 py-1 text-xs text-[#9AA5BE] hover:bg-white/10 hover:text-white"
            >
              Clear
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="rounded-md p-1.5 text-[#9AA5BE] hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Quick suggestions bar */}
        <div className="flex flex-wrap items-center gap-1.5 border-b border-white/8 bg-[#080B12] px-4 py-2.5">
          <span className="font-mono-archive text-[10px] uppercase tracking-wider text-[#68748F] mr-1">
            Quick:
          </span>
          {SUGGESTED_QUERIES.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setQuery(item)}
              className="rounded border border-white/10 bg-[#0F1420] px-2 py-0.5 text-[11px] text-[#CBD5E1] hover:border-[#D4A853]/50 hover:text-white"
            >
              {item}
            </button>
          ))}
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-6">
          <div>
            <div className="mb-2 flex items-center justify-between px-2">
              <span className="font-mono-archive text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9AA5BE]">
                Investigations ({matchedMysteries.length})
              </span>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate(`/explore${query ? `?q=${encodeURIComponent(query)}` : ''}`);
                }}
                className="text-xs text-[#D4A853] hover:underline"
              >
                Open in Explore
              </button>
            </div>
            {matchedMysteries.length === 0 ? (
              <div className="rounded-lg border border-white/8 bg-[#080B12] px-4 py-5 text-center">
                <p className="text-sm text-[#9AA5BE]">
                  No matching investigations found for &ldquo;{query}&rdquo;.
                </p>
                <p className="mt-1 text-xs text-[#68748F]">
                  Try searching by region (e.g., Antarctica, USA, Russia) or method (e.g., DNA,
                  Radar).
                </p>
              </div>
            ) : (
              <ul className="space-y-1">
                {matchedMysteries.map((m, idx) => {
                  const isActive = idx === activeIndex;
                  return (
                    <li key={m.slug}>
                      <button
                        type="button"
                        onMouseEnter={() => setActiveIndex(idx)}
                        onClick={() => {
                          onClose();
                          navigate(`/investigation/${m.slug}`);
                        }}
                        className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                          isActive ? 'bg-[#171F31]' : 'hover:bg-white/[0.04]'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Compass className="h-4 w-4 shrink-0 text-[#D4A853]" />
                          <div className="min-w-0">
                            <div className="truncate text-sm font-medium text-white">
                              <HighlightText text={m.title} query={query} />
                            </div>
                            <div className="truncate text-xs text-[#9AA5BE]">
                              <HighlightText text={`${m.locationName} · ${m.region}`} query={query} />
                            </div>
                          </div>
                        </div>
                        <EvidenceBadge status={m.evidenceStatus} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between px-2">
              <span className="font-mono-archive text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9AA5BE]">
                Research Library Records ({matchedSources.length})
              </span>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate(`/library${query ? `?q=${encodeURIComponent(query)}` : ''}`);
                }}
                className="text-xs text-[#6C9EFF] hover:underline"
              >
                Browse Library
              </button>
            </div>
            {matchedSources.length === 0 ? (
              <p className="px-2 py-3 text-sm text-[#68748F]">No matching archival sources found.</p>
            ) : (
              <ul className="space-y-1">
                {matchedSources.map((s) => (
                  <li key={s.id}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-white/[0.04]"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <BookOpen className="h-4 w-4 shrink-0 text-[#6C9EFF]" />
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium text-white">
                            <HighlightText text={s.title} query={query} />
                          </div>
                          <div className="truncate text-xs text-[#9AA5BE]">
                            <HighlightText
                              text={`${s.authorOrOrg} • ${s.recordTier}`}
                              query={query}
                            />
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[#9AA5BE]" />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="font-mono-archive flex items-center justify-between border-t border-white/10 bg-[#080B12] px-4 py-2 text-[10px] text-[#68748F]">
          <span>↑↓ Navigate · Enter Open Dossier · Esc Close</span>
          <span>ARCHIVE SEARCH</span>
        </div>
      </div>
    </div>
  );
}
