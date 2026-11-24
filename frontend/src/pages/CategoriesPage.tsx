import { ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchCategories, fetchMysteries } from '../api/client';
import { EvidenceBadge } from '../components/EvidenceBadge';
import { CATEGORIES, MYSTERIES } from '../data';
import type { CategoryInfo, MysteryInvestigation } from '../types/archive';

export function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryInfo[]>(CATEGORIES);
  const [mysteries, setMysteries] = useState<MysteryInvestigation[]>(MYSTERIES);
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({});

  useEffect(() => {
    void fetchCategories().then(setCategories);
    void fetchMysteries().then(setMysteries);
  }, []);

  const toggleExpand = (slug: string) => {
    setExpandedCats((prev) => ({ ...prev, [slug]: !prev[slug] }));
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-3xl">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#E5B66A]">
          12 Exhibition Domains · {mysteries.length} Investigations
        </span>
        <h1 className="mt-2 font-editorial text-4xl font-semibold text-white sm:text-5xl">
          Explore by Category
        </h1>
        <p className="mt-3 text-base leading-relaxed text-[#CBD6F0]">
          Twelve clear domains organizing humanity’s unexplained questions—from classified military
          bases and time anomalies to secret societies, disappearances, and frontier science.
        </p>
      </div>

      <div className="mt-10 grid gap-x-8 gap-y-10 md:grid-cols-2">
        {categories.map((cat) => {
          const items = mysteries.filter(
            (m) => m.category === cat.slug || m.secondaryCategories?.includes(cat.slug)
          );
          const isExpanded = Boolean(expandedCats[cat.slug]);
          const visibleItems = isExpanded ? items : items.slice(0, 5);

          return (
            <section
              key={cat.slug}
              className="flex flex-col justify-between overflow-hidden rounded-2xl border border-white/12 bg-[#121A2B]"
            >
              <div>
                <Link
                  to={`/explore?category=${cat.slug}`}
                  className="group block aspect-[16/10] overflow-hidden bg-[#0B1020]"
                >
                  <img
                    src={cat.image}
                    alt={`${cat.number}. ${cat.name} visual plate`}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </Link>

                <div className="p-6 pb-4">
                  <div className="flex items-baseline justify-between gap-3">
                    <h2 className="text-2xl font-bold text-white">
                      {cat.number}. {cat.name}
                    </h2>
                    <span className="shrink-0 rounded-full border border-[#6C9EFF]/35 bg-[#0B1020] px-3 py-0.5 text-xs font-semibold text-[#6C9EFF]">
                      {items.length} {items.length === 1 ? 'Dossier' : 'Dossiers'}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-medium text-[#E5B66A]">{cat.tagline}</p>
                  <p className="mt-3 text-sm leading-relaxed text-[#CBD6F0]">{cat.description}</p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {cat.disciplines.map((d) => (
                      <span
                        key={d}
                        className="rounded-full border border-white/10 bg-[#0B1020] px-2.5 py-0.5 text-xs text-[#B8C4E0]"
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="px-6 pb-6">
                <div className="space-y-2 border-t border-white/8 pt-4">
                  {visibleItems.map((m) => (
                    <Link
                      key={m.slug}
                      to={`/investigation/${m.slug}`}
                      className="flex items-center justify-between gap-3 rounded-xl border border-white/8 bg-[#0B1020]/85 px-3.5 py-2.5 text-sm transition-colors hover:border-[#6C9EFF]/50 hover:bg-[#0E162B]"
                    >
                      <span className="truncate font-medium text-white">{m.title}</span>
                      <EvidenceBadge status={m.evidenceStatus} />
                    </Link>
                  ))}
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-1">
                  {items.length > 5 ? (
                    <button
                      type="button"
                      onClick={() => toggleExpand(cat.slug)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#E5B66A] hover:underline"
                    >
                      {isExpanded ? (
                        <>
                          Show fewer <ChevronUp className="h-3.5 w-3.5" />
                        </>
                      ) : (
                        <>
                          Show all {items.length} dossiers <ChevronDown className="h-3.5 w-3.5" />
                        </>
                      )}
                    </button>
                  ) : (
                    <span />
                  )}

                  <Link
                    to={`/explore?category=${cat.slug}`}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#6C9EFF] hover:text-white transition-colors"
                  >
                    Explore category
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
