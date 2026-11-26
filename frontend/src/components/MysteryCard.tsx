import { ArrowRight, Bookmark, Clock, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getCategoryBySlug } from '../data';
import { useBookmarks } from '../hooks/useBookmarks';
import type { MysteryInvestigation } from '../types/archive';
import { EvidenceBadge } from './EvidenceBadge';

interface MysteryCardProps {
  mystery: MysteryInvestigation;
  layout?: 'grid' | 'list';
}

export function MysteryCard({ mystery, layout = 'grid' }: MysteryCardProps) {
  const category = getCategoryBySlug(mystery.category);
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const saved = isBookmarked(mystery.slug);
  const caseCode = `ARC-${mystery.slug.slice(0, 4).toUpperCase()}`;

  if (layout === 'list') {
    return (
      <article className="group flex flex-col sm:flex-row overflow-hidden rounded-xl border border-white/10 bg-[#0F1420] transition-all duration-300 hover:border-[#D4A853]/45 hover:bg-[#131928]">
        <Link
          to={`/investigation/${mystery.slug}`}
          className="relative sm:w-72 shrink-0 overflow-hidden bg-[#080B12]"
        >
          <img
            src={mystery.heroImage}
            alt={mystery.imageAlt}
            loading="lazy"
            className="h-48 sm:h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
          <span className="font-mono-archive absolute top-2.5 left-2.5 rounded border border-white/15 bg-[#080B12]/85 px-2 py-0.5 text-[10px] tracking-wider text-[#D4A853] backdrop-blur-sm">
            {caseCode}
          </span>
        </Link>
        <div className="flex flex-1 flex-col justify-between p-5 sm:p-6">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
              <span className="font-mono-archive text-[11px] font-medium tracking-wider uppercase text-[#9AA5BE]">
                {category ? `${category.number} // ${category.name}` : mystery.category}
              </span>
              <div className="flex items-center gap-2">
                <EvidenceBadge status={mystery.evidenceStatus} showPlainLabel />
                <button
                  type="button"
                  onClick={() => toggleBookmark(mystery.slug)}
                  aria-label={saved ? `Remove ${mystery.title} from saved dossiers` : `Save ${mystery.title} dossier`}
                  aria-pressed={saved}
                  title={saved ? 'Saved in bookmarks' : 'Bookmark dossier'}
                  className={`rounded-md border p-1.5 transition-colors ${
                    saved
                      ? 'border-[#D4A853]/50 bg-[#D4A853]/15 text-[#D4A853]'
                      : 'border-white/10 bg-[#080B12] text-[#9AA5BE] hover:border-white/25 hover:text-white'
                  }`}
                >
                  <Bookmark className={`h-3.5 w-3.5 ${saved ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>
            <Link to={`/investigation/${mystery.slug}`}>
              <h3 className="font-editorial text-2xl font-semibold leading-snug text-white group-hover:text-[#D4A853] transition-colors">
                {mystery.title}
              </h3>
            </Link>
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[#CBD5E1]">
              {mystery.summary}
            </p>
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-white/8 pt-3.5 text-xs text-[#9AA5BE]">
            <div className="flex flex-wrap items-center gap-4">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-[#D4A853]" aria-hidden="true" />
                {mystery.locationName}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-[#6C9EFF]" aria-hidden="true" />
                {mystery.readingTimeMinutes} min read
              </span>
            </div>
            <Link
              to={`/investigation/${mystery.slug}`}
              className="font-mono-archive inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#D4A853] hover:text-white transition-colors"
            >
              Open Dossier
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-white/10 bg-[#0F1420] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#D4A853]/45 hover:shadow-[0_14px_34px_rgba(0,0,0,0.5)]">
      <div className="relative aspect-[16/10] overflow-hidden bg-[#080B12]">
        <Link to={`/investigation/${mystery.slug}`} className="block h-full w-full">
          <img
            src={mystery.heroImage}
            alt={mystery.imageAlt}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F1420] via-transparent to-transparent opacity-70" />
        </Link>
        <span className="font-mono-archive pointer-events-none absolute top-2.5 left-2.5 rounded border border-white/15 bg-[#080B12]/85 px-2 py-0.5 text-[10px] tracking-wider text-[#D4A853] backdrop-blur-sm">
          {caseCode}
        </span>
        <button
          type="button"
          onClick={() => toggleBookmark(mystery.slug)}
          aria-label={saved ? `Remove ${mystery.title} from saved dossiers` : `Save ${mystery.title} dossier`}
          aria-pressed={saved}
          title={saved ? 'Saved in bookmarks' : 'Bookmark dossier'}
          className={`absolute top-2.5 right-2.5 rounded-md border p-1.5 backdrop-blur-sm transition-colors ${
            saved
              ? 'border-[#D4A853]/60 bg-[#080B12]/90 text-[#D4A853]'
              : 'border-white/15 bg-[#080B12]/80 text-[#9AA5BE] hover:border-white/30 hover:text-white'
          }`}
        >
          <Bookmark className={`h-3.5 w-3.5 ${saved ? 'fill-current' : ''}`} />
        </button>
      </div>

      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
            <span className="font-mono-archive text-[10px] font-medium uppercase tracking-wider text-[#9AA5BE]">
              {category ? `${category.number} // ${category.name}` : mystery.category}
            </span>
            <EvidenceBadge status={mystery.evidenceStatus} />
          </div>

          <Link to={`/investigation/${mystery.slug}`}>
            <h3 className="font-editorial text-xl sm:text-2xl font-semibold leading-snug text-white group-hover:text-[#D4A853] transition-colors">
              {mystery.title}
            </h3>
          </Link>
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[#CBD5E1]">
            {mystery.summary}
          </p>
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-white/8 pt-3.5 text-xs text-[#9AA5BE]">
          <span className="inline-flex items-center gap-1.5 truncate pr-2">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-[#D4A853]/80" aria-hidden="true" />
            <span className="truncate">{mystery.locationName}</span>
          </span>
          <Link
            to={`/investigation/${mystery.slug}`}
            className="font-mono-archive inline-flex shrink-0 items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-[#D4A853] hover:text-white transition-colors"
          >
            Dossier
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
