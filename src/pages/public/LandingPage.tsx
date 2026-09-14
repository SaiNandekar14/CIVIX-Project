import { Link } from 'react-router-dom';
import { MapView } from '../../components/MapView';
import { useStore } from '../../state/StoreContext';
import { PostCard } from '../../components/PostCard';
import { Share2, Users, Eye, TrendingUp, ShieldCheck, MapPin, ArrowRight } from 'lucide-react';

export function LandingPage() {
  const store = useStore();
  const allPosts = store.getAllPosts();
  const issueCount = allPosts.filter((p) => p.type === 'Issue').length;
  const mapPosts = allPosts.filter((p) => p.type === 'Issue' && p.lat != null).slice(0, 10);
  const feedPosts = allPosts.slice(0, 4);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-stone-100 to-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(234,88,12,0.08),transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-sm font-medium text-orange-700">
                <MapPin className="h-4 w-4" />
                Pilot City: Nagpur, Maharashtra
              </div>
              <h1 className="text-5xl font-bold tracking-tight text-gray-900 lg:text-6xl">
                CIVIX
              </h1>
              <p className="mt-3 text-xl font-medium text-orange-600">
                For the Community. To the Community. With the Community.
              </p>
              <p className="mt-4 max-w-lg text-base text-gray-600">
                A community-driven civic platform for Nagpur where people share what matters, discover common experiences, participate in local initiatives and see what happens next.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link to="/register" className="btn-primary text-base px-6 py-3">
                  Join CIVIX
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/explore" className="btn-secondary text-base px-6 py-3">
                  Explore Nagpur
                </Link>
              </div>
              <div className="mt-8 flex items-center gap-6 text-sm text-gray-500">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{issueCount}+</div>
                  <div>Civic Issues</div>
                </div>
                <div className="h-8 w-px bg-gray-300" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">5</div>
                  <div>Organizations</div>
                </div>
                <div className="h-8 w-px bg-gray-300" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">12</div>
                  <div>Localities</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="card overflow-hidden p-0">
                <div className="border-b border-gray-100 bg-stone-50 px-4 py-2.5">
                  <span className="text-xs font-semibold text-gray-500">LIVE CIVIC MAP - NAGPUR</span>
                </div>
                <MapView posts={mapPosts} height="300px" zoom={12} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feed preview */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">What's happening in Nagpur?</h2>
            <p className="text-sm text-gray-500">Real civic issues shared by the community</p>
          </div>
          <Link to="/explore" className="text-sm font-medium text-orange-600 hover:text-orange-700">
            View all →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {feedPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
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
              { num: '1', icon: Share2, title: 'Share', desc: 'Share an issue, event, initiative or civic update.', color: 'bg-orange-50 text-orange-600' },
              { num: '2', icon: Users, title: 'Connect', desc: 'Support it, identify the Same Issue, discuss and participate.', color: 'bg-blue-50 text-blue-600' },
              { num: '3', icon: TrendingUp, title: 'Act', desc: 'Relevant organizations see collective community signals.', color: 'bg-amber-50 text-amber-600' },
              { num: '4', icon: Eye, title: 'See Change', desc: 'Follow what happens after an organization responds.', color: 'bg-cyan-50 text-cyan-600' },
              { num: '5', icon: ShieldCheck, title: 'Build Trust', desc: 'Community-confirmed outcomes build transparent organizational profiles.', color: 'bg-green-50 text-green-600' },
            ].map((step) => (
              <div key={step.num} className="text-center">
                <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl ${step.color}`}>
                  <step.icon className="h-6 w-6" />
                </div>
                <div className="mb-1 text-xs font-bold text-gray-400">STEP {step.num}</div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">{step.title}</h3>
                <p className="text-sm text-gray-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-orange-600 to-orange-700 py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white">Be part of your community</h2>
          <p className="mt-3 text-orange-100">
            Join CIVIX today and make your voice count in Nagpur's civic life.
          </p>
          <Link to="/register" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-base font-semibold text-orange-600 transition-all hover:bg-orange-50">
            Create Your Account
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
