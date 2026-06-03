<?php

return [
    'secret' => env('JWT_SECRET', 'haei-anteque-anteque-async-embehgweh-bwemwanfwat'),
    'algo' => env('JWT_ALGO', 'HS256'),
    'ttl' => env('JWT_TTL', 1800),
    'refresh_ttl' => env('JWT_REFRESH_TTL', 43200),
    'issuer' => env('APP_URL', 'http://localhost'),
];