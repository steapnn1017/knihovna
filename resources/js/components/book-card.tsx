import { Link } from '@inertiajs/react';
import { AvailabilityBadge } from '@/components/availability-badge';
import { BookCover } from '@/components/book-cover';
import { cn } from '@/lib/utils';
import { show } from '@/routes/books';
import type { Book } from '@/types';

/** Karta knihy v mřížce katalogu: obálka, stav, název, autor. */
export function BookCard({
    book,
    className,
}: {
    book: Book;
    className?: string;
}) {
    return (
        <Link
            href={show(book.id)}
            prefetch
            className={cn(
                'group flex flex-col gap-3 rounded-2xl outline-offset-4',
                className,
            )}
        >
            <div className="relative">
                <BookCover
                    src={book.cover_url}
                    title={book.title}
                    author={book.author}
                    className={cn(
                        'shadow-[0_18px_40px_-20px_rgba(0,0,0,0.9)] transition-transform duration-300 ease-[var(--ease-out-strong)] group-hover:-translate-y-1',
                        !book.is_available && 'opacity-75',
                    )}
                />
            </div>
            <div className="space-y-1.5">
                <AvailabilityBadge book={book} />
                <h3 className="line-clamp-2 text-[15px] leading-snug font-medium text-white decoration-white/30 underline-offset-4 group-hover:underline">
                    {book.title}
                </h3>
                <p className="truncate text-sm text-zinc-400">{book.author}</p>
            </div>
        </Link>
    );
}
