<?php

namespace Database\Seeders;

use App\Models\Book;
use App\Models\Loan;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

/**
 * Ukázková data: knihovnice, tři čtenáři, 37 knih a pár výpůjček,
 * aby bylo hned vidět, které knihy jsou vypůjčené a které dostupné.
 *
 * Spuštění: php artisan migrate:fresh --seed
 */
class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $this->call(BookSeeder::class);

        // Účet knihovníka (může přidávat knihy a vracet výpůjčky za čtenáře)
        $librarian = User::factory()->create([
            'name' => 'Jana Knihovnice',
            'email' => 'knihovnik@knihovna.test',
            'password' => 'heslo123',
        ]);
        $librarian->forceFill(['is_librarian' => true])->save();

        // Běžní čtenáři
        $reader = User::factory()->create([
            'name' => 'Tomáš Čtenář',
            'email' => 'ctenar@knihovna.test',
            'password' => 'heslo123',
        ]);
        $petra = User::factory()->create(['name' => 'Petra Dvořáková', 'email' => 'petra@knihovna.test', 'password' => 'heslo123']);
        $lukas = User::factory()->create(['name' => 'Lukáš Marek', 'email' => 'lukas@knihovna.test', 'password' => 'heslo123']);

        // Aktivní výpůjčky: [čtenář, název knihy, před kolika dny si ji půjčil]
        $active = [
            [$reader, 'Duna', 4],
            [$reader, 'Marťan', 12],
            [$reader, 'Proces', 36],          // po termínu - ukázka upozornění
            [$petra, '1984', 2],
            [$petra, 'Mistr a Markétka', 18],
            [$petra, 'Malý princ', 9],
            [$lukas, 'Hobit aneb Cesta tam a zase zpátky', 7],
            [$lukas, 'Neuromancer', 25],
            [$lukas, 'Válka s mloky', 33],    // po termínu
        ];

        foreach ($active as [$user, $title, $daysAgo]) {
            $this->loan($user, $title, $daysAgo);
        }

        // Historie (vrácené výpůjčky)
        $history = [
            [$reader, 'Farma zvířat', 70, 21],
            [$reader, 'Spasitel', 55, 14],
            [$petra, 'Pýcha a předsudek', 90, 28],
            [$lukas, 'Stopařův průvodce po Galaxii', 40, 10],
        ];

        foreach ($history as [$user, $title, $daysAgo, $keptDays]) {
            $this->loan($user, $title, $daysAgo, returnedAfter: $keptDays);
        }
    }

    private function loan(User $user, string $title, int $daysAgo, ?int $returnedAfter = null): void
    {
        $book = Book::where('title', $title)->firstOrFail();
        $borrowedAt = now()->subDays($daysAgo)->setTime(rand(9, 17), rand(0, 59));

        Loan::create([
            'book_id' => $book->id,
            'user_id' => $user->id,
            'borrowed_at' => $borrowedAt,
            'due_at' => Loan::dueDateFor($borrowedAt),
            'returned_at' => $returnedAfter ? $borrowedAt->copy()->addDays($returnedAfter) : null,
        ]);
    }
}
