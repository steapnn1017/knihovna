<?php

namespace App\Models;

use Carbon\CarbonInterface;
use Database\Factories\LoanFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * Výpůjčka = kdo (user) si půjčil co (book), kdy a do kdy to má vrátit.
 *
 * @property int $id
 * @property int $book_id
 * @property int $user_id
 * @property Carbon $borrowed_at
 * @property Carbon $due_at
 * @property Carbon|null $returned_at
 * @property-read Book $book
 * @property-read User $user
 * @property-read bool $is_overdue
 */
#[Fillable(['book_id', 'user_id', 'borrowed_at', 'due_at', 'returned_at'])]
class Loan extends Model
{
    /** @use HasFactory<LoanFactory> */
    use HasFactory;

    /** Výchozí výpůjční doba ve dnech. */
    public const LOAN_DAYS = 30;

    /** Kolik knih může mít jeden čtenář půjčeno najednou. */
    public const MAX_ACTIVE_PER_USER = 5;

    protected $appends = ['is_overdue'];

    /**
     * Termín vrácení pro výpůjčku začínající v daný okamžik:
     * +30 dní, do půlnoci (v časovém pásmu aplikace, tj. Europe/Prague).
     * Jediné místo, kde se termín počítá - používá ho controller, seeder i testy.
     */
    public static function dueDateFor(CarbonInterface $borrowedAt): CarbonInterface
    {
        return $borrowedAt->copy()->addDays(self::LOAN_DAYS)->endOfDay();
    }

    /** @return BelongsTo<Book, $this> */
    public function book(): BelongsTo
    {
        return $this->belongsTo(Book::class);
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Nevrácené výpůjčky.
     *
     * @param  Builder<Loan>  $query
     */
    public function scopeActive(Builder $query): void
    {
        $query->whereNull('returned_at');
    }

    /**
     * Po termínu = ještě nevráceno a termín vrácení už minul.
     */
    protected function isOverdue(): Attribute
    {
        return Attribute::get(fn () => $this->returned_at === null && $this->due_at->isPast());
    }

    protected function casts(): array
    {
        return [
            'borrowed_at' => 'datetime',
            'due_at' => 'datetime',
            'returned_at' => 'datetime',
        ];
    }
}
