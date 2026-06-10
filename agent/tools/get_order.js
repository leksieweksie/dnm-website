import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export async function get_order({ opn_charge_id }) {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('opn_charge_id', opn_charge_id)
    .single();

  if (error) throw new Error(`Supabase get_order error: ${error.message}`);
  return data;
}
