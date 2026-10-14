import { useStore } from '../../state/StoreContext';
import { Link } from 'react-router-dom';
import { StatusBadge, CategoryBadge } from '../../components/Badge';
import { ArrowRight, MapPin, Users, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useState } from 'react';
import { ORG_CATEGORY_MAP } from '../../data/constants';

const statusFilters = ['All', 'New', 'Verified', 'In Progress', 'Resolution Submitted', 'Resolved'];

export function OrgIssues() {
  const store = useStore();
  const org = store.currentUser!;
  const [filter, setFilter] = useState('All');

  const allIssues = store.getAllPosts().filter((p) => p.type === 'Issue');
  const orgCategories = ORG_CATEGORY_MAP[org.id] || [];
  const relevantIssues = allIssues.filter((p) =>
    p.assignedOrgId === org.id ||
    (!p.assignedOrgId && p.category && orgCategories.includes(p.category))
  );

  let filtered = relevantIssues;
  if (filter === 'New') {
    filtered = filtered.filter((p) => p.status === 'Reported' || p.status === 'Community Attention');
  } else if (filter !== 'All') {
    filtered = filtered.filter((p) => p.status === filter);
  }

  filtered = [...filtered].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Civic Issues</h1>
        <p className="text-sm text-gray-500">All issues relevant to your organization</p>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-2">
        {statusFilters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              filter === f ? 'bg-orange-600 text-white' : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-gray-400 text-lg mb-1">No issues found</p>
          <p className="text-sm text-gray-400">Try a different filter</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((issue) => {
            const counts = store.getReactionCounts(issue.id);
            return (
              <Link
                key={issue.id}
                to={`/organization/issue/${issue.id}`}
                className="card-hover block p-4"
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {issue.category && <CategoryBadge category={issue.category} />}
                    <StatusBadge status={issue.status} />
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-gray-400" />
                </div>
                <h3 className="mb-1 text-base font-semibold text-gray-900">{issue.title}</h3>
                <p className="mb-2 line-clamp-1 text-sm text-gray-600">{issue.description}</p>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {issue.locality}
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-4 border-t border-gray-100 pt-3 text-sm">
                  <span className="inline-flex items-center gap-1 font-semibold text-gray-900">
                    <Users className="h-3.5 w-3.5 text-orange-600" />
                    {counts.sameIssue} Same Issue
                  </span>
                  <span className="inline-flex items-center gap-1 font-semibold text-blue-600">
                    <ThumbsUp className="h-3.5 w-3.5" />
                    {counts.support} Support
                  </span>
                  <span className="inline-flex items-center gap-1 font-semibold text-gray-600">
                    <ThumbsDown className="h-3.5 w-3.5" />
                    {counts.downvote} Downvote
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
