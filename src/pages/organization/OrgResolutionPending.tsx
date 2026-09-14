import { useStore } from '../../state/StoreContext';
import { Link } from 'react-router-dom';
import { StatusBadge, CategoryBadge } from '../../components/Badge';
import { Clock, ArrowRight, MapPin } from 'lucide-react';
import { ORG_CATEGORY_MAP } from '../../data/constants';

export function OrgResolutionPending() {
  const store = useStore();
  const org = store.currentUser!;

  const allIssues = store.getAllPosts().filter((p) => p.type === 'Issue');
  const orgCategories = ORG_CATEGORY_MAP[org.id] || [];
  const pending = allIssues
    .filter((p) =>
      (p.assignedOrgId === org.id || (!p.assignedOrgId && p.category && orgCategories.includes(p.category))) &&
      (p.status === 'Verified' || p.status === 'Assigned' || p.status === 'In Progress')
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Resolution Pending</h1>
        <p className="text-sm text-gray-500">Issues that need your action</p>
      </div>

      {pending.length === 0 ? (
        <div className="card p-12 text-center">
          <Clock className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <p className="text-gray-400 text-lg mb-1">No pending resolutions</p>
          <p className="text-sm text-gray-400">All assigned issues have been resolved</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pending.map((issue) => (
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
              <p className="mb-2 line-clamp-1 text-sm text-gray-600">{issue.description}</p>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {issue.locality}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {new Date(issue.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
