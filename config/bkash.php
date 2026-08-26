<?php

return [
    "sandbox"         => env("BKASH_SANDBOX", true),
    "bkash_app_key"   => env("BKASH_CHECKOUT_APP_KEY"),
    "bkash_app_secret" => env("BKASH_CHECKOUT_APP_SECRET"),
    "bkash_username"  => env("BKASH_CHECKOUT_USERNAME"),
    "bkash_password"  => env("BKASH_CHECKOUT_PASSWORD"),
    "bkash_app_base_url" => env("BKASH_CHECKOUT_APP_BASE_URL"),
    "callback_url"    => "http://localhost:3000/bkash-callback",
];