# Struktura projektu Knihovna

Mapa souborů, které tvoří aplikaci. Věci ze „starter kitu“ (přihlášení, nastavení účtu) jsou zmíněné jen krátce.

## Tahák: chci… → jdi do…

| Chci…                                             | Soubor                                                                             |
| ------------------------------------------------- | ---------------------------------------------------------------------------------- |
| změnit adresy stránek (URL)                       | `routes/web.php`                                                                   |
| změnit výpůjční dobu (30 dní) nebo limit (5 knih) | `app/Models/Loan.php`                                                              |
| upravit, jak se pozná dostupná/vypůjčená kniha    | `app/Models/Book.php` (`activeLoan`, `scopeAvailable`, `scopeBorrowed`)            |
| upravit logiku půjčení / vrácení                  | `app/Http/Controllers/LoanController.php`                                          |
| upravit katalog (hledání, filtry)                 | `app/Http/Controllers/BookController.php` + `resources/js/pages/books/index.tsx`   |
| upravit volání Open Library API                   | `app/Services/OpenLibrary.php`                                                     |
| upravit, kdo smí vracet knihy                     | `app/Policies/LoanPolicy.php`                                                      |
| upravit, kdo je knihovník / smí spravovat         | `app/Providers/AppServiceProvider.php` (Gate `manage-library`)                     |
| změnit úvodní knihy                               | `database/data/books.json` (pak `php artisan migrate:fresh --seed`)                |
| změnit testovací účty a ukázkové výpůjčky         | `database/seeders/DatabaseSeeder.php`                                              |
| upravit úvodní stránku                            | `resources/js/pages/welcome.tsx`                                                   |
| upravit hero (skleněná sekce nahoře)              | `resources/js/components/ui/glassmorphism-trust-hero.tsx`                          |
| upravit vějíř obálek                              | `resources/js/components/ui/card-fan-carousel.tsx` + CSS v `resources/css/app.css` |
| upravit navigaci / patičku                        | `resources/js/components/site-header.tsx`, `site-footer.tsx`                       |
| změnit barvy, písmo                               | `resources/css/app.css`                                                            |
| změnit české chybové hlášky                       | `lang/cs/validation.php`                                                           |

## Backend (PHP / Laravel)

```
app/
├── Console/Commands/ImportBooks.php   příkaz: php artisan knihy:import "dotaz"
├── Http/
│   ├── Controllers/
│   │   ├── HomeController.php         úvodní stránka (statistiky, vějíř, dostupné/vypůjčené)
│   │   ├── BookController.php         katalog, detail knihy, smazání (knihovník)
│   │   ├── LoanController.php         moje výpůjčky, půjčit, vrátit
│   │   ├── ImportController.php       hledání v Open Library + přidání knihy (knihovník)
│   │   └── Settings/…                 nastavení účtu (ze starter kitu)
│   └── Resources/
│       ├── BookResource.php           jaká data o knize jdou do Reactu (vč. stavu a termínu)
│       └── LoanResource.php           jaká data o výpůjčce jdou do Reactu
├── Models/
│   ├── Book.php                       kniha + výpočet dostupnosti
│   ├── Loan.php                       výpůjčka, termín vrácení, „po termínu“
│   └── User.php                       uživatel, příznak is_librarian
├── Policies/LoanPolicy.php            vrátit smí vlastník výpůjčky nebo knihovník
├── Providers/AppServiceProvider.php   Gate „manage-library“ (jen knihovník)
└── Services/OpenLibrary.php           komunikace s Open Library API (bez klíče)

config/services.php                    adresa Open Library, User-Agent, timeout
config/app.php                         časové pásmo Europe/Prague

database/
├── data/books.json                    37 skutečných knih (data z Open Library)
├── migrations/
│   ├── …add_is_librarian_to_users…    role knihovníka
│   ├── …create_books_table…           knihy
│   └── …create_loans_table…           výpůjčky (returned_at NULL = kniha je venku)
├── factories/                         náhodná data pro testy
└── seeders/                           BookSeeder (knihy) + DatabaseSeeder (účty, výpůjčky)

lang/cs/                               české hlášky (validace, přihlášení, hesla)
routes/web.php                         všechny URL aplikace
tests/Feature/LibraryTest.php          testy knihovny
```

### Tabulky

| Tabulka | Důležité sloupce                                                                                                                |
| ------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `users` | `name`, `email`, `password`, `is_librarian`                                                                                     |
| `books` | `title`, `original_title`, `author`, `year`, `pages`, `isbn`, `genre`, `description`, `cover_id`, `open_library_key` (unikátní) |
| `loans` | `book_id`, `user_id`, `borrowed_at`, `due_at`, `returned_at` (prázdné = ještě nevráceno)                                        |

## Frontend (React / TypeScript)

```
resources/
├── css/app.css                        barvy (tmavé téma), písmo Geist, třída .glass, CSS vějíře
├── js/
│   ├── app.tsx                        start Inertia, výběr layoutu podle stránky
│   ├── pages/                         stránky (název = to, co vrací controller)
│   │   ├── welcome.tsx                úvod
│   │   ├── books/index.tsx            katalog
│   │   ├── books/show.tsx             detail knihy + tlačítko Vypůjčit / Vrátit
│   │   ├── loans/index.tsx            moje výpůjčky (+ přehled pro knihovníka)
│   │   ├── admin/import.tsx           přidávání knih z Open Library
│   │   ├── auth/…                     přihlášení, registrace (přeloženo do češtiny)
│   │   └── settings/…                 profil, zabezpečení
│   ├── layouts/
│   │   ├── site-layout.tsx            navigace + obsah + patička
│   │   └── auth/auth-simple-layout.tsx  skleněná karta pro přihlášení
│   ├── components/
│   │   ├── ui/glassmorphism-trust-hero.tsx   komponenta z 21st.dev (hero)
│   │   ├── ui/card-fan-carousel.tsx          komponenta z 21st.dev (vějíř, GSAP)
│   │   ├── ui/…                       ostatní shadcn komponenty (tlačítka, dialogy…)
│   │   ├── site-header.tsx            plovoucí skleněná navigace, mobilní menu
│   │   ├── site-footer.tsx            patička
│   │   ├── book-card.tsx              karta knihy v mřížce
│   │   ├── book-cover.tsx             obálka (s náhradní obálkou, když chybí)
│   │   ├── availability-badge.tsx     štítek Dostupná / Vypůjčená / Po termínu
│   │   ├── page-header.tsx            nadpis podstránky
│   │   └── pagination.tsx             stránkování
│   ├── lib/format.ts                  české datum, „za 5 dní“, skloňování (kniha/knihy/knih)
│   ├── types/library.ts               TypeScript typy Book, Loan…
│   └── routes/, actions/              GENEROVANÉ Wayfinderem - neupravovat ručně
public/images/                         fotky z Unsplash (pozadí hero a přihlášení)
```

## Jak teče požadavek: „Vypůjčit knihu“

1. Na stránce `books/show.tsx` čtenář klikne na **Vypůjčit knihu**. Formulář (Inertia `<Form>`) pošle `POST /knihy/25/vypujcit`.
2. `routes/web.php` → middleware `auth` (musí být přihlášený) → `LoanController@store`.
3. Controller v **transakci** znovu načte knihu, zkontroluje, že je dostupná a že čtenář nemá už 5 knih, a vytvoří řádek v `loans` s termínem `Loan::dueDateFor(now())` (za 30 dní do půlnoci).
4. Uloží „toast“ zprávu (`Inertia::flash`) a vrátí se zpět na stránku.
5. Inertia stránku obnoví bez reloadu: štítek se změní na **Vypůjčená do …**, místo tlačítka Vypůjčit je **Vrátit knihu** a vpravo dole vyskočí potvrzení.
