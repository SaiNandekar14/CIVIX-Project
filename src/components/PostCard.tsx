import type { Post } from '../types';
import { Link } from 'react-router-dom';
import { StatusBadge, CategoryBadge, VerifiedBadge } from './Badge';
import { ReactionBar } from './ReactionBar';
import { DeletePostButton } from './DeletePostButton';
import { MapPin, Clock, MessageSquare, Building2 } from 'lucide-react';
import { useStore } from '../state/StoreContext';

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export function PostCard({ post, showCommunitySignal = true }: { post: Post; showCommunitySignal?: boolean }) {
  const store = useStore();
  const commentCount = store.getComments(post.id).length;
  const currentUser = store.currentUser;
  const basePath = currentUser?.role === 'citizen' ? '/citizen' : currentUser?.role === 'organization' ? '/organization' : '';
  const linkTo = `${basePath}/issue/${post.id}`;
  const isOrgPost = store.getOrganization(post.authorId) !== undefined;

  if (post.type === 'Issue') {
    return (
      <Link to={linkTo} className="card block p-4 transition-all hover:shadow-md hover:border-gray-300">
        <div className="mb-2 flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {post.category && <CategoryBadge category={post.category} />}
            <StatusBadge status={post.status} />
          </div>
          <span className="shrink-0 text-xs text-gray-400">{formatDate(post.createdAt)}</span>
        </div>
        <h3 className="mb-1 text-base font-semibold text-gray-900">{post.title}</h3>
        <p className="mb-2 line-clamp-2 text-sm text-gray-600">{post.description}</p>
        <div className="mb-3 flex items-center gap-3 text-xs text-gray-500">
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {post.locality}
          </span>
          <span className="inline-flex items-center gap-1">
            <MessageSquare className="h-3.5 w-3.5" />
            {commentCount}
          </span>
          <span>by {post.authorName}</span>
          <DeletePostButton post={post} />
        </div>
        {showCommunitySignal && (
          <div className="border-t border-gray-100 pt-3">
            <ReactionBar postId={post.id} size="sm" />
          </div>
        )}
      </Link>
    );
  }

  // Event / Initiative / Announcement / Community Update
  return (
    <Link to={linkTo} className="card block p-4 transition-all hover:shadow-md hover:border-gray-300">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="badge border-blue-200 bg-blue-50 text-blue-700">{post.type}</span>
          {isOrgPost && (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-2 py-0.5 text-xs font-semibold text-white">
              <Building2 className="h-3 w-3" />
              OFFICIAL
            </span>
          )}
        </div>
        <span className="shrink-0 text-xs text-gray-400">{formatDate(post.createdAt)}</span>
      </div>
      <h3 className="mb-1 text-base font-semibold text-gray-900">{post.title}</h3>
      <p className="mb-2 line-clamp-2 text-sm text-gray-600">{post.description}</p>
      <div className="mb-3 flex items-center gap-3 text-xs text-gray-500">
        <span className="inline-flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" />
          {post.locality}
        </span>
        {post.date && (
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {new Date(post.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            {post.time ? ` ${post.time}` : ''}
          </span>
        )}
        <span className="inline-flex items-center gap-1">
          {isOrgPost ? <Building2 className="h-3 w-3 text-blue-600" /> : null}
          {post.authorName}
          {isOrgPost && <VerifiedBadge />}
        </span>
        <DeletePostButton post={post} />
      </div>
      {post.type === 'Event' && (
        <div className="flex items-center gap-3 border-t border-gray-100 pt-3 text-xs text-gray-600">
          <span className="inline-flex items-center gap-1">
            <span className="font-semibold text-orange-600">{post.interestedCount ?? 0}</span> interested
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="font-semibold text-green-600">{post.joinedCount ?? 0}</span> joined
          </span>
        </div>
      )}
    </Link>
  );
}
