<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller as BaseController;

class BkashController extends BaseController
{
    private $app_key = '4f6o0cjiki2rfm34kfdadl1eqq';
    private $app_secret = '2is7hdktrekvrbljjh44ll3d9l1dtjo4pasmjvs5vl5qr3fug4b';
    private $username = 'sandboxTokenizedUser02';
    private $password = 'sandboxTokenizedUser02@12345';
    private $base_url = 'https://checkout.sandbox.bka.sh/v1.2.0-beta';

    public function createPayment(Request $request)
    {
        // 1. Get Token
        $auth_url = $this->base_url . "/checkout/token/grant";
        $auth_headers = [
            "Content-Type: application/json",
            "username: " . $this->username,
            "password: " . $this->password
        ];
        $auth_body = json_encode(['app_key' => $this->app_key, 'app_secret' => $this->app_secret]);

        $ch = curl_init($auth_url);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
        curl_setopt($ch, CURLOPT_POSTFIELDS, $auth_body);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Important for Localhost
        curl_setopt($ch, CURLOPT_HTTPHEADER, $auth_headers);
        $auth_result = curl_exec($ch);
        $auth_json = json_decode($auth_result, true);
        curl_close($ch);

        $token = $auth_json['id_token'] ?? null;

        if (!$token) {
            return response()->json(['error' => 'bKash Token Failed', 'details' => $auth_result], 500);
        }

        // 2. Create Payment Request
        $create_url = $this->base_url . "/checkout/payment/create";
        $create_headers = [
            "Content-Type: application/json",
            "Authorization: " . $token,
            "X-APP-Key: " . $this->app_key
        ];
        
        $create_body = json_encode([
            'mode' => '0011',
            'payerReference' => $request->customer_phone ?? '01700000000',
            'callbackURL' => "http://localhost:3000/bkash-callback",
            'amount' => $request->total_price,
            'currency' => 'BDT',
            'intent' => 'sale',
            'merchantInvoiceNumber' => 'INV' . time()
        ]);

        $ch = curl_init($create_url);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
        curl_setopt($ch, CURLOPT_POSTFIELDS, $create_body);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Important for Localhost
        curl_setopt($ch, CURLOPT_HTTPHEADER, $create_headers);
        $create_result = curl_exec($ch);
        curl_close($ch);

        return response()->json(json_decode($create_result, true));
    }
}