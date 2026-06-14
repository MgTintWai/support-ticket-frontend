import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { logout } from '../../api/auth';
import { btnSecondary } from '../../utils/ui';

const navLinkClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive
      ? 'bg-slate-800 text-white'
      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
  }`;

export default function AppLayout({ children }) {
  const { user, isAgent, clearSession } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      clearSession();
      navigate('/login');
    }
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-900 text-white shadow-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="text-lg font-bold tracking-tight text-white hover:text-slate-200"
            onClick={closeMenu}
          >
            Support Portal
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            <NavLink to="/" className={navLinkClass}>Dashboard</NavLink>
            <NavLink to="/tickets" className={navLinkClass}>Tickets</NavLink>
            <NavLink to="/tickets/new" className={navLinkClass}>New Ticket</NavLink>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <span className="max-w-[140px] truncate text-sm text-slate-300">{user?.name}</span>
            <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-slate-200">
              {isAgent ? 'Agent' : 'Client'}
            </span>
            <button type="button" className={btnSecondary} onClick={handleLogout}>
              Logout
            </button>
          </div>

          <button
            type="button"
            className="inline-flex cursor-pointer items-center justify-center rounded-lg p-2 text-slate-300 hover:bg-slate-800 hover:text-white md:hidden"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-slate-800 px-4 py-4 md:hidden">
            <nav className="flex flex-col gap-1">
              <NavLink to="/" className={navLinkClass} onClick={closeMenu}>Dashboard</NavLink>
              <NavLink to="/tickets" className={navLinkClass} onClick={closeMenu}>Tickets</NavLink>
              <NavLink to="/tickets/new" className={navLinkClass} onClick={closeMenu}>New Ticket</NavLink>
            </nav>
            <div className="mt-4 flex flex-col gap-3 border-t border-slate-800 pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-300">{user?.name}</span>
                <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-slate-200">
                  {isAgent ? 'Agent' : 'Client'}
                </span>
              </div>
              <button type="button" className={`${btnSecondary} w-full`} onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {children}
      </main>
    </div>
  );
}
