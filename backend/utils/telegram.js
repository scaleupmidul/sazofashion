export const sendTelegramMessage = async ({ botToken, chatId, text }) => {
  if (!botToken || !chatId) {
    return { success: false, error: 'Telegram Bot Token or Chat ID missing.' };
  }

  // Clean bot token if prefix 'bot' was included
  const cleanToken = botToken.trim().replace(/^bot/i, '');
  const cleanChatId = chatId.trim();

  const url = `https://api.telegram.org/bot${cleanToken}/sendMessage`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: cleanChatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
        disable_notification: false // Loud ringtone/sound notification on phone
      })
    });

    const data = await response.json();
    if (data.ok) {
      console.log(`[Telegram Bot] Notification sent successfully to Chat ID: ${cleanChatId}`);
      return { success: true, data };
    } else {
      console.error(`[Telegram Bot] Telegram API error response:`, data);
      return { success: false, error: data.description || 'Telegram API Error' };
    }
  } catch (error) {
    console.error(`[Telegram Bot] Connection error:`, error);
    return { success: false, error: error.message };
  }
};

export const sendTelegramOrderNotification = async (order, settings) => {
  if (!settings || settings.telegramEnabled === false) {
    return;
  }

  const botToken = settings.telegramBotToken || process.env.TELEGRAM_BOT_TOKEN;
  const chatId = settings.telegramChatId || process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.log('[Telegram Bot] Bot token or Chat ID not configured.');
    return;
  }

  const circledNumbers = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩', '⑪', '⑫', '⑬', '⑭', '⑮', '⑯', '⑰', '⑱', '⑲', '⑯', '⑳'];

  const itemsList = (order.cartItems || []).map((item, idx) => {
    const num = circledNumbers[idx] || `(${idx + 1})`;
    const sizePart = item.size ? `• <b>Size:</b> ${item.size} ` : '';
    const unitPrice = (item.price || 0).toLocaleString();
    const itemSubtotal = ((item.quantity || 1) * (item.price || 0)).toLocaleString();
    return `${num} <b>${item.name}</b>
${sizePart ? sizePart + '• ' : '• '}<b>Quantity:</b> ${item.quantity}
• <b>Unit Price:</b> ৳${unitPrice}
• <b>Subtotal:</b> ৳${itemSubtotal}`;
  }).join('\n\n');

  const productTotalVal = (order.cartItems || []).reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0);
  const productTotal = productTotalVal.toLocaleString();
  const deliveryCharge = (order.shippingCharge || 0).toLocaleString();
  const discount = order.discountAmount || 0;
  const grandTotal = (order.total || 0).toLocaleString();

  const d = order.createdAt ? new Date(order.createdAt) : new Date();
  const day = d.toLocaleDateString('en-GB', { timeZone: 'Asia/Dhaka', day: '2-digit' });
  const month = d.toLocaleDateString('en-GB', { timeZone: 'Asia/Dhaka', month: 'short' });
  const year = d.toLocaleDateString('en-GB', { timeZone: 'Asia/Dhaka', year: 'numeric' });
  const time = d.toLocaleTimeString('en-US', { timeZone: 'Asia/Dhaka', hour: '2-digit', minute: '2-digit', hour12: true });
  const timeStr = `${day} ${month} ${year} • ${time}`;

  const customerName = `${order.firstName || ''} ${order.lastName || ''}`.trim();
  const paymentMethodStr = order.paymentMethod === 'Online' ? 'Online Payment' : 'Cash on Delivery (COD)';

  const message = `🛍️ <b>SAZO | New Order Received</b>

━━━━━━━━━━━━━━━━━━━━━━

📋 <b>Order Information:</b>
<b>Order ID:</b> #${order.orderId}
<b>Order Time:</b> ${timeStr}

👤 <b>Customer Information:</b>
<b>Name:</b> ${customerName}
<b>Phone:</b> ${order.phone}
<b>Address:</b> ${order.address}
<b>City/District:</b> ${order.city || 'N/A'}

💳 <b>Payment:</b>
<b>Method:</b> ${paymentMethodStr}
${order.paymentDetails?.transactionId ? `<b>Txn ID:</b> <code>${order.paymentDetails.transactionId}</code>\n<b>Sender Number:</b> <code>${order.paymentDetails.paymentNumber}</code>\n` : ''}${order.note ? `<b>Customer Note:</b> <i>${order.note}</i>\n` : ''}
📦 <b>Ordered Items:</b>
${itemsList}

💰 <b>Order Summary:</b>
<b>Product Total:</b> ৳${productTotal}
${discount > 0 ? `<b>Discount:</b> -৳${discount.toLocaleString()}\n` : ''}<b>Delivery Charge:</b> ৳${deliveryCharge}

✅ <b>Grand Total: ৳${grandTotal}</b>`;

  return await sendTelegramMessage({ botToken, chatId, text: message });
};
