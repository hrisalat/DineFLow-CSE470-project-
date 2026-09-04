<?php

return [
    "sandbox"            => env("BKASH_SANDBOX", true),
    "bkash_app_key"      => env("BKASH_CHECKOUT_APP_KEY", "4f6o0cjiki2rfm34kfdadl1eqq"),
    "bkash_app_secret"   => env("BKASH_CHECKOUT_APP_SECRET", "2is7hdktrekvrbljjh44ll3d9l1dtjo4pasmjvs5vl5qr3fug4b"),
    "bkash_username"     => env("BKASH_CHECKOUT_USERNAME", "sandboxTokenizedUser02"),
    "bkash_password"     => env("BKASH_CHECKOUT_PASSWORD", "sandboxTokenizedUser02@12345"),
    "bkash_app_base_url" => env("BKASH_CHECKOUT_APP_BASE_URL", "https://tokenized.sandbox.bka.sh/v1.2.0-beta"),
    "callback_url"       => env("BKASH_CALLBACK_URL", "http://localhost:3000/bkash-callback"),
];