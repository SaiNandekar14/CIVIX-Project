import { useStore } from '../../state/StoreContext';
import { Link } from 'react-router-dom';
import { StatusBadge, CategoryBadge } from '../../components/Badge';
import { TrendingUp, Users, Clock, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { ORG_CATEGORY_MAP } from '../../data/constants';
import type { Post } from '../../types';

export function OrgDashboard() {
  const store = useStore();
  const org = store.currentUser as Extract<typeof store.currentUser, { role: 'organization' }>;
  const allIssues = store.getAllPosts().filter((p) => p.type === 'Issue');

  // Filter relevant issues: assigned to this org, or in this org's categories (and unassigned)
  const orgCategories = ORG_CATEGORY_MAP[org.id] || [];
  const relevantIssues = allIssues.filter((p) =>
    p.assignedOrgId === org.id ||
    (!p.assignedOrgId && p.category && orgCategories.includes(p.category))
  );

  const newIssues = relevantIssues.filter((p) => p.status === 'Reported' || p.status === 'Community Attention');
  const highAttention = relevantIssues.filter((p) => p.status === 'Community Attention');
  const inProgress = relevantIssues.filter((p) => p.status === 'In Progress' || p.status === 'Verified' || p.status === 'Assigned');
  const resolutionPending = relevantIssues.filter((p) => p.status === 'In Progress');
  const resolved = relevantIssues.filter((p) => p.status === 'Resolved');

  const stats = [
    { label: 'New Issues', value: newIssues.length, icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'High Community Attention', value: highAttention.length, icon: Users, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'In Progress', value: inProgress.length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Resolution Pending', value: resolutionPending.length, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Resolved', value: resolved.length, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
  ];

  const recentIssues = [...relevantIssues]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Nagpur Civic Operations</h1>
        <p className="text-sm text-gray-500">Overview of civic issues relevant to {org.orgName}</p>
      </div>

      {/* Stat cards */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((stat) => (
          <div key={stat.label} className="card p-4">
            <div className={`mb-2 flex h-9 w-9 items-center justify-center rounded-lg ${stat.bg}`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-xs text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Recent issues */}
      <div className="card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">Recent Issues</h2>
          <Link to="/organization/issues" className="text-sm font-medium text-orange-600 hover:text-orange-700">
            View all →
          </Link>
        </div>
        {recentIssues.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-400">No issues found.</p>
        ) : (
          <div className="space-y-3">
            {recentIssues.map((issue: Post) => {
              const counts = store.getReactionCounts(issue.id);
              return (
                <Link
                  key={issue.id}
                  to={`/organization/issue/${issue.id}`}
                  className="flex items-center justify-between rounded-lg border border-gray-100 p-3 transition-colors hover:border-gray-200 hover:bg-gray-50"
                >
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      {issue.category && <CategoryBadge category={issue.category} />}
                      <StatusBadge status={issue.status} />
                    </div>
                    <p className="text-sm font-medium text-gray-900 truncate">{issue.title}</p>
                    <p className="text-xs text-gray-500">{issue.locality}</p>
                  </div>
                  <div className="ml-3 flex shrink-0 items-center gap-3 text-xs">
                    <span className="text-orange-600 font-semibold">{counts.sameIssue} Same Issue</span>
                    <span className="text-blue-600 font-semibold">{counts.support} Support</span>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
