import { useStore } from '../../state/StoreContext';
import { Link } from 'react-router-dom';
import { CategoryBadge } from '../../components/Badge';
import { Users, ThumbsUp, ThumbsDown, TrendingUp, MapPin } from 'lucide-react';
import { ORG_CATEGORY_MAP } from '../../data/constants';

export function OrgCommunitySignals() {
  const store = useStore();
  const org = store.currentUser!;

  const allIssues = store.getAllPosts().filter((p) => p.type === 'Issue');
  const orgCategories = ORG_CATEGORY_MAP[org.id] || [];
  const relevantIssues = allIssues.filter((p) =>
    p.assignedOrgId === org.id ||
    (!p.assignedOrgId && p.category && orgCategories.includes(p.category))
  );

  // Sort by Same Issue count (highest community signal first)
  const sorted = [...relevantIssues].sort((a, b) => {
    const aCount = store.getReactionCounts(a.id).sameIssue;
    const bCount = store.getReactionCounts(b.id).sameIssue;
    return bCount - aCount;
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Community Signals</h1>
        <p className="text-sm text-gray-500">Issues ranked by collective community attention</p>
      </div>

      <div className="mb-4 rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
        <TrendingUp className="inline h-4 w-4 mr-1.5 text-gray-400" />
        These issues have the highest number of citizens reporting the same experience. Prioritize them for action.
      </div>

      {sorted.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-gray-400 text-lg mb-1">No community signals yet</p>
          <p className="text-sm text-gray-400">Issues will appear here as citizens react</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((issue, idx) => {
            const counts = store.getReactionCounts(issue.id);
            const totalReactions = counts.sameIssue + counts.support + counts.downvote;
            return (
              <Link
                key={issue.id}
                to={`/organization/issue/${issue.id}`}
                className="card-hover block p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-600">
                    {idx + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1.5 flex flex-wrap items-center gap-2">
                      {issue.category && <CategoryBadge category={issue.category} />}
                      <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                        <MapPin className="h-3 w-3" />
                        {issue.locality}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-gray-900">{issue.title}</h3>
                    <div className="mt-3 flex items-center gap-4 text-sm">
                      <span className="inline-flex items-center gap-1 font-bold text-gray-900">
                        <Users className="h-4 w-4 text-orange-600" />
                        {counts.sameIssue} Same Issue
                      </span>
                      <span className="inline-flex items-center gap-1 font-semibold text-blue-600">
                        <ThumbsUp className="h-4 w-4" />
                        {counts.support}
                      </span>
                      <span className="inline-flex items-center gap-1 font-semibold text-gray-600">
                        <ThumbsDown className="h-4 w-4" />
                        {counts.downvote}
                      </span>
                      <span className="text-xs text-gray-400">
                        {totalReactions} total reactions
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
