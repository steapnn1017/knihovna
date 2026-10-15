import { Link, usePage } from '@inertiajs/react';
import { LogIn } from 'lucide-react';
import { useEffect, useState } from 'react';
import { SiteLogo } from '@/components/site-logo';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserInfo } from '@/components/user-info';
import { UserMenuContent } from '@/components/user-menu-content';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn, toUrl } from '@/lib/utils';
import { home, login, logout, register } from '@/routes';
import { index as booksIndex } from '@/routes/books';
import { create as importCreate } from '@/routes/import';
import { edit as editProfile } from '@/routes/profile';
import { index as loansIndex } from '@/routes/loans';

/**
 * Plovoucí „pilulka“ navigace ze skla: logo vlevo, odkazy uprostřed,
 * účet / přihlášení vpravo. Na mobilu se rozbalí přes celou obrazovku.
 */
export function SiteHeader() {
    const { auth } = usePage().props;
    const { currentUrl, isCurrentUrl } = useCurrentUrl();
    const [open, setOpen] = useState(false);

    const links = [
        { label: 'Úvod', href: toUrl(home()), exact: true },
        { label: 'Katalog', href: toUrl(booksIndex()), exact: false },
        ...(auth.user
            ? [
                  {
                      label: 'Moje výpůjčky',
                      href: toUrl(loansIndex()),
                      exact: true,
                  },
              ]
            : []),
        ...(auth.user?.is_librarian
            ? [
                  {
                      label: 'Přidat knihy',
                      href: toUrl(importCreate()),
                      exact: true,
                  },
              ]
            : []),
    ];

    const isActive = (href: string, exact: boolean) =>
        isCurrentUrl(href, undefined, !exact);

    // Zavřít mobilní menu při přechodu na jinou stránku
    useEffect(() => setOpen(false), [currentUrl]);

    // Zamknout scroll stránky, když je mobilní menu otevřené
    useEffect(() => {
        document.body.style.overflow = open ? 'hidden' : '';

        return () => {
            document.body.style.overflow = '';
        };
    }, [open]);

    return (
        <>
            <header className="fixed inset-x-0 top-4 z-50 px-4">
                <nav
                    aria-label="Hlavní navigace"
                    className={cn(
                        'mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 rounded-full border border-white/10 pr-2 pl-2 shadow-[0_18px_44px_-22px_rgba(0,0,0,0.85)]',
                        // Při otevřeném menu bez blur - jinak by se z navigace stal
                        // „containing block“ pro fixed overlay a ten by se ořízl
                        open ? 'bg-zinc-900' : 'glass bg-zinc-950/60',
                    )}
                >
                    <SiteLogo />

                    <ul className="hidden items-center gap-1 md:flex">
                        {links.map((link) => {
                            const active = isActive(link.href, link.exact);

                            return (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        aria-current={
                                            active ? 'page' : undefined
                                        }
                                        className={cn(
                                            'relative rounded-full px-4 py-2 text-sm transition-colors duration-150',
                                            active
                                                ? 'text-white'
                                                : 'text-zinc-400 hover:bg-white/5 hover:text-white',
                                        )}
                                    >
                                        {link.label}
                                        {active && (
                                            <span className="absolute inset-x-4 -bottom-px h-px bg-gold" />
                                        )}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>

                    <div className="flex items-center gap-2">
                        {auth.user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger className="hidden cursor-pointer items-center gap-2 rounded-full py-1 pr-4 pl-1 text-sm transition-colors hover:bg-white/5 md:flex">
                                    <UserInfo user={auth.user} />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    className="w-60 rounded-2xl"
                                    align="end"
                                >
                                    <UserMenuContent user={auth.user} />
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <>
                                <Link
                                    href={login()}
                                    className="hidden rounded-full px-4 py-2 text-sm text-zinc-300 transition-colors hover:text-white md:block"
                                >
                                    Přihlásit
                                </Link>
                                <Link
                                    href={register()}
                                    className="hidden h-10 items-center rounded-full bg-white px-5 text-sm font-semibold text-zinc-950 transition-[background-color,transform] duration-150 hover:bg-zinc-200 active:scale-[0.97] md:inline-flex"
                                >
                                    Založit účet
                                </Link>
                            </>
                        )}

                        {/* Hamburger → křížek */}
                        <button
                            type="button"
                            onClick={() => setOpen((v) => !v)}
                            aria-expanded={open}
                            aria-controls="mobile-menu"
                            aria-label={open ? 'Zavřít menu' : 'Otevřít menu'}
                            className="relative flex size-10 cursor-pointer items-center justify-center rounded-full bg-white/5 text-white transition-colors hover:bg-white/10 md:hidden"
                        >
                            <span
                                className={cn(
                                    'absolute h-[1.5px] w-4 bg-current transition-transform duration-300 ease-[var(--ease-out-strong)]',
                                    open ? 'rotate-45' : '-translate-y-[3.5px]',
                                )}
                            />
                            <span
                                className={cn(
                                    'absolute h-[1.5px] w-4 bg-current transition-transform duration-300 ease-[var(--ease-out-strong)]',
                                    open ? '-rotate-45' : 'translate-y-[3.5px]',
                                )}
                            />
                        </button>
                    </div>
                </nav>
            </header>

            {/* Mobilní menu přes celou obrazovku */}
            <div
                id="mobile-menu"
                hidden={!open}
                className="fixed inset-0 z-40 flex flex-col bg-zinc-950 px-6 pt-28 pb-10 md:hidden"
            >
                <ul className="flex flex-col gap-1">
                    {links.map((link, i) => (
                        <li
                            key={link.href}
                            className="animate-in duration-300 fill-mode-both fade-in slide-in-from-bottom-2"
                            style={{ animationDelay: `${i * 40}ms` }}
                        >
                            <Link
                                href={link.href}
                                className={cn(
                                    'block py-3 text-3xl font-medium tracking-tight',
                                    isActive(link.href, link.exact)
                                        ? 'text-white'
                                        : 'text-zinc-500',
                                )}
                            >
                                {link.label}
                            </Link>
                        </li>
                    ))}
                </ul>

                <div className="mt-auto flex flex-col gap-3">
                    {auth.user ? (
                        <>
                            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                                <UserInfo user={auth.user} showEmail />
                            </div>
                            <Link
                                href={editProfile()}
                                className="flex h-12 items-center justify-center rounded-full border border-white/10 text-sm font-semibold text-white"
                            >
                                Nastavení účtu
                            </Link>
                            <Link
                                href={logout()}
                                as="button"
                                className="flex h-12 cursor-pointer items-center justify-center rounded-full bg-white text-sm font-semibold text-zinc-950"
                            >
                                Odhlásit se
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link
                                href={register()}
                                className="flex h-12 items-center justify-center rounded-full bg-white text-sm font-semibold text-zinc-950"
                            >
                                Založit účet
                            </Link>
                            <Link
                                href={login()}
                                className="flex h-12 items-center justify-center gap-2 rounded-full border border-white/10 text-sm font-semibold text-white"
                            >
                                <LogIn className="size-4" />
                                Přihlásit
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
