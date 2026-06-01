'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Dumbbell, LineChart, NotebookPen, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { href: '/', label: 'Home', Icon: Home },
  { href: '/plan', label: 'Plan', Icon: Dumbbell },
  { href: '/progress', label: 'Progress', Icon: LineChart },
  { href: '/notes', label: 'Notes', Icon: NotebookPen },
  { href: '/settings', label: 'More', Icon: Settings }
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 border-t border-forge-stone bg-forge-ink/95 backdrop-blur safe-bottom">
      <div className="mx-auto max-w-md flex items-stretch justify-around">
        {tabs.map(({ href, label, Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-colors',
                active ? 'text-forge-lime' : 'text-forge-ash hover:text-forge-bone'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] tracking-wide uppercase">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
