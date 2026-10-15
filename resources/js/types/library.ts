/** Typy dat, která posílá Laravel (viz app/Http/Resources). */

export type BookLoanInfo = {
    id: number;
    due_at: string;
    is_overdue: boolean;
    is_mine: boolean;
    /** Jméno čtenáře - vidí jen knihovník */
    borrower: string | null;
};

export type Book = {
    id: number;
    title: string;
    original_title: string | null;
    author: string;
    year: number | null;
    pages: number | null;
    isbn: string | null;
    genre: string | null;
    description?: string | null;
    cover_url: string | null;
    open_library_url: string | null;
    is_available: boolean | null;
    loan: BookLoanInfo | null;
};

export type Loan = {
    id: number;
    borrowed_at: string;
    due_at: string;
    returned_at: string | null;
    is_overdue: boolean;
    book: Pick<Book, 'id' | 'title' | 'author' | 'cover_url'>;
    borrower?: { name: string; email: string };
};

/** Laravel API Resource kolekce: { data: [...] } */
export type ResourceCollection<T> = { data: T[] };

export type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

export type Paginated<T> = {
    data: T[];
    links: {
        first: string | null;
        last: string | null;
        prev: string | null;
        next: string | null;
    };
    meta: {
        current_page: number;
        last_page: number;
        from: number | null;
        to: number | null;
        total: number;
        per_page: number;
        links: PaginationLink[];
    };
};

export type OpenLibraryResult = {
    open_library_key: string;
    title: string;
    author: string;
    year: number | null;
    pages: number | null;
    isbn: string | null;
    cover_id: number | null;
    cover_url: string | null;
    genre: string | null;
    existing_id: number | null;
};
