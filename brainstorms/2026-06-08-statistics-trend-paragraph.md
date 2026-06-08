# Statistics Trend Paragraph: Brainstorm / Discovery Notes
Date: 2026-06-08 · Goal: Extract what the new descriptive paragraph under the main statistics graph should be — placement, scope, tone, eventual real content, and behavior — so the placeholder can be written now and confidently filled in later.

## Summary / key decisions — LOCKED SPEC
- **What:** One descriptive paragraph under the main interactive chart (`#chart1`) on statistics.html, between the canvas and the existing "Baseline sources:" line.
- **Scope:** Paragraph ONLY. No other stats-page changes. Only statistics.html is edited.
- **Behavior:** Static — does NOT change when a different substance is selected (chart-update JS untouched).
- **Length/voice (eventual real copy):** Medium, 3–4 sentences. Descriptive of the rising meth usage trend BUT strongly advocacy-leaning (not calm/neutral).
- **Placeholder now:** Generic lorem-style body text (obviously temporary), so structure is visible and real copy is an easy swap.
- **CTA:** Yes. Real, persuasive label **"Join The Movement →"** linking to `join.html` (top of page). Inline text link in brand green (#1F6B3A/#3FAE5A) with hover + focus-visible states — NOT a heavy button (won't compete with the chart card).
- **Styling:** Match page tokens — Roboto, font-size ~0.9rem, muted green body (#4F5D52), line-height 1.7, margin-top ~1rem. No new fonts/colors/layout.
- **Deferred (user, later, out of scope):** stat-strip numbers (2026 / 78.78% / 4 / 1) look uneven.
- Original steer: primarily the paragraph; revamp considered after screenshot review and judged NOT warranted (page is clean).

## Q&A log
### Q1 — Session scope (narrow vs wide)
- Asked: Grill narrowly on just the paragraph, or wider on the whole stats page?
- Captured: "Mostly the paragraph, but if you think the stats page could use a little revamp, go ahead, just use the screenshot function to make sure everything's right and grill me on that too before you proceed." → Paragraph is the core deliverable; revamp is optional and must be (a) justified by screenshot review and (b) grilled before any implementation.
- Flags: none

### Screenshot review (screenshot-1-stats-current.png, port 3001)
- Page structure: green hero ("Statistics" + source-backed subtitle + 3 source pills) → stat strip (2026 / 78.78% / 4 / 1) → charts grid (left: "Usage Statistics" bar chart; right: "Substances" selectable list) → Sources panel → footer.
- **Key observation for the paragraph:** the left chart card has visible empty white space beneath the bar chart, above the small "Baseline sources:" line. A description paragraph fills this naturally — confirms placement is sound and not forced.
- **Revamp candidates noticed (NOT yet endorsed):**
  - Stat strip numbers look thin/placeholder-ish: "4" and "1" especially (labels like standout team members / island·community) read oddly next to 2026 and 78.78%. Content issue, not design.
  - Page is otherwise clean, well-spaced, consistent palette. No structural problems.
- **My assessment:** a full revamp is NOT warranted. The single biggest, most natural improvement IS the paragraph the user already asked for. Recommend staying focused on the paragraph; optionally flag the stat-strip numbers separately.

### Q2 — Revamp appetite
- Asked: Paragraph only, paragraph + fix stat strip, or more?
- Captured: "Do the paragraph only for now, I'll fix that later." → Scope locked to the paragraph. Stat-strip numbers (4 / 1 looking placeholder-ish) deferred to user, later.
- Flags: Stat-strip numbers review -> user (deferred, not part of this task)

### Q3 — The paragraph's job / message
- Asked: Real-copy intent — descriptive, mission-tie, advocacy, or other?
- Captured: "Honestly i was looking for a Descriptive but also very advocacy leaning paragraph." → Eventual real copy = describe what the rising trend shows AND push hard on advocacy (not calm/neutral). Blend of factual description + strong call to care/act.
- Flags: none

### Q4 — Advocacy delivery (CTA?)
- Asked: Tone only, tone + soft link, or stronger CTA?
- Captured: "Yea, tone and a cta, maybe to the Join us / donate page." → Paragraph carries advocacy in tone AND ends with a CTA. CTA target = Join Us / donate page (join.html; confirm donate anchor exists).
- Flags: Confirm CTA destination — does a dedicated donate page/section exist, or does it live inside join.html? (checking codebase next)

### Codebase finding — CTA destination
- join.html has BOTH a Volunteer card and a Donate card (join.html:166-185). Donate card = ฿500/฿1,000/฿2,500/Custom + "Donate Now".
- Volunteer form has anchor `id="volunteer-form"` (join.html:191). **Donate card has NO id anchor.**
- Implication: linking to `join.html` lands at top of page (both cards are near top, same section). To land directly on Donate, need to add `id="donate"` to the donate `.track-card` (join.html:167) — tiny, safe edit. Then CTA -> `join.html#donate`.

### Q6 — CTA label + completeness backstop
- Asked: Real CTA label vs placeholder? And anything we haven't touched?
- Captured: "Join The Movement sounds persuasive." → CTA label = **"Join The Movement →"** (real, persuasive copy). No additional items raised on the backstop → spec is locked.
- Flags: none

### Q5 — CTA destination
- Asked: Deep-link to Donate, top of Join Us page, or external donate link?
- Captured: "Top of Join Us Page works." → CTA points to `join.html` (top of page, both Volunteer + Donate cards visible). No anchor edit needed; statistics.html is the only file changed.
- Flags: none (donate-anchor idea dropped)

## Open flags (pending input)
- Stat-strip numbers (2026 / 78.78% / 4 / 1) feel uneven -> user will fix later (out of scope here)

---

# SESSION 2 (2026-06-08) — Make the paragraph DYNAMIC per drug
Goal: Paragraph changes slightly per selected substance using that drug's data; main advocacy message stays roughly constant. This SUPERSEDES Session 1's "static" decision.

## Chart data analysis (usage index, 2018→2025, baseline 100)
Meth +125% (steepest) · Cannabis +114% (2022 jump) · Heroin +99% · Benzodiazepines +98% · Cocaine +81% · Kratom +66% (post-2021) · MDMA/Ecstasy +64% · Inhalants +62% · Alcohol +28% (flattest). Every series rises → core message holds for all. INTEGRITY: all start at exactly 100 in 2018 = illustrative index, not measured prevalence.

## Locked decisions
- Q1 Data honesty → frame numbers as "our index" (honest, not measured prevalence).
- Q2 Approach → shared template + injected stat (consistent message, low maintenance).
- Q3 Injected stat → % rise since 2018, universal verb "risen".
- Q4 Constant body → tightened template, keep "in Phuket".
- Q5 Switch transition → quick opacity fade (~150ms); reduced-motion = instant.
- Q6 Backstop → round %s to nearest 5; add hint to Substances panel; verify mobile.

## LOCKED TEMPLATE (only {Drug} + {X} vary)
"{Drug} use in Phuket has risen by roughly {X}% on our index since 2018. This is where we come in — we work to prevent more people from using drugs and to stop addiction and death. Join our movement, whether through a small donation or becoming part of our team, to help us fight this growing problem."
- Rounded {X}: Meth 125, Cannabis 115, Heroin 100, Benzodiazepines 100, Cocaine 80, Kratom 65, MDMA/Ecstasy 65, Inhalants 60, Alcohol 30.
- {X} computed live in JS = round((values[last]-100)/5)*5. CTA "JOIN THE MOVEMENT →" → join.html, constant.
- Full plan: ../../../.claude/plans/in-the-statistics-part-drifting-penguin.md
