<?php

namespace Database\Factories;

use App\Models\Book;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * Náhodné knihy pro testy.
 *
 * @extends Factory<Book>
 */
class BookFactory extends Factory
{
    public function definition(): array
    {
        return [
            'title' => rtrim(fake()->sentence(3), '.'),
            'original_title' => null,
            'author' => fake()->name(),
            'year' => fake()->numberBetween(1850, 2024),
            'pages' => fake()->numberBetween(80, 900),
            'isbn' => fake()->isbn13(),
            'genre' => fake()->randomElement(['Román', 'Sci-fi', 'Fantasy', 'Klasika', 'Detektivka']),
            'description' => fake()->paragraph(),
            'cover_id' => null,
            'open_library_key' => '/works/OL'.fake()->unique()->numberBetween(100000, 9999999).'W',
        ];
    }
}
