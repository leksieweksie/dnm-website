import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function send_email({ to, subject, receipt }) {
  const itemsHtml = receipt.items
    ? receipt.items.map(i => `<tr><td style="padding:6px 0;border-bottom:1px solid #e8f5ec;">${i.name}</td><td style="padding:6px 0;border-bottom:1px solid #e8f5ec;text-align:right;">x${i.qty}</td><td style="padding:6px 0;border-bottom:1px solid #e8f5ec;text-align:right;">฿${i.price * i.qty}</td></tr>`).join('')
    : `<tr><td colspan="3" style="padding:6px 0;">Donation of ฿${receipt.amount_thb}</td></tr>`;

  const html = `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#102418;">
      <div style="background:#0F2E1A;padding:32px;text-align:center;border-radius:8px 8px 0 0;">
        <h1 style="color:#fff;font-size:24px;margin:0;">Thank you, ${receipt.customer_name}!</h1>
        <p style="color:rgba(255,255,255,0.7);margin:8px 0 0;">${receipt.type === 'donation' ? 'Your donation has been received.' : 'Your order has been confirmed.'}</p>
      </div>
      <div style="background:#fff;padding:32px;border:1px solid #e8f5ec;border-top:none;border-radius:0 0 8px 8px;">
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr style="border-bottom:2px solid #1F6B3A;">
              <th style="text-align:left;padding:6px 0;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#1F6B3A;">Item</th>
              <th style="text-align:right;padding:6px 0;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#1F6B3A;">Qty</th>
              <th style="text-align:right;padding:6px 0;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#1F6B3A;">Total</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        <div style="margin-top:20px;padding-top:16px;border-top:2px solid #1F6B3A;display:flex;justify-content:space-between;">
          <strong>Total Paid</strong>
          <strong style="color:#1F6B3A;">฿${receipt.amount_thb}</strong>
        </div>
        <p style="margin-top:24px;color:#4a6b55;font-size:14px;line-height:1.6;">All proceeds go directly to DNM's drug prevention programs in Phuket. If you have any questions, reply to this email or contact us at info@drugsnomore.org.</p>
        <p style="margin-top:16px;color:#A7B3AA;font-size:12px;">Reference: ${receipt.opn_charge_id}</p>
      </div>
    </div>`;

  const { data, error } = await resend.emails.send({
    from: 'DNM <noreply@drugsnomore.org>',
    to,
    subject,
    html,
  });

  if (error) throw new Error(`Resend error: ${error.message}`);
  return { email_id: data.id };
}
