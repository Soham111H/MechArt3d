import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center gap-1 text-xs flex-wrap ${className}`}
    >
      <Link
        href="/"
        className="flex items-center gap-1 text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
      >
        <Home size={11} />
        <span>Home</span>
      </Link>

      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={i} className="flex items-center gap-1">
            <ChevronRight size={11} className="text-slate-300 dark:text-slate-600 shrink-0" />
            {isLast || !item.href ? (
              <span className={isLast ? 'font-semibold text-slate-700 dark:text-slate-300' : 'text-slate-400'}>
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                {item.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
