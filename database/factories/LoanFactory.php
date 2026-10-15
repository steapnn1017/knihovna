<?php

namespace Database\Factories;

use App\Models\Book;
use App\Models\Loan;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * Výpůjčky pro testy. Výchozí stav = aktivní (nevrácená) výpůjčka.
 *
 * @extends Factory<Loan>
 */
class LoanFactory extends Factory
{
    public function definition(): array
    {
        $borrowedAt = now()->subDays(fake()->numberBetween(1, 20));

        return [
            'book_id' => Book::factory(),
            'user_id' => User::factory(),
            'borrowed_at' => $borrowedAt,
            'due_at' => Loan::dueDateFor($borrowedAt),
            'returned_at' => null,
        ];
    }

    /** Už vrácená výpůjčka (historie). */
    public function returned(): static
    {
        return $this->state(fn (array $attributes) => [
            'returned_at' => $attributes['borrowed_at']->copy()->addDays(fake()->numberBetween(1, 25)),
        ]);
    }

    /** Výpůjčka po termínu vrácení. */
    public function overdue(): static
    {
        return $this->state(fn () => [
            'borrowed_at' => now()->subDays(Loan::LOAN_DAYS + 6),
            'due_at' => now()->subDays(6)->endOfDay(),
        ]);
    }
}
