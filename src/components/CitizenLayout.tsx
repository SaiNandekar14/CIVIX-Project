import { Outlet, NavLink, Link, useNavigate, Navigate } from 'react-router-dom';
import { Logo } from './Logo';
import { useStore } from '../state/StoreContext';
import { Home, Compass, PlusCircle, Map, Calendar, Building2, Bell, Activity, User, LogOut, Menu, X, MapPin } from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { to: '/citizen', label: 'Home', icon: Home, end: true },
  { to: '/citizen/explore', label: 'Explore', icon: Compass, end: false },
  { to: '/citizen/create', label: 'Create Post', icon: PlusCircle, end: false },
  { to: '/citizen/map', label: 'Map', icon: Map, end: false },
  { to: '/citizen/events', label: 'Events', icon: Calendar, end: false },
  { to: '/citizen/organizations', label: 'Organizations', icon: Building2, end: false },
  { to: '/citizen/notifications', label: 'Notifications', icon: Bell, end: false },
  { to: '/citizen/activity', label: 'My Activity', icon: Activity, end: false },
  { to: '/citizen/profile', label: 'Profile', icon: User, end: false },
];

const mobileNavItems = [
  { to: '/citizen', label: 'Home', icon: Home, end: true },
  { to: '/citizen/explore', label: 'Explore', icon: Compass, end: false },
  { to: '/citizen/create', label: 'Create', icon: PlusCircle, end: false },
  { to: '/citizen/map', label: 'Map', icon: Map, end: false },
  { to: '/citizen/profile', label: 'Profile', icon: User, end: false },
];

export function CitizenLayout() {
  const store = useStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!store.currentUser || store.currentUser.role !== 'citizen') {
    return <Navigate to="/login" replace />;
  }

  const unreadCount = store.getNotifications(store.currentUser.id).filter((n) => !n.read).length;

  const handleLogout = () => {
    store.logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-60 flex-col border-r border-gray-200 bg-white md:flex">
        <div className="flex h-16 items-center border-b border-gray-200 px-4">
          <Logo />
        </div>
        <div className="flex items-center gap-1.5 border-b border-gray-100 px-4 py-2.5">
          <MapPin className="h-3.5 w-3.5 text-orange-600" />
          <span className="text-xs font-medium text-gray-600">Nagpur, Maharashtra</span>
        </div>
        <nav className="flex-1 overflow-y-auto p-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `mb-0.5 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive ? 'bg-orange-50 text-orange-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              <item.icon className="h-4.5 w-4.5" style={{ width: '1.125rem', height: '1.125rem' }} />
              {item.label}
              {item.label === 'Notifications' && unreadCount > 0 && (
                <span className="ml-auto rounded-full bg-orange-600 px-1.5 py-0.5 text-xs font-semibold text-white">
                  {unreadCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-gray-200 p-3">
          <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900">
            <LogOut className="h-4.5 w-4.5" style={{ width: '1.125rem', height: '1.125rem' }} />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="fixed top-0 left-0 right-0 z-30 flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 md:hidden">
        <Logo />
        <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500">
          <MapPin className="h-3 w-3 text-orange-600" /> Nagpur
        </span>
      </div>

      {/* Main content */}
      <div className="md:pl-60">
        <main className="min-h-screen pt-14 pb-20 md:pt-0 md:pb-0">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around border-t border-gray-200 bg-white md:hidden">
        {mobileNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 py-2 px-2 text-xs ${isActive ? 'text-orange-600' : 'text-gray-500'}`
            }
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
