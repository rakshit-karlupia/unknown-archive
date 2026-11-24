import { ArrowRight, BookOpen, Compass, Search, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MYSTERIES, RESEARCH_SOURCES } from '../data';
import { EvidenceBadge } from './EvidenceBadge';

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

export function SearchModal({ open, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 40);
    } else {
      setQuery('');
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const { matchedMysteries, matchedSources } = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return {
        matchedMysteries: MYSTERIES.slice(0, 5),
        matchedSources: RESEARCH_SOURCES.slice(0, 3),
      };
    }
    return {
      matchedMysteries: MYSTERIES.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.summary.toLowerCase().includes(q) ||
          m.locationName.toLowerCase().includes(q) ||
          m.region.toLowerCase().includes(q)
      ).slice(0, 6),
      matchedSources: RESEARCH_SOURCES.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.authorOrOrg.toLowerCase().includes(q) ||
          s.summary.toLowerCase().includes(q)
      ).slice(0, 4),
    };
  }, [query]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-[#060913]/80 px-4 pt-20 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Global archive search"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/15 bg-[#121A2B] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3.5">
          <Search className="h-5 w-5 text-[#6C9EFF]" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search investigations, locations, or peer-reviewed papers..."
            className="w-full bg-transparent text-sm text-white placeholder-[#7D89A8] focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="rounded-lg p-1.5 text-[#A8B3CF] hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[65vh] overflow-y-auto p-4 space-y-6">
          <div>
            <div className="mb-2 flex items-center justify-between px-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#A8B3CF]">
                Investigations
              </span>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate(`/explore${query ? `?q=${encodeURIComponent(query)}` : ''}`);
                }}
                className="text-xs text-[#6C9EFF] hover:underline"
              >
                Open in Explore
              </button>
            </div>
            {matchedMysteries.length === 0 ? (
              <p className="px-2 py-3 text-sm text-[#7D89A8]">No matching investigations found.</p>
            ) : (
              <ul className="space-y-1">
                {matchedMysteries.map((m) => (
                  <li key={m.slug}>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        navigate(`/investigation/${m.slug}`);
                      }}
                      className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-white/5"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Compass className="h-4 w-4 shrink-0 text-[#E5B66A]" />
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium text-white">{m.title}</div>
                          <div className="truncate text-xs text-[#A8B3CF]">{m.locationName}</div>
                        </div>
                      </div>
                      <EvidenceBadge status={m.evidenceStatus} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between px-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#A8B3CF]">
                Research Library Records
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
              <p className="px-2 py-3 text-sm text-[#7D89A8]">No matching archival sources found.</p>
            ) : (
              <ul className="space-y-1">
                {matchedSources.map((s) => (
                  <li key={s.id}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-white/5"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <BookOpen className="h-4 w-4 shrink-0 text-[#6C9EFF]" />
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium text-white">{s.title}</div>
                          <div className="truncate text-xs text-[#A8B3CF]">
                            {s.authorOrOrg} • {s.recordTier}
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[#A8B3CF]" />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
