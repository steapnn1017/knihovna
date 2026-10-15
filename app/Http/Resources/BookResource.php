<?php

namespace App\Http\Resources;

use App\Models\Book;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Jak kniha vypadá pro frontend (React).
 * Jméno toho, kdo má knihu půjčenou, vidí jen knihovník - ochrana soukromí čtenářů.
 *
 * @mixin Book
 */
class BookResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $loan = $this->relationLoaded('activeLoan') ? $this->activeLoan : null;
        $user = $request->user();

        return [
            'id' => $this->id,
            'title' => $this->title,
            'original_title' => $this->original_title,
            'author' => $this->author,
            'year' => $this->year,
            'pages' => $this->pages,
            'isbn' => $this->isbn,
            'genre' => $this->genre,
            'description' => $this->when($request->routeIs('books.show'), $this->description),
            'cover_url' => $this->cover_url,
            'open_library_url' => $this->open_library_key ? 'https://openlibrary.org'.$this->open_library_key : null,
            'is_available' => $this->relationLoaded('activeLoan') ? $loan === null : null,
            'loan' => $loan ? [
                'id' => $loan->id,
                'due_at' => $loan->due_at->toIso8601String(),
                'is_overdue' => $loan->is_overdue,
                'is_mine' => $user?->id === $loan->user_id,
                'borrower' => $user?->is_librarian ? $loan->user?->name : null,
            ] : null,
        ];
    }
}
