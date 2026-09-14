import { STATUS_COLORS, STATUS_ICONS, CATEGORY_ICONS } from '../data/constants';
import * as LucideIcons from 'lucide-react';
import type { LucideProps } from 'lucide-react';
import type { ComponentType, SVGProps } from 'react';

export function StatusBadge({ status, size = 'sm' }: { status: string; size?: 'sm' | 'md' }) {
  const colorClass = STATUS_COLORS[status] || 'bg-gray-100 text-gray-700 border-gray-300';
  const iconName = STATUS_ICONS[status] || 'Circle';
  const Icon = (LucideIcons as unknown as Record<string, ComponentType<SVGProps<SVGSVGElement> & LucideProps>>)[iconName] || LucideIcons.Circle;
  const sizeClass = size === 'md' ? 'px-3 py-1 text-sm' : 'px-2.5 py-0.5 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${colorClass} ${sizeClass}`}>
      <Icon className={size === 'md' ? 'h-4 w-4' : 'h-3 w-3'} />
      {status}
    </span>
  );
}

export function CategoryBadge({ category }: { category: string }) {
  const iconName = CATEGORY_ICONS[category] || 'CircleAlert';
  const Icon = (LucideIcons as unknown as Record<string, ComponentType<SVGProps<SVGSVGElement> & LucideProps>>)[iconName] || LucideIcons.CircleAlert;
  return (
    <span className="badge border-orange-200 bg-orange-50 text-orange-700">
      <Icon className="h-3 w-3" />
      {category}
    </span>
  );
}

export function VerifiedBadge() {
  return (
    <span className="badge border-green-200 bg-green-50 text-green-700">
      <LucideIcons.BadgeCheck className="h-3 w-3" />
      Verified Organization
    </span>
  );
}

export function PendingBadge() {
  return (
    <span className="badge border-amber-200 bg-amber-50 text-amber-700">
      <LucideIcons.Clock className="h-3 w-3" />
      Pending Verification
    </span>
  );
}
