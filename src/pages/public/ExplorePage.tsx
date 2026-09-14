import { useState, useMemo } from 'react';
import { useStore } from '../../state/StoreContext';
import { PostCard } from '../../components/PostCard';
import { Search, SlidersHorizontal } from 'lucide-react';

const tabs = ['All', 'Issues', 'Events', 'Initiatives', 'Announcements', 'Discussions'];
const filters = ['Recent', 'Most Supported', 'Most Same Issue', 'Resolved'];

export function ExplorePage() {
  const store = useStore();
  const [tab, setTab] = useState('All');
  const [filter, setFilter] = useState('Recent');
  const [search, setSearch] = useState('');

  const posts = store.getAllPosts();

  const tabMap: Record<string, string> = {
    Issues: 'Issue',
    Events: 'Event',
    Initiatives: 'Community Initiative',
    Announcements: 'Announcement',
    Discussions: 'Civic Discussion',
  };

  let filtered = posts;
  if (tab !== 'All') {
    filtered = filtered.filter((p) => p.type === tabMap[tab]);
  }

  if (search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter((p) =>
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.locality.toLowerCase().includes(q) ||
      (p.category || '').toLowerCase().includes(q)
    );
  }

  // Sort
  filtered = [...filtered];
  if (filter === 'Most Supported') {
    filtered.sort((a, b) => store.getReactionCounts(b.id).support - store.getReactionCounts(a.id).support);
  } else if (filter === 'Most Same Issue') {
    filtered.sort((a, b) => store.getReactionCounts(b.id).sameIssue - store.getReactionCounts(a.id).sameIssue);
  } else if (filter === 'Resolved') {
    filtered = filtered.filter((p) => p.status === 'Resolved');
  } else {
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Explore Nagpur</h1>
        <p className="text-sm text-gray-500">Discover civic issues, events and initiatives across the city</p>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          className="input pl-9"
          placeholder="Search issues, events, organizations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Tabs */}
      <div className="mb-4 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              tab === t ? 'bg-orange-600 text-white' : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <SlidersHorizontal className="h-4 w-4 text-gray-400" />
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
              filter === f ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-gray-400 text-lg mb-1">No results found</p>
          <p className="text-sm text-gray-400">Try a different search or filter</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
