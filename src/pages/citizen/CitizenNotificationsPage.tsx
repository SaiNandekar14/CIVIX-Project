import { useStore } from '../../state/StoreContext';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, MessageSquare, Users, Building2, TrendingUp, CheckCircle2, AlertCircle } from 'lucide-react';
import type { CitizenUser } from '../../types';

const iconMap: Record<string, typeof Bell> = {
  reaction: Users,
  organization: Building2,
  status: TrendingUp,
  resolution: CheckCircle2,
  feedback: MessageSquare,
  communication: AlertCircle,
};

export function CitizenNotificationsPage() {
  const store = useStore();
  const navigate = useNavigate();
  const user = store.currentUser as CitizenUser;
  const notifications = store.getNotifications(user.id);
  const commRequests = store.getCommRequests(user.id);

  const handleAccept = async (reqId: string, orgId: string, orgName: string, postTitle: string) => {
    await store.respondCommRequest(reqId, 'allowed');
    await store.addNotification({
      userId: orgId,
      text: `${user.name} accepted your communication request regarding "${postTitle}". You can now view their contact details.`,
      type: 'communication',
      postId: undefined,
      orgId: orgId,
    });
  };

  const handleDeny = async (reqId: string, orgId: string, orgName: string, postTitle: string) => {
    await store.respondCommRequest(reqId, 'declined');
    await store.addNotification({
      userId: orgId,
      text: `${user.name} denied your communication request regarding "${postTitle}".`,
      type: 'communication',
      postId: undefined,
      orgId: orgId,
    });
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        <p className="text-sm text-gray-500">Stay updated on your civic activity</p>
      </div>

      {/* Communication requests */}
      {commRequests.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-3 text-sm font-semibold text-gray-900">Communication Requests</h2>
          <div className="space-y-3">
            {commRequests.map((req) => (
              <div key={req.id} className="card p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-semibold text-gray-900">{req.orgName}</span>
                </div>
                <p className="text-sm text-gray-600">
                  {req.orgName} requested permission to contact you regarding your civic issue.
                </p>
                <div className="mt-2 rounded-lg bg-gray-50 p-2.5 text-sm">
                  <p className="text-gray-700"><strong>Issue:</strong> {req.postTitle}</p>
                  <p className="text-gray-600 mt-1"><strong>Reason:</strong> {req.reason}</p>
                </div>
                {req.status === 'pending' ? (
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => handleAccept(req.id, req.orgId, req.orgName, req.postTitle)}
                      className="btn-primary text-xs px-3 py-1.5"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleDeny(req.id, req.orgId, req.orgName, req.postTitle)}
                      className="btn-secondary text-xs px-3 py-1.5"
                    >
                      Deny
                    </button>
                  </div>
                ) : (
                  <div className="mt-2">
                    <span className={`badge ${req.status === 'allowed' ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
                      {req.status === 'allowed' ? 'Accepted — contact details visible to organization' : 'Denied — contact details hidden'}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notifications */}
      <h2 className="mb-3 text-sm font-semibold text-gray-900">Recent Activity</h2>
      {notifications.length === 0 ? (
        <div className="card p-12 text-center">
          <Bell className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <p className="text-gray-400 text-lg mb-1">No notifications yet</p>
          <p className="text-sm text-gray-400">You'll be notified when there's activity on your posts</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => {
            const Icon = iconMap[n.type] || Bell;
            return (
              <div
                key={n.id}
                className={`card flex items-start gap-3 p-4 cursor-pointer ${!n.read ? 'border-orange-200 bg-orange-50/30' : ''}`}
                onClick={async () => {
                  await store.markNotificationRead(n.id);
                  if (n.postId) navigate(`/citizen/issue/${n.postId}`);
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
