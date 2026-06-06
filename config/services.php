<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
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

    'prodi_api' => [
        'base_url'       => env('PRODI_API_BASE_URL'),
        'cache_ttl'      => env('PRODI_API_CACHE_TTL', 3600),
        'timeout'        => env('PRODI_API_TIMEOUT', 5),
        'retries'        => env('PRODI_API_RETRIES', 2),
        'retry_delay_ms' => env('PRODI_API_RETRY_DELAY_MS', 200),
    ],


    'pegawai_api' => [
        'base_url'       => env('PEGAWAI_API_BASE_URL', 'https://api-pegawai-4c.akufarish.my.id:9001/api/pegawai'),
        'api_token'      => env('PEGAWAI_API_TOKEN', '264|ys67ffrV3ZtDDjk8KuzytYGAXy5yIAVzMNfIZljD341b1a37'),
        'cache_ttl'      => env('PEGAWAI_API_CACHE_TTL', 3600),
        'timeout'        => env('PEGAWAI_API_TIMEOUT', 5),
        'retries'        => env('PEGAWAI_API_RETRIES', 2),
        'retry_delay_ms' => env('PEGAWAI_API_RETRY_DELAY_MS', 200),
    ],
];
