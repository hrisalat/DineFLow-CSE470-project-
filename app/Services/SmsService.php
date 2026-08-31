<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SmsService
{
    /**
     * Format a Bangladeshi phone number into standard 8801... format.
     */
    public static function formatPhoneNumber($phone)
    {
        $cleaned = preg_replace('/[^0-9]/', '', (string)$phone);

        // If it starts with 880 and has 13 digits (8801XXXXXXXXX)
        if (str_starts_with($cleaned, '880') && strlen($cleaned) === 13) {
            return $cleaned;
        }

        // If it starts with 01 and has 11 digits (01XXXXXXXXX)
        if (str_starts_with($cleaned, '01') && strlen($cleaned) === 11) {
            return '88' . $cleaned;
        }

        // If it has 10 digits starting with 1 (1XXXXXXXXX)
        if (str_starts_with($cleaned, '1') && strlen($cleaned) === 10) {
            return '880' . $cleaned;
        }

        return $cleaned;
    }

    /**
     * Build the standard order confirmation message.
     */
    public static function buildOrderMessage($order, $items = [])
    {
        $orderId = $order->id;
        $totalCost = number_format((float)$order->total_price, 2, '.', '');
        
        $itemLines = [];
        if (!empty($items)) {
            foreach ($items as $item) {
                $name = is_array($item) ? ($item['name'] ?? $item['item_name'] ?? 'Item') : ($item->item_name ?? 'Item');
                $qty = is_array($item) ? ($item['quantity'] ?? 1) : ($item->quantity ?? 1);
                $itemLines[] = "{$name} x {$qty}";
            }
        } elseif ($order->relationLoaded('items') && $order->items) {
            foreach ($order->items as $item) {
                $itemLines[] = "{$item->item_name} x {$item->quantity}";
            }
        }

        $itemsText = !empty($itemLines) ? implode("\n", $itemLines) : "Items confirmed";
        $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
        $progressUrl = rtrim($frontendUrl, '/') . '/order-progress';

        return "Order no: #DF_{$orderId}\n" .
               "{$itemsText}\n" .
               "Total Cost: ৳{$totalCost}\n" .
               "Check order progress here: {$progressUrl}";
    }

    /**
     * Send SMS and return delivery status and WhatsApp URL.
     */
    public static function sendOrderConfirmation($order, $items = [])
    {
        $phone = $order->customer_phone;
        if (empty($phone)) {
            return [
                'success' => false,
                'message' => 'No customer phone provided',
                'sms_text' => null,
                'whatsapp_url' => null
            ];
        }

        $formattedPhone = self::formatPhoneNumber($phone);
        $messageText = self::buildOrderMessage($order, $items);
        $whatsappUrl = "https://wa.me/{$formattedPhone}?text=" . urlencode($messageText);

        Log::info("=== DineFlow Order Confirmation Notification ===");
        Log::info("Target Phone: {$phone} (Normalized: {$formattedPhone})");
        Log::info("Message Content:\n{$messageText}");
        Log::info("WhatsApp Link: {$whatsappUrl}");

        $smsSent = false;

        // Try BD SMS Gateway if API key is configured
        $apiKey = env('SMS_BD_API_KEY');
        $senderId = env('SMS_BD_SENDER_ID', 'DineFlow');

        if (!empty($apiKey) && $apiKey !== 'your_api_key_here') {
            try {
                // Try sms.net.bd API endpoint
                $response = Http::timeout(8)->post('https://api.sms.net.bd/sendsms', [
                    'api_key' => $apiKey,
                    'msg' => $messageText,
                    'to' => $formattedPhone,
                    'sender_id' => $senderId
                ]);

                if ($response->successful()) {
                    $resData = $response->json();
                    if (isset($resData['error']) && $resData['error'] === 0) {
                        $smsSent = true;
                        Log::info("SMS successfully sent via sms.net.bd: " . json_encode($resData));
                    } else {
                        Log::warning("sms.net.bd returned notice: " . $response->body());
                    }
                }
            } catch (\Exception $e) {
                Log::warning("SMS gateway request error: " . $e->getMessage());
            }

            // If not sent yet, try Bulksmsbd API
            if (!$smsSent) {
                try {
                    $response = Http::timeout(8)->get('http://bulksmsbd.net/api/smsapi', [
                        'api_key' => $apiKey,
                        'type' => 'text',
                        'number' => $formattedPhone,
                        'senderid' => $senderId,
                        'message' => $messageText
                    ]);

                    if ($response->successful() && str_contains($response->body(), 'success_cause')) {
                        $smsSent = true;
                        Log::info("SMS successfully sent via bulksmsbd: " . $response->body());
                    }
                } catch (\Exception $e) {
                    Log::warning("Bulksmsbd gateway request error: " . $e->getMessage());
                }
            }
        }

        // Try Twilio if Twilio credentials are in env
        if (!$smsSent && env('TWILIO_SID') && env('TWILIO_TOKEN') && env('TWILIO_FROM')) {
            try {
                $twilioSid = env('TWILIO_SID');
                $twilioToken = env('TWILIO_TOKEN');
                $twilioFrom = env('TWILIO_FROM');
                $twilioPhone = '+' . $formattedPhone;

                $twilio = new \Twilio\Rest\Client($twilioSid, $twilioToken);
                $twilio->messages->create($twilioPhone, [
                    'from' => $twilioFrom,
                    'body' => $messageText
                ]);
                $smsSent = true;
                Log::info("SMS successfully sent via Twilio to {$twilioPhone}");
            } catch (\Exception $e) {
                Log::warning("Twilio SMS send error: " . $e->getMessage());
            }
        }

        return [
            'success' => true,
            'sms_sent' => $smsSent,
            'sms_message' => $messageText,
            'whatsapp_url' => $whatsappUrl,
            'formatted_phone' => $formattedPhone
        ];
    }
}
