<?php

namespace App\Policies;

use App\Models\Loan;
use App\Models\User;

/**
 * Kdo smí co dělat s výpůjčkou.
 * Laravel tuto třídu najde automaticky podle názvu (Loan → LoanPolicy).
 */
class LoanPolicy
{
    /**
     * Vrátit knihu může čtenář, který ji má půjčenou, nebo knihovník.
     */
    public function return(User $user, Loan $loan): bool
    {
        return $loan->user_id === $user->id || $user->is_librarian;
    }
}
