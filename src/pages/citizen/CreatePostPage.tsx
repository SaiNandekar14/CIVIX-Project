import { useState } from 'react';
import { useStore } from '../../state/StoreContext';
import { useNavigate } from 'react-router-dom';
import { MapView } from '../../components/MapView';
import { CITIZEN_POST_TYPES, ORG_POST_TYPES, ISSUE_CATEGORIES, CITIZEN_LOCALITIES, NAGPUR_LOCALITIES, CATEGORY_ORG_MAP } from '../../data/constants';
import { MapPin, Send, CheckCircle2, Building2 } from 'lucide-react';
import { ImageUpload } from '../../components/ImageUpload';
import type { CitizenUser, OrganizationUser } from '../../types';

export function CreatePostPage() {
  const store = useStore();
  const navigate = useNavigate();
  const user = store.currentUser!;
  const isCitizen = user.role === 'citizen';
  const isOrg = user.role === 'organization';
  const citizen = user as CitizenUser;
  const org = user as OrganizationUser;

  const availableTypes = isCitizen ? CITIZEN_POST_TYPES : ORG_POST_TYPES;

  const [postType, setPostType] = useState(availableTypes[0]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [selectedOrgId, setSelectedOrgId] = useState('');
  const [locality, setLocality] = useState(isCitizen ? citizen.locality : '');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [lat, setLat] = useState<number | undefined>(undefined);
  const [lng, setLng] = useState<number | undefined>(undefined);
  const [imageData, setImageData] = useState<string | undefined>(undefined);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const organizations = store.getOrganizations();

  const handleLocalityChange = (val: string) => {
    setLocality(val);
    const coords = NAGPUR_LOCALITIES[val];
    if (coords) {
      setLat(coords[0]);
      setLng(coords[1]);
    }
  };

  const handleCategoryChange = (cat: string) => {
    setCategory(cat);
    const mappedOrgId = CATEGORY_ORG_MAP[cat];
    if (mappedOrgId) {
      setSelectedOrgId(mappedOrgId);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !locality) {
      setError('Please fill in all required fields.');
      return;
    }
    if (postType === 'Issue' && !category) {
      setError('Please select a category.');
      return;
    }
    if (postType === 'Issue' && !selectedOrgId) {
      setError('Please select a relevant organization.');
      return;
    }
    if ((postType === 'Event' || postType === 'Community Initiative') && !date) {
      setError('Please select a date.');
      return;
    }

    const authorName = isCitizen ? citizen.name : org.orgName;
    const post = store.createPost({
      type: postType as any,
      title,
      description,
      category: postType === 'Issue' ? (category as any) : undefined,
      locality,
      lat,
      lng,
      image: imageData,
      authorId: user.id,
      authorName,
      authorLocality: isCitizen ? citizen.locality : undefined,
      date: date || undefined,
      time: time || undefined,
      status: 'Reported',
      assignedOrgId: postType === 'Issue' ? selectedOrgId : undefined,
    });

    if (postType === 'Issue' && selectedOrgId) {
      const assignedOrg = store.getOrganization(selectedOrgId);
      if (assignedOrg) {
        store.addNotification({
          userId: selectedOrgId,
          text: `New ${category} issue assigned to ${assignedOrg.orgName}: "${title}".`,
          type: 'organization',
          postId: post.id,
        });
      }
    }

    setSuccess(true);
    setTimeout(() => {
      navigate(`${isCitizen ? '/citizen' : '/organization'}/issue/${post.id}`);
    }, 1500);
  };

  if (success) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-green-500" />
        <h1 className="text-xl font-semibold text-gray-900">
          {isOrg ? 'Posted to the community!' : 'Posted to the community!'}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {isOrg ? 'Your organization\'s post is now visible in the community feed.' : 'Your post is now visible in the community feed.'}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
      <h1 className="mb-1 text-2xl font-bold text-gray-900">
        {isOrg ? 'Create Organization Post' : 'What would you like to share with Nagpur?'}
      </h1>
      <p className="mb-6 text-sm text-gray-500">
        {isOrg ? 'Share an announcement, event, initiative or community update' : 'Share an issue, event, initiative or civic update'}
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Post type */}
        <div className="card p-4">
          <label className="label">Post Type</label>
          <div className="flex flex-wrap gap-2">
            {availableTypes.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setPostType(t)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  postType === t ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          {isOrg && (
            <p className="mt-2 text-xs text-gray-400">
              Organizations can create announcements, events, initiatives and updates. Civic issues are reported by citizens.
            </p>
          )}
        </div>

        {/* Fields */}
        <div className="card p-5 space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">{error}</div>
          )}

          {postType === 'Issue' && (
            <>
              <div>
                <label className="label" htmlFor="category">Category</label>
                <select id="category" className="input" value={category} onChange={(e) => handleCategoryChange(e.target.value)}>
                  <option value="">Select a category</option>
                  {ISSUE_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label" htmlFor="org">Relevant Organization</label>
                <select id="org" className="input" value={selectedOrgId} onChange={(e) => setSelectedOrgId(e.target.value)}>
                  <option value="">Select the responsible organization</option>
                  {organizations.map((o) => (
                    <option key={o.id} value={o.id}>{o.orgName}</option>
                  ))}
                </select>
                {category && selectedOrgId && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                    <Building2 className="h-3 w-3 text-orange-600" />
                    This issue will be sent to {organizations.find((o) => o.id === selectedOrgId)?.orgName}
                  </p>
                )}
              </div>
            </>
          )}

          <div>
            <label className="label" htmlFor="title">Title</label>
            <input id="title" className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Give your post a clear title" />
          </div>

          <div>
            <label className="label" htmlFor="description">Description</label>
            <textarea id="description" className="input min-h-[100px]" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe what you want to share" />
          </div>

          {(postType === 'Event' || postType === 'Community Initiative') && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="date">Date</label>
                <input id="date" type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              {postType === 'Event' && (
                <div>
                  <label className="label" htmlFor="time">Time</label>
                  <input id="time" type="time" className="input" value={time} onChange={(e) => setTime(e.target.value)} />
                </div>
              )}
            </div>
          )}

          <div>
            <label className="label" htmlFor="locality">Location / Locality</label>
            <select id="locality" className="input mb-3" value={locality} onChange={(e) => handleLocalityChange(e.target.value)}>
              <option value="">Select a Nagpur locality</option>
              {CITIZEN_LOCALITIES.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
            {locality && (
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <MapPin className="h-3 w-3 text-orange-600" />
                {lat != null && lng != null ? `Coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}` : 'Select a point on the map below'}
              </p>
            )}
          </div>

          {/* Map location picker */}
          {locality && (
            <div>
              <label className="label">Map Location (click to adjust)</label>
              <MapView
                pickable
                onPick={(pickedLat, pickedLng) => {
                  setLat(pickedLat);
                  setLng(pickedLng);
                }}
                pickedLocation={lat != null && lng != null ? { lat, lng } : null}
                height="250px"
                zoom={13}
              />
            </div>
          )}

          {/* Image upload */}
          <ImageUpload
            label={postType === 'Issue' ? 'Issue Photo' : 'Image'}
            onImageChange={(data) => setImageData(data)}
            currentImage={imageData}
            helperText={postType === 'Issue' ? 'Add a photo to help others understand the issue' : 'Add an image (optional)'}
          />
        </div>

        <button type="submit" className="btn-primary w-full text-base py-3">
          <Send className="h-4 w-4" />
          {isOrg ? 'Publish Post' : 'Post to Community'}
        </button>
      </form>
    </div>
  );
}
