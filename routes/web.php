<?php

use App\Http\Controllers\BookController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\ImportController;
use App\Http\Controllers\LoanController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Veřejné stránky (katalog vidí každý, i nepřihlášený)
|--------------------------------------------------------------------------
*/
Route::get('/', HomeController::class)->name('home');
Route::get('/knihy', [BookController::class, 'index'])->name('books.index');
Route::get('/knihy/{book}', [BookController::class, 'show'])->name('books.show');

/*
|--------------------------------------------------------------------------
| Přihlášený čtenář - půjčování a vracení
|--------------------------------------------------------------------------
*/
Route::middleware('auth')->group(function () {
    Route::get('/moje-vypujcky', [LoanController::class, 'index'])->name('loans.index');
    Route::post('/knihy/{book}/vypujcit', [LoanController::class, 'store'])->name('loans.store');
    Route::patch('/vypujcky/{loan}/vratit', [LoanController::class, 'return'])->name('loans.return');

    // Starter kit po přihlášení posílá na /dashboard - přesměrujeme na výpůjčky
    Route::redirect('/dashboard', '/moje-vypujcky')->name('dashboard');
});

/*
|--------------------------------------------------------------------------
| Správa - jen knihovník (Gate „manage-library“ v AppServiceProvider)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'can:manage-library'])->prefix('sprava')->group(function () {
    Route::get('/pridat-knihy', [ImportController::class, 'create'])->name('import.create');
    Route::post('/knihy', [ImportController::class, 'store'])->name('import.store');
    Route::delete('/knihy/{book}', [BookController::class, 'destroy'])->name('books.destroy');
});

require __DIR__.'/settings.php';
