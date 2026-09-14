import { Outlet, NavLink, useNavigate, Navigate } from 'react-router-dom';
import { Logo } from './Logo';
import { useStore } from '../state/StoreContext';
import { LayoutDashboard, ListTodo, Signal, Map, Clock, CheckCircle2, MessageSquareReply, Building2, LogOut, MapPin, Menu, X, Bell, PlusCircle } from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { to: '/organization', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/organization/issues', label: 'Issues', icon: ListTodo, end: false },
  { to: '/organization/create', label: 'Create Post', icon: PlusCircle, end: false },
  { to: '/organization/signals', label: 'Community Signals', icon: Signal, end: false },
  { to: '/organization/map', label: 'Map', icon: Map, end: false },
  { to: '/organization/resolution-pending', label: 'Resolution Pending', icon: Clock, end: false },
  { to: '/organization/resolved', label: 'Resolved', icon: CheckCircle2, end: false },
  { to: '/organization/feedback', label: 'Community Feedback', icon: MessageSquareReply, end: false },
  { to: '/organization/notifications', label: 'Notifications', icon: Bell, end: false },
  { to: '/organization/profile', label: 'Public Profile', icon: Building2, end: false },
];

export function OrganizationLayout() {
  const store = useStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!store.currentUser || store.currentUser.role !== 'organization') {
    return <Navigate to="/login" replace />;
  }

  const unreadCount = store.getNotifications(store.currentUser.id).filter((n) => !n.read).length;

  const handleLogout = () => {
    store.logout();
    navigate('/');
  };

  const org = store.currentUser;

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-60 flex-col border-r border-gray-200 bg-white md:flex">
        <div className="flex h-16 items-center border-b border-gray-200 px-4">
          <Logo />
        </div>
        <div className="border-b border-gray-100 px-4 py-2.5">
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-orange-600" />
            <span className="text-xs font-medium text-gray-600">Nagpur Operations</span>
          </div>
        </div>
        <div className="border-b border-gray-100 px-4 py-3">
          <p className="truncate text-sm font-semibold text-gray-900">{org.orgName}</p>
          <p className="text-xs text-gray-500">{org.orgType}</p>
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
              <item.icon style={{ width: '1.125rem', height: '1.125rem' }} />
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
            <LogOut style={{ width: '1.125rem', height: '1.125rem' }} />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="fixed top-0 left-0 right-0 z-30 flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 md:hidden">
        <Logo />
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="rounded-lg p-2 text-gray-600 hover:bg-gray-100">
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setSidebarOpen(false)}>
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute left-0 top-0 h-full w-64 bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex h-14 items-center border-b border-gray-200 px-4">
              <Logo />
            </div>
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="truncate text-sm font-semibold text-gray-900">{org.orgName}</p>
              <p className="text-xs text-gray-500">{org.orgType}</p>
            </div>
            <nav className="p-3" onClick={() => setSidebarOpen(false)}>
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `mb-0.5 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive ? 'bg-orange-50 text-orange-700' : 'text-gray-600 hover:bg-gray-100'
                    }`
                  }
                >
                  <item.icon style={{ width: '1.125rem', height: '1.125rem' }} />
                  {item.label}
                </NavLink>
              ))}
              <button onClick={handleLogout} className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100">
                <LogOut style={{ width: '1.125rem', height: '1.125rem' }} />
                Logout
              </button>
            </nav>
          </div>
        </div>
      )}

      <div className="md:pl-60">
        <main className="min-h-screen pt-14 md:pt-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
