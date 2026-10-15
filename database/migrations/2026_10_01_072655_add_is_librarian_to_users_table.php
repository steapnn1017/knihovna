<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Přidá uživatelům příznak „knihovník“.
 * Knihovník smí přidávat knihy z Open Library, mazat je
 * a vracet výpůjčky za kohokoli. Běžný čtenář si jen půjčuje a vrací své knihy.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('is_librarian')->default(false)->after('email');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('is_librarian');
        });
    }
};
