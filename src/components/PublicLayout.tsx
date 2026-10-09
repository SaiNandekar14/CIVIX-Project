import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { Logo } from './Logo';
import { useStore } from '../state/StoreContext';
import { Menu, X, MapPin } from 'lucide-react';
import { useState } from 'react';

const publicNavItems = [
  { to: '/', label: 'Home' },
  { to: '/organizations', label: 'Organizations' },
  { to: '/about', label: 'About' },
];

const authedNavItems = [
  { to: '/', label: 'Home' },
  { to: '/explore', label: 'Explore' },
  { to: '/organizations', label: 'Organizations' },
  { to: '/about', label: 'About' },
];

export function PublicLayout() {
  const store = useStore();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navItems = store.currentUser ? authedNavItems : publicNavItems;

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <Logo />
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive ? 'text-orange-600 bg-orange-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-1 rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700 sm:inline-flex">
              <MapPin className="h-3 w-3" />
              Nagpur
            </span>
            {store.currentUser ? (
              <Link to={store.currentUser.role === 'citizen' ? '/citizen' : '/organization'} className="btn-primary text-sm">
                Go to App
              </Link>
            ) : (
              <div className="hidden items-center gap-2 sm:flex">
                <Link to="/login" className="btn-ghost text-sm">
                  Log In
                </Link>
                <Link to="/register" className="btn-primary text-sm">
                  Create Account
                </Link>
              </div>
            )}
            <button
              className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {mobileOpen && (
          <div className="border-t border-gray-200 bg-white px-4 py-3 md:hidden">
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-2 text-sm font-medium ${isActive ? 'text-orange-600 bg-orange-50' : 'text-gray-600'}`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              <div className="mt-2 flex gap-2 border-t border-gray-100 pt-3">
                <Link to="/login" className="btn-secondary flex-1 text-sm" onClick={() => setMobileOpen(false)}>
                  Log In
                </Link>
                <Link to="/register" className="btn-primary flex-1 text-sm" onClick={() => setMobileOpen(false)}>
                  Create Account
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <Logo />
            <p className="text-center text-sm text-gray-500 sm:text-right">
              For the Community. To the Community. With the Community.
              <br />
              <span className="text-xs">Pilot City: Nagpur, Maharashtra. CIVIX is a demonstration prototype and is not affiliated with any real government organization.</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
