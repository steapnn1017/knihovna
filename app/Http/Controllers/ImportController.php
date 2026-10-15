<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Services\OpenLibrary;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;

/**
 * Správa (jen knihovník): hledání v Open Library a přidání knihy do katalogu.
 */
class ImportController extends Controller
{
    public function __construct(private readonly OpenLibrary $openLibrary) {}

    /**
     * Stránka s vyhledáváním. Dotaz je v URL (?q=...), takže výsledky jdou sdílet i obnovit.
     */
    public function create(Request $request): Response
    {
        $query = trim((string) $request->string('q'));
        $results = [];
        $error = null;

        if ($query !== '') {
            try {
                $results = $this->openLibrary->search($query, 16);
            } catch (RuntimeException $e) {
                $error = $e->getMessage();
            }
        }

        // Které z nalezených knih už v katalogu máme (podle klíče díla)
        $existing = Book::whereIn('open_library_key', array_column($results, 'open_library_key'))
            ->pluck('id', 'open_library_key');

        return Inertia::render('admin/import', [
            'query' => $query,
            'error' => $error,
            'results' => array_map(fn (array $book) => [
                ...$book,
                'cover_url' => $book['cover_id'] ? "https://covers.openlibrary.org/b/id/{$book['cover_id']}-M.jpg" : null,
                'existing_id' => $existing[$book['open_library_key']] ?? null,
            ], $results),
        ]);
    }

    /**
     * Přidá knihu podle klíče díla. Data si znovu stáhneme ze serveru Open Library,
     * nevěříme tomu, co pošle prohlížeč.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'open_library_key' => ['required', 'string', 'regex:#^/works/OL\d+W$#', 'unique:books,open_library_key'],
        ], [
            'open_library_key.unique' => 'Tahle kniha už v katalogu je.',
            'open_library_key.regex' => 'Neplatný identifikátor knihy.',
        ]);

        try {
            $data = $this->openLibrary->findWork($validated['open_library_key']);
        } catch (RuntimeException $e) {
            Inertia::flash('toast', ['type' => 'error', 'message' => $e->getMessage()]);

            return back();
        }

        if ($data === null) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'Knihu se v Open Library nepodařilo najít.']);

            return back();
        }

        $book = Book::create($data);

        Inertia::flash('toast', ['type' => 'success', 'message' => "Přidáno do katalogu: {$book->title}"]);

        return back();
    }
}
