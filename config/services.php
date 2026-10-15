<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Resend, Postmark, AWS, and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Open Library (zdroj dat o knihách)
    |--------------------------------------------------------------------------
    |
    | Veřejné API https://openlibrary.org - NEPOTŘEBUJE žádný API klíč.
    | Open Library žádá, aby se aplikace představila v hlavičce User-Agent
    | (jméno aplikace + kontakt), proto ji posíláme.
    |
    */

    'openlibrary' => [
        'url' => env('OPENLIBRARY_URL', 'https://openlibrary.org'),
        'covers_url' => env('OPENLIBRARY_COVERS_URL', 'https://covers.openlibrary.org'),
        'user_agent' => env('OPENLIBRARY_USER_AGENT', 'KnihovnaApp/1.0 (skolni projekt)'),
        'timeout' => (int) env('OPENLIBRARY_TIMEOUT', 10),
    ],

];
