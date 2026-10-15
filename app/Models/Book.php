<?php

namespace App\Models;

use Database\Factories\BookFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Carbon;

/**
 * Kniha v knihovně (jeden výtisk).
 *
 * Stav „dostupná / vypůjčená“ se NEUKLÁDÁ jako sloupec - počítá se
 * z výpůjček. Kniha je vypůjčená právě tehdy, když má výpůjčku bez data vrácení.
 * Díky tomu se stav nikdy nerozejde se skutečností.
 *
 * @property int $id
 * @property string $title
 * @property string|null $original_title
 * @property string $author
 * @property int|null $year
 * @property int|null $pages
 * @property string|null $isbn
 * @property string|null $genre
 * @property string|null $description
 * @property int|null $cover_id
 * @property string|null $open_library_key
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Loan|null $activeLoan
 * @property-read string|null $cover_url
 */
#[Fillable([
    'title', 'original_title', 'author', 'year', 'pages', 'isbn',
    'genre', 'description', 'cover_id', 'open_library_key',
])]
class Book extends Model
{
    /** @use HasFactory<BookFactory> */
    use HasFactory;

    /** Atributy, které se automaticky přidají do JSONu pro frontend. */
    protected $appends = ['cover_url'];

    /**
     * Všechny výpůjčky této knihy (i vrácené = historie).
     *
     * @return HasMany<Loan, $this>
     */
    public function loans(): HasMany
    {
        return $this->hasMany(Loan::class);
    }

    /**
     * Aktuální (nevrácená) výpůjčka. Pokud je null, kniha je dostupná.
     *
     * @return HasOne<Loan, $this>
     */
    public function activeLoan(): HasOne
    {
        return $this->hasOne(Loan::class)->whereNull('returned_at')->latestOfMany('borrowed_at');
    }

    public function isAvailable(): bool
    {
        return $this->activeLoan === null;
    }

    /**
     * Jen knihy, které jsou právě v regálu.
     *
     * @param  Builder<Book>  $query
     */
    public function scopeAvailable(Builder $query): void
    {
        $query->whereDoesntHave('loans', fn (Builder $q) => $q->whereNull('returned_at'));
    }

    /**
     * Jen knihy, které má někdo půjčené.
     *
     * @param  Builder<Book>  $query
     */
    public function scopeBorrowed(Builder $query): void
    {
        $query->whereHas('loans', fn (Builder $q) => $q->whereNull('returned_at'));
    }

    /**
     * Fulltextové hledání v názvu, původním názvu a autorovi.
     *
     * @param  Builder<Book>  $query
     */
    public function scopeSearch(Builder $query, ?string $term): void
    {
        if (blank($term)) {
            return;
        }

        $like = '%'.str_replace(['%', '_'], ['\%', '\_'], trim($term)).'%';

        $query->where(fn (Builder $q) => $q
            ->where('title', 'like', $like)
            ->orWhere('original_title', 'like', $like)
            ->orWhere('author', 'like', $like));
    }

    /**
     * URL obálky z Open Library Covers API (velikost L = cca 500 px na výšku).
     * Obrázky se tahají přímo z jejich CDN, nic neukládáme na disk.
     */
    protected function coverUrl(): Attribute
    {
        return Attribute::get(fn () => $this->cover_id
            ? sprintf('%s/b/id/%d-L.jpg', rtrim(config('services.openlibrary.covers_url'), '/'), $this->cover_id)
            : null);
    }

    protected function casts(): array
    {
        return [
            'year' => 'integer',
            'pages' => 'integer',
            'cover_id' => 'integer',
        ];
    }
}
