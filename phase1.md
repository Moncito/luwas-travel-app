# LUWAS Landing Page — Upgrade Spec

### Modern Web Design + GSAP Animation Recommendations

---

## 1. Typography System

- **Switch to a variable font** (Inter, Manrope, or General Sans). Load one variable font file instead of separate weight files, and animate the weight axis (400 → 600) on nav hover instead of just swapping color.
- **Headline hierarchy:** Make "Your Next Great Escape" slightly smaller/lighter than "Starts Here." Consider an elegant serif or italic treatment on one accent word (e.g. "Escape") for an editorial, boutique-travel feel — contrast sans + serif is a strong current trend.
- **Letter-spacing on nav/caps text:** Increase tracking to 0.05–0.08em on "HOME," "ITINERARIES," "PROMO!," "DESTINATIONS," "TRAVEL HISTORY." Cramped all-caps nav reads cheap; airy tracking reads premium.
- **Fluid type scale:** Replace fixed breakpoint font sizes with `clamp()`.
  ```css
  font-size: clamp(2.5rem, 5vw + 1rem, 5.5rem);
  ```
- **Gradient text shimmer:** On "Starts Here," set `background-size: 200%` on the gradient and animate `background-position` on a slow loop for a subtle moving shimmer.

---

## 2. Search Bar Redesign

Current 3-box form (destination / departure / travelers + button) reads as a dated 2018-era pattern. Recommended direction:

**Primary recommendation — Progressive Disclosure Pill**

- Show only a single large glass pill on the hero: _"Where do you want to go?"_
- On click/focus, a panel slides down beneath it to reveal Departure + Travelers fields.
- Keeps the hero visually quiet so the illustrated background stays the star.

**Alternative — Segmented Single Pill (Airbnb-style)**

- Merge all three fields into one continuous rounded pill, divided by thin vertical separators, no individual boxed inputs.

**Either direction should include:**

- Thinner glass effect — lower blur/opacity than current (barely-there frosted look, not heavy frosted glass).
- Icon + label spacing increased slightly for breathing room.
- Border-glow on input focus using the teal-blue accent gradient (animated via CSS custom property).
- Button hover: scale to `1.03` + brightness increase, `duration: 0.2s`, `ease: power2.out`.

---

## 3. Layout & Visual Hierarchy

- **Nav bar:** Add a subtle top gradient/blur overlay behind the nav so it doesn't fight with busy parts of the background art while scrolling.
- **Color restraint:** Limit the teal-blue accent gradient to: headline accent word, CTA button, scroll cue. Everything else stays neutral white/gray — consistency of accent placement builds brand recognition faster than spreading it everywhere.
- **Negative space:** Favor fewer, more confident elements over dense card-heavy layouts (the broader shift from "2020s SaaS glass panel everywhere" toward editorial minimalism).
- **Scroll cue:** Make the down-arrow an actual animated invitation, not a static afterthought (see animation section).

---

## 4. GSAP Animation Plan

### A. Hero Entrance (on page load)

- Split headline into two lines, reveal separately: `gsap.from()` with `y: 40, opacity: 0, stagger: 0.15` per line/word.
- Delay search bar entrance ~0.4s after headline: slide up + fade (`y: 60 → 0, opacity: 0 → 1`).
- Stagger nav items in left-to-right with slight `y` shift + fade, so the page feels like it assembles into place.

### B. Background Parallax

- Wrap background image in its own layer; apply `ScrollTrigger` with `scrub: true`.
- Move background slower than foreground (max 10–15% offset) for subtle depth — keep restrained since the art is painterly, not photographic.

### C. Scroll-Cue Animation

- Infinite bounce: `yoyo: true, repeat: -1` on the down arrow.
- Combine with opacity pulse (0.4 → 1) so it feels alive without distracting.

### D. Nav Interactions

- Animate the existing "HOME" underline from `0 → 100%` width on load.
- On hover for other nav items: animate a matching underline in via `scaleX` transform (GPU-cheap).

### E. Search Bar Micro-interactions

- Input focus: animate border-glow opacity via GSAP-driven CSS custom property.
- Button hover: `scale: 1.03`, brightness increase, `duration: 0.2, ease: "power2.out"`.
- If using progressive disclosure: animate the reveal panel with `height: auto` workaround (GSAP `.to()` on a wrapper) + fade, `duration: 0.3–0.4s`.

### F. Section Scroll Reveals (Destinations / Itineraries below the fold)

- Use `ScrollTrigger.batch()` for grid/card sections.
- Stagger fade + slide-up (`y: 30 → 0`) as each row enters viewport.
- For destination cards specifically: pair with a slight scale-in (`0.95 → 1`) so each card feels like it "surfaces."

---

## 5. Priority Order (highest impact first)

1. Hero load animation sequence (Section 4A) — single biggest lever for feeling "modern/premium" immediately.
2. Search bar redesign (Section 2) — replaces the most dated-feeling element on the page.
3. Typography refinements (Section 1) — nav tracking + fluid type scale are low-effort, high-visual-payoff.
4. Scroll parallax + scroll cue (4B, 4C).
5. Micro-interactions + section scroll reveals (4D, 4E, 4F) — polish layer once the above is solid.

---

## 6. Guiding Principles Summary

- Restraint over density — bigger type, more negative space, fewer competing elements.
- Motion as hierarchy — animations should reveal content in order of importance (headline → subtext → CTA), not just decorate.
- Thinner glassmorphism — barely-there blur, not heavy frosted panels.
- One consistent accent gradient, used sparingly.
- Lean into the illustrated/painterly background as the site's distinct visual identity rather than covering it with generic UI chrome.
