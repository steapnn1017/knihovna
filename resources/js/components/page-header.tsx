import type { ReactNode } from 'react';

/** Hlavička podstránky: nadpis, krátký popis a volitelný obsah vpravo/pod ním. */
export function PageHeader({
    title,
    description,
    children,
}: {
    title: string;
    description?: ReactNode;
    children?: ReactNode;
}) {
    return (
        <div className="animate-in space-y-6 duration-500 fade-in slide-in-from-bottom-2">
            <div className="space-y-3">
                <h1 className="text-4xl font-medium tracking-tighter text-white md:text-5xl">
                    {title}
                </h1>
                {description && (
                    <p className="max-w-2xl text-base leading-relaxed text-pretty text-zinc-400">
                        {description}
                    </p>
                )}
            </div>
            {children}
        </div>
    );
}
