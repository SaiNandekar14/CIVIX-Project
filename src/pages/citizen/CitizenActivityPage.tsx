import { useStore } from '../../state/StoreContext';
import { Link } from 'react-router-dom';
import { PostCard } from '../../components/PostCard';
import { FileText, ThumbsUp, Users, MessageSquare, CheckCircle2 } from 'lucide-react';

export function CitizenActivityPage() {
  const store = useStore();
  const userId = store.currentUser!.id;
  const posts = store.getAllPosts();
  const reactions = (store as any).state?.reactions || [];

  const myPosts = posts.filter((p) => p.authorId === userId);
  const mySupported = posts.filter((p) => reactions.some((r: any) => r.userId === userId && r.postId === p.id && r.reaction === 'support'));
  const mySameIssue = posts.filter((p) => reactions.some((r: any) => r.userId === userId && r.postId === p.id && r.reaction === 'same_issue'));
  const myComments = store.getComments('').length === 0 ? [] : [];
  // Get all comments by this user
  const allComments = (store as any).state?.comments || [];
  const myCommentList = allComments.filter((c: any) => c.authorId === userId);
  const myResolved = posts.filter((p) => p.status === 'Resolved' && (reactions.some((r: any) => r.userId === userId && r.postId === p.id) || p.authorId === userId));

  const sections = [
    { label: 'My Posts', icon: FileText, items: myPosts, color: 'text-gray-900' },
    { label: 'Supported', icon: ThumbsUp, items: mySupported, color: 'text-blue-600' },
    { label: 'Same Issue', icon: Users, items: mySameIssue, color: 'text-orange-600' },
    { label: 'Resolved Issues', icon: CheckCircle2, items: myResolved, color: 'text-green-600' },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Activity</h1>
        <p className="text-sm text-gray-500">Your civic participation history</p>
      </div>

      {/* Comments summary */}
      <div className="card mb-6 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div>
            <div className="text-lg font-bold text-gray-900">{myCommentList.length}</div>
            <div className="text-xs text-gray-500">Comments Posted</div>
          </div>
        </div>
        {myCommentList.length > 0 && (
          <div className="mt-3 space-y-2 border-t border-gray-100 pt-3">
            {myCommentList.slice(-5).reverse().map((c: any) => (
              <Link key={c.id} to={`/citizen/issue/${c.postId}`} className="block rounded-lg p-2 hover:bg-gray-50">
                <p className="text-sm text-gray-700 line-clamp-1">{c.text}</p>
                <p className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
              </Link>
            ))}
          </div>
        )}
      </div>

      {sections.map((section) => (
        <div key={section.label} className="mb-6">
          <div className="mb-3 flex items-center gap-2">
            <section.icon className="h-4 w-4 text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-900">{section.label}</h2>
            <span className="text-xs text-gray-400">({section.items.length})</span>
          </div>
          {section.items.length === 0 ? (
            <div className="card p-6 text-center">
              <p className="text-sm text-gray-400">No {section.label.toLowerCase()} yet</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {section.items.map((post) => (
                <PostCard key={post.id} post={post} showCommunitySignal={section.label === 'My Posts'} />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
