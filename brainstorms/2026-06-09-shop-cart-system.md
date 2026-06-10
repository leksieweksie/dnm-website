# Shop Cart System: Brainstorm / Discovery Notes
Date: 2026-06-09 · Goal: Turn the non-functional shop "cart" on products.html into a real, usable client-side cart.

## Problem (current state)
Cart was a visual stub: `addToCart(name)` bumped an in-memory counter + toast; `#cartBtn` did nothing; no storage, no cart view, no qty/totals/remove/checkout. Prices only displayed as ฿ text. Static site on Vercel (no backend).

## Locked decisions (grill, one Q at a time)
- Q1 Checkout goal → "Just make the cart usable." Working cart; checkout = "contact us to order" message. No payment this round.
- Q2 Cart UI → slide-in drawer from right + dimmed overlay; stays on shop page.
- Q3 Variants → track size + color per line.
- Q4 Sizes → T-Shirt & Hoodie get S/M/L/XL; Cap = one-size (color only); accessories/stationery none.
- Q4b → REQUIRE size/color selection before Add (disable + nudge).
- Q5 Checkout → reveal contact-to-order message in drawer (info@drugsnomore.org / +66 94 736 2815 + button to contact.html).
- Q6 → Shop-page only (data persists via localStorage); badge = TOTAL qty; add Clear-cart; include empty-cart state.

## Build summary
- localStorage `dnm_cart` = [{id,name,price,size,color,qty}]; merge same id+size+color.
- Variants: Tee colors Dark Green/White; Cap colors Dark Green/Green; Hoodie Forest Green (single).
- Drawer: line items (name, "Size · Color", unit price, qty −/+, remove), subtotal ฿, Clear cart, empty state, Checkout → contact message.
- Single file: products.html. Keep "added!" toast. transform/opacity anims; reduced-motion; ESC/overlay close.
- Full plan: ../../../.claude/plans/in-the-statistics-part-drifting-penguin.md
