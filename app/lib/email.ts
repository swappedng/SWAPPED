import { Resend } from 'resend';
import { getSwapMethodLabel, SwapMethod } from '@/lib/api/types/enums';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = 'SWAPPED <noreply@swapped.com>';
const APP_BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

// ─── Confirmation email (existing) ───────────────────────────────────────────


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

// ─── Revised offer email ──────────────────────────────────────────────────────

const fmt = (v: number) => `₦${Number(v).toLocaleString('en-NG')}`;

export async function sendRevisedOfferEmail({
  swap,
  offer,
  originalTradeInValue,
  reason,
}: {
  swap: { contactEmail?: string | null; upgradeModel: string; upgradeStorage: string };
  offer: {
    id: string;
    responseToken?: string | null;
    tradeInValue: number;
    upgradePrice: number;
    amountToPay: number;
  };
  originalTradeInValue: number;
  reason: string;
}): Promise<{ success: boolean; error?: any }> {
  if (!swap.contactEmail) return { success: false, error: 'No email address' };

  const acceptUrl = `${APP_BASE_URL}/offer-response?token=${offer.responseToken}&action=accept`;
  const rejectUrl = `${APP_BASE_URL}/offer-response?token=${offer.responseToken}&action=reject`;

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Revised Swap Offer – SWAPPED</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; color: #333; background: #f5f5f5; margin: 0; padding: 20px; }
    .wrap { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,.08); }
    h1 { font-size: 22px; color: #000; margin-bottom: 6px; }
    p { line-height: 1.6; }
    .section { background: #f9f9f9; border-radius: 6px; padding: 20px; margin: 20px 0; }
    .row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #eee; }
    .row:last-child { border-bottom: none; }
    .label { color: #666; }
    .value { font-weight: 600; color: #000; }
    .highlight { font-size: 28px; font-weight: bold; color: #000; }
    .reason { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 4px; margin: 16px 0; }
    .btn { display: inline-block; padding: 12px 28px; border-radius: 6px; font-weight: 700; font-size: 15px; text-decoration: none; margin: 8px 4px; }
    .btn-accept { background: #16a34a; color: #fff !important; }
    .btn-reject { background: #dc2626; color: #fff !important; }
    .footer { text-align: center; margin-top: 32px; font-size: 13px; color: #999; }
    .expiry { font-size: 12px; color: #999; margin-top: 12px; }
  </style>
</head>
<body>
  <div class="wrap">
    <div style="text-align:center;margin-bottom:24px;font-size:22px;font-weight:bold;">SWAPPED</div>
    <h1>Your swap offer has been revised</h1>
    <p>After inspecting your device, our team has prepared a revised offer for your swap. Please review the details below and let us know your decision.</p>

    <div class="reason">
      <strong>Reason for revision:</strong><br>${reason}
    </div>

    <div class="section">
      <h2 style="margin-top:0;font-size:16px;">Offer comparison</h2>
      <div class="row"><span class="label">Original trade-in value</span><span class="value">${fmt(originalTradeInValue)}</span></div>
      <div class="row"><span class="label">Revised trade-in value</span><span class="value">${fmt(offer.tradeInValue)}</span></div>
      <div class="row"><span class="label">Upgrade phone</span><span class="value">${swap.upgradeModel} ${swap.upgradeStorage}</span></div>
      <div class="row"><span class="label">Upgrade price</span><span class="value">${fmt(offer.upgradePrice)}</span></div>
    </div>

    <div class="section" style="text-align:center;">
      <p style="color:#666;margin-top:0;">Revised amount to pay</p>
      <div class="highlight">${fmt(offer.amountToPay)}</div>
    </div>

    <p style="text-align:center;font-weight:600;">Do you accept this revised offer?</p>
    <div style="text-align:center;margin:20px 0;">
      <a href="${acceptUrl}" class="btn btn-accept">✓ Accept offer</a>
      <a href="${rejectUrl}" class="btn btn-reject">✗ Decline offer</a>
    </div>
    <p class="expiry">These links expire in 72 hours. If you have questions, contact us at <strong>support@swapped.com</strong>.</p>

    <div class="footer">SWAPPED · The easiest way to upgrade your iPhone</div>
  </div>
</body>
</html>`;

  try {
    const { data, error } = await resend.emails.send({
      from: FROM,
      to: [swap.contactEmail],
      subject: 'Revised swap offer – action required',
      html,
    });
    if (error) return { success: false, error };
    return { success: true };
  } catch (err) {
    return { success: false, error: err };
  }
}

// ─── Admin rejection notification ─────────────────────────────────────────────

export async function sendAdminRejectionNotification({
  swap,
  offer,
}: {
  swap: { id: string; contactName?: string | null; contactEmail?: string | null; tradeInModel?: { model: string; storage: string } };
  offer: { tradeInValue: number; upgradePrice: number; amountToPay: number };
}): Promise<{ success: boolean; error?: any }> {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (!adminEmail) return { success: false, error: 'No admin notification email configured' };

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Customer rejected revised offer</title></head>
<body style="font-family:sans-serif;color:#333;padding:20px;">
  <h2>Customer rejected a revised swap offer</h2>
  <p>Swap ID: <strong>${swap.id}</strong></p>
  <p>Customer: ${swap.contactName ?? 'Unknown'} (${swap.contactEmail ?? 'no email'})</p>
  <p>Trade-in device: ${swap.tradeInModel?.model ?? ''} ${swap.tradeInModel?.storage ?? ''}</p>
  <p>Revised offer details:</p>
  <ul>
    <li>Trade-in value: ${fmt(offer.tradeInValue)}</li>
    <li>Upgrade price: ${fmt(offer.upgradePrice)}</li>
    <li>Amount to pay: ${fmt(offer.amountToPay)}</li>
  </ul>
  <p>Please coordinate device return with the customer if it has already been collected.</p>
  <p><a href="${APP_BASE_URL}/admin/swaps/${swap.id}">View swap in admin →</a></p>
</body>
</html>`;

  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: [adminEmail],
      subject: `Customer rejected revised offer – Swap ${swap.id.slice(-8).toUpperCase()}`,
      html,
    });
    if (error) return { success: false, error };
    return { success: true };
  } catch (err) {
    return { success: false, error: err };
  }
}

// ─── Appointment booking email ─────────────────────────────────────────────────

export async function sendAppointmentConfirmationEmail({
  to,
  appointmentDetails,
}: {
  to: string;
  appointmentDetails: {
    date: string;
    time: string;
    swapMethod: SwapMethod;
  };
}): Promise<{ success: boolean; error?: any }> {
  const { date, time, swapMethod } = appointmentDetails;
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Appointment Confirmed – SWAPPED</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; color: #333; background: #f5f5f5; margin: 0; padding: 20px; }
    .wrap { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,.08); }
    h1 { font-size: 22px; color: #000; margin-bottom: 6px; }
    p { line-height: 1.6; }
    .section { background: #f9f9f9; border-radius: 6px; padding: 20px; margin: 20px 0; }
    .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
    .row:last-child { border-bottom: none; }
    .label { color: #666; }
    .value { font-weight: 600; color: #000; }
    .highlight { font-size: 20px; font-weight: bold; color: #000; }
    .footer { text-align: center; margin-top: 32px; font-size: 13px; color: #999; }
  </style>
</head>
<body>
  <div class="wrap">
    <div style="text-align:center;margin-bottom:24px;font-size:22px;font-weight:bold;">SWAPPED</div>
    <h1>Appointment Confirmed</h1>
    <p>Your appointment has been successfully scheduled. Here are the details:</p>

    <div class="section">
      <h2 style="margin-top:0;font-size:16px;">Appointment Details</h2>
      <div class="row"><span class="label">Date</span><span class="value">${formattedDate}</span></div>
      <div class="row"><span class="label">Time</span><span class="value">${time}</span></div>
      <div class="row"><span class="label">Method</span><span class="value">${getSwapMethodLabel(swapMethod)}</span></div>
    </div>

    <p>Please arrive on time for your appointment. If you need to reschedule, please contact us at <strong>support@swapped.com</strong>.</p>

    <div class="footer">SWAPPED · The easiest way to upgrade your iPhone</div>
  </div>
</body>
</html>`;

  try {
    const { data, error } = await resend.emails.send({
      from: FROM,
      to: [to],
      subject: 'Appointment Confirmed – SWAPPED',
      html,
    });
    if (error) return { success: false, error };
    return { success: true };
  } catch (err) {
    return { success: false, error: err };
  }
}

export async function sendAdminAppointmentNotification({
  swap,
  appointment,
}: {
  swap: { id: string; contactName?: string | null; contactEmail?: string | null; contactPhone?: string | null };
  appointment: { date: string; time: string; swapMethod: SwapMethod };
}): Promise<{ success: boolean; error?: any }> {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (!adminEmail) return { success: false, error: 'No admin notification email configured' };

  const formattedDate = new Date(appointment.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>New appointment booked</title></head>
<body style="font-family:sans-serif;color:#333;padding:20px;">
  <h2>New appointment booked</h2>
  <p>Swap ID: <strong>${swap.id}</strong></p>
  <p>Customer: ${swap.contactName ?? 'Unknown'}</p>
  <p>Email: ${swap.contactEmail ?? 'no email'}</p>
  <p>Phone: ${swap.contactPhone ?? 'no phone'}</p>
  <p>Appointment details:</p>
  <ul>
    <li>Date: ${formattedDate}</li>
    <li>Time: ${appointment.time}</li>
    <li>Method: ${getSwapMethodLabel(appointment.swapMethod)}</li>
  </ul>
  <p><a href="${APP_BASE_URL}/admin/swaps/${swap.id}">View swap in admin →</a></p>
</body>
</html>`;

  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: [adminEmail],
      subject: `New appointment booked – Swap ${swap.id.slice(-8).toUpperCase()}`,
      html,
    });
    if (error) return { success: false, error };
    return { success: true };
  } catch (err) {
    return { success: false, error: err };
  }
}
