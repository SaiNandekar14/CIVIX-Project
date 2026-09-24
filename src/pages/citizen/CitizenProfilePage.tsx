import { useStore } from '../../state/StoreContext';
import { useState } from 'react';
import { User, MapPin, Lock, ShieldCheck, MessageSquare, FileText, ThumbsUp, Users, CheckCircle2, Mail } from 'lucide-react';
import { ImageUpload } from '../../components/ImageUpload';

export function CitizenProfilePage() {
  const store = useStore();
  const user = store.currentUser;
  if (!user || user.role !== 'citizen') return null;

  const posts = store.getAllPosts();
  const reactions = (store as any).state?.reactions || [];
  const myPosts = posts.filter((p) => p.authorId === user.id);
  const mySupported = posts.filter((p) => reactions.some((r: any) => r.userId === user.id && r.postId === p.id && r.reaction === 'support'));
  const mySameIssue = posts.filter((p) => reactions.some((r: any) => r.userId === user.id && r.postId === p.id && r.reaction === 'same_issue'));
  const allComments = (store as any).state?.comments || [];
  const myComments = allComments.filter((c: any) => c.authorId === user.id);

  const [privacy, setPrivacy] = useState(user.privacy);
  const [orgComm, setOrgComm] = useState(user.orgCommunication);
  const [photo, setPhoto] = useState<string | undefined>(user.photo);
  const [savedMsg, setSavedMsg] = useState(false);

  const updateSetting = async (setting: 'privacy' | 'orgCommunication', value: string) => {
    const updates: Partial<typeof user> = {};
    if (setting === 'privacy') {
      setPrivacy(value as any);
      updates.privacy = value as any;
    }
    if (setting === 'orgCommunication') {
      setOrgComm(value as any);
      updates.orgCommunication = value as any;
    }
    await store.updateCitizen(user.id, updates);
    showSaved();
  };

  const handlePhotoChange = async (data: string | undefined) => {
    setPhoto(data);
    await store.updateCitizen(user.id, { photo: data });
    showSaved();
  };

  const showSaved = () => {
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2500);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      {/* Profile header */}
      <div className="card mb-6 p-6">
        <div className="flex items-start gap-4">
          {photo ? (
            <img src={photo} alt={user.name} className="h-16 w-16 rounded-full object-cover" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 text-orange-600">
              <User className="h-8 w-8" />
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">{user.name}</h1>
            <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
              <MapPin className="h-3.5 w-3.5" />
              {user.locality}
            </div>
            <div className="mt-2">
              <span className="badge border-gray-200 bg-gray-50 text-gray-600">
                <Lock className="h-3 w-3" />
                Private Profile
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Participation stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'My Posts', value: myPosts.length, icon: FileText },
          { label: 'Supported', value: mySupported.length, icon: ThumbsUp },
          { label: 'Same Issue', value: mySameIssue.length, icon: Users },
          { label: 'Comments', value: myComments.length, icon: MessageSquare },
        ].map((stat) => (
          <div key={stat.label} className="card p-4 text-center">
            <stat.icon className="mx-auto mb-2 h-5 w-5 text-gray-400" />
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-xs text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Settings */}
      <div className="card p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-orange-600" />
            <h2 className="text-sm font-semibold text-gray-900">Privacy & Communication Settings</h2>
          </div>
          {savedMsg && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600">
              <CheckCircle2 className="h-3.5 w-3.5" /> Settings saved
            </span>
          )}
        </div>

        <div className="space-y-5">
          {/* Profile photo */}
          <div>
            <ImageUpload
              label="Profile Photo"
              onImageChange={handlePhotoChange}
              currentImage={photo}
              helperText="Upload a photo from your device (optional)"
            />
          </div>

          <div>
            <label className="label">Profile Visibility</label>
            <div className="flex gap-2">
              {['private', 'public'].map((v) => (
                <button
                  key={v}
                  onClick={() => updateSetting('privacy', v)}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium capitalize transition-colors ${
                    privacy === v ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {v === 'private' ? 'Private (default)' : 'Public'}
                </button>
              ))}
            </div>
            <p className="mt-1 text-xs text-gray-400">When private, only you can see your full profile. Other citizens see limited info.</p>
          </div>

          <div>
            <label className="label">Organization Communication</label>
            <div className="flex gap-2">
              {[
                { val: 'allow', label: 'Allow', desc: 'Organizations can directly see your contact details' },
                { val: 'ask', label: 'Ask Before Contact', desc: 'Organizations must request permission first' },
                { val: 'deny', label: 'Deny', desc: 'Organizations must request permission, you will review each request' },
              ].map((opt) => (
                <button
                  key={opt.val}
                  onClick={() => updateSetting('orgCommunication', opt.val)}
                  className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                    orgComm === opt.val ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                  title={opt.desc}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="mt-2 rounded-lg bg-gray-50 p-2.5 text-xs text-gray-500">
              {orgComm === 'allow' && (
                <p>Organizations can directly see your name, email, and general area without requesting permission.</p>
              )}
              {orgComm === 'ask' && (
                <p>Organizations cannot see your contact details. They must send a communication request, and you can accept or deny it.</p>
              )}
              {orgComm === 'deny' && (
                <p>Organizations cannot see your contact details. They may still send a communication request, but you must approve it before any details are shared.</p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-lg bg-gray-50 p-3 text-xs text-gray-500">
          <p className="font-medium text-gray-700 mb-1">Your privacy is protected:</p>
          <ul className="space-y-0.5">
            <li>• Email, phone and exact address are never publicly displayed</li>
            <li>• Organizations see only your display name and general area by default</li>
            <li>• No sensitive personal information is shared without your consent</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
