import { Form, Head, Link } from '@inertiajs/react';
import { BookOpen, Undo2 } from 'lucide-react';
import { BookCover } from '@/components/book-cover';
import { PageHeader } from '@/components/page-header';
import { Spinner } from '@/components/ui/spinner';
import { daysUntil, dueLabel, formatDate, plural } from '@/lib/format';
import { cn } from '@/lib/utils';
import { index as booksIndex, show } from '@/routes/books';
import { returnMethod } from '@/routes/loans';
import type { Loan, ResourceCollection } from '@/types';

type Props = {
    active: ResourceCollection<Loan>;
    history: ResourceCollection<Loan>;
    maxLoans: number;
    allActive: ResourceCollection<Loan> | null;
};

export default function LoansIndex({
    active,
    history,
    maxLoans,
    allActive,
}: Props) {
    const overdue = active.data.filter((loan) => loan.is_overdue).length;

    return (
        <>
            <Head title="Moje výpůjčky" />

            <div className="mx-auto max-w-5xl px-4 pt-32 sm:px-6 lg:px-8">
                <PageHeader
                    title="Moje výpůjčky"
                    description={
                        active.data.length === 0
                            ? 'Momentálně nemáte nic půjčeno.'
                            : `Máte půjčeno ${active.data.length} z ${maxLoans} ${plural(maxLoans, ['knihy', 'knih', 'knih'])}.${overdue > 0 ? ` ${overdue} ${plural(overdue, ['je', 'jsou', 'je'])} po termínu.` : ''}`
                    }
                />

                {/* Aktivní výpůjčky */}
                <section aria-label="Aktivní výpůjčky" className="mt-10">
                    {active.data.length === 0 ? (
                        <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-white/10 px-6 py-16 text-center">
                            <BookOpen className="size-8 text-zinc-500" />
                            <p className="text-zinc-400">
                                Vyberte si něco z katalogu, dostupné knihy mají
                                zelený štítek.
                            </p>
                            <Link
                                href={booksIndex({
                                    query: { stav: 'dostupne' },
                                })}
                                className="inline-flex h-11 items-center rounded-full bg-white px-6 text-sm font-semibold text-zinc-950 active:scale-[0.97]"
                            >
                                Dostupné knihy
                            </Link>
                        </div>
                    ) : (
                        <ul className="grid gap-4 sm:grid-cols-2">
                            {active.data.map((loan) => (
                                <ActiveLoanCard key={loan.id} loan={loan} />
                            ))}
                        </ul>
                    )}
                </section>

                {/* Knihovník: všechny nevrácené výpůjčky */}
                {allActive && (
                    <section aria-labelledby="all-heading" className="mt-20">
                        <h2
                            id="all-heading"
                            className="text-2xl font-medium tracking-tight text-white"
                        >
                            Všechny vypůjčené knihy
                        </h2>
                        <p className="mt-1 mb-6 text-sm text-zinc-400">
                            Přehled pro knihovníka. Nahoře ty, které se měly
                            vrátit nejdřív.
                        </p>
                        <div className="overflow-hidden rounded-3xl border border-white/10">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-white/[0.03] text-xs text-zinc-500">
                                    <tr>
                                        <th
                                            scope="col"
                                            className="px-4 py-3 font-medium"
                                        >
                                            Kniha
                                        </th>
                                        <th
                                            scope="col"
                                            className="hidden px-4 py-3 font-medium md:table-cell"
                                        >
                                            Čtenář
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-4 py-3 font-medium"
                                        >
                                            Vrátit do
                                        </th>
                                        <th scope="col" className="px-4 py-3">
                                            <span className="sr-only">
                                                Akce
                                            </span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {allActive.data.map((loan) => (
                                        <tr
                                            key={loan.id}
                                            className={cn(
                                                loan.is_overdue &&
                                                    'bg-rose-400/[0.04]',
                                            )}
                                        >
                                            <td className="px-4 py-3">
                                                <Link
                                                    href={show(loan.book.id)}
                                                    className="font-medium text-white hover:underline"
                                                >
                                                    {loan.book.title}
                                                </Link>
                                                <p className="text-xs text-zinc-500 md:hidden">
                                                    {loan.borrower?.name}
                                                </p>
                                            </td>
                                            <td className="hidden px-4 py-3 text-zinc-300 md:table-cell">
                                                {loan.borrower?.name}
                                                <span className="block text-xs text-zinc-500">
                                                    {loan.borrower?.email}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <span
                                                    className={
                                                        loan.is_overdue
                                                            ? 'text-rose-300'
                                                            : 'text-zinc-300'
                                                    }
                                                >
                                                    {formatDate(loan.due_at)}
                                                </span>
                                                <span className="block text-xs text-zinc-500">
                                                    {dueLabel(loan.due_at)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <ReturnForm
                                                    loanId={loan.id}
                                                    compact
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}

                {/* Historie */}
                {history.data.length > 0 && (
                    <section
                        aria-labelledby="history-heading"
                        className="mt-20"
                    >
                        <h2
                            id="history-heading"
                            className="mb-6 text-2xl font-medium tracking-tight text-white"
                        >
                            Už vrácené
                        </h2>
                        <ul className="grid gap-x-8 sm:grid-cols-2">
                            {history.data.map((loan) => (
                                <li key={loan.id}>
                                    <Link
                                        href={show(loan.book.id)}
                                        className="flex items-center gap-4 rounded-2xl p-2 transition-colors hover:bg-white/5"
                                    >
                                        <BookCover
                                            src={loan.book.cover_url}
                                            title={loan.book.title}
                                            author={loan.book.author}
                                            className="w-10 shrink-0 rounded-md"
                                        />
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium text-white">
                                                {loan.book.title}
                                            </p>
                                            <p className="text-xs text-zinc-500 tabular-nums">
                                                {formatDate(loan.borrowed_at)}{' '}
                                                až{' '}
                                                {loan.returned_at &&
                                                    formatDate(
                                                        loan.returned_at,
                                                    )}
                                            </p>
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}
            </div>
        </>
    );
}

function ActiveLoanCard({ loan }: { loan: Loan }) {
    // Kolik z výpůjční doby už uběhlo - pro tenký ukazatel průběhu
    const total = Math.max(
        1,
        daysUntil(loan.due_at) - daysUntil(loan.borrowed_at),
    );
    const elapsed = Math.min(total, Math.max(0, -daysUntil(loan.borrowed_at)));
    const percent = Math.round((elapsed / total) * 100);

    return (
        <li className="flex gap-5 rounded-3xl glass p-4">
            <Link href={show(loan.book.id)} className="w-24 shrink-0">
                <BookCover
                    src={loan.book.cover_url}
                    title={loan.book.title}
                    author={loan.book.author}
                    className="rounded-lg"
                />
            </Link>
            <div className="flex min-w-0 flex-1 flex-col">
                <Link
                    href={show(loan.book.id)}
                    className="line-clamp-2 font-medium text-white hover:underline"
                >
                    {loan.book.title}
                </Link>
                <p className="truncate text-sm text-zinc-400">
                    {loan.book.author}
                </p>

                <div className="mt-auto space-y-3 pt-4">
                    <div className="space-y-1.5">
                        <div className="flex items-baseline justify-between gap-2 text-xs">
                            <span
                                className={
                                    loan.is_overdue
                                        ? 'font-medium text-rose-300'
                                        : 'text-zinc-300'
                                }
                            >
                                {loan.is_overdue
                                    ? dueLabel(loan.due_at)
                                    : `Vrátit do ${formatDate(loan.due_at)}`}
                            </span>
                            {!loan.is_overdue && (
                                <span className="text-zinc-500">
                                    {dueLabel(loan.due_at)}
                                </span>
                            )}
                        </div>
                        <div className="h-1 overflow-hidden rounded-full bg-white/10">
                            <div
                                className={cn(
                                    'h-full rounded-full',
                                    loan.is_overdue ? 'bg-rose-400' : 'bg-gold',
                                )}
                                style={{
                                    width: `${loan.is_overdue ? 100 : percent}%`,
                                }}
                            />
                        </div>
                    </div>
                    <ReturnForm loanId={loan.id} />
                </div>
            </div>
        </li>
    );
}

function ReturnForm({
    loanId,
    compact = false,
}: {
    loanId: number;
    compact?: boolean;
}) {
    return (
        <Form {...returnMethod.form(loanId)} options={{ preserveScroll: true }}>
            {({ processing }) => (
                <button
                    type="submit"
                    disabled={processing}
                    className={cn(
                        'inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-white/15 font-semibold text-white transition-[background-color,transform] duration-150 hover:bg-white/5 active:scale-[0.97] disabled:opacity-60',
                        compact ? 'h-9 px-3.5 text-xs' : 'h-10 px-4 text-sm',
                    )}
                >
                    {processing ? <Spinner /> : <Undo2 className="size-4" />}
                    Vrátit
                </button>
            )}
        </Form>
    );
}
