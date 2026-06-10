// Shared PromptPay checkout modal logic
// Used by products.html (cart checkout) and join.html (donations)

const POLL_INTERVAL_MS = 3000;
const MAX_POLL_ATTEMPTS = 100; // ~5 minutes

let pollTimer = null;
let pollAttempts = 0;
let activeChargeId = null;

function createModal() {
  if (document.getElementById('dnm-checkout-modal')) return;

  const modal = document.createElement('div');
  modal.id = 'dnm-checkout-modal';
  modal.style.cssText = `
    position:fixed;inset:0;z-index:9999;display:none;
    background:rgba(15,46,26,0.6);backdrop-filter:blur(4px);
    align-items:center;justify-content:center;padding:1rem;
  `;
  modal.innerHTML = `
    <div style="background:#fff;border-radius:20px;width:100%;max-width:440px;box-shadow:0 20px 60px rgba(15,46,26,0.3);overflow:hidden;">
      <!-- Step 1: Details form -->
      <div id="dnm-step-details">
        <div style="background:#0F2E1A;padding:1.5rem 2rem;display:flex;align-items:center;justify-content:space-between;">
          <h2 style="font-family:'Playfair Display',serif;color:#fff;font-size:1.2rem;font-weight:700;margin:0;">Complete Payment</h2>
          <button onclick="dnmCloseModal()" style="background:none;border:none;color:rgba(255,255,255,0.6);cursor:pointer;font-size:1.5rem;line-height:1;">&times;</button>
        </div>
        <div style="padding:2rem;">
          <div style="margin-bottom:1rem;">
            <label style="display:block;font-size:0.78rem;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:#102418;margin-bottom:0.4rem;">Full Name</label>
            <input id="dnm-name" type="text" placeholder="Your name" style="width:100%;padding:0.7rem 1rem;border:1.5px solid #d1e8d8;border-radius:8px;font-family:'Roboto',sans-serif;font-size:0.95rem;outline:none;transition:border-color 0.2s;" onfocus="this.style.borderColor='#1F6B3A'" onblur="this.style.borderColor='#d1e8d8'" />
          </div>
          <div style="margin-bottom:1.5rem;">
            <label style="display:block;font-size:0.78rem;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:#102418;margin-bottom:0.4rem;">Email Address</label>
            <input id="dnm-email" type="email" placeholder="your@email.com" style="width:100%;padding:0.7rem 1rem;border:1.5px solid #d1e8d8;border-radius:8px;font-family:'Roboto',sans-serif;font-size:0.95rem;outline:none;transition:border-color 0.2s;" onfocus="this.style.borderColor='#1F6B3A'" onblur="this.style.borderColor='#d1e8d8'" />
          </div>
          <div id="dnm-order-summary" style="background:#E8F5EC;border-radius:10px;padding:1rem;margin-bottom:1.5rem;font-size:0.9rem;color:#102418;"></div>
          <div id="dnm-details-error" style="color:#dc2626;font-size:0.85rem;margin-bottom:0.75rem;display:none;"></div>
          <button id="dnm-proceed-btn" onclick="dnmProceedToQR()" style="width:100%;background:#1F6B3A;color:#fff;border:none;border-radius:8px;padding:0.9rem;font-family:'Roboto',sans-serif;font-weight:700;font-size:0.95rem;letter-spacing:0.04em;text-transform:uppercase;cursor:pointer;transition:background 0.2s;">
            Generate QR Code →
          </button>
        </div>
      </div>

      <!-- Step 2: QR code + polling -->
      <div id="dnm-step-qr" style="display:none;">
        <div style="background:#0F2E1A;padding:1.5rem 2rem;display:flex;align-items:center;justify-content:space-between;">
          <h2 style="font-family:'Playfair Display',serif;color:#fff;font-size:1.2rem;font-weight:700;margin:0;">Scan to Pay</h2>
          <button onclick="dnmCloseModal()" style="background:none;border:none;color:rgba(255,255,255,0.6);cursor:pointer;font-size:1.5rem;line-height:1;">&times;</button>
        </div>
        <div style="padding:2rem;text-align:center;">
          <p style="color:#4a6b55;font-size:0.9rem;margin-bottom:1.25rem;">Open your banking app, scan the QR code below, and complete the payment. This page will update automatically.</p>
          <div id="dnm-qr-container" style="background:#f5f5f5;border-radius:12px;padding:1rem;display:inline-block;margin-bottom:1.25rem;">
            <img id="dnm-qr-img" src="" alt="PromptPay QR Code" style="width:220px;height:220px;display:block;" />
          </div>
          <div id="dnm-amount-display" style="font-family:'Playfair Display',serif;font-size:1.75rem;font-weight:700;color:#0F2E1A;margin-bottom:0.25rem;"></div>
          <div id="dnm-polling-status" style="color:#A7B3AA;font-size:0.85rem;display:flex;align-items:center;justify-content:center;gap:0.5rem;">
            <span class="dnm-spin" style="display:inline-block;width:12px;height:12px;border:2px solid #d1e8d8;border-top-color:#1F6B3A;border-radius:50;animation:dnmSpin 0.8s linear infinite;"></span>
            Waiting for payment…
          </div>
        </div>
      </div>
    </div>
    <style>
      @keyframes dnmSpin { to { transform: rotate(360deg); } }
      .dnm-spin { animation: dnmSpin 0.8s linear infinite; border-radius: 50%; }
    </style>
  `;
  document.body.appendChild(modal);
}

// Called by products.html with cart data, or join.html with donation amount
window.dnmOpenCheckout = function({ type, items = null, amount = null }) {
  createModal();

  // Store pending payload for when user submits the form
  window._dnmCheckoutPayload = { type, items, amount };

  // Populate summary
  const summary = document.getElementById('dnm-order-summary');
  if (type === 'product' && items) {
    const total = items.reduce((s, i) => s + i.price * i.qty, 0);
    summary.innerHTML = items.map(i => `<div style="display:flex;justify-content:space-between;"><span>${i.name} x${i.qty}</span><span>฿${i.price * i.qty}</span></div>`).join('') +
      `<div style="border-top:1px solid #c5d4c8;margin-top:0.5rem;padding-top:0.5rem;display:flex;justify-content:space-between;font-weight:700;"><span>Total</span><span>฿${total}</span></div>`;
  } else {
    summary.innerHTML = `<div style="display:flex;justify-content:space-between;font-weight:700;"><span>Donation amount</span><span>฿${amount}</span></div>`;
  }

  const modal = document.getElementById('dnm-checkout-modal');
  modal.style.display = 'flex';
  document.getElementById('dnm-step-details').style.display = 'block';
  document.getElementById('dnm-step-qr').style.display = 'none';
  document.getElementById('dnm-details-error').style.display = 'none';
};

window.dnmCloseModal = function() {
  const modal = document.getElementById('dnm-checkout-modal');
  if (modal) modal.style.display = 'none';
  if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
};

window.dnmProceedToQR = async function() {
  const name  = document.getElementById('dnm-name').value.trim();
  const email = document.getElementById('dnm-email').value.trim();
  const errEl = document.getElementById('dnm-details-error');

  if (!name || !email) {
    errEl.textContent = 'Please enter your name and email.';
    errEl.style.display = 'block';
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errEl.textContent = 'Please enter a valid email address.';
    errEl.style.display = 'block';
    return;
  }
  errEl.style.display = 'none';

  const btn = document.getElementById('dnm-proceed-btn');
  btn.textContent = 'Creating charge…';
  btn.disabled = true;

  const { type, items, amount } = window._dnmCheckoutPayload;

  try {
    const res = await fetch('/api/create-charge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, name, email, items, amount }),
    });
    const data = await res.json();

    if (!res.ok) throw new Error(data.error || 'Failed to create charge');

    activeChargeId = data.charge_id;
    document.getElementById('dnm-qr-img').src = data.qr_url;
    const displayAmount = type === 'product'
      ? items.reduce((s, i) => s + i.price * i.qty, 0)
      : amount;
    document.getElementById('dnm-amount-display').textContent = `฿${displayAmount}`;

    document.getElementById('dnm-step-details').style.display = 'none';
    document.getElementById('dnm-step-qr').style.display = 'block';

    // Start polling
    pollAttempts = 0;
    pollTimer = setInterval(async () => {
      pollAttempts++;
      if (pollAttempts > MAX_POLL_ATTEMPTS) {
        clearInterval(pollTimer);
        document.getElementById('dnm-polling-status').textContent = 'QR code expired. Please try again.';
        return;
      }
      try {
        const statusRes = await fetch(`/api/order-status?charge_id=${activeChargeId}`);
        const statusData = await statusRes.json();
        if (statusData.status === 'paid') {
          clearInterval(pollTimer);
          window.location.href = `/success.html?type=${type}&amount=${displayAmount}&name=${encodeURIComponent(name)}`;
        } else if (statusData.status === 'failed') {
          clearInterval(pollTimer);
          document.getElementById('dnm-polling-status').innerHTML = '<span style="color:#dc2626;">Payment failed. Please try again.</span>';
        }
      } catch { /* network blip, keep polling */ }
    }, POLL_INTERVAL_MS);

  } catch (err) {
    errEl.textContent = err.message;
    errEl.style.display = 'block';
    btn.textContent = 'Generate QR Code →';
    btn.disabled = false;
  }
};

// Close modal on backdrop click
document.addEventListener('click', e => {
  const modal = document.getElementById('dnm-checkout-modal');
  if (modal && e.target === modal) dnmCloseModal();
});
