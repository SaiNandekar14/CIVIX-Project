import { useStore } from '../../state/StoreContext';
import { PostCard } from '../../components/PostCard';

export function CitizenEventsPage() {
  const store = useStore();
  const events = store.getAllPosts().filter((p) => p.type === 'Event' || p.type === 'Community Initiative');

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Community Events</h1>
        <p className="text-sm text-gray-500">Discover and join local initiatives in Nagpur</p>
      </div>

      {events.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-gray-400 text-lg mb-1">No events yet</p>
          <p className="text-sm text-gray-400">Check back soon for community events in Nagpur</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {events.map((event) => (
            <PostCard key={event.id} post={event} showCommunitySignal={false} />
          ))}
        </div>
      )}
    </div>
  );
}
