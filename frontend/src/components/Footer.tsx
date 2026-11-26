import { Compass } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#06080E] text-[#9AA5BE]">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link to="/" className="inline-flex items-center gap-2.5 text-white">
              <Compass className="h-5 w-5 text-[#D4A853]" aria-hidden="true" />
              <span className="font-ui text-sm font-bold tracking-[0.18em]">
                THE UNKNOWN ARCHIVE
              </span>
            </Link>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-[#9AA5BE]">
              Make the unknown understandable. An editorial intelligence archive and scientific
              investigation platform examining enduring mysteries through primary documents,
              verified measurements, and peer-reviewed inquiry.
            </p>
            <p className="font-mono-archive mt-4 text-[11px] text-[#68748F]">
              INTEGRITY PROTOCOL // Established facts, unresolved questions, debated models, and
              unsupported claims are strictly separated on every dossier.
            </p>
          </div>

          <div>
            <h3 className="font-mono-archive text-xs font-semibold uppercase tracking-[0.16em] text-white">
              Archive Index
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link to="/explore" className="hover:text-[#D4A853] transition-colors">
                  Explore Investigations
                </Link>
              </li>
              <li>
                <Link to="/categories" className="hover:text-[#D4A853] transition-colors">
                  Browse Categories
                </Link>
              </li>
              <li>
                <Link to="/map" className="hover:text-[#D4A853] transition-colors">
                  Global Mystery Map
                </Link>
              </li>
              <li>
                <Link to="/investigation-room" className="hover:text-[#D4A853] transition-colors">
                  Investigation Room
                </Link>
              </li>
              <li>
                <Link to="/library" className="hover:text-[#D4A853] transition-colors">
                  Research Library
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#D4A853] transition-colors">
                  Methodology &amp; About
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-mono-archive text-xs font-semibold uppercase tracking-[0.16em] text-white">
              Evidence Ratings
            </h3>
            <ul className="mt-4 space-y-2 text-xs leading-relaxed">
              <li>
                <span className="font-mono-archive font-semibold text-emerald-300">VERIFIED:</span>{' '}
                Repeatable scientific or documentary support.
              </li>
              <li>
                <span className="font-mono-archive font-semibold text-[#6C9EFF]">UNRESOLVED:</span>{' '}
                Real event or phenomenon with open questions.
              </li>
              <li>
                <span className="font-mono-archive font-semibold text-[#D4A853]">DEBATED:</span>{' '}
                Competing models with inconclusive data.
              </li>
              <li>
                <span className="font-mono-archive font-semibold text-rose-300">UNSUPPORTED:</span>{' '}
                No reliable evidence supports the claim.
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-white/8 pt-6 text-xs text-[#68748F]">
          <span className="font-mono-archive">
            THE UNKNOWN ARCHIVE — CLASSIFIED INQUIRY &amp; SCIENTIFIC DISCOVERY
          </span>
          <span>Citations link to NASA, NOAA, USGS, BAS, Smithsonian &amp; peer-reviewed journals.</span>
        </div>
      </div>
    </footer>
  );
}
