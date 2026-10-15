import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import type { PaginationLink } from '@/types';

/** Stránkování podle odkazů, které generuje Laravel paginator. */
export function Pagination({ links }: { links: PaginationLink[] }) {
    if (links.length <= 3) {
        return null; // jen „předchozí, 1, další“ = jediná stránka
    }

    const label = (raw: string) =>
        raw
            .replace('&laquo;', '←')
            .replace('&raquo;', '→')
            .replace(/Předchozí|Previous/, '')
            .replace(/Další|Next/, '')
            .trim();

    return (
        <nav
            aria-label="Stránkování"
            className="flex flex-wrap items-center justify-center gap-1.5"
        >
            {links.map((link, i) =>
                link.url ? (
                    <Link
                        key={i}
                        href={link.url}
                        preserveScroll={false}
                        aria-current={link.active ? 'page' : undefined}
                        className={cn(
                            'flex h-10 min-w-10 items-center justify-center rounded-full px-3 text-sm tabular-nums transition-colors',
                            link.active
                                ? 'bg-white font-semibold text-zinc-950'
                                : 'border border-white/10 text-zinc-300 hover:bg-white/5 hover:text-white',
                        )}
                    >
                        {label(link.label)}
                    </Link>
                ) : (
                    <span
                        key={i}
                        className="flex h-10 min-w-10 items-center justify-center px-3 text-sm text-zinc-600"
                    >
                        {label(link.label)}
                    </span>
                ),
            )}
        </nav>
    );
}
