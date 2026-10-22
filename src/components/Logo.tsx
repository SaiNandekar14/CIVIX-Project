import { Link } from 'react-router-dom';

export function Logo({ className = '', showText = true }: { className?: string; showText?: boolean }) {
  return (
    <Link to="/" className={`inline-flex shrink-0 items-center ${className}`} aria-label="CIVIX home">
      <img
        src="/image.png"
        alt="CIVIX — For the Community. To the Community. With the Community."
        className={`${showText ? 'h-14 w-[176px]' : 'h-11 w-[144px]'} object-contain`}
      />
    </Link>
  );
}
