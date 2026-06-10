import Anthropic from '@anthropic-ai/sdk';
import { generate_qr }    from './tools/generate_qr.js';
import { verify_payment } from './tools/verify_payment.js';
import { save_order }     from './tools/save_order.js';
import { get_order }      from './tools/get_order.js';
import { send_email }     from './tools/send_email.js';
import { validate_cart }  from './tools/validate_cart.js';
import { check_fraud }    from './tools/check_fraud.js';
import { build_receipt }  from './tools/build_receipt.js';

const client = new Anthropic();

const TOOLS = [
  {
    name: 'generate_qr',
    description: 'Create a PromptPay charge via Opn Payments and return a QR code URL and charge ID.',
    input_schema: {
      type: 'object',
      properties: {
        amount_thb:      { type: 'number',  description: 'Amount in Thai Baht (whole number)' },
        customer_email:  { type: 'string',  description: 'Customer email address' },
        description:     { type: 'string',  description: 'Order or donation description' },
      },
      required: ['amount_thb', 'customer_email', 'description'],
    },
  },
  {
    name: 'verify_payment',
    description: 'Check the current status of an Opn Payments charge.',
    input_schema: {
      type: 'object',
      properties: {
        charge_id: { type: 'string', description: 'Opn Payments charge ID (chrg_...)' },
      },
      required: ['charge_id'],
    },
  },
  {
    name: 'save_order',
    description: 'Create or update an order record in the database.',
    input_schema: {
      type: 'object',
      properties: {
        type:            { type: 'string', enum: ['product', 'donation'] },
        status:          { type: 'string', enum: ['pending', 'paid', 'failed'] },
        opn_charge_id:   { type: 'string' },
        customer_name:   { type: 'string' },
        customer_email:  { type: 'string' },
        amount_thb:      { type: 'number' },
        items:           { type: ['array', 'null'], description: 'Cart items (null for donations)' },
        notes:           { type: ['string', 'null'] },
      },
      required: ['type', 'status', 'opn_charge_id', 'customer_name', 'customer_email', 'amount_thb'],
    },
  },
  {
    name: 'get_order',
    description: 'Retrieve an order from the database by Opn charge ID.',
    input_schema: {
      type: 'object',
      properties: {
        opn_charge_id: { type: 'string' },
      },
      required: ['opn_charge_id'],
    },
  },
  {
    name: 'send_email',
    description: 'Send a confirmation email to the customer via Resend.',
    input_schema: {
      type: 'object',
      properties: {
        to:      { type: 'string', description: 'Recipient email address' },
        subject: { type: 'string' },
        receipt: { type: 'object', description: 'Receipt object from build_receipt' },
      },
      required: ['to', 'subject', 'receipt'],
    },
  },
  {
    name: 'validate_cart',
    description: 'Validate cart items and compute total. Returns { valid, items, total_thb } or { valid: false, error }.',
    input_schema: {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name:  { type: 'string' },
              qty:   { type: 'number' },
              price: { type: 'number' },
            },
          },
        },
      },
      required: ['items'],
    },
  },
  {
    name: 'check_fraud',
    description: 'Run basic fraud checks on the transaction. Returns { flagged, flags, recommendation }.',
    input_schema: {
      type: 'object',
      properties: {
        customer_email: { type: 'string' },
        amount_thb:     { type: 'number' },
      },
      required: ['customer_email', 'amount_thb'],
    },
  },
  {
    name: 'build_receipt',
    description: 'Format an order object into a receipt ready for emailing.',
    input_schema: {
      type: 'object',
      properties: {
        order: { type: 'object', description: 'Full order row from the database' },
      },
      required: ['order'],
    },
  },
];

const TOOL_FNS = {
  generate_qr,
  verify_payment,
  save_order,
  get_order,
  send_email,
  validate_cart: ({ items }) => validate_cart({ items }),
  check_fraud,
  build_receipt: ({ order }) => build_receipt({ order }),
};

const SYSTEM_PROMPT = `You are the DNM payment agent for a Thai nonprofit's website.
You orchestrate the PromptPay payment lifecycle using your tools.

For "new_checkout" events: validate_cart → check_fraud → generate_qr → save_order(pending) → return QR.
For "payment_confirmed" events: get_order → build_receipt → send_email → save_order(paid) → return success.
For "payment_failed" events: get_order → save_order(failed) → return failure info.

Always call tools in the correct order. Never skip fraud checks on new checkouts.
Never send confirmation emails until payment is confirmed.
Respond with a concise JSON summary of what you did and the result.`;

export async function runPaymentAgent(event, payload) {
  const messages = [
    {
      role: 'user',
      content: `Event: ${event}\nPayload: ${JSON.stringify(payload)}`,
    },
  ];

  let response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    tools: TOOLS,
    messages,
  });

  // Agentic loop — keep running until no more tool calls
  while (response.stop_reason === 'tool_use') {
    const toolUseBlocks = response.content.filter(b => b.type === 'tool_use');
    const toolResults = [];

    for (const block of toolUseBlocks) {
      let result;
      try {
        result = await TOOL_FNS[block.name](block.input);
      } catch (err) {
        result = { error: err.message };
      }
      toolResults.push({
        type: 'tool_result',
        tool_use_id: block.id,
        content: JSON.stringify(result),
      });
    }

    messages.push({ role: 'assistant', content: response.content });
    messages.push({ role: 'user', content: toolResults });

    response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      tools: TOOLS,
      messages,
    });
  }

  const text = response.content.find(b => b.type === 'text')?.text ?? '{}';
  try {
    return JSON.parse(text);
  } catch {
    return { summary: text };
  }
}
