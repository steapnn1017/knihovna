<?php

namespace App\Http\Controllers;

use App\Http\Resources\LoanResource;
use App\Models\Book;
use App\Models\Loan;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Půjčování a vracení knih.
 */
class LoanController extends Controller
{
    /**
     * Moje výpůjčky (+ u knihovníka přehled všech aktivních výpůjček).
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        $myLoans = $user->loans()->with('book')->latest('borrowed_at')->get();

        return Inertia::render('loans/index', [
            'active' => LoanResource::collection($myLoans->whereNull('returned_at')->sortBy('due_at')->values()),
            'history' => LoanResource::collection($myLoans->whereNotNull('returned_at')->take(20)->values()),
            'maxLoans' => Loan::MAX_ACTIVE_PER_USER,
            // Knihovník vidí všechny nevrácené výpůjčky, nejdřív ty po termínu
            'allActive' => $user->is_librarian
                ? LoanResource::collection(Loan::active()->with(['book', 'user'])->orderBy('due_at')->get())
                : null,
        ]);
    }

    /**
     * Vypůjčit knihu.
     */
    public function store(Request $request, Book $book): RedirectResponse
    {
        $user = $request->user();

        // Transakce: kontrola dostupnosti a zápis výpůjčky proběhnou jako jeden celek,
        // takže si stejnou knihu nemohou ve stejnou chvíli půjčit dva lidé.
        $result = DB::transaction(function () use ($user, $book) {
            $book = Book::whereKey($book->id)->lockForUpdate()->firstOrFail();

            if (! $book->isAvailable()) {
                return 'Tuhle knihu už má někdo půjčenou.';
            }

            if ($user->loans()->active()->count() >= Loan::MAX_ACTIVE_PER_USER) {
                return 'Najednou můžete mít půjčeno nejvýš '.Loan::MAX_ACTIVE_PER_USER.' knih. Nejdřív nějakou vraťte.';
            }

            return $user->loans()->create([
                'book_id' => $book->id,
                'borrowed_at' => now(),
                'due_at' => Loan::dueDateFor(now()),
            ]);
        });

        // Transakce vrátila text chyby, nebo novou výpůjčku
        if (is_string($result)) {
            Inertia::flash('toast', ['type' => 'error', 'message' => $result]);

            return back();
        }

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "Vypůjčeno: {$book->title}. Vraťte ji do {$result->due_at->format('j. n. Y')}.",
        ]);

        return back();
    }

    /**
     * Vrátit knihu (čtenář svou, knihovník jakoukoli - viz LoanPolicy).
     */
    public function return(Loan $loan): RedirectResponse
    {
        Gate::authorize('return', $loan);

        if ($loan->returned_at !== null) {
            Inertia::flash('toast', ['type' => 'info', 'message' => 'Tahle kniha už byla vrácena.']);

            return back();
        }

        $loan->update(['returned_at' => now()]);

        Inertia::flash('toast', ['type' => 'success', 'message' => "Vráceno: {$loan->book->title}. Díky!"]);

        return back();
    }
}
