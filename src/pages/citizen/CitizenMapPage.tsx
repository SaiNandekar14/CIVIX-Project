import { useState, useMemo } from 'react';
import { useStore } from '../../state/StoreContext';
import { MapView } from '../../components/MapView';
import { Link, useNavigate } from 'react-router-dom';
import { CATEGORY_FILTER_MAP } from '../../data/constants';
import { MapPin, ArrowRight } from 'lucide-react';
import type { Post } from '../../types';

const filters = ['All', 'Roads', 'Water', 'Garbage', 'Streetlights', 'Drainage', 'Transport', 'Resolved'];

export function CitizenMapPage() {
  const store = useStore();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');
  const [selected, setSelected] = useState<Post | null>(null);

  const issues = store.getAllPosts().filter((p) => p.type === 'Issue' && p.lat != null);

  const filtered = useMemo(() => {
    if (filter === 'All') return issues;
    if (filter === 'Resolved') return issues.filter((p) => p.status === 'Resolved');
    const categories = CATEGORY_FILTER_MAP[filter];
    if (categories) return issues.filter((p) => p.category && categories.includes(p.category));
    return issues;
  }, [issues, filter]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Civic Map — Nagpur</h1>
        <p className="text-sm text-gray-500">Explore civic issues across the city</p>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-2">
        {filters.map((f) => (
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

      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        {/* Map */}
        <div className="card overflow-hidden p-0">
          <MapView
            posts={filtered}
            height="500px"
            zoom={12}
            onMarkerClick={(post) => setSelected(post)}
            selectedPostId={selected?.id}
          />
        </div>

        {/* Side panel */}
        <div className="space-y-4">
          {selected ? (
            <div className="card p-4">
              <h3 className="mb-2 text-base font-semibold text-gray-900">{selected.title}</h3>
              <div className="mb-3 flex items-center gap-2 text-xs text-gray-500">
                <MapPin className="h-3.5 w-3.5" />
                {selected.locality}
              </div>
              <p className="mb-3 text-sm text-gray-600 line-clamp-2">{selected.description}</p>
              <div className="mb-3">
                <span className="badge border-gray-200 bg-gray-50 text-gray-600">{selected.category}</span>
              </div>
              <div className="mb-4 flex items-center gap-3 text-sm">
                <span className="font-semibold text-orange-600">{store.getReactionCounts(selected.id).sameIssue} Same Issue</span>
                <span className="font-semibold text-blue-600">{store.getReactionCounts(selected.id).support} Support</span>
                <span className="font-semibold text-gray-600">{store.getReactionCounts(selected.id).downvote} Downvote</span>
              </div>
              <button onClick={() => navigate(`/citizen/issue/${selected.id}`)} className="btn-primary w-full text-sm">
                View Issue <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="card p-6 text-center">
              <MapPin className="mx-auto mb-3 h-8 w-8 text-gray-300" />
              <p className="text-sm text-gray-500">Click a marker on the map to see issue details</p>
            </div>
          )}

          {/* List of visible issues */}
          <div className="card p-4">
            <h3 className="mb-3 text-sm font-semibold text-gray-900">Visible Issues ({filtered.length})</h3>
            <div className="max-h-[300px] space-y-2 overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="py-4 text-center text-sm text-gray-400">No issues match this filter yet.</p>
              ) : (
                filtered.map((issue) => (
                <button
                  key={issue.id}
                  onClick={() => setSelected(issue)}
                  className={`block w-full rounded-lg p-2.5 text-left transition-colors ${
                    selected?.id === issue.id ? 'bg-orange-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <p className="text-sm font-medium text-gray-900 line-clamp-1">{issue.title}</p>
                  <p className="text-xs text-gray-500">{issue.category} · {issue.locality}</p>
                </button>
              ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
