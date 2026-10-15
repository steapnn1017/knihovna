import { BookOpen } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Obálka knihy z Open Library.
 *
 * Pod obrázkem je vždy „typografická“ obálka (název + autor). Je vidět:
 *  - dokud se obrázek načítá (Open Library bývá pomalá),
 *  - když obálka chybí nebo se nepodaří načíst.
 * Obrázek se po načtení jemně prolne (opacity), takže nic neskáče.
 */
export function BookCover({
    src,
    title,
    author,
    className,
    eager = false,
}: {
    src: string | null;
    title: string;
    author: string;
    className?: string;
    eager?: boolean;
}) {
    const [loaded, setLoaded] = useState(false);
    const [failed, setFailed] = useState(false);

    return (
        <div
            className={cn(
                // @container = velikost písma se řídí šířkou obálky (jednotky cqw)
                '@container relative aspect-[2/3] overflow-hidden rounded-xl border border-white/10 bg-zinc-900',
                className,
            )}
        >
            <div
                aria-hidden={Boolean(src) && !failed}
                className="absolute inset-0 flex flex-col justify-between bg-gradient-to-br from-zinc-800 to-zinc-900 p-[8%] @max-[96px]:items-center @max-[96px]:justify-center"
            >
                <BookOpen className="size-[18%] max-h-5 min-h-3 max-w-5 min-w-3 text-gold" />
                <div className="min-w-0 @max-[96px]:hidden">
                    <p className="line-clamp-4 text-[clamp(0.5rem,8cqw,0.875rem)] leading-snug font-semibold text-white">
                        {title}
                    </p>
                    <p className="mt-1 line-clamp-2 text-[clamp(0.45rem,6cqw,0.75rem)] text-zinc-400">
                        {author}
                    </p>
                </div>
            </div>

            {src && !failed && (
                <img
                    src={src}
                    alt={`Obálka: ${title}`}
                    loading={eager ? 'eager' : 'lazy'}
                    decoding="async"
                    onLoad={() => setLoaded(true)}
                    onError={() => setFailed(true)}
                    className={cn(
                        'absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ease-out',
                        loaded ? 'opacity-100' : 'opacity-0',
                    )}
                />
            )}
        </div>
    );
}
