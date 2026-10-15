import type { ReactNode } from 'react';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';

/**
 * Hlavní rozložení celé aplikace: plovoucí navigace, obsah, patička.
 * Nastavuje se automaticky v app.tsx podle názvu stránky.
 */
export default function SiteLayout({ children }: { children: ReactNode }) {
    return (
        <div className="relative flex min-h-dvh flex-col overflow-x-clip bg-zinc-950 text-white">
            {/* Jemná zlatá záře nahoře - stejný „světelný“ motiv jako v hero */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-[480px] bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(255,205,117,0.07),transparent)]"
            />
            <SiteHeader />
            <main className="relative flex-1">{children}</main>
            <SiteFooter />
        </div>
    );
}
