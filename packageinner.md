# Luwas — Itinerary Section Redesign Spec

Design and implementation reference for the "What's Included" + "Daily Itinerary" section, built for a MERN + Framer Motion stack.

---

## 1. Color palette

Based on the existing Luwas blue used in the hero and headings (`#2F5DFB`-ish royal blue). Keep the palette tight — one accent, neutrals for everything else.

| Token | Hex | Usage |
|---|---|---|
| --luwas-blue | #2F5DFB | Accent — active tab, icons, links, primary button |
| --luwas-blue-dark | #1C3FC7 | Hover/active states on blue elements |
| --luwas-blue-tint | #EAF0FF | Active tab background, badge background |
| --text-primary | #0F172A | Headings, day titles |
| --text-secondary | #475569 | Body copy, descriptions |
| --text-muted | #94A3B8 | Eyebrow labels, tag text |
| --surface-card | #F8FAFC | Included-item cards, itinerary panel background |
| --surface-white | #FFFFFF | Page background |
| --border | #E2E8F0 | Card borders, tag borders |

Rule of thumb: blue is reserved for *interactive/active state only* (active tab, hover, CTA). Everything at rest is neutral gray/white — this is what makes the active tab feel like a real selection instead of noise.

---

## 2. Typography

| Element | Font | Size | Weight | Notes |
|---|---|---|---|---|
| Section eyebrow ("Daily itinerary") | Inter / system sans | 13px | 500 | Uppercase, letter-spacing: 0.04em, --text-muted |
| Day title (e.g. "Arrival and Chocolate Hills") | Inter | 20px | 600 | --text-primary |
| Tab label ("Day 1") | Inter | 14px | 500 | Sentence case, not bold when inactive |
| Tag / pill text | Inter | 12px | 500 | --text-muted, uppercase optional |
| Body / description | Inter | 15px | 400 | line-height: 1.7, --text-secondary |

Keep to *two weights* (400 and 500/600) — avoid mixing in a third weight, it starts to look inconsistent against the rest of the site's headings.

---

## 3. Component structure

<section>
  <IncludedGrid />       // icon + label cards, 3-column grid desktop, 2-column mobile
  <ItineraryTabs>
    <TabBar />           // Day 1 / Day 2 / Day 3 / Day 4
    <DayPanel />         // title, tags, description — swaps on tab change
  </ItineraryTabs>
</section>

State: a single activeDay index drives both the tab bar's active styling and which panel content renders.

---

## 4. Framer Motion — animation spec

Keep animations *fast and purposeful* — this is a booking page, not a portfolio piece. Nothing should make the user wait to read content.

### 4.1 Included-items grid — staggered entrance on scroll

import { motion } from "framer-motion";

const gridVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } }
};

<motion.div
  className="included-grid"
  variants={gridVariants}
  initial="hidden"
  whileInView="show"
  viewport={{ once: true, amount: 0.3 }}
>
  {items.map((item) => (
    <motion.div key={item.id} className="included-card" variants={itemVariants}>
      {/* icon + label */}
    </motion.div>
  ))}
</motion.div>

- whileInView + once: true — animates only the first time it scrolls into view, never re-triggers.
- Stagger of 0.06s keeps the whole grid settling in under ~400ms even with 6 items — fast enough to not feel sluggish.

### 4.2 Tab bar — active pill indicator

Use a single shared layoutId element that slides between tabs instead of animating each tab's background separately — this is the detail that makes it feel "premium" rather than a plain CSS :active swap.

<div className="tab-bar">
  {days.map((day, i) => (
    <button
      key={day.n}
      onClick={() => setActiveDay(i)}
      className="tab-button"
    >
      {i === activeDay && (
        <motion.div
          layoutId="activeTabBg"
          className="tab-active-bg"
          transition={{ type: "spring", stiffness: 500, damping: 35 }}
        />
      )}
      <span className="tab-label">{`Day ${day.n}`}</span>
    </button>
  ))}
</div>

tab-active-bg is an absolutely-positioned div behind the label, filled with --luwas-blue-tint and a --luwas-blue border — Framer Motion animates its position/width automatically between clicks because it shares a layoutId.

### 4.3 Day panel — content crossfade + slide

import { AnimatePresence, motion } from "framer-motion";

<AnimatePresence mode="wait">
  <motion.div
    key={activeDay}
    initial={{ opacity: 0, x: 12 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -12 }}
    transition={{ duration: 0.25, ease: "easeInOut" }}
    className="day-panel"
  >
    <h3>{days[activeDay].title}</h3>
    <div className="tag-row">
      {days[activeDay].tags.map((t) => <span key={t} className="tag">{t}</span>)}
    </div>
    <p>{days[activeDay].desc}</p>
  </motion.div>
</AnimatePresence>

- mode="wait" prevents the incoming and outgoing panel from overlapping mid-transition (avoids layout jump).
- Keep this under 0.3s — anything slower makes rapid tab-clicking feel laggy.

### 4.4 Tag pills — optional micro entrance

If you want a slightly richer feel, stagger the tag pills in right after the panel text using the same staggerChildren pattern as 4.1, delayed by ~0.1s so they land just after the title fades in. Optional — skip this if you want to keep things minimal.

### 4.5 What to avoid

- No bounce/overshoot easing on the tab indicator — a subtle spring (stiffness: 500, damping: 35) reads as responsive, not playful.
- No scale-up animations on hover for the included-item cards — a simple border-color transition on hover (plain CSS, not Framer) is enough and keeps things calm.
- Don't animate on every render — always gate scroll-triggered animations with viewport={{ once: true }}.

---

## 5. Responsive notes

- Included grid: repeat(auto-fit, minmax(140px, 1fr)) — collapses to 2 columns on mobile automatically.
- Tab bar: flex-wrap: wrap with horizontal scroll fallback (overflow-x: auto) if you ever add itineraries longer than ~6 days, so tabs don't wrap awkwardly to a second row.
- Day panel: keep min-height roughly consistent across days (e.g. min-height: 140px) so the crossfade doesn't cause the page to jump vertically when switching tabs.