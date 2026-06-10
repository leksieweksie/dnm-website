import { runPaymentAgent } from '../agent/payment_agent.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  res.setHeader('Access-Control-Allow-Origin', process.env.SITE_URL || '*');

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { type, name, email, items, amount } = body;

    if (!type || !name || !email) {
      return res.status(400).json({ error: 'Missing required fields: type, name, email' });
    }
    if (type === 'product' && (!Array.isArray(items) || items.length === 0)) {
      return res.status(400).json({ error: 'Cart is empty' });
    }
    if (type === 'donation' && (!amount || amount < 1)) {
      return res.status(400).json({ error: 'Invalid donation amount' });
    }

    const result = await runPaymentAgent('new_checkout', { type, name, email, items, amount });

    if (result.error || result.flagged) {
      return res.status(400).json({ error: result.error ?? 'Transaction flagged for review' });
    }

    return res.status(200).json({
      charge_id: result.charge_id,
      qr_url:    result.qr_url,
      expires_at: result.expires_at,
    });
  } catch (err) {
    console.error('[create-charge]', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
