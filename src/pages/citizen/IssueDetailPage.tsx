import { useParams, Link, useNavigate } from 'react-router-dom';
import { useStore } from '../../state/StoreContext';
import { useState, useEffect } from 'react';
import { MapView } from '../../components/MapView';
import { ReactionBar } from '../../components/ReactionBar';
import { StatusBadge, CategoryBadge, VerifiedBadge } from '../../components/Badge';
import { ImageUpload } from '../../components/ImageUpload';
import { MapPin, Clock, MessageSquare, Send, ShieldCheck, ArrowLeft, CheckCircle2, AlertTriangle, Users, Building2, Mail, Lock, CheckCircle } from 'lucide-react';
import { DeletePostButton } from '../../components/DeletePostButton';
import type { IssueStatus } from '../../types';

const STATUS_FLOW: IssueStatus[] = [
  'Reported',
  'Community Attention',
  'Verified',
  'Assigned',
  'In Progress',
  'Resolution Submitted',
  'Community Feedback',
  'Resolved',
];

export function IssueDetailPage() {
  const { id } = useParams();
  const store = useStore();
  const navigate = useNavigate();
  const post = store.getPost(id!);
  const user = store.currentUser;
  const [commentText, setCommentText] = useState('');
  const [showResolutionForm, setShowResolutionForm] = useState(false);
  const [resolutionDesc, setResolutionDesc] = useState('');
  const [resolutionDate, setResolutionDate] = useState(new Date().toISOString().slice(0, 10));
  const [resolutionImageData, setResolutionImageData] = useState<string | undefined>(undefined);
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [commRequestSent, setCommRequestSent] = useState(false);

  // Refresh commRequestSent when post or user changes
  useEffect(() => {
    if (user?.role === 'organization' && post) {
      const existing = store.getCommRequestByOrgAndCitizen(user.id, post.authorId);
      setCommRequestSent(!!existing);
    }
  }, [user, post, store]);

  // Determine the base path for navigation based on current user role
  const basePath = user?.role === 'citizen' ? '/citizen' : user?.role === 'organization' ? '/organization' : '';
  const backPath = user ? -1 : -1; // always go back

  if (!post) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-gray-900">Issue not found</h1>
        <Link to={basePath || '/'} className="mt-4 inline-block text-sm text-orange-600 hover:text-orange-700">
          ← Back to home
        </Link>
      </div>
    );
  }

  const comments = store.getComments(post.id);
  const counts = store.getReactionCounts(post.id);
  const isOrg = user?.role === 'organization';
  const isCitizen = user?.role === 'citizen';
  const authorCitizen = store.getCitizen(post.authorId);
  const assignedOrg = post.assignedOrgId ? store.getOrganization(post.assignedOrgId) : null;

  const canAct = isOrg && (!post.assignedOrgId || post.assignedOrgId === user?.id);

  // Communication logic
  const existingCommRequest = isOrg && authorCitizen ? store.getCommRequestByOrgAndCitizen(user!.id, authorCitizen.id) : undefined;
  const citizenSettings = authorCitizen?.orgCommunication ?? 'ask';
  const canSeeContactDetails =
    isOrg && authorCitizen &&
    (citizenSettings === 'allow' || (existingCommRequest?.status === 'allowed'));

  const showRequestButton = isOrg && authorCitizen && citizenSettings !== 'allow' && !existingCommRequest;

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !user) return;
    await store.addComment(post.id, commentText, isOrg);
    setCommentText('');
  };

  const handleStatusChange = async (newStatus: IssueStatus) => {
    await store.updatePost(post.id, { status: newStatus, assignedOrgId: post.assignedOrgId || user?.id });
    if (post.authorId !== user?.id) {
      await store.addNotification({
        userId: post.authorId,
        text: `Your issue "${post.title}" status changed to ${newStatus}.`,
        type: 'status',
        postId: post.id,
      });
    }
  };

  const handleResolutionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolutionDesc) return;
    if (!resolutionImageData) return; // Required proof image
    await store.updatePost(post.id, {
      status: 'Resolution Submitted',
      resolutionDescription: resolutionDesc,
      resolutionDate: resolutionDate,
      resolutionImage: resolutionImageData,
      assignedOrgId: post.assignedOrgId || user?.id,
    });
    await store.addNotification({
      userId: post.authorId,
      text: `A resolution has been submitted for your issue "${post.title}". Community feedback is now open.`,
      type: 'resolution',
      postId: post.id,
    });
    setShowResolutionForm(false);
  };

  const handleFeedback = async (resolved: boolean) => {
    if (feedbackGiven) return;
    await store.updatePost(post.id, {
      status: 'Community Feedback',
      feedbackYes: (post.feedbackYes || 0) + (resolved ? 1 : 0),
      feedbackNo: (post.feedbackNo || 0) + (resolved ? 0 : 1),
    });
    setFeedbackGiven(true);
    if (feedbackComment.trim()) {
      await store.addComment(post.id, feedbackComment, false);
      setFeedbackComment('');
    }
    if (post.assignedOrgId) {
      await store.addNotification({
        userId: post.assignedOrgId,
        text: resolved
          ? `A citizen confirmed resolution for "${post.title}".`
          : `A citizen still reports the issue for "${post.title}".`,
        type: 'feedback',
        postId: post.id,
      });
    }
  };

  const handleRequestCommunication = async () => {
    if (!isOrg || !authorCitizen || !user) return;
    await store.requestCommunication(
      user.id,
      (user as any).orgName,
      authorCitizen.id,
      authorCitizen.name,
      post.id,
      post.title,
      `Need to discuss the ${post.category} issue at ${post.locality}.`
    );
    await store.addNotification({
      userId: authorCitizen.id,
      text: `${(user as any).orgName} requested permission to contact you regarding "${post.title}".`,
      type: 'communication',
      postId: post.id,
      orgId: user.id,
    });
    setCommRequestSent(true);
  };

  const currentStatusIdx = STATUS_FLOW.indexOf(post.status);
  const totalFeedback = (post.feedbackYes || 0) + (post.feedbackNo || 0);
  const yesPercent = totalFeedback > 0 ? Math.round(((post.feedbackYes || 0) / totalFeedback) * 100) : 0;
  const noPercent = totalFeedback > 0 ? Math.round(((post.feedbackNo || 0) / totalFeedback) * 100) : 0;
  const isCommunityConfirmed = totalFeedback > 0 && (post.feedbackYes || 0) > (post.feedbackNo || 0);

  const orgProfileLink = (orgId: string) => `${basePath}/organizations/${orgId}`;

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      <button onClick={() => navigate(backPath)} className="mb-4 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      {/* Issue header */}
      <div className="card mb-4 p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {post.category && <CategoryBadge category={post.category} />}
          <StatusBadge status={post.status} size="md" />
        </div>
        <h1 className="mb-2 text-xl font-bold text-gray-900">{post.title}</h1>
        <p className="mb-4 text-gray-600">{post.description}</p>

        {post.image && (
          <div className="mb-4 overflow-hidden rounded-lg">
            <img src={post.image} alt={post.title} className="w-full max-h-80 object-cover" />
          </div>
        )}

        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {post.locality}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {new Date(post.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
          <span>by <strong className="text-gray-700">{post.authorName}</strong></span>
          <DeletePostButton post={post} variant="full" />
        </div>
      </div>

      {/* Map preview */}
      {post.lat != null && post.lng != null && (
        <div className="card mb-4 overflow-hidden p-0">
          <MapView posts={[post]} height="200px" zoom={15} />
        </div>
      )}

      {/* Community signal */}
      {post.type === 'Issue' && (
        <div className="card mb-4 p-5">
          <h2 className="mb-3 text-sm font-semibold text-gray-900">Community Signal</h2>
          <div className="mb-3 flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-orange-600" />
            <span className="font-semibold text-gray-900">{counts.sameIssue} citizens are experiencing this issue.</span>
          </div>
          {isCitizen && (
            <ReactionBar postId={post.id} size="md" />
          )}
          {!isCitizen && (
            <div className="flex items-center gap-4 text-sm">
              <span className="font-semibold text-orange-600">{counts.sameIssue} Same Issue</span>
              <span className="font-semibold text-blue-600">{counts.support} Support</span>
              <span className="font-semibold text-gray-600">{counts.downvote} Downvote</span>
            </div>
          )}
        </div>
      )}

      {/* Status timeline */}
      {post.type === 'Issue' && (
        <div className="card mb-4 p-5">
          <h2 className="mb-4 text-sm font-semibold text-gray-900">Issue Lifecycle</h2>
          <div className="flex overflow-x-auto pb-2">
            {STATUS_FLOW.map((status, idx) => {
              const isDone = idx <= currentStatusIdx;
              const isCurrent = idx === currentStatusIdx;
              return (
                <div key={status} className="flex items-center shrink-0">
                  <div className="flex flex-col items-center" style={{ minWidth: '70px' }}>
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                        isDone ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-400'
                      } ${isCurrent ? 'ring-2 ring-orange-300 ring-offset-2' : ''}`}
                    >
                      {isDone ? '✓' : idx + 1}
                    </div>
                    <span className={`mt-1.5 text-[10px] text-center ${isDone ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
                      {status}
                    </span>
                  </div>
                  {idx < STATUS_FLOW.length - 1 && (
                    <div className={`h-0.5 w-5 ${idx < currentStatusIdx ? 'bg-orange-600' : 'bg-gray-200'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Organization actions */}
      {canAct && post.type === 'Issue' && (
        <div className="card mb-4 border-orange-200 p-5">
          <div className="mb-3 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-orange-600" />
            <h2 className="text-sm font-semibold text-gray-900">Organization Actions</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {post.status === 'Reported' && (
              <button onClick={() => handleStatusChange('Community Attention')} className="btn-secondary text-sm">
                Mark Community Attention
              </button>
            )}
            {post.status === 'Community Attention' && (
              <button onClick={() => handleStatusChange('Verified')} className="btn-primary text-sm">
                Verify Issue
              </button>
            )}
            {post.status === 'Verified' && (
              <button onClick={() => handleStatusChange('In Progress')} className="btn-primary text-sm">
                Mark In Progress
              </button>
            )}
            {post.status === 'In Progress' && (
              <button onClick={() => setShowResolutionForm(!showResolutionForm)} className="btn-primary text-sm">
                Submit Resolution
              </button>
            )}
          </div>

          {/* Resolution form */}
          {showResolutionForm && (
            <form onSubmit={handleResolutionSubmit} className="mt-4 space-y-3 rounded-lg bg-orange-50/50 p-4">
              <div>
                <label className="label" htmlFor="resDesc">Resolution Description</label>
                <textarea
                  id="resDesc"
                  className="input min-h-[80px]"
                  value={resolutionDesc}
                  onChange={(e) => setResolutionDesc(e.target.value)}
                  placeholder="Describe what was done to resolve this issue"
                />
              </div>
              <div>
                <label className="label" htmlFor="resDate">Resolution Date</label>
                <input id="resDate" type="date" className="input" value={resolutionDate} onChange={(e) => setResolutionDate(e.target.value)} />
              </div>
              <ImageUpload
                label="Resolution Proof Image"
                onImageChange={(data) => setResolutionImageData(data)}
                currentImage={resolutionImageData}
                required
                helperText="Photo proof is required before submitting resolution"
              />
              <button type="submit" className="btn-primary w-full text-sm" disabled={!resolutionDesc || !resolutionImageData}>
                Submit Resolution
              </button>
              {(!resolutionDesc || !resolutionImageData) && (
                <p className="text-xs text-gray-500 text-center">Description and proof image are both required.</p>
              )}
            </form>
          )}
        </div>
      )}

      {/* Resolution display */}
      {post.status === 'Resolution Submitted' || post.status === 'Community Feedback' || post.status === 'Resolved' ? (
        <div className="card mb-4 border-green-200 p-5">
          <div className="mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <h2 className="text-sm font-semibold text-gray-900">Resolution Submitted</h2>
          </div>
          {assignedOrg && (
            <Link to={orgProfileLink(assignedOrg.id)} className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-orange-600 hover:text-orange-700">
              <Building2 className="h-3.5 w-3.5" />
              {assignedOrg.orgName}
            </Link>
          )}
          <p className="text-sm text-gray-700">{post.resolutionDescription}</p>
          {post.resolutionDate && (
            <p className="mt-1 text-xs text-gray-400">Resolved on {new Date(post.resolutionDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
          )}
          {post.resolutionImage && (
            <div className="mt-3 overflow-hidden rounded-lg">
              <img src={post.resolutionImage} alt="Resolution proof" className="h-48 w-full object-cover" />
            </div>
          )}

          {/* Community feedback section */}
          {isCitizen && post.status !== 'Resolved' && (
            <div className="mt-4 border-t border-green-100 pt-4">
              <h3 className="mb-2 text-sm font-semibold text-gray-900">Was this issue actually resolved?</h3>
              <p className="mb-3 text-xs text-gray-500">Have you experienced the result?</p>
              {feedbackGiven ? (
                <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
                  <CheckCircle2 className="inline h-4 w-4 mr-1" />
                  Thank you for your feedback!
                </div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); handleFeedback(true); }} className="space-y-3">
                  <div className="flex gap-2">
                    <button type="button" onClick={() => handleFeedback(true)} className="flex-1 rounded-lg border border-green-300 bg-green-50 px-3 py-2.5 text-sm font-medium text-green-700 transition-colors hover:bg-green-100">
                      <CheckCircle2 className="inline h-4 w-4 mr-1" />
                      Yes, Resolved
                    </button>
                    <button type="button" onClick={() => handleFeedback(false)} className="flex-1 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2.5 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-100">
                      <AlertTriangle className="inline h-4 w-4 mr-1" />
                      Still an Issue
                    </button>
                  </div>
                  <input
                    className="input text-sm"
                    placeholder="Add a comment about your experience (optional)"
                    value={feedbackComment}
                    onChange={(e) => setFeedbackComment(e.target.value)}
                  />
                </form>
              )}
            </div>
          )}

          {/* Community feedback results */}
          {totalFeedback > 0 && (
            <div className="mt-4 border-t border-green-100 pt-4">
              <h3 className="mb-3 text-sm font-semibold text-gray-900">Community Resolution Feedback</h3>
              <div className="mb-3 flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-semibold text-green-600">{yesPercent}% Confirmed Resolved</span>
                    <span className="text-gray-500">{noPercent}% Still an Issue</span>
                  </div>
                  <div className="flex h-3 overflow-hidden rounded-full bg-gray-100">
                    <div className="bg-green-500" style={{ width: `${yesPercent}%` }} />
                    <div className="bg-amber-400" style={{ width: `${noPercent}%` }} />
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                {post.feedbackYes} citizens confirmed resolution · {post.feedbackNo} citizens still report the issue
              </p>
              {isCommunityConfirmed && totalFeedback >= 5 ? (
                <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-green-50 px-3 py-1.5 text-sm font-semibold text-green-700">
                  <ShieldCheck className="h-4 w-4" />
                  Community Confirmed Resolved
                </div>
              ) : !isCommunityConfirmed && totalFeedback >= 5 ? (
                <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-700">
                  <AlertTriangle className="h-4 w-4" />
                  Community Still Reporting Issue
                </div>
              ) : null}
            </div>
          )}
        </div>
      ) : null}

      {/* Communication / Citizen info (for orgs) */}
      {isOrg && authorCitizen && post.type === 'Issue' && (
        <div className="card mb-4 p-4">
          <h3 className="mb-3 text-sm font-semibold text-gray-900">Citizen Information</h3>
          <div className="rounded-lg bg-gray-50 p-3 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-gray-500 text-xs">Citizen:</span>
                <p className="font-medium text-gray-900">{authorCitizen.name}</p>
              </div>
              <div>
                <span className="text-gray-500 text-xs">General Area:</span>
                <p className="font-medium text-gray-900">{authorCitizen.locality}</p>
              </div>
              <div>
                <span className="text-gray-500 text-xs">Relevant Issue:</span>
                <p className="font-medium text-gray-900">{post.category}</p>
              </div>
              <div>
                <span className="text-gray-500 text-xs">Communication Setting:</span>
                <p className="font-medium text-gray-900 capitalize">{citizenSettings}</p>
              </div>
            </div>
          </div>

          {/* Contact details — visible if allow or accepted */}
          {canSeeContactDetails && (
            <div className="mt-3 rounded-lg border border-green-200 bg-green-50/50 p-3">
              <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-green-700">
                <CheckCircle className="h-3.5 w-3.5" />
                PERMITTED CONTACT DETAILS
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-gray-700">{authorCitizen.email}</span>
              </div>
              <p className="mt-1 text-xs text-gray-500">This information is shared with your organization only for this communication context.</p>
            </div>
          )}

          {/* Show communication status */}
          {existingCommRequest && existingCommRequest.status === 'pending' && (
            <div className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
              <Clock className="inline h-4 w-4 mr-1" />
              Communication request sent — waiting for citizen response.
            </div>
          )}
          {existingCommRequest && existingCommRequest.status === 'declined' && (
            <div className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              <Lock className="inline h-4 w-4 mr-1" />
              Communication request denied — contact details are hidden.
            </div>
          )}

          {/* Request button */}
          {showRequestButton && (
            <button
              onClick={handleRequestCommunication}
              className="mt-3 btn-secondary text-sm"
            >
              Request Communication
            </button>
          )}

          {/* If setting is allow, show note */}
          {citizenSettings === 'allow' && (
            <p className="mt-3 text-xs text-green-600">
              <CheckCircle className="inline h-3.5 w-3.5 mr-1" />
              This citizen allows direct communication — contact details are visible above.
            </p>
          )}
        </div>
      )}

      {/* Discussion */}
      <div className="card p-5">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-900">
          <MessageSquare className="h-4 w-4" />
          Community Discussion ({comments.length})
        </h2>

        {/* Comment form */}
        {user && (
          <form onSubmit={handleComment} className="mb-4 flex gap-2">
            <input
              className="input flex-1"
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <button type="submit" className="btn-primary px-3" disabled={!commentText.trim()}>
              <Send className="h-4 w-4" />
            </button>
          </form>
        )}

        {/* Comments list */}
        {comments.length === 0 ? (
          <div className="py-8 text-center">
            <MessageSquare className="mx-auto mb-3 h-8 w-8 text-gray-300" />
            <p className="text-sm text-gray-400">No comments yet. Start the discussion!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className={`rounded-lg p-3 ${comment.isOfficial ? 'border border-blue-200 bg-blue-50/50' : 'bg-gray-50'}`}
              >
                {comment.isOfficial && (
                  <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-blue-700">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    OFFICIAL ORGANIZATION RESPONSE
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium ${comment.isOfficial ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-600'}`}>
                    {comment.authorName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-900">{comment.authorName}</span>
                    {comment.authorRole === 'organization' && (
                      <span className="ml-1.5 text-xs text-blue-600">Organization</span>
                    )}
                  </div>
                  <span className="ml-auto text-xs text-gray-400">
                    {new Date(comment.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-700">{comment.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
