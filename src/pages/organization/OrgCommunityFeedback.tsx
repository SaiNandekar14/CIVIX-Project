import { useStore } from '../../state/StoreContext';
import { Link } from 'react-router-dom';
import { CategoryBadge } from '../../components/Badge';
import { MessageSquareReply, ArrowRight, ShieldCheck, AlertTriangle, MapPin } from 'lucide-react';
import { ORG_CATEGORY_MAP } from '../../data/constants';

export function OrgCommunityFeedback() {
  const store = useStore();
  const org = store.currentUser!;

  const allIssues = store.getAllPosts().filter((p) => p.type === 'Issue');
  const orgCategories = ORG_CATEGORY_MAP[org.id] || [];
  const orgRelevant = allIssues.filter((p) =>
    p.assignedOrgId === org.id ||
    (!p.assignedOrgId && p.category && orgCategories.includes(p.category))
  );
  const feedbackIssues = orgRelevant
    .filter((p) => p.status === 'Resolution Submitted' || p.status === 'Community Feedback' || p.status === 'Resolved')
    .filter((p) => (p.feedbackYes || 0) + (p.feedbackNo || 0) > 0)
    .sort((a, b) => {
      const aTotal = (a.feedbackYes || 0) + (a.feedbackNo || 0);
      const bTotal = (b.feedbackYes || 0) + (b.feedbackNo || 0);
      return bTotal - aTotal;
    });

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Community Feedback</h1>
        <p className="text-sm text-gray-500">See what the community says about your resolutions</p>
      </div>

      {feedbackIssues.length === 0 ? (
        <div className="card p-12 text-center">
          <MessageSquareReply className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <p className="text-gray-400 text-lg mb-1">No community feedback yet</p>
          <p className="text-sm text-gray-400">Feedback will appear here after you submit resolutions</p>
        </div>
      ) : (
        <div className="space-y-4">
          {feedbackIssues.map((issue) => {
            const total = (issue.feedbackYes || 0) + (issue.feedbackNo || 0);
            const yesPct = total > 0 ? Math.round(((issue.feedbackYes || 0) / total) * 100) : 0;
            const noPct = 100 - yesPct;
            const isConfirmed = (issue.feedbackYes || 0) > (issue.feedbackNo || 0);
            return (
              <Link
                key={issue.id}
                to={`/organization/issue/${issue.id}`}
                className="card block p-5 transition-all hover:shadow-md hover:border-gray-300"
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {issue.category && <CategoryBadge category={issue.category} />}
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-gray-400" />
                </div>
                <h3 className="mb-1 text-base font-semibold text-gray-900">{issue.title}</h3>
                <p className="mb-3 text-sm text-gray-600 line-clamp-1">{issue.resolutionDescription}</p>
                <div className="mb-3 flex items-center gap-2 text-xs text-gray-500">
                  <MapPin className="h-3.5 w-3.5" />
                  {issue.locality}
                </div>

                {/* Feedback bar */}
                <div className="rounded-lg bg-gray-50 p-3">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-semibold text-green-600">{yesPct}% Confirmed Resolved</span>
                    <span className="text-gray-500">{noPct}% Still an Issue</span>
                  </div>
                  <div className="mb-2 flex h-3 overflow-hidden rounded-full bg-gray-200">
                    <div className="bg-green-500" style={{ width: `${yesPct}%` }} />
                    <div className="bg-amber-400" style={{ width: `${noPct}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{issue.feedbackYes} citizens confirmed</span>
                    <span>{issue.feedbackNo} citizens still report</span>
                  </div>
                  {isConfirmed && total >= 5 ? (
                    <div className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-green-700">
                      <ShieldCheck className="h-4 w-4" />
                      Community Confirmed Resolved
                    </div>
                  ) : !isConfirmed && total >= 5 ? (
                    <div className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-amber-700">
                      <AlertTriangle className="h-4 w-4" />
                      Community Still Reporting Issue
                    </div>
                  ) : null}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
