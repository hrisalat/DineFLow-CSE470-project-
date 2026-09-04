<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Receipt #DF-{{ $order->id }}</title>
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; margin: 0; padding: 20px; line-height: 1.5; }
        .receipt-card { max-width: 400px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 8px; }
        .header { text-align: center; border-bottom: 2px dashed #ddd; padding-bottom: 15px; margin-bottom: 15px; }
        .header h2 { margin: 0 0 5px 0; color: #111; font-size: 22px; }
        .header p { margin: 2px 0; color: #666; font-size: 13px; }
        .meta-table { width: 100%; font-size: 13px; margin-bottom: 15px; }
        .meta-table td { padding: 4px 0; }
        .meta-table td.label { font-weight: bold; color: #555; width: 40%; }
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 13px; }
        .items-table th { text-align: left; border-bottom: 1px solid #ddd; padding: 6px 0; color: #555; }
        .items-table td { border-bottom: 1px solid #f4f4f4; padding: 8px 0; }
        .items-table td.qty { text-align: center; }
        .items-table td.price { text-align: right; }
        .total-section { border-top: 2px solid #222; padding-top: 10px; font-size: 15px; font-weight: bold; text-align: right; margin-bottom: 20px; }
        .footer { text-align: center; border-top: 1px dashed #ddd; padding-top: 15px; font-size: 12px; color: #666; }
        .footer a { color: #6366f1; text-decoration: none; word-break: break-all; }
    </style>
</head>
<body>
    <div class="receipt-card">
        <div class="header">
            <h2>DineFlow Receipt</h2>
            <p>Thank you for your order!</p>
        </div>

        <table class="meta-table">
            <tr>
                <td class="label">Order No:</td>
                <td>#DF-{{ $order->id }}</td>
            </tr>
            <tr>
                <td class="label">Phone number:</td>
                <td>{{ $order->customer_phone }}</td>
            </tr>
            @if($order->customer_name)
            <tr>
                <td class="label">Customer Name:</td>
                <td>{{ $order->customer_name }}</td>
            </tr>
            @endif
            <tr>
                <td class="label">Payment method:</td>
                <td>{{ strtoupper($order->payment_method) }}</td>
            </tr>
            <tr>
                <td class="label">Date:</td>
                <td>{{ $order->created_at ? $order->created_at->format('Y-m-d H:i') : date('Y-m-d H:i') }}</td>
            </tr>
        </table>

        <table class="items-table">
            <thead>
                <tr>
                    <th>Item</th>
                    <th style="text-align: center;">Qty</th>
                    <th style="text-align: right;">Price</th>
                </tr>
            </thead>
            <tbody>
                @foreach($order->items as $item)
                <tr>
                    <td>{{ $item->item_name }}</td>
                    <td class="qty">{{ $item->quantity }}</td>
                    <td class="price">Tk {{ number_format($item->price * $item->quantity, 2) }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>

        <div class="total-section">
            Total: Tk {{ number_format($order->total_price, 2) }}
        </div>

        <div class="footer">
            <p style="margin-bottom: 5px; font-weight: bold;">Check your order progress here:</p>
            <p style="margin: 0;"><a href="http://localhost:3000/order-progress">http://localhost:3000/order-progress</a></p>
        </div>
    </div>
</body>
</html>
