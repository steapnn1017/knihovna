<?php

namespace App\Console\Commands;

use App\Models\Book;
use App\Services\OpenLibrary;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use RuntimeException;

/**
 * Hromadný import knih z Open Library z terminálu.
 *
 * Příklady:
 *   php artisan knihy:import "Karel Čapek"
 *   php artisan knihy:import "harry potter" --limit=3
 */
#[Signature('knihy:import {dotaz : Název knihy nebo autor} {--limit=5 : Kolik knih nejvýš přidat}')]
#[Description('Najde knihy v Open Library a přidá je do katalogu')]
class ImportBooks extends Command
{
    public function handle(OpenLibrary $openLibrary): int
    {
        $limit = max(1, min(50, (int) $this->option('limit')));

        try {
            $results = $openLibrary->search((string) $this->argument('dotaz'), $limit * 2);
        } catch (RuntimeException $e) {
            $this->error($e->getMessage());

            return self::FAILURE;
        }

        $added = 0;

        foreach ($results as $result) {
            if ($added >= $limit) {
                break;
            }

            if (Book::where('open_library_key', $result['open_library_key'])->exists()) {
                $this->line("  přeskočeno (už v katalogu): {$result['title']}");

                continue;
            }

            $data = $openLibrary->findWork($result['open_library_key']) ?? $result;
            Book::create($data);
            $added++;

            $this->info("  + {$data['title']} ({$data['author']})");
        }

        $this->newLine();
        $this->info("Hotovo, přidáno knih: {$added}");

        return self::SUCCESS;
    }
}
