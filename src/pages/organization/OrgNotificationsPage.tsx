import { useStore } from '../../state/StoreContext';
import { useNavigate } from 'react-router-dom';
import { Bell, MessageSquare, Users, Building2, TrendingUp, CheckCircle2, AlertCircle, Mail } from 'lucide-react';

const iconMap: Record<string, typeof Bell> = {
  reaction: Users,
  organization: Building2,
  status: TrendingUp,
  resolution: CheckCircle2,
  feedback: MessageSquare,
  communication: AlertCircle,
};

export function OrgNotificationsPage() {
  const store = useStore();
  const navigate = useNavigate();
  const notifications = store.getNotifications(store.currentUser!.id);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        <p className="text-sm text-gray-500">Stay updated on your civic activity</p>
      </div>

      {notifications.length === 0 ? (
        <div className="card p-12 text-center">
          <Bell className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <p className="text-gray-400 text-lg mb-1">No notifications yet</p>
          <p className="text-sm text-gray-400">You'll be notified when there's activity on issues you're handling</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => {
            const Icon = iconMap[n.type] || Bell;
            return (
              <div
                key={n.id}
                className={`card flex items-start gap-3 p-4 cursor-pointer ${!n.read ? 'border-orange-200 bg-orange-50/30' : ''}`}
                onClick={() => {
                  store.markNotificationRead(n.id);
                  if (n.postId) navigate(`/organization/issue/${n.postId}`);
                }}
              >
                <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${!n.read ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-400'}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700">{n.text}</p>
                  {n.postId && (
                    <span className="mt-1 inline-block text-xs font-medium text-orange-600 hover:text-orange-700">
                      View issue →
                    </span>
                  )}
                </div>
                {!n.read && <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-orange-500" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
