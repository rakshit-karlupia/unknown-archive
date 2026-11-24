import { ArrowRight, Clock, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getCategoryBySlug } from '../data';
import type { MysteryInvestigation } from '../types/archive';
import { EvidenceBadge } from './EvidenceBadge';

interface MysteryCardProps {
  mystery: MysteryInvestigation;
  layout?: 'grid' | 'list';
}

export function MysteryCard({ mystery, layout = 'grid' }: MysteryCardProps) {
  const category = getCategoryBySlug(mystery.category);

  if (layout === 'list') {
    return (
      <article className="group flex flex-col sm:flex-row overflow-hidden rounded-2xl border border-white/10 bg-[#121A2B]/95 transition-all duration-300 hover:border-[#6C9EFF]/50 hover:bg-[#152036]">
        <Link
          to={`/investigation/${mystery.slug}`}
          className="relative sm:w-72 shrink-0 overflow-hidden bg-[#0B1020]"
        >
          <img
            src={mystery.heroImage}
            alt={mystery.imageAlt}
            loading="lazy"
            className="h-48 sm:h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>
        <div className="flex flex-1 flex-col justify-between p-6">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <span className="text-xs font-semibold tracking-wider uppercase text-[#6C9EFF]">
                {category ? `${category.number}. ${category.name}` : mystery.category}
              </span>
              <EvidenceBadge status={mystery.evidenceStatus} showPlainLabel />
            </div>
            <Link to={`/investigation/${mystery.slug}`}>
              <h3 className="text-xl font-bold leading-snug text-white group-hover:text-[#E5B66A] transition-colors">
                {mystery.title}
              </h3>
            </Link>
            <p className="mt-2 line-clamp-2 text-[15px] leading-relaxed text-[#CBD6F0]">
              {mystery.summary}
            </p>
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-white/8 pt-4 text-xs text-[#B8C4E0]">
            <div className="flex flex-wrap items-center gap-4">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-[#E5B66A]" aria-hidden="true" />
                {mystery.region}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-[#6C9EFF]" aria-hidden="true" />
                {mystery.readingTimeMinutes} min read
              </span>
            </div>
            <Link
              to={`/investigation/${mystery.slug}`}
              className="inline-flex items-center gap-1.5 font-semibold text-[#E5B66A] hover:text-white transition-colors"
            >
              Read Dossier
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#121A2B]/95 transition-all duration-300 hover:-translate-y-1 hover:border-[#6C9EFF]/50 hover:shadow-[0_18px_40px_rgba(0,0,0,0.45)]">
      <Link
        to={`/investigation/${mystery.slug}`}
        className="relative block aspect-[16/10] overflow-hidden bg-[#0B1020]"
      >
        <img
          src={mystery.heroImage}
          alt={mystery.imageAlt}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </Link>

      <div className="flex flex-1 flex-col justify-between p-5 sm:p-6">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6C9EFF]">
              {category ? `${category.number}. ${category.name}` : mystery.category}
            </span>
            <EvidenceBadge status={mystery.evidenceStatus} />
          </div>

          <Link to={`/investigation/${mystery.slug}`}>
            <h3 className="text-lg sm:text-xl font-bold leading-snug text-white group-hover:text-[#E5B66A] transition-colors">
              {mystery.title}
            </h3>
          </Link>
          <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed text-[#CBD6F0]">
            {mystery.summary}
          </p>
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-white/8 pt-4 text-xs text-[#B8C4E0]">
          <span className="inline-flex items-center gap-1.5 truncate pr-2">
            <Clock className="h-3.5 w-3.5 shrink-0 text-[#6C9EFF]" aria-hidden="true" />
            {mystery.readingTimeMinutes} min · {mystery.region}
          </span>
          <Link
            to={`/investigation/${mystery.slug}`}
            className="inline-flex shrink-0 items-center gap-1.5 font-semibold text-[#E5B66A] hover:text-white transition-colors"
          >
            Read Dossier
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </article>
  );
}
