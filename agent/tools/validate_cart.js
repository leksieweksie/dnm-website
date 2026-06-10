const PRODUCTS = {
  'DNM Classic T-Shirt':       390,
  'Green Awareness Wristband': 120,
  'Canvas Tote Bag':           280,
  'Embroidered Cap':           450,
  'Sticker Pack':               80,
  'Insulated Water Bottle':    650,
  'Forest Green Hoodie':       890,
  'Recycled Notebook':         180,
};

export function validate_cart({ items }) {
  if (!Array.isArray(items) || items.length === 0) {
    return { valid: false, error: 'Cart is empty.' };
  }

  let total = 0;
  const validated = [];

  for (const item of items) {
    const expectedPrice = PRODUCTS[item.name];
    if (!expectedPrice) return { valid: false, error: `Unknown product: ${item.name}` };
    if (item.qty < 1 || item.qty > 99) return { valid: false, error: `Invalid quantity for ${item.name}` };
    if (item.price !== expectedPrice) return { valid: false, error: `Price mismatch for ${item.name}` };
    total += expectedPrice * item.qty;
    validated.push({ name: item.name, qty: item.qty, price: expectedPrice });
  }

  return { valid: true, items: validated, total_thb: total };
}
