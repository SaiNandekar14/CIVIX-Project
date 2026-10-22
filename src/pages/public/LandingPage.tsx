import { Link } from 'react-router-dom';
import { useStore } from '../../state/StoreContext';
import { Share2, Users, Eye, TrendingUp, ShieldCheck, MapPin, ArrowRight, Lock } from 'lucide-react';

export function LandingPage() {
  const store = useStore();
  const isLoggedIn = !!store.currentUser;

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-stone-50">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(234,88,12,0.06),transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600">
              <MapPin className="h-3.5 w-3.5 text-orange-600" />
              Pilot City: Nagpur, Maharashtra
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              CIVIX
            </h1>
            <p className="mt-2 text-lg font-medium text-gray-700">
              For the Community. To the Community. With the Community.
            </p>
            <p className="mt-4 text-base text-gray-500">
              A community-driven civic platform for Nagpur where people share what matters, discover common experiences, participate in local initiatives and see what happens next.
            </p>
            {isLoggedIn ? (
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link to={store.currentUser!.role === 'citizen' ? '/citizen' : '/organization'} className="btn-primary text-base px-6 py-3">
                  Go to Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link to="/register" className="btn-primary text-base px-6 py-3">
                  Join CIVIX
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/login" className="btn-secondary text-base px-6 py-3">
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* How CIVIX works */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900">How CIVIX Works</h2>
            <p className="mt-2 text-gray-500">From individual experience to community trust</p>
          </div>
          <div className="grid gap-8 md:grid-cols-5">
            {[
              { num: '1', icon: Share2, title: 'Share', desc: 'Share an issue, event, initiative or civic update.' },
              { num: '2', icon: Users, title: 'Connect', desc: 'Support it, identify the Same Issue, discuss and participate.' },
              { num: '3', icon: TrendingUp, title: 'Act', desc: 'Relevant organizations see collective community signals.' },
              { num: '4', icon: Eye, title: 'See Change', desc: 'Follow what happens after an organization responds.' },
              { num: '5', icon: ShieldCheck, title: 'Build Trust', desc: 'Community-confirmed outcomes build transparent organizational profiles.' },
            ].map((step) => (
              <div key={step.num} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-gray-600">
                  <step.icon className="h-5 w-5" />
                </div>
                <div className="mb-1 text-xs font-semibold text-gray-400">STEP {step.num}</div>
                <h3 className="mb-2 text-base font-semibold text-gray-900">{step.title}</h3>
                <p className="text-sm text-gray-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy note */}
      <section className="bg-stone-50 py-12">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
            <Lock className="h-3.5 w-3.5" />
            Privacy First
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Your privacy is protected</h2>
          <p className="mt-3 text-gray-600">
            Organizations see only your display name and general area by default. Your contact details are never shared without your consent. You control who can reach you and when.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-gray-200 bg-stone-50 px-8 py-12 text-center">
            <h2 className="text-2xl font-bold text-gray-900">Be part of your community</h2>
            <p className="mt-2 text-gray-500">
              Join CIVIX today and make your voice count in Nagpur's civic life.
            </p>
            {isLoggedIn ? (
              <Link to={store.currentUser!.role === 'citizen' ? '/citizen' : '/organization'} className="mt-6 btn-primary text-base px-6 py-3">
                Go to Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link to="/register" className="btn-primary text-base px-6 py-3">
                  Create Your Account
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/login" className="btn-secondary text-base px-6 py-3">
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
