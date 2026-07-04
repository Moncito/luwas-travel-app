# LUWAS Activities / Trip Builder Page — Upgrade Spec

### UI/UX Improvements

Applies to the destination detail / trip builder page (e.g. `/baguio`) with Trip Details, Available Activities, Trip Summary, and Pricing sections. Current build is functional but visually flat — everything uses the same white card/gray background treatment with no hierarchy.

---

## 1. Hero Section

- Replace the near-black/heavily-darkened destination photo with a brighter, more visible image — currently under-delivers compared to the homepage hero and reads as an empty dark bar.
- Add a breadcrumb above the title: `Home / Destinations / Baguio` — improves wayfinding, adds visual detail to otherwise sparse hero.
- Add a small stat row under the subtitle to fill hero space with useful personality, e.g.:
  `⛰ 1,500 MASL · 🌡 15–20°C · 🚗 5–6 hrs from Manila`

---

## 2. Trip Details Card

- Add explicit field labels above each input — currently just icon + raw input with no label ("Check-in," "Check-out," "Travelers").
- Replace the raw number input for traveler count with a proper stepper control (`− 3 +`), matching the pattern already used on the homepage search bar for consistency.

---

## 3. Available Activities Grid (highest-impact fix)

- Switch from single-card-in-empty-space to a responsive grid (3–4 columns desktop, 1–2 mobile) so multiple activities display side by side.
- Add a color-coded category badge system — extend the existing "Adventure" badge with distinct colors per category:
  - Adventure = orange
  - Food = red
  - Culture = purple
  - Nature = green
- Add a card hover state: `translateY(-4px)` + increased shadow on hover to signal interactivity.
- Review placeholder-looking content (e.g. activity titled "JUMPING" / location "TALUNAN") — looks like test/seed data rather than real copy; replace with descriptive real activity names (e.g. "Chocolate Hills Jump Shot Photo Experience").

---

## 4. Sidebar — Trip Summary / Pricing / Need Help

Currently all three cards use flat, undifferentiated blue/white/yellow fills with identical padding and radius. Differentiate:

- **Trip Summary:** keep light blue background, but replace plain text rows with small icon-driven stat pills (e.g. "👥 3 persons," "📋 0 activities").
- **Pricing (conversion-critical, needs the most visual weight):**
  - Add a colored top accent border using the brand teal→blue gradient.
  - Increase font size/weight on the "Total" line significantly relative to subtotal rows.
  - Apply the brand gradient to the "Select Dates" CTA button once dates are selectable, matching homepage CTA styling.
- **Need Help:** convert the static checklist into a visual step-progress indicator — checkboxes/step icons that visually fill in as the user completes each step (select dates → browse activities → add to itinerary → review pricing), rather than plain italic checklist text.

---

## 5. Overall Polish

- **Standardize border-radius scale:** pick two sizes only — e.g. 8px for inputs/buttons, 16px for cards — and apply consistently across the whole page (currently inconsistent/similar-but-not-matching values).
- **Reintroduce brand identity:** this page currently feels visually disconnected from the homepage. Bring the teal→blue accent gradient onto this page via the Pricing total and/or primary CTA button, so the trip-builder flow feels like the same product.
- **Design empty states, don't just leave them as text:** "No activities added yet..." and "Select dates first" should include a small icon (suitcase, calendar) alongside the copy — makes incomplete states feel intentional, not broken/unfinished.

---

## 6. Priority Order

1. Populate/fix the Available Activities grid (multi-card layout + real content) — single biggest driver of the "plain" impression
2. Hero image brightness/visibility fix
3. Category color-coding + activity card hover states
4. Sidebar differentiation, especially bringing brand gradient into the Pricing card
5. Trip Details field labels + traveler stepper
