<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Platform lead notifications
    |--------------------------------------------------------------------------
    | Where new white-label / platform leads from the marketing site are sent.
    | Falls back to the mail "from" address if LEADS_NOTIFY_EMAIL is unset.
    */
    'notify_email' => env('LEADS_NOTIFY_EMAIL', env('MAIL_FROM_ADDRESS', 'hello@example.com')),
];
