import { useStore } from '../state/StoreContext';
import type { ReactionType } from '../types';
import { Users, ThumbsUp, ThumbsDown } from 'lucide-react';

interface ReactionBarProps {
  postId: string;
  counts?: { support: number; sameIssue: number; downvote: number };
  size?: 'sm' | 'md';
}

export function ReactionBar({ postId, size = 'md' }: ReactionBarProps) {
  const store = useStore();
  const userId = store.currentUser?.id;
  const myReaction = userId ? store.getReaction(userId, postId) : null;
  const counts = store.getReactionCounts(postId);

  const handleClick = (reaction: ReactionType) => {
    if (!userId) return;
    if (myReaction === reaction) {
      store.removeReaction(userId, postId);
    } else if (!myReaction) {
      store.setReaction(userId, postId, reaction);
    }
  };

  const reactions: {
    type: ReactionType;
    label: string;
    count: number;
    icon: typeof Users;
    activeClass: string;
  }[] = [
    { type: 'same_issue', label: 'Same Issue', count: counts.sameIssue, icon: Users, activeClass: 'bg-orange-600 text-white border-orange-600' },
    { type: 'support', label: 'Support', count: counts.support, icon: ThumbsUp, activeClass: 'bg-blue-600 text-white border-blue-600' },
    { type: 'downvote', label: 'Downvote', count: counts.downvote, icon: ThumbsDown, activeClass: 'bg-gray-700 text-white border-gray-700' },
  ];

  const isSmall = size === 'sm';
  const btnSize = isSmall ? 'px-2.5 py-1 text-xs gap-1' : 'px-3 py-1.5 text-sm gap-1.5';
  const iconSize = isSmall ? 'h-3.5 w-3.5' : 'h-4 w-4';

  return (
    <div className="flex items-center gap-2">
      {reactions.map((r) => {
        const isActive = myReaction === r.type;
        const isDisabled = myReaction !== null && !isActive;

        return (
          <button
            key={r.type}
            onClick={() => handleClick(r.type)}
            disabled={isDisabled}
            className={`inline-flex items-center rounded-full border font-medium transition-all ${btnSize} ${
              isActive
                ? r.activeClass
                : isDisabled
                  ? 'border-gray-200 bg-gray-50 text-gray-400 opacity-50 cursor-not-allowed'
                  : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400 hover:bg-gray-50'
            }`}
            title={
              isActive
                ? `Click to remove your ${r.label} reaction`
                : isDisabled
                  ? 'Unselect your current reaction first to choose a different one'
                  : `Mark as ${r.label}`
            }
          >
            <r.icon className={iconSize} />
            <span>{r.count}</span>
            <span className="hidden sm:inline">{r.label}</span>
          </button>
        );
      })}
    </div>
  );
}
