import { Head, Link, router } from '@inertiajs/react';
import { BookX, Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { BookCard } from '@/components/book-card';
import { PageHeader } from '@/components/page-header';
import { Pagination } from '@/components/pagination';
import { plural } from '@/lib/format';
import { cn } from '@/lib/utils';
import { index } from '@/routes/books';
import type { Book, Paginated } from '@/types';

type Status = 'vse' | 'dostupne' | 'vypujcene';

type Props = {
    books: Paginated<Book>;
    filters: { q: string; stav: Status; zanr: string };
    counts: Record<Status, number>;
    genres: string[];
};

const STATUS_TABS: { value: Status; label: string }[] = [
    { value: 'vse', label: 'Vše' },
    { value: 'dostupne', label: 'Dostupné' },
    { value: 'vypujcene', label: 'Vypůjčené' },
];

export default function BooksIndex({ books, filters, counts, genres }: Props) {
    const [query, setQuery] = useState(filters.q);
    const firstRender = useRef(true);

    /** Pošle nové filtry na server (URL se změní, např. /knihy?stav=dostupne). */
    const applyFilters = (changes: Partial<Props['filters']>) => {
        const next = { ...filters, q: query, ...changes };

        router.get(
            index.url(),
            {
                // Prázdné hodnoty do URL nepíšeme
                q: next.q || undefined,
                stav: next.stav !== 'vse' ? next.stav : undefined,
                zanr: next.zanr || undefined,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    // Hledání při psaní - počká 300 ms od posledního stisku klávesy
    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;

            return;
        }

        const timer = setTimeout(() => applyFilters({ q: query }), 300);

        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query]);

    const hasFilters =
        filters.q !== '' || filters.stav !== 'vse' || filters.zanr !== '';

    return (
        <>
            <Head title="Katalog knih" />

            <div className="mx-auto max-w-7xl px-4 pt-32 sm:px-6 lg:px-8">
                <PageHeader
                    title="Katalog knih"
                    description="Zelený štítek znamená, že je kniha v regálu a můžete si ji půjčit. U vypůjčených vidíte, kdy se vrací."
                >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        {/* Vyhledávání */}
                        <div className="relative w-full lg:max-w-md">
                            <label htmlFor="search" className="sr-only">
                                Hledat podle názvu nebo autora
                            </label>
                            <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-zinc-500" />
                            <input
                                id="search"
                                type="search"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Hledat název nebo autora…"
                                autoComplete="off"
                                className="h-12 w-full rounded-full border border-white/10 bg-white/5 pr-11 pl-11 text-base text-white placeholder:text-zinc-500 focus:border-white/25 focus:bg-white/[0.07] focus:outline-none md:text-sm"
                            />
                            {query && (
                                <button
                                    type="button"
                                    onClick={() => setQuery('')}
                                    aria-label="Smazat hledání"
                                    className="absolute top-1/2 right-2 flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-zinc-400 hover:bg-white/10 hover:text-white"
                                >
                                    <X className="size-4" />
                                </button>
                            )}
                        </div>

                        {/* Stav: vše / dostupné / vypůjčené */}
                        <div
                            role="radiogroup"
                            aria-label="Filtrovat podle dostupnosti"
                            className="inline-flex self-start rounded-full glass p-1"
                        >
                            {STATUS_TABS.map((tab) => {
                                const active = filters.stav === tab.value;

                                return (
                                    <button
                                        key={tab.value}
                                        type="button"
                                        role="radio"
                                        aria-checked={active}
                                        onClick={() =>
                                            applyFilters({ stav: tab.value })
                                        }
                                        className={cn(
                                            'flex h-10 cursor-pointer items-center gap-2 rounded-full px-4 text-sm transition-[background-color,color] duration-200',
                                            active
                                                ? 'bg-white font-semibold text-zinc-950'
                                                : 'text-zinc-300 hover:text-white',
                                        )}
                                    >
                                        {tab.value === 'dostupne' && (
                                            <span className="size-1.5 rounded-full bg-emerald-400" />
                                        )}
                                        {tab.label}
                                        <span className="text-xs text-zinc-500 tabular-nums">
                                            {counts[tab.value]}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Žánry - vodorovně posuvné „pilulky“ */}
                    {/* Maska vpravo naznačuje, že řádek jde posunout */}
                    <div className="-mx-4 [scrollbar-width:none] overflow-x-auto [mask-image:linear-gradient(to_right,black_85%,transparent)] px-4 pb-1 sm:mx-0 sm:px-0">
                        <div className="flex w-max gap-2">
                            <GenrePill
                                active={filters.zanr === ''}
                                onClick={() => applyFilters({ zanr: '' })}
                            >
                                Všechny žánry
                            </GenrePill>
                            {genres.map((genre) => (
                                <GenrePill
                                    key={genre}
                                    active={filters.zanr === genre}
                                    onClick={() =>
                                        applyFilters({ zanr: genre })
                                    }
                                >
                                    {genre}
                                </GenrePill>
                            ))}
                        </div>
                    </div>
                </PageHeader>

                <p
                    className="mt-10 mb-6 text-sm text-zinc-500"
                    aria-live="polite"
                >
                    {books.meta.total}{' '}
                    {plural(books.meta.total, ['kniha', 'knihy', 'knih'])}
                    {hasFilters && ' odpovídá filtru'}
                </p>

                {books.data.length === 0 ? (
                    <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-white/10 px-6 py-20 text-center">
                        <BookX className="size-8 text-zinc-500" />
                        <div>
                            <p className="font-medium text-white">
                                Nic jsme nenašli
                            </p>
                            <p className="mt-1 text-sm text-zinc-400">
                                Zkuste jiný výraz nebo zrušte filtry.
                            </p>
                        </div>
                        <Link
                            href={index()}
                            className="mt-2 inline-flex h-11 items-center rounded-full bg-white px-6 text-sm font-semibold text-zinc-950 active:scale-[0.97]"
                        >
                            Zrušit filtry
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 md:gap-x-6 lg:grid-cols-4 xl:grid-cols-6">
                        {books.data.map((book) => (
                            <BookCard key={book.id} book={book} />
                        ))}
                    </div>
                )}

                <div className="mt-14">
                    <Pagination links={books.meta.links} />
                </div>
            </div>
        </>
    );
}

function GenrePill({
    active,
    onClick,
    children,
}: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={active}
            className={cn(
                'h-9 cursor-pointer rounded-full border px-4 text-sm whitespace-nowrap transition-colors duration-150',
                active
                    ? 'border-gold/40 bg-gold/10 text-gold'
                    : 'border-white/10 text-zinc-400 hover:border-white/20 hover:text-white',
            )}
        >
            {children}
        </button>
    );
}
