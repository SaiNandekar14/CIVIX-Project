import { useStore } from '../../state/StoreContext';
import { PostCard } from '../../components/PostCard';
import { Link } from 'react-router-dom';
import { PlusCircle, TrendingUp, MapPin, Users } from 'lucide-react';

export function CitizenHome() {
  const store = useStore();
  const posts = store.getAllPosts();
  const issues = posts.filter((p) => p.type === 'Issue');
  const events = posts.filter((p) => p.type === 'Event');
  const resolved = issues.filter((p) => p.status === 'Resolved');

  // Trending = most same_issue reactions
  const trending = [...issues].sort((a, b) => {
    const aCount = store.getReactionCounts(a.id).sameIssue;
    const bCount = store.getReactionCounts(b.id).sameIssue;
    return bCount - aCount;
  }).slice(0, 3);

  const feed = [...posts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10);

  const user = store.currentUser as Extract<typeof store.currentUser, { role: 'citizen' }>;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      {/* Greeting */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">What's happening in Nagpur?</h1>
        <p className="text-sm text-gray-500">Welcome back, {user.name}. Here's what your community is sharing.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        {/* Feed */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Community Feed</h2>
            <Link to="/citizen/create" className="btn-primary text-sm">
              <PlusCircle className="h-4 w-4" /> Create Post
            </Link>
          </div>
          <div className="space-y-4">
            {feed.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          {/* Quick stats */}
          <div className="card p-4">
            <h3 className="mb-3 text-sm font-semibold text-gray-900">Nagpur at a glance</h3>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Active Issues</span>
                <span className="font-semibold text-gray-900">{issues.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Upcoming Events</span>
                <span className="font-semibold text-gray-900">{events.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Resolved</span>
                <span className="font-semibold text-green-600">{resolved.length}</span>
              </div>
            </div>
          </div>

          {/* Trending */}
          <div className="card p-4">
            <div className="mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-orange-600" />
              <h3 className="text-sm font-semibold text-gray-900">High Community Attention</h3>
            </div>
            <div className="space-y-3">
              {trending.map((post) => {
                const counts = store.getReactionCounts(post.id);
                return (
                  <Link key={post.id} to={`/citizen/issue/${post.id}`} className="block rounded-lg p-2 transition-colors hover:bg-gray-50">
                    <p className="text-sm font-medium text-gray-900 line-clamp-1">{post.title}</p>
                    <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                      <span className="inline-flex items-center gap-0.5">
                        <Users className="h-3 w-3 text-orange-600" />
                        {counts.sameIssue} Same Issue
                      </span>
                      <span className="inline-flex items-center gap-0.5">
                        <MapPin className="h-3 w-3" />
                        {post.locality}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Upcoming events */}
          <div className="card p-4">
            <h3 className="mb-3 text-sm font-semibold text-gray-900">Upcoming Events</h3>
            <div className="space-y-2.5">
              {events.slice(0, 3).map((event) => (
                <Link key={event.id} to={`/citizen/issue/${event.id}`} className="block rounded-lg p-2 transition-colors hover:bg-gray-50">
                  <p className="text-sm font-medium text-gray-900 line-clamp-1">{event.title}</p>
                  <p className="text-xs text-gray-500">{event.locality} · {event.date}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
