import { Resend } from 'resend';
import { getSwapMethodLabel, SwapMethod } from '@/lib/api/types/enums';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendSwapConfirmationEmail({
  to,
  swapDetails,
}: {
  to: string;
  swapDetails: {
    tradeInPhone: any;
    newPhone: any;
    tradeInValue: number;
    newPhonePrice: number;
    amountToPay: number;
    swapMethod: SwapMethod;
  };
}) {
  const { tradeInPhone, newPhone, tradeInValue, newPhonePrice, amountToPay, swapMethod } = swapDetails;

  try {
    const { data, error } = await resend.emails.send({
      from: 'SWAPPED <noreply@swapped.com>',
      to: [to],
      subject: 'Your iPhone Swap Quote - SWAPPED',
      html: generateEmailHTML(swapDetails),
    });

    if (error) {
      console.error('Error sending email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error };
  }
}

function generateEmailHTML(swapDetails: {
  tradeInPhone: any;
  newPhone: any;
  tradeInValue: number;
  newPhonePrice: number;
  amountToPay: number;
  swapMethod: SwapMethod;
}) {
  const { tradeInPhone, newPhone, tradeInValue, newPhonePrice, amountToPay, swapMethod } = swapDetails;
  const isPickup = swapMethod !== SwapMethod.WALK_IN;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your iPhone Swap Quote</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 40px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo {
      font-size: 28px;
      font-weight: bold;
      color: #000;
      margin-bottom: 10px;
    }
    .title {
      font-size: 24px;
      font-weight: 600;
      color: #000;
      margin-bottom: 10px;
    }
    .subtitle {
      color: #666;
      font-size: 16px;
    }
    .section {
      margin: 30px 0;
      padding: 20px;
      background-color: #f9f9f9;
      border-radius: 6px;
    }
    .section-title {
      font-size: 18px;
      font-weight: 600;
      color: #000;
      margin-bottom: 15px;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #eee;
    }
    .detail-row:last-child {
      border-bottom: none;
    }
    .detail-label {
      color: #666;
      font-weight: 500;
    }
    .detail-value {
      color: #000;
      font-weight: 600;
    }
    .highlight-box {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 25px;
      border-radius: 8px;
      text-align: center;
      margin: 30px 0;
    }
    .amount {
      font-size: 36px;
      font-weight: bold;
      margin: 10px 0;
    }
    .amount-label {
      font-size: 14px;
      opacity: 0.9;
    }
    .next-steps {
      background-color: #f0f9ff;
      border-left: 4px solid #000;
      padding: 20px;
      margin: 30px 0;
    }
    .next-steps h3 {
      margin-top: 0;
      color: #000;
    }
    .next-steps ul {
      margin: 10px 0;
      padding-left: 20px;
    }
    .next-steps li {
      margin: 8px 0;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #eee;
      color: #666;
      font-size: 14px;
    }
    .button {
      display: inline-block;
      background-color: #000;
      color: white !important;
      padding: 12px 30px;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 600;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">SWAPPED</div>
      <h1 class="title">Your iPhone Swap Quote</h1>
      <p class="subtitle">Thank you for choosing SWAPPED for your iPhone upgrade!</p>
    </div>

    <div class="highlight-box">
      <div class="amount-label">Estimated Amount to Pay</div>
      <div class="amount">₦${(amountToPay - 20000).toLocaleString()} - ₦${(amountToPay + 20000).toLocaleString()}</div>
      <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">
        Final amount may vary based on device inspection
      </p>
    </div>

    <div class="section">
      <h2 class="section-title">📱 Your Trade-In Device</h2>
      <div class="detail-row">
        <span class="detail-label">Model:</span>
        <span class="detail-value">${tradeInPhone.model || 'Not specified'}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Estimated Value:</span>
        <span class="detail-value">₦${tradeInValue.toLocaleString()}</span>
      </div>
    </div>

    <div class="section">
      <h2 class="section-title">✨ Your New Device</h2>
      <div class="detail-row">
        <span class="detail-label">Model:</span>
        <span class="detail-value">${newPhone.model || 'Not specified'}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Storage:</span>
        <span class="detail-value">${newPhone.storage || 'Not specified'}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Category:</span>
        <span class="detail-value">${newPhone.category || 'Not specified'}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Price:</span>
        <span class="detail-value">₦${newPhonePrice.toLocaleString()}</span>
      </div>
    </div>

    <div class="next-steps">
      <h3>📋 Next Steps</h3>
      <p><strong>Swap Method:</strong> ${getSwapMethodLabel(swapMethod)}</p>
      
      ${isPickup ? `
        <ul>
          <li><strong>Step 1:</strong> Our team will contact you within 24 hours to confirm details</li>
          <li><strong>Step 2:</strong> We'll arrange a convenient pickup time for your trade-in device</li>
          <li><strong>Step 3:</strong> Device inspection will be done upon pickup</li>
          <li><strong>Step 4:</strong> Once approved, we'll deliver your new iPhone and collect payment</li>
        </ul>
      ` : `
        <ul>
          <li><strong>Step 1:</strong> Visit our store at your convenience</li>
          <li><strong>Step 2:</strong> Bring your trade-in device and valid ID</li>
          <li><strong>Step 3:</strong> We'll inspect your device on-site</li>
          <li><strong>Step 4:</strong> Complete the swap and walk out with your new iPhone!</li>
        </ul>
      `}
    </div>

    <div style="text-align: center;">
      <p>Have questions? We're here to help!</p>
      <p style="font-size: 14px; color: #666;">
        Contact us at <strong>support@swapped.com</strong><br>
        or call <strong>+234-XXX-XXX-XXXX</strong>
      </p>
    </div>

    <div class="footer">
      <p><strong>SWAPPED</strong> - The easiest way to upgrade your iPhone</p>
      <p style="font-size: 12px; margin-top: 10px;">
        This quote is valid for 7 days from the date of issue.
      </p>
    </div>
  </div>
</body>
</html>
  `;
}
