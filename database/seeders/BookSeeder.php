<?php

namespace Database\Seeders;

use App\Models\Book;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;

/**
 * Naplní katalog skutečnými knihami.
 *
 * Data v database/data/books.json byla stažena z Open Library API
 * (názvy přeloženy do češtiny, popisy zkráceny). Seed tak funguje
 * i bez internetu. Další knihy lze kdykoli dotáhnout přímo z API:
 *   - v aplikaci: Správa → Přidat knihy (účet knihovníka)
 *   - v terminálu: php artisan knihy:import "hledaný výraz"
 */
class BookSeeder extends Seeder
{
    public function run(): void
    {
        /** @var list<array<string, mixed>> $books */
        $books = json_decode(File::get(database_path('data/books.json')), true, flags: JSON_THROW_ON_ERROR);

        foreach ($books as $book) {
            Book::updateOrCreate(
                ['open_library_key' => $book['open_library_key']],
                $book,
            );
        }
    }
}
