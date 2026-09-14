import { Link } from 'react-router-dom';
import { Users, Eye, Map, ShieldCheck, ArrowRight, MapPin, Building2, Heart } from 'lucide-react';

export function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900">About CIVIX</h1>
        <p className="mt-3 text-xl text-orange-600">For the Community. To the Community. With the Community.</p>
      </div>

      <div className="prose prose-stone max-w-none">
        <p className="text-lg text-gray-600">
          CIVIX is a community-driven civic participation platform. It is a new category that combines community participation with civic issue resolution.
        </p>
        <p className="text-gray-600">
          People share what they experience. Communities identify what they experience together. Collective community signals help relevant organizations understand what matters. Organizations can respond and take action. The community can see the response and provide feedback on whether the issue was actually resolved.
        </p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        <div className="card p-6">
          <MapPin className="mb-3 h-6 w-6 text-orange-600" />
          <h3 className="mb-2 text-lg font-semibold text-gray-900">Pilot City: Nagpur</h3>
          <p className="text-sm text-gray-500">
            CIVIX is currently piloting in Nagpur, Maharashtra — the Orange City. The platform is designed to expand to other cities in the future.
          </p>
        </div>
        <div className="card p-6">
          <Building2 className="mb-3 h-6 w-6 text-orange-600" />
          <h3 className="mb-2 text-lg font-semibold text-gray-900">Organizations</h3>
          <p className="text-sm text-gray-500">
            CIVIX features fictional demonstration organizations. It is not affiliated with Nagpur Municipal Corporation or any real government organization.
          </p>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">The CIVIX Cycle</h2>
        <div className="space-y-3">
          {[
            { label: 'Individual Experience', desc: 'People share what they experience in their community.' },
            { label: 'Community Participation', desc: 'Others support, identify the same issue, and discuss.' },
            { label: 'Collective Civic Signal', desc: 'Community signals help organizations understand what matters.' },
            { label: 'Organization Action', desc: 'Organizations respond and take action.' },
            { label: 'Resolution', desc: 'The organization submits a resolution.' },
            { label: 'Community Feedback', desc: 'The community validates whether the resolution actually worked.' },
            { label: 'Public Trust', desc: 'Transparent outcomes build organizational credibility.' },
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-700">
                {i + 1}
              </div>
              <div className="card flex-1 p-3">
                <span className="font-semibold text-gray-900">{step.label}</span>
                <span className="ml-2 text-sm text-gray-500">— {step.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12 rounded-xl bg-orange-50 p-8 text-center">
        <h2 className="text-xl font-bold text-gray-900">Ready to join?</h2>
        <p className="mt-2 text-sm text-gray-600">Create your account and start participating in your community.</p>
        <Link to="/register" className="mt-4 btn-primary">
          Join CIVIX <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
