<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tabulka knih. Každý řádek = jeden fyzický výtisk v knihovně.
 * Údaje o knize (autor, rok, obálka…) pocházejí z Open Library API.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('books', function (Blueprint $table) {
            $table->id();
            $table->string('title');                       // název (u nás česky, pokud existuje překlad)
            $table->string('original_title')->nullable();  // původní název
            $table->string('author');
            $table->unsignedSmallInteger('year')->nullable(); // rok prvního vydání
            $table->unsignedSmallInteger('pages')->nullable();
            $table->string('isbn', 20)->nullable();
            $table->string('genre')->nullable();
            $table->text('description')->nullable();
            $table->unsignedBigInteger('cover_id')->nullable(); // ID obálky na covers.openlibrary.org
            // Klíč díla v Open Library (např. /works/OL27448W) - díky unique se kniha nenaimportuje dvakrát
            $table->string('open_library_key')->nullable()->unique();
            $table->timestamps();

            $table->index('title');
            $table->index('author');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('books');
    }
};
