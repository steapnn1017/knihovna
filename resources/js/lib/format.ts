/**
 * Pomocné funkce pro české formátování dat a skloňování.
 *
 * Všechna data se zobrazují v pražském čase - stejném, ve kterém je počítá
 * server (APP_TIMEZONE=Europe/Prague). Termín „do 31. 10.“ tak bude všude stejný,
 * i kdyby měl čtenář v počítači nastavené jiné časové pásmo.
 */

const TIME_ZONE = 'Europe/Prague';

const dateFormatter = new Intl.DateTimeFormat('cs-CZ', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    timeZone: TIME_ZONE,
});

// Rozloží datum na rok/měsíc/den v pražském čase
const partsFormatter = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: TIME_ZONE,
});

/** Pořadové číslo dne (bez času) - rozdíl dvou čísel = počet dní mezi daty. */
function dayNumber(date: Date): number {
    const [y, m, d] = partsFormatter.format(date).split('-').map(Number);

    return Date.UTC(y, m - 1, d) / 86_400_000;
}

/** 2026-10-31T23:59:59+01:00 → „31. 10. 2026“ */
export function formatDate(iso: string): string {
    return dateFormatter.format(new Date(iso));
}

/** Kolik celých dní zbývá do data (záporné = po termínu). */
export function daysUntil(iso: string): number {
    return dayNumber(new Date(iso)) - dayNumber(new Date());
}

/**
 * České skloňování podle čísla: plural(3, ['kniha', 'knihy', 'knih']) → „knihy“
 */
export function plural(
    n: number,
    forms: [one: string, few: string, many: string],
): string {
    if (n === 1) {
        return forms[0];
    }

    if (n >= 2 && n <= 4) {
        return forms[1];
    }

    return forms[2];
}

/** Lidský popis termínu vrácení: „vrátit zítra“, „za 5 dní“, „3 dny po termínu“ */
export function dueLabel(iso: string): string {
    const days = daysUntil(iso);

    if (days < 0) {
        const late = Math.abs(days);

        return `${late} ${plural(late, ['den', 'dny', 'dní'])} po termínu`;
    }

    if (days === 0) {
        return 'vrátit dnes';
    }

    if (days === 1) {
        return 'vrátit zítra';
    }

    return `za ${days} ${plural(days, ['den', 'dny', 'dní'])}`;
}
