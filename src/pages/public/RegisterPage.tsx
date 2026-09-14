import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../../state/StoreContext';
import { useState } from 'react';
import { User, Building2, ArrowRight, ArrowLeft, AlertCircle, ShieldCheck, Lock } from 'lucide-react';
import { CITIZEN_LOCALITIES, ORG_TYPES } from '../../data/constants';

export function RegisterPage() {
  const store = useStore();
  const navigate = useNavigate();
  const [role, setRole] = useState<'citizen' | 'organization' | null>(null);

  // Citizen form state
  const [cName, setCName] = useState('');
  const [cEmail, cEmail_set] = useState('');
  const [cPassword, setCPassword] = useState('');
  const [cConfirm, setCConfirm] = useState('');
  const [cLocality, setCLocality] = useState('');
  const [cAgree, setCAgree] = useState(false);
  const [cError, setCError] = useState('');

  // Org form state
  const [oName, setOName] = useState('');
  const [oType, setOType] = useState('');
  const [oEmail, setOEmail] = useState('');
  const [oPassword, setOPassword] = useState('');
  const [oConfirm, setOConfirm] = useState('');
  const [oContact, setOContact] = useState('');
  const [oServiceArea, setOServiceArea] = useState('Nagpur');
  const [oDescription, setODescription] = useState('');
  const [oError, setOError] = useState('');

  const handleCitizenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cName || !cEmail || !cPassword || !cLocality) {
      setCError('Please fill in all required fields.');
      return;
    }
    if (cPassword !== cConfirm) {
      setCError('Passwords do not match.');
      return;
    }
    if (!cAgree) {
      setCError('Please agree to the privacy and community guidelines.');
      return;
    }
    const existing = store.login(cEmail, cPassword);
    if (existing) {
      setCError('An account with this email already exists.');
      return;
    }
    store.registerCitizen({
      name: cName,
      email: cEmail,
      password: cPassword,
      locality: cLocality,
    });
    navigate('/citizen');
  };

  const handleOrgSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oName || !oType || !oEmail || !oPassword || !oContact || !oServiceArea || !oDescription) {
      setOError('Please fill in all required fields.');
      return;
    }
    if (oPassword !== oConfirm) {
      setOError('Passwords do not match.');
      return;
    }
    store.registerOrganization({
      orgName: oName,
      orgType: oType,
      email: oEmail,
      password: oPassword,
      contactPerson: oContact,
      serviceArea: oServiceArea,
      description: oDescription,
    });
    navigate('/organization');
  };

  // Role selection
  if (!role) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">How will you use CIVIX?</h1>
          <p className="mt-2 text-gray-500">Choose how you want to participate in your community</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <button
            onClick={() => setRole('citizen')}
            className="card group flex flex-col items-center p-8 text-center transition-all hover:border-orange-300 hover:shadow-lg"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 transition-colors group-hover:bg-orange-100">
              <User className="h-8 w-8" />
            </div>
            <h2 className="mb-2 text-xl font-bold text-gray-900">Citizen</h2>
            <p className="text-sm text-gray-500">Participate in your community, share experiences and follow civic issues.</p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-orange-600">
              Continue as Citizen
              <ArrowRight className="h-4 w-4" />
            </span>
          </button>
          <button
            onClick={() => setRole('organization')}
            className="card group flex flex-col items-center p-8 text-center transition-all hover:border-orange-300 hover:shadow-lg"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-100">
              <Building2 className="h-8 w-8" />
            </div>
            <h2 className="mb-2 text-xl font-bold text-gray-900">Organization</h2>
            <p className="text-sm text-gray-500">Respond to community issues, communicate actions and build public accountability.</p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-blue-600">
              Continue as Organization
              <ArrowRight className="h-4 w-4" />
            </span>
          </button>
        </div>
        <div className="mt-6 text-center">
          <Link to="/login" className="text-sm text-gray-500 hover:text-gray-700">
            Already have an account? Log in
          </Link>
        </div>
      </div>
    );
  }

  // Citizen registration
  if (role === 'citizen') {
    return (
      <div className="mx-auto max-w-lg px-4 py-8 sm:px-6">
        <button onClick={() => setRole(null)} className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-4 w-4" /> Back to role selection
        </button>
        <h1 className="mb-1 text-2xl font-bold text-gray-900">Create Citizen Account</h1>
        <p className="mb-6 text-sm text-gray-500">Join the CIVIX community in Nagpur</p>

        <form onSubmit={handleCitizenSubmit} className="card p-6 space-y-4">
          {cError && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" /> {cError}
            </div>
          )}
          <div>
            <label className="label" htmlFor="cName">Full Name</label>
            <input id="cName" className="input" value={cName} onChange={(e) => setCName(e.target.value)} placeholder="Your full name" />
          </div>
          <div>
            <label className="label" htmlFor="cEmail">Email</label>
            <input id="cEmail" type="email" className="input" value={cEmail} onChange={(e) => cEmail_set(e.target.value)} placeholder="you@example.com" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="cPassword">Password</label>
              <input id="cPassword" type="password" className="input" value={cPassword} onChange={(e) => setCPassword(e.target.value)} placeholder="Password" />
            </div>
            <div>
              <label className="label" htmlFor="cConfirm">Confirm Password</label>
              <input id="cConfirm" type="password" className="input" value={cConfirm} onChange={(e) => setCConfirm(e.target.value)} placeholder="Confirm" />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="cLocality">General Locality</label>
            <select id="cLocality" className="input" value={cLocality} onChange={(e) => setCLocality(e.target.value)}>
              <option value="">Select your locality</option>
              {CITIZEN_LOCALITIES.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
          <div className="flex items-start gap-2 rounded-lg bg-orange-50/50 px-3 py-2.5 text-xs text-gray-600">
            <ShieldCheck className="h-4 w-4 shrink-0 text-orange-600 mt-0.5" />
            <span>Your citizen profile is private by default. Only relevant basic information may be shared with an organization when communication is required.</span>
          </div>
          <label className="flex items-start gap-2 text-sm text-gray-600">
            <input type="checkbox" checked={cAgree} onChange={(e) => setCAgree(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500" />
            I agree to the CIVIX privacy and community guidelines.
          </label>
          <button type="submit" className="btn-primary w-full">
            Create Citizen Account
          </button>
        </form>
      </div>
    );
  }

  // Organization registration
  return (
    <div className="mx-auto max-w-lg px-4 py-8 sm:px-6">
      <button onClick={() => setRole(null)} className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4" /> Back to role selection
      </button>
      <h1 className="mb-1 text-2xl font-bold text-gray-900">Create Organization Account</h1>
      <p className="mb-6 text-sm text-gray-500">Register your organization on CIVIX</p>

      <form onSubmit={handleOrgSubmit} className="card p-6 space-y-4">
        {oError && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" /> {oError}
          </div>
        )}
        <div>
          <label className="label" htmlFor="oName">Organization Name</label>
          <input id="oName" className="input" value={oName} onChange={(e) => setOName(e.target.value)} placeholder="Your organization name" />
        </div>
        <div>
          <label className="label" htmlFor="oType">Organization Type</label>
          <select id="oType" className="input" value={oType} onChange={(e) => setOType(e.target.value)}>
            <option value="">Select type</option>
            {ORG_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="oEmail">Official Email</label>
          <input id="oEmail" type="email" className="input" value={oEmail} onChange={(e) => setOEmail(e.target.value)} placeholder="org@example.com" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="oPassword">Password</label>
            <input id="oPassword" type="password" className="input" value={oPassword} onChange={(e) => setOPassword(e.target.value)} placeholder="Password" />
          </div>
          <div>
            <label className="label" htmlFor="oConfirm">Confirm Password</label>
            <input id="oConfirm" type="password" className="input" value={oConfirm} onChange={(e) => setOConfirm(e.target.value)} placeholder="Confirm" />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="oContact">Contact Person</label>
          <input id="oContact" className="input" value={oContact} onChange={(e) => setOContact(e.target.value)} placeholder="Contact person name" />
        </div>
        <div>
          <label className="label" htmlFor="oServiceArea">Service Area</label>
          <input id="oServiceArea" className="input" value={oServiceArea} onChange={(e) => setOServiceArea(e.target.value)} placeholder="Service area" />
        </div>
        <div>
          <label className="label" htmlFor="oDescription">Description</label>
          <textarea id="oDescription" className="input min-h-[80px]" value={oDescription} onChange={(e) => setODescription(e.target.value)} placeholder="Brief description of your organization" />
        </div>
        <div className="flex items-start gap-2 rounded-lg bg-amber-50/50 px-3 py-2.5 text-xs text-gray-600">
          <Lock className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
          <span>After registration, your organization will be in <strong>Pending Verification</strong> status until reviewed. A pre-verified demo organization account is available for testing.</span>
        </div>
        <button type="submit" className="btn-primary w-full">
          Create Organization Account
        </button>
      </form>
    </div>
  );
}
