<?php

namespace App\Http\Controllers;

use App\Http\Resources\BookResource;
use App\Models\Book;
use App\Models\Loan;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Katalog knih: výpis s filtrem dostupnosti, detail knihy a mazání (knihovník).
 */
class BookController extends Controller
{
    /** Hodnoty filtru „stav“ v URL: /knihy?stav=dostupne */
    private const STATUSES = ['vse', 'dostupne', 'vypujcene'];

    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'q' => ['nullable', 'string', 'max:100'],
            'stav' => ['nullable', Rule::in(self::STATUSES)],
            'zanr' => ['nullable', 'string', 'max:60'],
        ]);

        $status = $filters['stav'] ?? 'vse';

        $books = Book::query()
            ->with('activeLoan.user')
            ->search($filters['q'] ?? null)
            ->when($status === 'dostupne', fn ($q) => $q->available())
            ->when($status === 'vypujcene', fn ($q) => $q->borrowed())
            ->when($filters['zanr'] ?? null, fn ($q, string $genre) => $q->where('genre', $genre))
            ->orderBy('title')
            ->paginate(24)
            ->withQueryString();

        $total = Book::count();
        $borrowed = Book::borrowed()->count();

        return Inertia::render('books/index', [
            'books' => BookResource::collection($books),
            'filters' => [
                'q' => $filters['q'] ?? '',
                'stav' => $status,
                'zanr' => $filters['zanr'] ?? '',
            ],
            'counts' => [
                'vse' => $total,
                'dostupne' => $total - $borrowed,
                'vypujcene' => $borrowed,
            ],
            'genres' => Book::query()->whereNotNull('genre')->distinct()->orderBy('genre')->pluck('genre'),
        ]);
    }

    public function show(Request $request, Book $book): Response
    {
        $book->load('activeLoan.user');
        $user = $request->user();

        return Inertia::render('books/show', [
            'book' => new BookResource($book),
            'timesBorrowed' => $book->loans()->count(),
            // Proč si uživatel nemůže knihu půjčit (null = může)
            'borrowBlocker' => match (true) {
                $user === null => 'guest',
                ! $book->isAvailable() => 'borrowed',
                $user->loans()->active()->count() >= Loan::MAX_ACTIVE_PER_USER => 'limit',
                default => null,
            },
            'loanDays' => Loan::LOAN_DAYS,
            'dueIfBorrowedToday' => Loan::dueDateFor(now())->toIso8601String(),
            'maxLoans' => Loan::MAX_ACTIVE_PER_USER,
            'related' => BookResource::collection(
                Book::with('activeLoan')
                    ->whereKeyNot($book->id)
                    ->where(fn ($q) => $q->where('genre', $book->genre)->orWhere('author', $book->author))
                    ->inRandomOrder()
                    ->limit(5)
                    ->get()
            ),
        ]);
    }

    public function destroy(Book $book): RedirectResponse
    {
        if (! $book->isAvailable()) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'Vypůjčenou knihu nelze smazat. Nejdřív ji označte jako vrácenou.']);

            return back();
        }

        $book->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => "Kniha „{$book->title}“ byla odebrána z katalogu."]);

        return to_route('books.index');
    }
}
