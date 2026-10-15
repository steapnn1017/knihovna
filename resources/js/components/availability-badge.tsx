import { AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { dueLabel, formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { Book } from '@/types';

/**
 * Štítek stavu knihy. Barva + ikona + text (ne jen barva - kvůli přístupnosti):
 *  - zelená   = dostupná, je v regálu
 *  - šedá     = vypůjčená, s datem vrácení
 *  - růžová   = vypůjčená a už po termínu
 */
export function AvailabilityBadge({
    book,
    size = 'sm',
    className,
}: {
    book: Pick<Book, 'is_available' | 'loan'>;
    size?: 'sm' | 'md';
    className?: string;
}) {
    const base = cn(
        'inline-flex items-center gap-1.5 rounded-full border font-medium whitespace-nowrap',
        size === 'sm' ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1.5 text-xs',
        className,
    );

    if (book.is_available || !book.loan) {
        return (
            <span
                className={cn(
                    base,
                    'border-emerald-400/20 bg-emerald-400/10 text-emerald-300',
                )}
            >
                <CheckCircle2 className="size-3.5" />
                Dostupná
            </span>
        );
    }

    if (book.loan.is_overdue) {
        return (
            <span
                className={cn(
                    base,
                    'border-rose-400/25 bg-rose-400/10 text-rose-300',
                )}
                title={`Měla být vrácena ${formatDate(book.loan.due_at)}`}
            >
                <AlertTriangle className="size-3.5" />
                Vypůjčená · po termínu
            </span>
        );
    }

    return (
        <span
            className={cn(base, 'border-white/10 bg-white/5 text-zinc-300')}
            title={`Vrátit do ${formatDate(book.loan.due_at)} (${dueLabel(book.loan.due_at)})`}
        >
            <Clock className="size-3.5" />
            Vypůjčená do {formatDate(book.loan.due_at)}
        </span>
    );
}
