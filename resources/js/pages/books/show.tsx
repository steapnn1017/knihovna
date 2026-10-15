import { Form, Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    BookCheck,
    CalendarDays,
    ExternalLink,
    Hash,
    LogIn,
    Trash2,
    Undo2,
} from 'lucide-react';
import { AvailabilityBadge } from '@/components/availability-badge';
import { BookCard } from '@/components/book-card';
import { BookCover } from '@/components/book-cover';
import { Spinner } from '@/components/ui/spinner';
import { dueLabel, formatDate, plural } from '@/lib/format';
import { login, register } from '@/routes';
import { destroy, index } from '@/routes/books';
import { returnMethod, store } from '@/routes/loans';
import type { Book, ResourceCollection } from '@/types';

type Props = {
    book: { data: Book };
    timesBorrowed: number;
    borrowBlocker: null | 'guest' | 'borrowed' | 'limit';
    loanDays: number;
    dueIfBorrowedToday: string;
    maxLoans: number;
    related: ResourceCollection<Book>;
};

export default function BookShow({
    book: { data: book },
    timesBorrowed,
    borrowBlocker,
    loanDays,
    dueIfBorrowedToday,
    maxLoans,
    related,
}: Props) {
    const { auth } = usePage().props;

    const facts = [
        book.year && { label: 'Vydáno', value: String(book.year) },
        book.pages && { label: 'Stran', value: String(book.pages) },
        book.genre && { label: 'Žánr', value: book.genre },
        book.isbn && { label: 'ISBN', value: book.isbn },
    ].filter(Boolean) as { label: string; value: string }[];

    return (
        <>
            <Head title={book.title} />

            <div className="mx-auto max-w-7xl px-4 pt-28 sm:px-6 lg:px-8">
                <Link
                    href={index()}
                    className="group mb-8 inline-flex h-10 items-center gap-2 rounded-full pr-4 pl-3 text-sm text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
                >
                    <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
                    Zpět do katalogu
                </Link>

                <div className="grid gap-10 md:grid-cols-[minmax(0,320px)_1fr] lg:gap-16">
                    {/* Obálka */}
                    <div className="mx-auto w-full max-w-[280px] animate-in duration-500 zoom-in-95 fade-in md:max-w-none">
                        <BookCover
                            src={book.cover_url}
                            title={book.title}
                            author={book.author}
                            eager
                            className="rounded-2xl shadow-[0_40px_80px_-30px_rgba(0,0,0,0.9)]"
                        />
                    </div>

                    {/* Informace + panel výpůjčky */}
                    <div className="animate-in space-y-8 duration-500 fade-in slide-in-from-bottom-2">
                        <div className="space-y-4">
                            <AvailabilityBadge book={book} size="md" />
                            <h1 className="text-4xl leading-[1.05] font-medium tracking-tighter text-white md:text-5xl">
                                {book.title}
                            </h1>
                            <p className="text-lg text-zinc-300">
                                {book.author}
                            </p>
                            {book.original_title &&
                                book.original_title !== book.title && (
                                    <p className="text-sm text-zinc-500">
                                        Původní název: {book.original_title}
                                    </p>
                                )}
                        </div>

                        {book.description && (
                            <p className="max-w-[65ch] text-base leading-relaxed text-zinc-400">
                                {book.description}
                            </p>
                        )}

                        {facts.length > 0 && (
                            // Počet sloupců = počet údajů, aby nezůstala prázdná buňka
                            <dl
                                className="grid max-w-xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:[grid-template-columns:repeat(var(--cols),minmax(0,1fr))]"
                                style={
                                    {
                                        '--cols': facts.length,
                                    } as React.CSSProperties
                                }
                            >
                                {facts.map((fact) => (
                                    <div
                                        key={fact.label}
                                        className="bg-zinc-950 p-4 odd:last:col-span-2 sm:odd:last:col-span-1"
                                    >
                                        <dt className="text-xs text-zinc-500">
                                            {fact.label}
                                        </dt>
                                        <dd className="mt-1 truncate text-sm font-medium text-white tabular-nums">
                                            {fact.value}
                                        </dd>
                                    </div>
                                ))}
                            </dl>
                        )}

                        {/* Panel výpůjčky */}
                        <div className="max-w-xl rounded-3xl glass p-6">
                            <LoanPanel
                                book={book}
                                blocker={borrowBlocker}
                                dueIfBorrowedToday={dueIfBorrowedToday}
                                loanDays={loanDays}
                                maxLoans={maxLoans}
                            />
                        </div>

                        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-zinc-500">
                            <span className="inline-flex items-center gap-2">
                                <Hash className="size-4" />
                                {timesBorrowed === 0
                                    ? 'Zatím si ji nikdo nepůjčil'
                                    : `Půjčeno ${timesBorrowed}×`}
                            </span>
                            {book.open_library_url && (
                                <a
                                    href={book.open_library_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 hover:text-white"
                                >
                                    <ExternalLink className="size-4" />
                                    Záznam v Open Library
                                </a>
                            )}
                            {auth.user?.is_librarian && book.is_available && (
                                <Form
                                    {...destroy.form(book.id)}
                                    onBefore={() =>
                                        confirm(
                                            `Opravdu odebrat „${book.title}“ z katalogu?`,
                                        )
                                    }
                                >
                                    {({ processing }) => (
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="inline-flex cursor-pointer items-center gap-2 text-rose-300/80 hover:text-rose-300"
                                        >
                                            <Trash2 className="size-4" />
                                            Odebrat z katalogu
                                        </button>
                                    )}
                                </Form>
                            )}
                        </div>
                    </div>
                </div>

                {related.data.length > 0 && (
                    <section
                        aria-labelledby="related-heading"
                        className="mt-24"
                    >
                        <h2
                            id="related-heading"
                            className="mb-8 text-2xl font-medium tracking-tight text-white"
                        >
                            Podobné knihy
                        </h2>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 md:gap-x-6 lg:grid-cols-5">
                            {related.data.map((item) => (
                                <BookCard key={item.id} book={item} />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </>
    );
}

/** Co může uživatel s knihou udělat: půjčit, vrátit, přihlásit se… */
function LoanPanel({
    book,
    blocker,
    dueIfBorrowedToday,
    loanDays,
    maxLoans,
}: {
    book: Book;
    blocker: Props['borrowBlocker'];
    dueIfBorrowedToday: string;
    loanDays: number;
    maxLoans: number;
}) {
    // Mám ji půjčenou já
    if (book.loan?.is_mine) {
        return (
            <div className="space-y-4">
                <PanelText
                    title="Tuhle knihu máte půjčenou"
                    text={`Vraťte ji do ${formatDate(book.loan.due_at)} (${dueLabel(book.loan.due_at)}).`}
                    tone={book.loan.is_overdue ? 'danger' : 'default'}
                />
                <ReturnButton loanId={book.loan.id} label="Vrátit knihu" />
            </div>
        );
    }

    // Má ji někdo jiný
    if (book.loan) {
        return (
            <div className="space-y-4">
                <PanelText
                    title="Teď je vypůjčená"
                    text={
                        book.loan.is_overdue
                            ? `Měla se vrátit ${formatDate(book.loan.due_at)}, je ${dueLabel(book.loan.due_at)}.`
                            : `Vrátit se má do ${formatDate(book.loan.due_at)}. Pak si ji můžete půjčit vy.`
                    }
                    tone={book.loan.is_overdue ? 'danger' : 'default'}
                />
                {book.loan.borrower && (
                    <div className="flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-zinc-400">
                            Půjčil(a):{' '}
                            <span className="font-medium text-white">
                                {book.loan.borrower}
                            </span>
                        </p>
                        <ReturnButton
                            loanId={book.loan.id}
                            label="Označit jako vrácenou"
                        />
                    </div>
                )}
            </div>
        );
    }

    if (blocker === 'guest') {
        return (
            <div className="space-y-4">
                <PanelText
                    title="Kniha je v regálu"
                    text="Pro vypůjčení se přihlaste. Účet si založíte za pár vteřin."
                />
                <div className="flex flex-col gap-3 sm:flex-row">
                    <Link
                        href={login()}
                        className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-zinc-950 transition-transform active:scale-[0.97]"
                    >
                        <LogIn className="size-4" />
                        Přihlásit a půjčit
                    </Link>
                    <Link
                        href={register()}
                        className="inline-flex h-12 items-center justify-center rounded-full border border-white/10 px-6 text-sm font-semibold text-white hover:bg-white/5"
                    >
                        Založit účet
                    </Link>
                </div>
            </div>
        );
    }

    if (blocker === 'limit') {
        return (
            <PanelText
                title="Máte půjčeno maximum"
                text={`Najednou můžete mít ${maxLoans} ${plural(maxLoans, ['knihu', 'knihy', 'knih'])}. Nejdřív nějakou vraťte.`}
            />
        );
    }

    return (
        <div className="space-y-4">
            <PanelText
                title="Kniha je v regálu"
                text={`Půjčujeme na ${loanDays} dní. Když si ji vezmete dnes, vrátíte ji do ${formatDate(dueIfBorrowedToday)}.`}
            />
            <Form {...store.form(book.id)} options={{ preserveScroll: true }}>
                {({ processing }) => (
                    <button
                        type="submit"
                        disabled={processing}
                        className="inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-white px-8 text-sm font-semibold text-zinc-950 transition-[background-color,transform] duration-150 hover:bg-zinc-200 active:scale-[0.97] disabled:opacity-60 sm:w-auto"
                    >
                        {processing ? (
                            <Spinner />
                        ) : (
                            <BookCheck className="size-4" />
                        )}
                        Vypůjčit knihu
                    </button>
                )}
            </Form>
        </div>
    );
}

function PanelText({
    title,
    text,
    tone = 'default',
}: {
    title: string;
    text: string;
    tone?: 'default' | 'danger';
}) {
    return (
        <div className="flex gap-3">
            <CalendarDays
                className={
                    tone === 'danger'
                        ? 'mt-0.5 size-5 shrink-0 text-rose-300'
                        : 'mt-0.5 size-5 shrink-0 text-gold'
                }
            />
            <div>
                <p className="font-medium text-white">{title}</p>
                <p
                    className={
                        tone === 'danger'
                            ? 'mt-1 text-sm text-rose-200/80'
                            : 'mt-1 text-sm text-zinc-400'
                    }
                >
                    {text}
                </p>
            </div>
        </div>
    );
}

function ReturnButton({ loanId, label }: { loanId: number; label: string }) {
    return (
        <Form {...returnMethod.form(loanId)} options={{ preserveScroll: true }}>
            {({ processing }) => (
                <button
                    type="submit"
                    disabled={processing}
                    className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-full border border-white/15 px-5 text-sm font-semibold text-white transition-[background-color,transform] duration-150 hover:bg-white/5 active:scale-[0.97] disabled:opacity-60"
                >
                    {processing ? <Spinner /> : <Undo2 className="size-4" />}
                    {label}
                </button>
            )}
        </Form>
    );
}
