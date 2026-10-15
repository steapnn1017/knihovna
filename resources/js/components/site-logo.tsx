import { Link } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';

/** Logo v navigaci: kulatý odznak s ikonou + název. */
export function SiteLogo({ onClick }: { onClick?: () => void }) {
    return (
        <Link
            href={home()}
            onClick={onClick}
            className="flex items-center gap-2.5 rounded-full py-1 pr-3 pl-1 transition-colors hover:bg-white/5"
        >
            <span className="flex size-9 items-center justify-center rounded-full bg-white text-zinc-950">
                <AppLogoIcon className="size-[18px]" />
            </span>
            <span className="text-[15px] font-semibold tracking-tight text-white">
                Knihovna
            </span>
        </Link>
    );
}
