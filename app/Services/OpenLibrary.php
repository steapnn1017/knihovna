<?php

namespace App\Services;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Normalizer;
use RuntimeException;

/**
 * Komunikace s Open Library API (https://openlibrary.org/developers/api).
 *
 * Používáme dva endpointy:
 *  - /search.json            hledání knih podle názvu / autora
 *  - /works/{id}.json        detail díla (kvůli popisu knihy)
 * Obálky se pak zobrazují přímo z covers.openlibrary.org (viz Book::coverUrl).
 *
 * Výsledky hledání se na hodinu cachují, abychom API zbytečně nezatěžovali.
 */
class OpenLibrary
{
    /** Pole, která chceme ze /search.json - čím méně, tím rychlejší odpověď. */
    private const SEARCH_FIELDS = 'key,title,author_name,first_publish_year,cover_i,isbn,number_of_pages_median,subject';

    /**
     * Vyhledá knihy a vrátí je ve stejném tvaru, v jakém je ukládáme do tabulky books.
     *
     * @return list<array{open_library_key: string, title: string, author: string, year: int|null, pages: int|null, isbn: string|null, cover_id: int|null, genre: string|null}>
     *
     * @throws RuntimeException když API neodpoví
     */
    public function search(string $query, int $limit = 12): array
    {
        $query = trim($query);

        if ($query === '') {
            return [];
        }

        $cacheKey = 'openlibrary.search.'.md5(Str::lower($query).'|'.$limit);

        return Cache::remember($cacheKey, now()->addHour(), function () use ($query, $limit) {
            $docs = $this->get('/search.json', [
                'q' => $query,
                'fields' => self::SEARCH_FIELDS,
                'limit' => $limit,
            ])['docs'] ?? [];

            return collect($docs)
                // Bez autora nebo názvu knihu do katalogu nedáme
                ->filter(fn (array $doc) => ! empty($doc['title']) && ! empty($doc['author_name']))
                ->map(fn (array $doc) => $this->normalize($doc))
                ->values()
                ->all();
        });
    }

    /**
     * Najde jedno dílo podle klíče (např. "/works/OL27448W") a doplní k němu popis.
     *
     * @return array{open_library_key: string, title: string, author: string, year: int|null, pages: int|null, isbn: string|null, cover_id: int|null, genre: string|null, description: string|null}|null
     */
    public function findWork(string $workKey): ?array
    {
        if (! preg_match('#^/works/OL\d+W$#', $workKey)) {
            return null;
        }

        // Search API umí filtrovat podle klíče díla - dostaneme autora, rok, obálku…
        $docs = $this->get('/search.json', [
            'q' => 'key:'.$workKey,
            'fields' => self::SEARCH_FIELDS,
            'limit' => 1,
        ])['docs'] ?? [];

        if ($docs === []) {
            return null;
        }

        $book = $this->normalize($docs[0]);
        $book['description'] = $this->description($workKey);

        return $book;
    }

    /**
     * Popis díla z /works/{id}.json. Open Library ho vrací buď jako string,
     * nebo jako objekt {"type": "/type/text", "value": "..."}.
     */
    private function description(string $workKey): ?string
    {
        try {
            $work = $this->get($workKey.'.json');
        } catch (RuntimeException) {
            return null; // popis je jen bonus, kvůli němu import neshodíme
        }

        $description = $work['description'] ?? null;
        $text = is_array($description) ? ($description['value'] ?? null) : $description;

        if (! is_string($text) || $text === '') {
            return null;
        }

        // Popisy často obsahují odkazy a zdroje ve formátu Markdown - necháme jen první odstavec
        $text = Str::of($this->clean($text))->before("\r\n\r\n")->before("\n\n")->before('----------')
            ->replaceMatches('/\[([^\]]+)\]\([^)]+\)/', '$1')
            ->squish();

        return Str::limit((string) $text, 1200);
    }

    /**
     * Převede dokument z Open Library na náš formát.
     *
     * @param  array<string, mixed>  $doc
     * @return array{open_library_key: string, title: string, author: string, year: int|null, pages: int|null, isbn: string|null, cover_id: int|null, genre: string|null}
     */
    private function normalize(array $doc): array
    {
        // Preferujeme ISBN-13, jinak vezmeme cokoli
        $isbns = $doc['isbn'] ?? [];
        $isbn = collect($isbns)->first(fn (string $i) => strlen($i) === 13) ?? ($isbns[0] ?? null);

        return [
            'open_library_key' => (string) $doc['key'],
            'title' => Str::limit($this->clean($doc['title']), 250, ''),
            'author' => $this->clean($doc['author_name'][0]),
            'year' => isset($doc['first_publish_year']) ? (int) $doc['first_publish_year'] : null,
            'pages' => isset($doc['number_of_pages_median']) ? (int) $doc['number_of_pages_median'] : null,
            'isbn' => $isbn,
            'cover_id' => isset($doc['cover_i']) && $doc['cover_i'] > 0 ? (int) $doc['cover_i'] : null,
            'genre' => isset($doc['subject'][0]) ? Str::limit(Str::ucfirst($this->clean($doc['subject'][0])), 60, '') : null,
        ];
    }

    /**
     * Open Library posílá text v Unicode podobě NFD („á“ = „a“ + samostatná čárka).
     * Převedeme ho na běžnou podobu NFC, jinak by v katalogu nefungovalo hledání
     * (uživatel píše „Bílá“ v NFC a databáze by ji v NFD nenašla).
     */
    private function clean(mixed $value): string
    {
        $text = trim((string) $value);

        return class_exists(Normalizer::class)
            ? (Normalizer::normalize($text, Normalizer::FORM_C) ?: $text)
            : $text;
    }

    /**
     * Jednotné místo pro HTTP volání: timeout, 2 pokusy, srozumitelná chyba.
     *
     * @param  array<string, mixed>  $query
     * @return array<string, mixed>
     */
    private function get(string $path, array $query = []): array
    {
        try {
            return $this->client()->get($path, $query)->throw()->json() ?? [];
        } catch (ConnectionException|RequestException $e) {
            report($e);

            throw new RuntimeException('Open Library teď neodpovídá. Zkuste to prosím za chvíli.', previous: $e);
        }
    }

    private function client(): PendingRequest
    {
        return Http::baseUrl(config('services.openlibrary.url'))
            ->withUserAgent(config('services.openlibrary.user_agent'))
            ->acceptJson()
            ->timeout(config('services.openlibrary.timeout'))
            ->retry(2, 300, throw: false);
    }
}
