import { Link, usePage } from '@inertiajs/react';
import { SiteLogo } from '@/components/site-logo';
import { home, login, register } from '@/routes';
import { index as booksIndex } from '@/routes/books';
import { index as loansIndex } from '@/routes/loans';

/** Patička se sloupci odkazů a informací o zdroji dat. */
export function SiteFooter() {
    const { auth } = usePage().props;

    return (
        <footer className="mt-24 border-t border-white/10">
            <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr] lg:px-8">
                <div className="space-y-4">
                    <SiteLogo />
                    <p className="max-w-sm text-sm leading-relaxed text-zinc-400">
                        Online katalog a výpůjčky. Výpůjční doba je 30 dní,
                        najednou můžete mít půjčeno až 5 knih.
                    </p>
                </div>

                <div>
                    <h2 className="mb-3 text-sm font-medium text-white">
                        Knihovna
                    </h2>
                    <ul className="space-y-2 text-sm text-zinc-400">
                        <li>
                            <Link href={home()} className="hover:text-white">
                                Úvod
                            </Link>
                        </li>
                        <li>
                            <Link
                                href={booksIndex()}
                                className="hover:text-white"
                            >
                                Katalog knih
                            </Link>
                        </li>
                        <li>
                            <Link
                                href={booksIndex({
                                    query: { stav: 'dostupne' },
                                })}
                                className="hover:text-white"
                            >
                                Dostupné hned
                            </Link>
                        </li>
                    </ul>
                </div>

                <div>
                    <h2 className="mb-3 text-sm font-medium text-white">
                        Čtenář
                    </h2>
                    <ul className="space-y-2 text-sm text-zinc-400">
                        {auth.user ? (
                            <li>
                                <Link
                                    href={loansIndex()}
                                    className="hover:text-white"
                                >
                                    Moje výpůjčky
                                </Link>
                            </li>
                        ) : (
                            <>
                                <li>
                                    <Link
                                        href={login()}
                                        className="hover:text-white"
                                    >
                                        Přihlášení
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href={register()}
                                        className="hover:text-white"
                                    >
                                        Registrace
                                    </Link>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </div>

            <div className="border-t border-white/5">
                <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-zinc-500 sm:flex-row sm:justify-between sm:px-6 lg:px-8">
                    <span>© {new Date().getFullYear()} Knihovna</span>
                    <span>
                        Údaje o knihách a obálky:{' '}
                        <a
                            href="https://openlibrary.org"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline decoration-white/20 underline-offset-4 hover:text-white"
                        >
                            Open Library
                        </a>
                    </span>
                </div>
            </div>
        </footer>
    );
}
