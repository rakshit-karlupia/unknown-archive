import { Compass } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#080C18] text-[#A8B3CF]">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link to="/" className="inline-flex items-center gap-2.5 text-white">
              <Compass className="h-5 w-5 text-[#E5B66A]" aria-hidden="true" />
              <span className="font-ui text-sm font-bold tracking-[0.18em]">
                THE UNKNOWN ARCHIVE
              </span>
            </Link>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-[#A8B3CF]">
              Make the unknown understandable. An editorial science and history platform examining
              the world’s enduring mysteries through primary documents, verified measurements, and
              peer-reviewed inquiry.
            </p>
            <p className="mt-4 text-xs text-[#7D89A8]">
              Evidence Integrity Standard: Established facts, unresolved questions, debated models,
              and unsupported claims are explicitly separated on every dossier.
            </p>
          </div>

          <div>
            <h3 className="font-ui text-xs font-semibold uppercase tracking-[0.16em] text-white">
              Explore Platform
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link to="/explore" className="hover:text-[#E5B66A] transition-colors">
                  Explore Investigations
                </Link>
              </li>
              <li>
                <Link to="/categories" className="hover:text-[#E5B66A] transition-colors">
                  Browse Categories
                </Link>
              </li>
              <li>
                <Link to="/map" className="hover:text-[#E5B66A] transition-colors">
                  Global Mystery Map
                </Link>
              </li>
              <li>
                <Link to="/library" className="hover:text-[#E5B66A] transition-colors">
                  Research Library
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#E5B66A] transition-colors">
                  Methodology & About
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-ui text-xs font-semibold uppercase tracking-[0.16em] text-white">
              Evidence Labels
            </h3>
            <ul className="mt-4 space-y-2 text-xs leading-relaxed">
              <li>
                <span className="font-semibold text-emerald-300">VERIFIED:</span> Repeatable
                scientific or documentary support.
              </li>
              <li>
                <span className="font-semibold text-[#6C9EFF]">UNRESOLVED:</span> Real event or
                phenomenon with open questions.
              </li>
              <li>
                <span className="font-semibold text-[#E5B66A]">DEBATED:</span> Competing models
                with inconclusive data.
              </li>
              <li>
                <span className="font-semibold text-rose-300">UNSUPPORTED:</span> No reliable
                evidence supports the claim.
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-white/8 pt-6 text-xs text-[#7D89A8]">
          <span>THE UNKNOWN ARCHIVE — Research & Scientific Discovery Platform</span>
          <span>Citations link to NASA, NOAA, USGS, BAS, Smithsonian & peer-reviewed journals.</span>
        </div>
      </div>
    </footer>
  );
}
