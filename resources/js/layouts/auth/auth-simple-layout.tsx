import { SiteLogo } from '@/components/site-logo';
import type { AuthLayoutProps } from '@/types';

/**
 * Přihlášení / registrace: skleněná karta nad tlumenou fotkou regálů.
 */
export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-zinc-950 p-4 text-white md:p-10">
            <div
                aria-hidden
                className="absolute inset-0 bg-cover bg-center opacity-25"
                style={{
                    backgroundImage: 'url(/images/regaly.jpg)',
                    maskImage:
                        'radial-gradient(ellipse 80% 70% at 50% 40%, black, transparent)',
                    WebkitMaskImage:
                        'radial-gradient(ellipse 80% 70% at 50% 40%, black, transparent)',
                }}
            />

            <div className="relative w-full max-w-md">
                <div className="mb-8 flex justify-center">
                    <SiteLogo />
                </div>

                <div className="animate-in rounded-3xl glass bg-zinc-950/60 p-6 shadow-2xl duration-500 fade-in slide-in-from-bottom-2 sm:p-8">
                    <div className="mb-8 space-y-2 text-center">
                        <h1 className="text-2xl font-medium tracking-tight">
                            {title}
                        </h1>
                        {description && (
                            <p className="text-sm text-zinc-400">
                                {description}
                            </p>
                        )}
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
