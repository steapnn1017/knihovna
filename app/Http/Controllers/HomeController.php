<?php

namespace App\Http\Controllers;

use App\Http\Resources\BookResource;
use App\Models\Book;
use App\Models\Loan;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Úvodní stránka: hero se statistikami, vějíř obálek a přehled
 * „dostupné hned“ vs. „právě vypůjčené“.
 */
class HomeController extends Controller
{
    public function __invoke(): Response
    {
        $total = Book::count();
        $borrowed = Book::borrowed()->count();

        return Inertia::render('welcome', [
            'stats' => [
                'books' => $total,
                'available' => $total - $borrowed,
                'borrowed' => $borrowed,
                'readers' => User::count(),
                'authors' => Book::distinct()->count('author'),
                'loanDays' => Loan::LOAN_DAYS,
            ],
            // Obálky do vějíře - jen knihy, které obálku mají
            'featured' => BookResource::collection(
                Book::with('activeLoan')->whereNotNull('cover_id')->inRandomOrder()->limit(10)->get()
            ),
            'availableNow' => BookResource::collection(
                Book::available()->with('activeLoan')->whereNotNull('cover_id')->inRandomOrder()->limit(8)->get()
            ),
            'borrowedNow' => BookResource::collection(
                Book::borrowed()->with('activeLoan.user')->get()
                    ->sortBy(fn (Book $book) => $book->activeLoan->due_at)
                    ->take(6)
                    ->values()
            ),
            // Pro „běžící pás“ autorů v hero sekci
            'authors' => Book::query()->distinct()->orderBy('author')->pluck('author'),
        ]);
    }
}
