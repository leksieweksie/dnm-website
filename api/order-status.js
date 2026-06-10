import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  res.setHeader('Access-Control-Allow-Origin', process.env.SITE_URL || '*');

  const { charge_id } = req.query;
  if (!charge_id) return res.status(400).json({ error: 'Missing charge_id' });

  const { data, error } = await supabase
    .from('orders')
    .select('status, type, amount_thb, customer_name')
    .eq('opn_charge_id', charge_id)
    .single();

  if (error || !data) return res.status(404).json({ error: 'Order not found' });

  return res.status(200).json({
    status:        data.status,
    type:          data.type,
    amount_thb:    data.amount_thb,
    customer_name: data.customer_name,
  });
}
