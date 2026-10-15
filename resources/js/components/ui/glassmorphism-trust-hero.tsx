import { Link } from '@inertiajs/react';
import { ArrowRight, Star } from 'lucide-react';
import type { ComponentType, ReactNode, SVGProps } from 'react';

/*
 * Glassmorphism hero (21st.dev „glassmorphism-trust-hero“), upravený pro knihovnu.
 *
 * Rozložení, třídy a animace jsou převzaté z originálu. Změny:
 *  - texty, čísla a položky běžícího pásu přicházejí přes props (z databáze),
 *    takže nic není vymyšlené,
 *  - tlačítka jsou Inertia <Link> (navigace bez znovunačtení stránky),
 *  - pozadí je fotka knihovny z Unsplash (public/images),
 *  - animace se vypnou při „omezit pohyb“ (prefers-reduced-motion),
 *  - nadpis je o stupeň menší, aby se hero vešel na jednu obrazovku.
 */

type Icon = ComponentType<SVGProps<SVGSVGElement>>;

export type HeroAction = {
    label: string;
    href: string;
    icon?: Icon;
};

type StatItemProps = { value: string; label: string };

export type HeroProps = {
    badge: string;
    title: { start: ReactNode; highlight: ReactNode; end: ReactNode };
    description: string;
    primaryAction: HeroAction;
    secondaryAction?: HeroAction;
    backgroundImage: string;
    stat: { value: string; label: string; icon: Icon };
    progress: { label: string; value: number; display: string };
    miniStats: [StatItemProps, StatItemProps, StatItemProps];
    tags: { label: string; live?: boolean; icon?: Icon }[];
    marquee: { title: string; items: { name: string; icon: Icon }[] };
};

// --- SUB-COMPONENTS ---
const StatItem = ({ value, label }: StatItemProps) => (
    <div className="flex cursor-default flex-col items-center justify-center transition-transform hover:-translate-y-1">
        <span className="text-xl font-bold text-white tabular-nums sm:text-2xl">
            {value}
        </span>
        <span className="text-[10px] font-medium tracking-wider text-zinc-400 uppercase sm:text-xs">
            {label}
        </span>
    </div>
);

// --- MAIN COMPONENT ---
export default function HeroSection({
    badge,
    title,
    description,
    primaryAction,
    secondaryAction,
    backgroundImage,
    stat,
    progress,
    miniStats,
    tags,
    marquee,
}: HeroProps) {
    const SecondaryIcon = secondaryAction?.icon;
    const StatIcon = stat.icon;

    return (
        <div className="relative w-full overflow-hidden bg-zinc-950 font-sans text-white">
            {/*
        SCOPED ANIMATIONS
      */}
            <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-33.333%); }
        }
        .animate-fade-in {
          animation: fadeSlideIn 0.8s cubic-bezier(0.23, 1, 0.32, 1) forwards;
          opacity: 0;
        }
        .animate-marquee {
          animation: marquee 40s linear infinite; /* Slower for readability */
        }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        .delay-500 { animation-delay: 0.5s; }
        @media (prefers-reduced-motion: reduce) {
          .animate-fade-in { animation: none; opacity: 1; }
          .animate-marquee { animation: none; }
        }
      `}</style>

            {/* Background Image with Gradient Mask */}
            <div
                aria-hidden
                className="absolute inset-0 z-0 bg-cover bg-center opacity-40"
                style={{
                    backgroundImage: `url(${backgroundImage})`,
                    maskImage:
                        'linear-gradient(180deg, transparent, black 0%, black 70%, transparent)',
                    WebkitMaskImage:
                        'linear-gradient(180deg, transparent, black 0%, black 70%, transparent)',
                }}
            />

            <div className="relative z-10 mx-auto max-w-7xl px-4 pt-28 pb-12 sm:px-6 md:pt-32 md:pb-20 lg:px-8">
                <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-8">
                    {/* --- LEFT COLUMN --- */}
                    <div className="flex flex-col justify-center space-y-8 pt-8 lg:col-span-7">
                        {/* Badge */}
                        <div className="animate-fade-in delay-100">
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur-md transition-colors hover:bg-white/10">
                                <span className="flex items-center gap-2 text-[10px] font-semibold tracking-wider text-zinc-300 uppercase sm:text-xs">
                                    {badge}
                                    <Star className="h-3.5 w-3.5 fill-gold text-gold" />
                                </span>
                            </div>
                        </div>

                        {/* Heading */}
                        <h1
                            className="animate-fade-in pb-2 text-5xl leading-[0.95] font-medium tracking-tighter delay-200 sm:text-6xl lg:text-7xl"
                            style={{
                                maskImage:
                                    'linear-gradient(180deg, black 0%, black 80%, transparent 100%)',
                                WebkitMaskImage:
                                    'linear-gradient(180deg, black 0%, black 80%, transparent 100%)',
                            }}
                        >
                            {title.start}
                            <br />
                            <span className="bg-gradient-to-br from-white via-white to-gold bg-clip-text text-transparent">
                                {title.highlight}
                            </span>
                            <br />
                            {title.end}
                        </h1>

                        {/* Description */}
                        <p className="animate-fade-in max-w-xl text-lg leading-relaxed text-zinc-400 delay-300">
                            {description}
                        </p>

                        {/* CTA Buttons */}
                        <div className="animate-fade-in flex flex-col gap-4 delay-400 sm:flex-row">
                            <Link
                                href={primaryAction.href}
                                className="group inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-semibold text-zinc-950 transition-all hover:scale-[1.02] hover:bg-zinc-200 active:scale-[0.98]"
                            >
                                {primaryAction.label}
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Link>

                            {secondaryAction && (
                                <Link
                                    href={secondaryAction.href}
                                    className="group inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-8 py-4 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:border-white/20 hover:bg-white/10 active:scale-[0.98]"
                                >
                                    {SecondaryIcon && (
                                        <SecondaryIcon className="h-4 w-4" />
                                    )}
                                    {secondaryAction.label}
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* --- RIGHT COLUMN --- */}
                    <div className="space-y-6 lg:col-span-5 lg:mt-12">
                        {/* Stats Card */}
                        <div className="animate-fade-in relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl delay-500">
                            {/* Card Glow Effect */}
                            <div className="pointer-events-none absolute top-0 right-0 -mt-16 -mr-16 h-64 w-64 rounded-full bg-white/5 blur-3xl" />

                            <div className="relative z-10">
                                <div className="mb-8 flex items-center gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
                                        <StatIcon className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <div className="text-3xl font-bold tracking-tight text-white tabular-nums">
                                            {stat.value}
                                        </div>
                                        <div className="text-sm text-zinc-400">
                                            {stat.label}
                                        </div>
                                    </div>
                                </div>

                                {/* Progress Bar Section */}
                                <div className="mb-8 space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-zinc-400">
                                            {progress.label}
                                        </span>
                                        <span className="font-medium text-white tabular-nums">
                                            {progress.display}
                                        </span>
                                    </div>
                                    <div
                                        className="h-2 w-full overflow-hidden rounded-full bg-zinc-800/50"
                                        role="progressbar"
                                        aria-valuenow={progress.value}
                                        aria-valuemin={0}
                                        aria-valuemax={100}
                                        aria-label={progress.label}
                                    >
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-white to-zinc-400"
                                            style={{ width: `${progress.value}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="mb-6 h-px w-full bg-white/10" />

                                {/* Mini Stats Grid */}
                                <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] gap-4 text-center">
                                    <StatItem {...miniStats[0]} />
                                    <div className="mx-auto h-full w-px bg-white/10" />
                                    <StatItem {...miniStats[1]} />
                                    <div className="mx-auto h-full w-px bg-white/10" />
                                    <StatItem {...miniStats[2]} />
                                </div>

                                {/* Tag Pills */}
                                <div className="mt-8 flex flex-wrap gap-2">
                                    {tags.map((tag) => {
                                        const TagIcon = tag.icon;

                                        return (
                                            <div
                                                key={tag.label}
                                                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-medium tracking-wide text-zinc-300 uppercase"
                                            >
                                                {tag.live && (
                                                    <span className="relative flex h-2 w-2">
                                                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75 motion-reduce:animate-none"></span>
                                                        <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                                                    </span>
                                                )}
                                                {TagIcon && (
                                                    <TagIcon className="h-3 w-3 text-gold" />
                                                )}
                                                {tag.label}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Marquee Card */}
                        <div className="animate-fade-in relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 py-8 backdrop-blur-xl delay-500">
                            <h3 className="mb-6 px-8 text-sm font-medium text-zinc-400">
                                {marquee.title}
                            </h3>

                            <div
                                className="relative flex overflow-hidden"
                                style={{
                                    maskImage:
                                        'linear-gradient(to right, transparent, black 20%, black 80%, transparent)',
                                    WebkitMaskImage:
                                        'linear-gradient(to right, transparent, black 20%, black 80%, transparent)',
                                }}
                            >
                                <div className="animate-marquee flex gap-12 px-4 whitespace-nowrap">
                                    {/* Triple list for seamless loop */}
                                    {[
                                        ...marquee.items,
                                        ...marquee.items,
                                        ...marquee.items,
                                    ].map((item, i) => (
                                        <div
                                            key={i}
                                            aria-hidden={
                                                i >= marquee.items.length
                                            }
                                            className="flex cursor-default items-center gap-2 opacity-50 transition-all hover:scale-105 hover:opacity-100"
                                        >
                                            <item.icon className="h-5 w-5 text-gold" />
                                            <span className="text-lg font-bold tracking-tight text-white">
                                                {item.name}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
