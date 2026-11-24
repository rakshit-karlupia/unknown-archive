import { Compass, Menu, Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

interface NavbarProps {
  onOpenSearch: () => void;
}

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/explore', label: 'Explore' },
  { to: '/categories', label: 'Categories' },
  { to: '/map', label: 'Global Map' },
  { to: '/library', label: 'Research Library' },
  { to: '/about', label: 'About' },
];

export function Navbar({ onOpenSearch }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onOpenSearch();
      }
      if (e.key === 'Escape') {
        setMobileOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onOpenSearch]);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0B1020]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="flex items-center gap-2.5 text-white hover:opacity-90 transition-opacity"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#6C9EFF]/35 bg-[#121A2B]">
            <Compass className="h-5 w-5 text-[#E5B66A]" aria-hidden="true" />
          </span>
          <div className="leading-tight">
            <span className="block font-ui text-sm font-bold tracking-[0.18em] text-white">
              THE UNKNOWN ARCHIVE
            </span>
            <span className="hidden sm:block text-[10px] tracking-[0.12em] uppercase text-[#A8B3CF]">
              Digital Museum of Inquiry
            </span>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#121A2B] text-[#E5B66A]'
                    : 'text-[#C6D0E8] hover:bg-white/5 hover:text-white'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenSearch}
            aria-label="Search mysteries and research library"
            className="inline-flex items-center gap-2 rounded-xl border border-white/12 bg-[#121A2B] px-3 py-2 text-sm text-[#D8E0F4] transition-colors hover:border-[#6C9EFF]/50 hover:text-white"
          >
            <Search className="h-4 w-4 text-[#6C9EFF]" aria-hidden="true" />
            <span className="hidden sm:inline text-xs text-[#A8B3CF]">Search</span>
            <kbd className="hidden md:inline-block rounded border border-white/15 bg-[#0B1020] px-1.5 py-0.5 text-[10px] text-[#A8B3CF]">
              Ctrl K
            </kbd>
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            className="inline-flex lg:hidden items-center justify-center rounded-xl border border-white/12 bg-[#121A2B] p-2 text-white hover:border-[#6C9EFF]/50"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav
          className="lg:hidden border-t border-white/10 bg-[#0E1528] px-4 py-4 space-y-1"
          aria-label="Mobile navigation"
        >
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `block rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#17223B] text-[#E5B66A]'
                    : 'text-[#D8E0F4] hover:bg-white/5 hover:text-white'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}
