import { useStore } from '../../state/StoreContext';
import { Link } from 'react-router-dom';
import { StatusBadge, CategoryBadge } from '../../components/Badge';
import { CheckCircle2, ArrowRight, MapPin, ShieldCheck, AlertTriangle } from 'lucide-react';
import { ORG_CATEGORY_MAP } from '../../data/constants';

export function OrgResolved() {
  const store = useStore();
  const org = store.currentUser!;

  const allIssues = store.getAllPosts().filter((p) => p.type === 'Issue');
  const orgCategories = ORG_CATEGORY_MAP[org.id] || [];
  const orgRelevant = allIssues.filter((p) =>
    p.assignedOrgId === org.id ||
    (!p.assignedOrgId && p.category && orgCategories.includes(p.category))
  );
  const resolved = orgRelevant
    .filter((p) => p.status === 'Resolved')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Also include Resolution Submitted / Community Feedback
  const inFeedback = orgRelevant
    .filter((p) => p.status === 'Resolution Submitted' || p.status === 'Community Feedback')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Resolved Issues</h1>
        <p className="text-sm text-gray-500">Issues your organization has resolved</p>
      </div>

      {inFeedback.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-3 text-sm font-semibold text-gray-900">Awaiting Community Feedback</h2>
          <div className="space-y-3">
            {inFeedback.map((issue) => {
              const total = (issue.feedbackYes || 0) + (issue.feedbackNo || 0);
              const yesPct = total > 0 ? Math.round(((issue.feedbackYes || 0) / total) * 100) : 0;
              return (
                <Link
                  key={issue.id}
                  to={`/organization/issue/${issue.id}`}
                  className="card block p-4 transition-all hover:shadow-md hover:border-gray-300"
                >
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {issue.category && <CategoryBadge category={issue.category} />}
                      <StatusBadge status={issue.status} />
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-gray-400" />
                  </div>
                  <h3 className="mb-1 text-base font-semibold text-gray-900">{issue.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {issue.locality}
                    </span>
                    {total > 0 && (
                      <span className="font-medium text-green-600">{yesPct}% confirmed ({issue.feedbackYes}/{total})</span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <h2 className="mb-3 text-sm font-semibold text-gray-900">Fully Resolved</h2>
      {resolved.length === 0 ? (
        <div className="card p-12 text-center">
          <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <p className="text-gray-400 text-lg mb-1">No resolved issues yet</p>
          <p className="text-sm text-gray-400">Resolved issues will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {resolved.map((issue) => {
            const total = (issue.feedbackYes || 0) + (issue.feedbackNo || 0);
            const isConfirmed = total > 0 && (issue.feedbackYes || 0) > (issue.feedbackNo || 0);
            return (
              <Link
                key={issue.id}
                to={`/organization/issue/${issue.id}`}
                className="card block p-4 transition-all hover:shadow-md hover:border-gray-300"
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {issue.category && <CategoryBadge category={issue.category} />}
                    <StatusBadge status={issue.status} />
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-gray-400" />
                </div>
                <h3 className="mb-1 text-base font-semibold text-gray-900">{issue.title}</h3>
                <p className="mb-2 text-sm text-gray-600 line-clamp-1">{issue.resolutionDescription}</p>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {issue.locality}
                  </span>
                  {total > 0 && (
                    <span className={`inline-flex items-center gap-1 font-medium ${isConfirmed ? 'text-green-600' : 'text-amber-600'}`}>
                      {isConfirmed ? <ShieldCheck className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
                      {issue.feedbackYes} confirmed / {issue.feedbackNo} still reporting
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
