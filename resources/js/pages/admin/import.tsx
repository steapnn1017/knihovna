import { Form, Head, Link, router } from '@inertiajs/react';
import { Check, CloudOff, Plus, Search } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { BookCover } from '@/components/book-cover';
import { PageHeader } from '@/components/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { show } from '@/routes/books';
import { create, store } from '@/routes/import';
import type { OpenLibraryResult } from '@/types';

type Props = {
    query: string;
    error: string | null;
    results: OpenLibraryResult[];
};

const SUGGESTIONS = [
    'Karel Čapek',
    'Agatha Christie',
    'Terry Pratchett',
    'Stephen King',
    'Jules Verne',
];

export default function ImportBooks({ query, error, results }: Props) {
    const [value, setValue] = useState(query);
    const [searching, setSearching] = useState(false);

    const search = (q: string) => {
        router.get(
            create.url(),
            { q },
            {
                preserveScroll: true,
                onStart: () => setSearching(true),
                onFinish: () => setSearching(false),
            },
        );
    };

    const onSubmit = (event: FormEvent) => {
        event.preventDefault();

        if (value.trim() !== '') {
            search(value.trim());
        }
    };

    return (
        <>
            <Head title="Přidat knihy" />

            <div className="mx-auto max-w-5xl px-4 pt-32 sm:px-6 lg:px-8">
                <PageHeader
                    title="Přidat knihy"
                    description={
                        <>
                            Vyhledejte knihu v otevřené databázi{' '}
                            <a
                                href="https://openlibrary.org"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-white underline decoration-white/30 underline-offset-4"
                            >
                                Open Library
                            </a>{' '}
                            a přidejte ji do katalogu. Název, autora, rok,
                            obálku i popis stáhneme automaticky.
                        </>
                    }
                >
                    <form
                        onSubmit={onSubmit}
                        className="flex flex-col gap-3 sm:flex-row"
                    >
                        <div className="relative flex-1">
                            <label htmlFor="ol-search" className="sr-only">
                                Název knihy nebo autor
                            </label>
                            <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-zinc-500" />
                            <input
                                id="ol-search"
                                type="search"
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                placeholder="Např. Babička, Tolkien, 9780141182803…"
                                className="h-12 w-full rounded-full border border-white/10 bg-white/5 pr-4 pl-11 text-base text-white placeholder:text-zinc-500 focus:border-white/25 focus:outline-none md:text-sm"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={searching || value.trim() === ''}
                            className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-full bg-white px-7 text-sm font-semibold text-zinc-950 transition-[background-color,transform] duration-150 hover:bg-zinc-200 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {searching ? (
                                <Spinner />
                            ) : (
                                <Search className="size-4" />
                            )}
                            Hledat
                        </button>
                    </form>

                    {query === '' && (
                        <div className="flex flex-wrap items-center gap-2 text-sm">
                            <span className="text-zinc-500">Zkuste:</span>
                            {SUGGESTIONS.map((s) => (
                                <button
                                    key={s}
                                    type="button"
                                    onClick={() => {
                                        setValue(s);
                                        search(s);
                                    }}
                                    className="h-9 cursor-pointer rounded-full border border-white/10 px-4 text-zinc-300 transition-colors hover:border-white/20 hover:text-white"
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    )}
                </PageHeader>

                <div className="mt-12">
                    {searching ? (
                        <ResultsSkeleton />
                    ) : error ? (
                        <div className="flex flex-col items-center gap-3 rounded-3xl border border-rose-400/20 bg-rose-400/5 px-6 py-14 text-center">
                            <CloudOff className="size-8 text-rose-300" />
                            <p className="text-rose-200">{error}</p>
                        </div>
                    ) : query !== '' && results.length === 0 ? (
                        <p className="rounded-3xl border border-dashed border-white/10 px-6 py-14 text-center text-zinc-400">
                            Pro „{query}“ Open Library nic nenašla. Zkuste
                            anglický název nebo jméno autora.
                        </p>
                    ) : (
                        <ul className="grid gap-3 md:grid-cols-2">
                            {results.map((book) => (
                                <ResultRow
                                    key={book.open_library_key}
                                    book={book}
                                />
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </>
    );
}

function ResultRow({ book }: { book: OpenLibraryResult }) {
    return (
        <li className="flex items-center gap-4 rounded-3xl border border-white/10 bg-white/[0.03] p-3">
            <BookCover
                src={book.cover_url}
                title={book.title}
                author={book.author}
                className="w-16 shrink-0 rounded-lg"
            />
            <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm font-medium text-white">
                    {book.title}
                </p>
                <p className="truncate text-xs text-zinc-400">
                    {book.author}
                    {book.year && ` · ${book.year}`}
                </p>
            </div>
            {book.existing_id ? (
                <Link
                    href={show(book.existing_id)}
                    className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full px-4 text-xs font-medium text-emerald-300 hover:bg-emerald-400/10"
                >
                    <Check className="size-4" />
                    V katalogu
                </Link>
            ) : (
                <Form {...store.form()} options={{ preserveScroll: true }}>
                    {({ processing, errors }) => (
                        <>
                            <input
                                type="hidden"
                                name="open_library_key"
                                value={book.open_library_key}
                            />
                            <button
                                type="submit"
                                disabled={processing}
                                aria-label={`Přidat ${book.title} do katalogu`}
                                className="inline-flex h-10 shrink-0 cursor-pointer items-center gap-1.5 rounded-full bg-white px-4 text-xs font-semibold text-zinc-950 transition-[background-color,transform] duration-150 hover:bg-zinc-200 active:scale-[0.97] disabled:opacity-60"
                            >
                                {processing ? (
                                    <Spinner />
                                ) : (
                                    <Plus className="size-4" />
                                )}
                                Přidat
                            </button>
                            {errors.open_library_key && (
                                <p className="mt-1 text-xs text-rose-300">
                                    {errors.open_library_key}
                                </p>
                            )}
                        </>
                    )}
                </Form>
            )}
        </li>
    );
}

function ResultsSkeleton() {
    return (
        <ul
            className="grid gap-3 md:grid-cols-2"
            aria-busy="true"
            aria-label="Hledám…"
        >
            {Array.from({ length: 6 }).map((_, i) => (
                <li
                    key={i}
                    className="flex items-center gap-4 rounded-3xl border border-white/10 p-3"
                >
                    <Skeleton className="aspect-[2/3] w-16 rounded-lg bg-white/5" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4 bg-white/5" />
                        <Skeleton className="h-3 w-1/2 bg-white/5" />
                    </div>
                </li>
            ))}
        </ul>
    );
}
