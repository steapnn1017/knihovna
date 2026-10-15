# Knihovna

Webová aplikace pro půjčování knih. Na první pohled je vidět, **která kniha je v regálu (dostupná)** a **která je vypůjčená** (a do kdy). Čtenář si dostupnou knihu půjčí jedním kliknutím, knihovník přidává nové knihy z veřejné databáze **Open Library** (bez API klíče).

Postaveno na **Laravel 13** + **Inertia + React (TypeScript)** + **Tailwind CSS 4**. Design vychází ze dvou komponent z 21st.dev (skleněný hero a vějíř obálek).

---

## Co aplikace umí

| Kdo                      | Co může                                                                                                                                                      |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Kdokoli (i nepřihlášený) | prohlížet katalog, hledat podle názvu/autora, filtrovat **Vše / Dostupné / Vypůjčené** a podle žánru, otevřít detail knihy                                   |
| Čtenář (přihlášený)      | **vypůjčit** dostupnou knihu (na 30 dní, max. 5 knih najednou), **vrátit** ji, vidět své výpůjčky a historii                                                 |
| Knihovník                | navíc **přidávat knihy z Open Library**, odebírat knihy z katalogu, vidět **všechny** vypůjčené knihy (kdo, do kdy, co je po termínu) a vracet je za čtenáře |

Po termínu vrácení se výpůjčka zbarví do růžova („3 dny po termínu“).

---

## Spuštění (krok za krokem)

Potřebuješ: **PHP 8.3+**, **Composer**, **Node.js 22+** (na tomhle Macu je vše přes Herd Lite / nvm).

```bash
cd "~/Claude Projects/knihovna-app"

composer install              # PHP balíčky
npm install                   # JavaScript balíčky
cp .env.example .env          # jen poprvé (soubor .env už existuje)
php artisan key:generate      # jen poprvé
php artisan migrate:fresh --seed   # vytvoří tabulky a naplní je ukázkovými daty
npm run build                 # sestaví frontend (React → public/build)
php artisan serve --port=8010 # spustí server
```

Pak otevři **http://127.0.0.1:8010**

> Port 8010 je zvolený proto, že 8000 používá jiný projekt (laravel-app).
> Při úpravách frontendu místo `npm run build` pusť v druhém terminálu `npm run dev` - změny se projeví hned.

### Testovací účty (heslo všude `heslo123`)

| E-mail                                       | Role                                                     |
| -------------------------------------------- | -------------------------------------------------------- |
| `knihovnik@knihovna.test`                    | knihovnice Jana (přidávání knih, přehled všech výpůjček) |
| `ctenar@knihovna.test`                       | čtenář Tomáš (má půjčené 3 knihy, jedna je po termínu)   |
| `petra@knihovna.test`, `lukas@knihovna.test` | další čtenáři                                            |

Nový účet si lze založit i přes **Založit účet**.

---

## Odkud jsou knihy (API)

Používá se **Open Library** (https://openlibrary.org) od Internet Archive - je zdarma a **nepotřebuje API klíč**. Aplikace se jen představí v hlavičce `User-Agent` (nastavení v `.env`, proměnná `OPENLIBRARY_USER_AGENT`).

- **Úvodní data**: 37 skutečných knih v `database/data/books.json` (staženo z Open Library, názvy přeložené do češtiny). Díky tomu seed funguje i bez internetu.
- **Přidání dalších knih v aplikaci**: přihlas se jako knihovník → **Přidat knihy** → vyhledej (např. „Karel Čapek“) → **Přidat**. Název, autor, rok, obálka a popis se stáhnou automaticky.
- **Přidání z terminálu**:
    ```bash
    php artisan knihy:import "Agatha Christie" --limit=5
    ```
- **Obálky** se načítají přímo z `covers.openlibrary.org` (nic se neukládá na disk).

---

## Jak se pozná, že je kniha vypůjčená?

V tabulce `books` **není** žádný sloupec „stav“. Stav se počítá z tabulky `loans` (výpůjčky):

- kniha má výpůjčku, kde `returned_at` je **prázdné** → **vypůjčená**
- jinak → **dostupná**

Vrácením se do `returned_at` zapíše datum a čas, výpůjčka zůstane jako historie. Díky tomu se stav nikdy nemůže „rozejít“ se skutečností. Logika je v `app/Models/Book.php` (`activeLoan`, `scopeAvailable`, `scopeBorrowed`).

Při půjčování běží kontrola i zápis v **databázové transakci**, takže si stejnou knihu nemohou ve stejné chvíli půjčit dva lidé.

---

## Testy

```bash
php artisan test
```

42 testů (z toho 13 pro knihovnu v `tests/Feature/LibraryTest.php`): dostupnost a filtry, půjčení, nemožnost půjčit vypůjčenou knihu, limit 5 knih, vracení (vlastní vs. cizí), knihovník, import z Open Library (s falešnou odpovědí API), převod textu z Open Library do správné podoby Unicode.

---

## Design

- **Tmavý vzhled** (zinc-950), matné sklo (glassmorphism), jediný barevný akcent = zlatá `#ffcd75` z hero komponenty. Písmo **Geist** (uložené lokálně, bez Google Fonts).
- **`resources/js/components/ui/glassmorphism-trust-hero.tsx`** - hero z 21st.dev. Texty a čísla jdou z databáze (počet knih, kolik je dostupných, autoři v běžícím pásu), pozadí je fotka knihovny z Unsplash.
- **`resources/js/components/ui/card-fan-carousel.tsx`** - vějíř obálek (GSAP). Klik na obálku otevře detail knihy. Komponenta neměla vlastní CSS pro karty - je doplněné v `resources/css/app.css` (sekce „Vějíř obálek“).
- Obě komponenty respektují nastavení „omezit pohyb“ (reduced motion).
- Funguje na mobilu (od 375 px), menu se na telefonu rozbalí přes celou obrazovku.

---

## Časté otázky

**Kde změním výpůjční dobu nebo limit knih?**
V `app/Models/Loan.php` - konstanty `LOAN_DAYS` (30) a `MAX_ACTIVE_PER_USER` (5).

**Jak udělám z někoho knihovníka?**

```bash
php artisan tinker
>>> App\Models\User::where('email', 'neco@email.cz')->first()->forceFill(['is_librarian' => true])->save();
```

(Roli si nikdo nemůže nastavit sám přes formulář - sloupec není „fillable“.)

**Proč se datum vrácení počítá „do půlnoci“?**
Termín je vždy do konce dne v českém čase (`APP_TIMEZONE=Europe/Prague`). Kdyby aplikace běžela v UTC, kniha vrácená 31. 10. ve 23:59 by se v Česku zobrazila jako 1. 11.

**Proč jsou názvy některých knih anglicky?**
Knihy přidané z Open Library mají název z jejich databáze (často anglický). Úvodních 37 knih má české názvy.

**Ověřování e-mailu?**
Je vypnuté (školní aplikace bez odesílání pošty) - v `config/fortify.php`.

---

## Slovníček

| Pojem             | Význam                                                                   |
| ----------------- | ------------------------------------------------------------------------ |
| **Model**         | PHP třída pro jednu tabulku (`Book` = `books`, `Loan` = `loans`)         |
| **Migrace**       | soubor, který vytvoří/změní tabulku (`database/migrations`)              |
| **Seeder**        | naplní databázi ukázkovými daty                                          |
| **Controller**    | přijme požadavek z prohlížeče, něco udělá a vrátí stránku                |
| **Inertia**       | most mezi Laravelem a Reactem - controller pošle data, React je vykreslí |
| **Policy / Gate** | pravidla „kdo smí co“ (vrátit knihu, spravovat katalog)                  |
| **Resource**      | určuje, jaká data o knize/výpůjčce dostane frontend                      |
| **Wayfinder**     | generuje TypeScript funkce pro routy (`resources/js/routes`)             |

Podrobná mapa souborů je v **[STRUKTURA.md](STRUKTURA.md)**.
