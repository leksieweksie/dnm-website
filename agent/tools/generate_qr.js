import Omise from 'omise';

const omise = Omise({
  secretKey: process.env.OPN_SECRET_KEY,
  omiseVersion: '2019-05-29',
});

export async function generate_qr({ amount_thb, customer_email, description }) {
  const charge = await omise.charges.create({
    amount: amount_thb * 100, // Omise uses satang (1/100 of THB)
    currency: 'thb',
    source: { type: 'promptpay' },
    description,
    metadata: { customer_email },
    return_uri: `${process.env.SITE_URL}/success.html`,
  });

  return {
    charge_id: charge.id,
    qr_url: charge.source?.scannable_code?.image?.download_uri ?? null,
    status: charge.status,
    expires_at: charge.expires_at,
  };
}
