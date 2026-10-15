/**
 * Knihovna má jen tmavý vzhled (design podle zadaných komponent).
 * Hook zachovává původní API ze starter kitu, aby komponenty, které ho používají
 * (toasty, dialog dvoufázového ověření), fungovaly beze změny.
 */
export type ResolvedAppearance = 'light' | 'dark';
export type Appearance = ResolvedAppearance | 'system';

export type UseAppearanceReturn = {
    readonly appearance: Appearance;
    readonly resolvedAppearance: ResolvedAppearance;
    readonly updateAppearance: (mode: Appearance) => void;
};

export function initializeTheme(): void {
    if (typeof document !== 'undefined') {
        document.documentElement.classList.add('dark');
        document.documentElement.style.colorScheme = 'dark';
    }
}

export function useAppearance(): UseAppearanceReturn {
    return {
        appearance: 'dark',
        resolvedAppearance: 'dark',
        updateAppearance: () => {},
    };
}
