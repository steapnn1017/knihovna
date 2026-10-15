import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    BookMarked,
    BookOpen,
    CalendarClock,
    Feather,
    Library,
    LibraryBig,
    PenTool,
    ScrollText,
} from 'lucide-react';
import { BookCard } from '@/components/book-card';
import { BookCover } from '@/components/book-cover';
import SocialCards from '@/components/ui/card-fan-carousel';
import HeroSection from '@/components/ui/glassmorphism-trust-hero';
import { dueLabel, plural } from '@/lib/format';
import { toUrl } from '@/lib/utils';
import { index as booksIndex, show } from '@/routes/books';
import type { Book, ResourceCollection } from '@/types';

type Props = {
    stats: {
        books: number;
        available: number;
        borrowed: number;
        readers: number;
        authors: number;
        loanDays: number;
    };
    featured: ResourceCollection<Book>;
    availableNow: ResourceCollection<Book>;
    borrowedNow: ResourceCollection<Book>;
    authors: string[];
};

// Ikony se v běžícím pásu autorů střídají (místo log firem z původní komponenty)
const AUTHOR_ICONS = [
    Feather,
    BookOpen,
    PenTool,
    ScrollText,
    BookMarked,
    Library,
];

export default function Welcome({
    stats,
    featured,
    availableNow,
    borrowedNow,
    authors,
}: Props) {
    const availablePercent =
        stats.books > 0 ? Math.round((stats.available / stats.books) * 100) : 0;

    return (
        <>
            <Head title="Online katalog a výpůjčky" />

            <HeroSection
                badge="Online katalog knihovny"
                title={{
                    start: 'Půjčte si',
                    highlight: 'příběh',
                    end: 'na celý měsíc',
                }}
                description="Hned vidíte, která kniha je v regálu a která je venku. Dostupnou si půjčíte jedním kliknutím."
                primaryAction={{
                    label: 'Prohlédnout katalog',
                    href: toUrl(booksIndex()),
                }}
                secondaryAction={{
                    label: 'Jen dostupné',
                    href: toUrl(booksIndex({ query: { stav: 'dostupne' } })),
                    icon: BookOpen,
                }}
                backgroundImage="/images/hero-knihovna.jpg"
                stat={{
                    value: String(stats.books),
                    label: `${plural(stats.books, ['kniha', 'knihy', 'knih'])} v katalogu`,
                    icon: LibraryBig,
                }}
                progress={{
                    label: 'Dostupné právě teď',
                    value: availablePercent,
                    display: `${stats.available} z ${stats.books}`,
                }}
                miniStats={[
                    { value: String(stats.borrowed), label: 'Vypůjčeno' },
                    { value: String(stats.authors), label: 'Autorů' },
                    { value: String(stats.readers), label: 'Čtenářů' },
                ]}
                tags={[
                    {
                        label: `${stats.available} v regálu`,
                        live: true,
                    },
                    {
                        label: `${stats.loanDays} dní na čtení`,
                        icon: CalendarClock,
                    },
                ]}
                marquee={{
                    title: 'V katalogu najdete',
                    items: authors.slice(0, 14).map((name, i) => ({
                        name,
                        icon: AUTHOR_ICONS[i % AUTHOR_ICONS.length],
                    })),
                }}
            />

            {/* Vějíř obálek */}
            <section
                aria-labelledby="fan-heading"
                className="relative mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8"
            >
                <div className="mx-auto max-w-2xl text-center">
                    <h2
                        id="fan-heading"
                        className="text-3xl font-medium tracking-tighter text-white md:text-4xl"
                    >
                        Vyberte si z regálu
                    </h2>
                    <p className="mt-3 text-zinc-400">
                        Šipkami listujte, kliknutím na obálku otevřete detail
                        knihy.
                    </p>
                </div>
                <SocialCards
                    cards={featured.data.map((book) => ({
                        imgUrl: book.cover_url ?? '',
                        alt: `${book.title} (${book.author})`,
                        linkUrl: toUrl(show(book.id)),
                    }))}
                />
            </section>

            {/* Dostupné vs. vypůjčené */}
            <section
                aria-label="Dostupnost knih"
                className="mx-auto mt-20 grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-[1.6fr_1fr] lg:px-8"
            >
                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
                    <div className="mb-8 flex items-end justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-medium tracking-tight text-white">
                                Dostupné hned
                            </h2>
                            <p className="mt-1 text-sm text-zinc-400">
                                {stats.available}{' '}
                                {plural(stats.available, [
                                    'kniha čeká',
                                    'knihy čekají',
                                    'knih čeká',
                                ])}{' '}
                                v regálu.
                            </p>
                        </div>
                        <Link
                            href={booksIndex({ query: { stav: 'dostupne' } })}
                            className="group inline-flex shrink-0 items-center gap-1.5 text-sm text-zinc-300 hover:text-white"
                        >
                            Všechny
                            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4">
                        {availableNow.data.map((book) => (
                            <BookCard key={book.id} book={book} />
                        ))}
                    </div>
                </div>

                <div className="rounded-3xl glass p-6 md:p-8">
                    <div className="mb-6">
                        <h2 className="text-2xl font-medium tracking-tight text-white">
                            Právě vypůjčené
                        </h2>
                        <p className="mt-1 text-sm text-zinc-400">
                            Seřazeno podle toho, která se vrací nejdřív.
                        </p>
                    </div>

                    {borrowedNow.data.length === 0 ? (
                        <p className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-zinc-400">
                            Teď nemá nikdo nic půjčeno. Celý katalog je v
                            regálu.
                        </p>
                    ) : (
                        <ul className="space-y-3">
                            {borrowedNow.data.map((book) => (
                                <li key={book.id}>
                                    <Link
                                        href={show(book.id)}
                                        className="flex items-center gap-4 rounded-2xl p-2 transition-colors hover:bg-white/5"
                                    >
                                        <BookCover
                                            src={book.cover_url}
                                            title={book.title}
                                            author={book.author}
                                            className="w-12 shrink-0 rounded-lg"
                                        />
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium text-white">
                                                {book.title}
                                            </p>
                                            <p className="truncate text-xs text-zinc-400">
                                                {book.author}
                                            </p>
                                        </div>
                                        {book.loan && (
                                            <span
                                                className={
                                                    book.loan.is_overdue
                                                        ? 'shrink-0 rounded-full bg-rose-400/10 px-2.5 py-1 text-xs text-rose-300'
                                                        : 'shrink-0 text-xs text-zinc-400'
                                                }
                                            >
                                                {dueLabel(book.loan.due_at)}
                                            </span>
                                        )}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}

                    <Link
                        href={booksIndex({ query: { stav: 'vypujcene' } })}
                        className="mt-6 flex h-11 items-center justify-center rounded-full border border-white/10 text-sm font-medium text-white transition-colors hover:bg-white/5"
                    >
                        Všechny vypůjčené ({stats.borrowed})
                    </Link>
                </div>
            </section>
        </>
    );
}
