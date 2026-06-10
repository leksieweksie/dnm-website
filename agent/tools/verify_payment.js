import Omise from 'omise';

const omise = Omise({
  secretKey: process.env.OPN_SECRET_KEY,
  omiseVersion: '2019-05-29',
});

export async function verify_payment({ charge_id }) {
  const charge = await omise.charges.retrieve(charge_id);
  return {
    charge_id: charge.id,
    status: charge.status, // 'pending' | 'successful' | 'failed' | 'expired'
    amount_thb: charge.amount / 100,
    paid_at: charge.paid_at ?? null,
  };
}
