<?php

namespace Tests\Feature;

use App\Models\Book;
use App\Models\Loan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/**
 * Testy hlavní logiky knihovny: dostupnost, půjčování, vracení, import.
 * Spuštění: php artisan test
 */
class LibraryTest extends TestCase
{
    use RefreshDatabase;

    public function test_catalog_is_public_and_shows_availability(): void
    {
        $available = Book::factory()->create(['title' => 'Volná kniha']);
        $borrowed = Book::factory()->create(['title' => 'Půjčená kniha']);
        Loan::factory()->for($borrowed)->create();

        $this->get(route('books.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('books/index')
                ->where('counts.vse', 2)
                ->where('counts.dostupne', 1)
                ->where('counts.vypujcene', 1));

        $this->get(route('books.index', ['stav' => 'dostupne']))
            ->assertInertia(fn (Assert $page) => $page
                ->has('books.data', 1)
                ->where('books.data.0.id', $available->id)
                ->where('books.data.0.is_available', true));

        $this->get(route('books.index', ['stav' => 'vypujcene']))
            ->assertInertia(fn (Assert $page) => $page
                ->has('books.data', 1)
                ->where('books.data.0.id', $borrowed->id)
                ->where('books.data.0.is_available', false));
    }

    public function test_returned_loan_makes_book_available_again(): void
    {
        $book = Book::factory()->create();
        Loan::factory()->for($book)->returned()->create();

        $this->assertTrue($book->fresh()->isAvailable());
        $this->assertSame(1, Book::available()->count());
    }

    public function test_guest_cannot_borrow(): void
    {
        $book = Book::factory()->create();

        $this->post(route('loans.store', $book))->assertRedirect(route('login'));
        $this->assertDatabaseCount('loans', 0);
    }

    public function test_reader_can_borrow_available_book(): void
    {
        $user = User::factory()->create();
        $book = Book::factory()->create();

        $this->actingAs($user)->post(route('loans.store', $book))->assertRedirect();

        $loan = Loan::sole();
        $this->assertSame($user->id, $loan->user_id);
        $this->assertNull($loan->returned_at);
        $this->assertTrue($loan->due_at->isSameDay(now()->addDays(Loan::LOAN_DAYS)));
        $this->assertFalse($book->fresh()->isAvailable());
    }

    public function test_cannot_borrow_already_borrowed_book(): void
    {
        $book = Book::factory()->create();
        Loan::factory()->for($book)->create();

        $this->actingAs(User::factory()->create())->post(route('loans.store', $book));

        $this->assertSame(1, Loan::count());
    }

    public function test_reader_cannot_exceed_loan_limit(): void
    {
        $user = User::factory()->create();
        Loan::factory()->count(Loan::MAX_ACTIVE_PER_USER)->for($user)->create();

        $this->actingAs($user)->post(route('loans.store', Book::factory()->create()));

        $this->assertSame(Loan::MAX_ACTIVE_PER_USER, $user->loans()->active()->count());
    }

    public function test_reader_can_return_own_book_but_not_someone_elses(): void
    {
        $owner = User::factory()->create();
        $stranger = User::factory()->create();
        $loan = Loan::factory()->for($owner)->create();

        $this->actingAs($stranger)->patch(route('loans.return', $loan))->assertForbidden();
        $this->assertNull($loan->fresh()->returned_at);

        $this->actingAs($owner)->patch(route('loans.return', $loan))->assertRedirect();
        $this->assertNotNull($loan->fresh()->returned_at);
    }

    public function test_librarian_can_return_any_book(): void
    {
        $librarian = User::factory()->create();
        $librarian->forceFill(['is_librarian' => true])->save();
        $loan = Loan::factory()->create();

        $this->actingAs($librarian)->patch(route('loans.return', $loan))->assertRedirect();

        $this->assertNotNull($loan->fresh()->returned_at);
    }

    public function test_overdue_flag(): void
    {
        $this->assertTrue(Loan::factory()->overdue()->create()->is_overdue);
        $this->assertFalse(Loan::factory()->create()->is_overdue);
    }

    public function test_only_librarian_can_open_import_page(): void
    {
        $this->actingAs(User::factory()->create())->get(route('import.create'))->assertForbidden();
    }

    public function test_librarian_can_search_and_import_from_open_library(): void
    {
        Http::fake([
            'openlibrary.org/search.json*' => Http::response(['docs' => [[
                'key' => '/works/OL27482W',
                'title' => 'The Hobbit',
                'author_name' => ['J.R.R. Tolkien'],
                'first_publish_year' => 1937,
                'cover_i' => 14627509,
                'isbn' => ['9780563528807'],
                'number_of_pages_median' => 310,
                'subject' => ['fantasy'],
            ]]]),
            'openlibrary.org/works/OL27482W.json' => Http::response([
                'description' => ['type' => '/type/text', 'value' => "A tale of high adventure.\r\n\r\nMore text."],
            ]),
        ]);

        $librarian = User::factory()->create();
        $librarian->forceFill(['is_librarian' => true])->save();

        $this->actingAs($librarian)
            ->get(route('import.create', ['q' => 'hobbit']))
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/import')
                ->where('results.0.title', 'The Hobbit')
                ->where('results.0.existing_id', null));

        $this->actingAs($librarian)
            ->post(route('import.store'), ['open_library_key' => '/works/OL27482W'])
            ->assertRedirect();

        $book = Book::sole();
        $this->assertSame('J.R.R. Tolkien', $book->author);
        $this->assertSame(14627509, $book->cover_id);
        $this->assertSame('A tale of high adventure.', $book->description);

        // Druhý import stejné knihy neprojde
        $this->actingAs($librarian)
            ->post(route('import.store'), ['open_library_key' => '/works/OL27482W'])
            ->assertSessionHasErrors('open_library_key');
    }

    public function test_imported_text_is_normalized_to_nfc(): void
    {
        // „Bílá nemoc“ tak, jak ji posílá Open Library: písmena a čárky zvlášť (NFD)
        $nfdTitle = "Bi\u{0301}la\u{0301} nemoc";
        $nfdAuthor = "Karel C\u{030C}apek";

        Http::fake([
            'openlibrary.org/search.json*' => Http::response(['docs' => [[
                'key' => '/works/OL575622W',
                'title' => $nfdTitle,
                'author_name' => [$nfdAuthor],
            ]]]),
            'openlibrary.org/works/*' => Http::response([]),
        ]);

        $librarian = User::factory()->create();
        $librarian->forceFill(['is_librarian' => true])->save();

        $this->actingAs($librarian)->post(route('import.store'), ['open_library_key' => '/works/OL575622W']);

        $book = Book::sole();
        $this->assertSame('Bílá nemoc', $book->title);
        $this->assertSame('Karel Čapek', $book->author);
        $this->assertSame(1, Book::search('Bílá')->count());
    }

    public function test_borrowed_book_cannot_be_deleted(): void
    {
        $librarian = User::factory()->create();
        $librarian->forceFill(['is_librarian' => true])->save();
        $book = Book::factory()->create();
        Loan::factory()->for($book)->create();

        $this->actingAs($librarian)->delete(route('books.destroy', $book));

        $this->assertModelExists($book);
    }
}
