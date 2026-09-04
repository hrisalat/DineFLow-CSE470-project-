import html2pdf from 'html2pdf.js';

export const generateReceiptPdf = (order) => {
    if (!order) return;

    const orderId = order.id || order.order_id || 'N/A';
    const customerPhone = order.customer_phone || 'N/A';
    const customerName = order.customer_name || '';
    const paymentMethod = (order.payment_method || '').toUpperCase();
    const totalPrice = parseFloat(order.total_price || 0).toFixed(2);
    const items = order.items || [];
    const dateStr = new Date().toLocaleString();

    const itemsHtml = items.map(item => `
        <tr style="border-bottom: 1px solid #f4f4f4;">
            <td style="padding: 8px 0;">${item.item_name || item.name}</td>
            <td style="padding: 8px 0; text-align: center;">${item.quantity}</td>
            <td style="padding: 8px 0; text-align: right;">Tk ${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
    `).join('');

    const element = document.createElement('div');
    element.innerHTML = `
        <div style="font-family: Arial, sans-serif; color: #333; padding: 25px; max-width: 400px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; background: #fff;">
            <div style="text-align: center; border-bottom: 2px dashed #ddd; padding-bottom: 15px; margin-bottom: 15px;">
                <h2 style="margin: 0 0 5px 0; color: #111; font-size: 22px;">DineFlow Receipt</h2>
                <p style="margin: 2px 0; color: #666; font-size: 13px;">Thank you for your order!</p>
            </div>

            <table style="width: 100%; font-size: 13px; margin-bottom: 15px;">
                <tr>
                    <td style="font-weight: bold; color: #555; width: 40%; padding: 4px 0;">Order No:</td>
                    <td style="padding: 4px 0;">#DF-${orderId}</td>
                </tr>
                <tr>
                    <td style="font-weight: bold; color: #555; padding: 4px 0;">Phone number:</td>
                    <td style="padding: 4px 0;">${customerPhone}</td>
                </tr>
                ${customerName ? `
                <tr>
                    <td style="font-weight: bold; color: #555; padding: 4px 0;">Customer Name:</td>
                    <td style="padding: 4px 0;">${customerName}</td>
                </tr>` : ''}
                <tr>
                    <td style="font-weight: bold; color: #555; padding: 4px 0;">Payment method:</td>
                    <td style="padding: 4px 0;">${paymentMethod}</td>
                </tr>
                <tr>
                    <td style="font-weight: bold; color: #555; padding: 4px 0;">Date:</td>
                    <td style="padding: 4px 0;">${dateStr}</td>
                </tr>
            </table>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 13px;">
                <thead>
                    <tr style="border-bottom: 1px solid #ddd; text-align: left; color: #555;">
                        <th style="padding: 6px 0;">Item</th>
                        <th style="padding: 6px 0; text-align: center;">Qty</th>
                        <th style="padding: 6px 0; text-align: right;">Price</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
            </table>

            <div style="border-top: 2px solid #222; padding-top: 10px; font-size: 15px; font-weight: bold; text-align: right; margin-bottom: 20px;">
                Total: Tk ${totalPrice}
            </div>

            <div style="text-align: center; border-top: 1px dashed #ddd; padding-top: 15px; font-size: 12px; color: #666;">
                <p style="margin-bottom: 5px; font-weight: bold;">Check your order progress here:</p>
                <p style="margin: 0;"><a href="http://localhost:3000/order-progress" style="color: #6366f1; text-decoration: none;">http://localhost:3000/order-progress</a></p>
            </div>
        </div>
    `;

    const opt = {
        margin:       10,
        filename:     `receipt_DF-${orderId}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
};
