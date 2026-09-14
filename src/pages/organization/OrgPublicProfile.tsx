import { useStore } from '../../state/StoreContext';
import { Link } from 'react-router-dom';
import { VerifiedBadge, PendingBadge } from '../../components/Badge';
import { MapPin, Building2, Clock, CheckCircle, ThumbsUp, TrendingUp, ShieldCheck, ArrowRight } from 'lucide-react';

export function OrgPublicProfilePage() {
  const store = useStore();
  const org = store.currentUser!;
  if (org.role !== 'organization') return null;

  const allIssues = store.getAllPosts().filter((p) => p.type === 'Issue');
  const orgIssues = allIssues.filter((p) => p.assignedOrgId === org.id);
  const resolved = orgIssues.filter((p) => p.status === 'Resolved');
  const confirmed = resolved.filter((p) => (p.feedbackYes || 0) > (p.feedbackNo || 0));
  const resolutionRate = orgIssues.length > 0 ? Math.round((resolved.length / orgIssues.length) * 100) : 0;
  const totalFeedback = resolved.reduce((sum, p) => sum + (p.feedbackYes || 0) + (p.feedbackNo || 0), 0);
  const confirmedRate = totalFeedback > 0
    ? Math.round((confirmed.reduce((s, p) => s + (p.feedbackYes || 0), 0) / totalFeedback) * 100)
    : 0;
  const communityScore = confirmedRate > 0 ? (confirmedRate / 20).toFixed(1) : '—';

  const recentResolutions = resolved.slice(-5).reverse();

  const statCards = [
    { label: 'Issues Received', value: orgIssues.length || '—', icon: TrendingUp, color: 'text-gray-900' },
    { label: 'Issues Resolved', value: resolved.length || '—', icon: CheckCircle, color: 'text-green-600' },
    { label: 'Resolution Rate', value: `${resolutionRate || 0}%`, icon: TrendingUp, color: 'text-orange-600' },
    { label: 'Community Confirmed', value: confirmed.length || '—', icon: ThumbsUp, color: 'text-blue-600' },
    { label: 'Avg Resolution Time', value: '42 hrs', icon: Clock, color: 'text-gray-900' },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      {/* Profile header */}
      <div className="card mb-6 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-orange-50">
            <Building2 className="h-7 w-7 text-orange-600" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">{org.orgName}</h1>
            <p className="text-sm text-gray-500">{org.orgType}</p>
            <div className="mt-2 flex items-center gap-2">
              {org.verified ? <VerifiedBadge /> : <PendingBadge />}
              <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                <MapPin className="h-3 w-3" /> {org.serviceArea}
              </span>
            </div>
          </div>
          <Link to={`/organization/organizations/${org.id}`} className="btn-secondary text-sm">
            View Public Page <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <p className="mt-4 text-sm text-gray-600">{org.description}</p>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {statCards.map((stat) => (
          <div key={stat.label} className="card p-4 text-center">
            <stat.icon className="mx-auto mb-2 h-5 w-5 text-gray-400" />
            <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-xs text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Reputation */}
      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <div className="card p-5">
          <h3 className="mb-3 text-sm font-semibold text-gray-900">Community Resolution Score</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-orange-600">{communityScore}</span>
            <span className="text-lg text-gray-400">/ 5</span>
          </div>
          {confirmedRate > 0 && (
            <div className="mt-2 h-2 w-full rounded-full bg-gray-100">
              <div className="h-2 rounded-full bg-orange-500" style={{ width: `${(parseFloat(communityScore) / 5) * 100}%` }} />
            </div>
          )}
          <p className="mt-2 text-xs text-gray-500">Based on community-confirmed resolutions</p>
        </div>
        <div className="card p-5">
          <h3 className="mb-3 text-sm font-semibold text-gray-900">Community Confirmed</h3>
          <div className="text-4xl font-bold text-green-600">{confirmed.length}</div>
          <p className="mt-2 text-xs text-gray-500">Resolutions confirmed by the community as actually resolved</p>
        </div>
      </div>

      {/* Recent resolutions */}
      <div className="card p-5">
        <h3 className="mb-4 text-sm font-semibold text-gray-900">Recent Resolution Experiences</h3>
        {recentResolutions.length === 0 ? (
          <p className="text-sm text-gray-400">No recent resolutions yet.</p>
        ) : (
          <div className="space-y-3">
            {recentResolutions.map((r) => (
              <div key={r.id} className="border-l-2 border-green-300 pl-3">
                <Link to={`/organization/issue/${r.id}`} className="text-sm font-medium text-gray-900 hover:text-orange-600">
                  {r.title}
                </Link>
                <p className="text-xs text-gray-500">{r.resolutionDescription}</p>
                <div className="mt-1 flex items-center gap-3 text-xs text-gray-400">
                  <span className="text-green-600">{r.feedbackYes || 0} confirmed</span>
                  {(r.feedbackNo || 0) > 0 && <span className="text-gray-500">{r.feedbackNo} still reporting</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
