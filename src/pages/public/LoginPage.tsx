import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../../state/StoreContext';
import { useState } from 'react';
import { Mail, Lock, AlertCircle, User, Building2 } from 'lucide-react';

export function LoginPage() {
  const store = useStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    const user = await store.login(email, password);
    if (!user) {
      setError('Invalid email or password. Try a demo account below.');
      return;
    }
    navigate(user.role === 'citizen' ? '/citizen' : '/organization');
  };

  const handleDemo = async (role: 'citizen' | 'organization') => {
    await store.loginDemo(role);
    navigate(role === 'citizen' ? '/citizen' : '/organization');
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center px-4 py-12">
      <div className="w-full">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Welcome back to CIVIX</h1>
          <p className="mt-1 text-sm text-gray-500">Log in to continue participating in your community</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}
          <div>
            <label className="label" htmlFor="email">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                id="email"
                type="email"
                className="input pl-9"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="password">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                id="password"
                type="password"
                className="input pl-9"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
          </div>
          <button type="submit" className="btn-primary w-full">
            Log In
          </button>
        </form>

        <div className="my-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-xs text-gray-400">OR TRY A DEMO ACCOUNT</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => handleDemo('citizen')} className="card flex flex-col items-center gap-2 p-4 transition-all hover:border-gray-300 hover:shadow-md">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50 text-gray-600">
              <User className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium text-gray-700">Citizen Demo</span>
          </button>
          <button onClick={() => handleDemo('organization')} className="card flex flex-col items-center gap-2 p-4 transition-all hover:border-gray-300 hover:shadow-md">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50 text-gray-600">
              <Building2 className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium text-gray-700">Organization Demo</span>
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          New to CIVIX? <Link to="/register" className="font-medium text-orange-600 hover:text-orange-700">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
