<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    | Allows the Next.js frontend (any localhost port) and future production
    | domains to communicate with this API.
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => env('CORS_ALLOWED_ORIGINS')
        ? explode(',', env('CORS_ALLOWED_ORIGINS'))
        : [
            'http://localhost:3000',
            'http://127.0.0.1:3000',
        ],

    // Any localhost / LAN port during local dev (frontend is pinned to :3000).
    'allowed_origins_patterns' => env('CORS_ALLOWED_ORIGINS') ? [] : [
        '#^https?://(localhost|127\.0\.0\.1)(:\d+)?$#',
        '#^https?://192\.168\.\d{1,3}\.\d{1,3}(:\d+)?$#',
        '#^https?://10\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?$#',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    /**
     * Must be true for Sanctum cookie-based SPA auth (withCredentials: true
     * in axios).
     */
    'supports_credentials' => true,

];
