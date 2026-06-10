export function build_receipt({ order }) {
  return {
    opn_charge_id: order.opn_charge_id,
    type: order.type,
    customer_name: order.customer_name,
    customer_email: order.customer_email,
    amount_thb: order.amount_thb,
    items: order.items ?? null,
    paid_at: order.updated_at ?? new Date().toISOString(),
    subject: order.type === 'donation'
      ? `Thank you for your donation to DNM — ฿${order.amount_thb}`
      : `Your DNM order is confirmed — ฿${order.amount_thb}`,
  };
}
