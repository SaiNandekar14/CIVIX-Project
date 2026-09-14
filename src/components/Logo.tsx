import { Link } from 'react-router-dom';

export function Logo({ className = '', showText = true }: { className?: string; showText?: boolean }) {
  return (
    <Link to="/" className={`flex items-center gap-2.5 ${className}`}>
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-600 text-white shadow-sm">
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L4 6v6c0 4.4 3.4 8.4 8 10 4.6-1.6 8-5.6 8-10V6l-8-4z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      </div>
      {showText && (
        <div className="leading-none">
          <div className="text-lg font-bold tracking-tight text-gray-900">CIVIX</div>
        </div>
      )}
    </Link>
  );
}
