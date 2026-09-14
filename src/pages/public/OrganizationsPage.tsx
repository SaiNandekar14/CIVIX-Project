import { Link } from 'react-router-dom';
import { useStore } from '../../state/StoreContext';
import { VerifiedBadge } from '../../components/Badge';
import { MapPin, ArrowRight } from 'lucide-react';
import type { OrganizationUser } from '../../types';

export function OrganizationsPage() {
  const store = useStore();
  const orgs = store.getOrganizations();
  const posts = store.getAllPosts();
  const currentUser = store.currentUser;
  const basePath = currentUser?.role === 'citizen' ? '/citizen' : currentUser?.role === 'organization' ? '/organization' : '';

  const getOrgStats = (orgId: string) => {
    const orgIssues = posts.filter((p) => p.assignedOrgId === orgId);
    const resolved = orgIssues.filter((p) => p.status === 'Resolved');
    const confirmed = resolved.filter((p) => (p.feedbackYes || 0) > (p.feedbackNo || 0));
    return {
      received: orgIssues.length,
      resolved: resolved.length,
      confirmed: confirmed.length,
      rate: orgIssues.length > 0 ? Math.round((resolved.length / orgIssues.length) * 100) : 0,
    };
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Organizations</h1>
        <p className="text-sm text-gray-500">Civic organizations serving the Nagpur community</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {orgs.map((org: OrganizationUser) => {
          const stats = getOrgStats(org.id);
          return (
            <Link
              key={org.id}
              to={`${basePath}/organizations/${org.id}`}
              className="card block p-5 transition-all hover:shadow-md hover:border-gray-300"
            >
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{org.orgName}</h3>
                  <p className="text-xs text-gray-500">{org.orgType}</p>
                </div>
                {org.verified && <VerifiedBadge />}
              </div>
              <p className="mb-3 line-clamp-2 text-sm text-gray-600">{org.description}</p>
              <div className="mb-3 flex items-center gap-1 text-xs text-gray-500">
                <MapPin className="h-3.5 w-3.5" />
                {org.serviceArea}
              </div>
              <div className="grid grid-cols-3 gap-2 border-t border-gray-100 pt-3">
                <div>
                  <div className="text-lg font-bold text-gray-900">{stats.received}</div>
                  <div className="text-xs text-gray-500">Received</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900">{stats.resolved}</div>
                  <div className="text-xs text-gray-500">Resolved</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-green-600">{stats.confirmed}</div>
                  <div className="text-xs text-gray-500">Confirmed</div>
                </div>
              </div>
              <div className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-orange-600">
                View Profile <ArrowRight className="h-4 w-4" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
