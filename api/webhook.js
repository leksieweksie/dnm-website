import crypto from 'crypto';
import { runPaymentAgent } from '../agent/payment_agent.js';

export const config = { api: { bodyParser: false } };

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function verifySignature(rawBody, signature, secret) {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const rawBody = await getRawBody(req);
  const signature = req.headers['opn-signature'] ?? req.headers['omise-signature'] ?? '';

  if (process.env.OPN_WEBHOOK_SECRET) {
    try {
      if (!verifySignature(rawBody, signature, process.env.OPN_WEBHOOK_SECRET)) {
        return res.status(401).json({ error: 'Invalid webhook signature' });
      }
    } catch {
      return res.status(401).json({ error: 'Signature verification failed' });
    }
  }

  const event = JSON.parse(rawBody.toString());
  const chargeId = event.data?.id;
  const eventKey = event.key; // e.g. 'charge.complete'

  if (!chargeId) return res.status(400).json({ error: 'No charge ID in webhook' });

  try {
    if (eventKey === 'charge.complete') {
      await runPaymentAgent('payment_confirmed', { charge_id: chargeId });
    } else if (eventKey === 'charge.failed' || eventKey === 'charge.expired') {
      await runPaymentAgent('payment_failed', { charge_id: chargeId });
    }
    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('[webhook]', err);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
}
