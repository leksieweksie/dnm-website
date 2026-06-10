import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export async function check_fraud({ customer_email, amount_thb }) {
  const flags = [];

  // More than 5 orders from same email in last 24h
  const since = new Date(Date.now() - 86400000).toISOString();
  const { count } = await supabase
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .eq('customer_email', customer_email)
    .gte('created_at', since);

  if (count >= 5) flags.push('High order frequency from this email in last 24h');

  // Unusually large single transaction
  if (amount_thb > 10000) flags.push(`Unusually large amount: ฿${amount_thb}`);

  return {
    flagged: flags.length > 0,
    flags,
    recommendation: flags.length > 0 ? 'review' : 'proceed',
  };
}
