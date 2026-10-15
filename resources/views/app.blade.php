<!DOCTYPE html>
{{-- Aplikace má jen tmavý vzhled (podle zadaného designu), proto je třída dark napevno --}}
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="dark">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        {{-- Barva pozadí ještě před načtením CSS, aby obrazovka nebliknula bíle --}}
        <style>
            html {
                background-color: #09090b;
            }
        </style>

        <link rel="icon" href="/favicon.ico" sizes="any">
        <link rel="icon" href="/favicon.svg" type="image/svg+xml">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">

        <meta name="theme-color" content="#09090b">

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        <x-inertia::head>
            <title>{{ config('app.name', 'Laravel') }}</title>
        </x-inertia::head>
    </head>
    <body class="bg-background font-sans text-foreground antialiased">
        <x-inertia::app />
    </body>
</html>
