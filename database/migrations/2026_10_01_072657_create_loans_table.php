<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Výpůjčky. Kniha je „vypůjčená“, pokud k ní existuje výpůjčka,
 * která ještě nebyla vrácena (returned_at je NULL). Jinak je dostupná.
 * Vrácené výpůjčky zůstávají v tabulce jako historie.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('loans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('book_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->timestamp('borrowed_at');
            $table->timestamp('due_at');                 // do kdy se má kniha vrátit
            $table->timestamp('returned_at')->nullable(); // NULL = kniha je stále půjčená
            $table->timestamps();

            // Nejčastější dotaz: „má tahle kniha aktivní výpůjčku?“
            $table->index(['book_id', 'returned_at']);
            $table->index(['user_id', 'returned_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('loans');
    }
};
