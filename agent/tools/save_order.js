import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export async function save_order({ type, status, opn_charge_id, customer_name, customer_email, amount_thb, items = null, notes = null }) {
  const { data, error } = await supabase
    .from('orders')
    .upsert(
      { type, status, opn_charge_id, customer_name, customer_email, amount_thb, items, notes },
      { onConflict: 'opn_charge_id' }
    )
    .select()
    .single();

  if (error) throw new Error(`Supabase save_order error: ${error.message}`);
  return { id: data.id, status: data.status };
}
