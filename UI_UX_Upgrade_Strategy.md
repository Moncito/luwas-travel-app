# UI/UX Audit & Premium Upgrade Strategy: Luwas Travel Customization

**Target Page:** Destination Customizer & Itinerary Builder (`/destinations/[id]/customize`)  
**Current Date:** July 4, 2026

---

## Executive Summary

The current interface provides a functional foundation for trip planning, but lacks the polished, high-end look and responsive flow expected of a modern luxury or seamless travel booking platform. The user journey currently suffers from visual imbalance (a heavy right column vs. a sparse left column), native UI form components that break branding, and a lack of clear micro-interactions.

This report delivers actionable, agency-level structural layout, component-level refinements, and behavioral optimizations designed to maximize conversion, improve user engagement, and elevate the overall **Luwas** aesthetic.

---

## 1. Hero Section & Typography Enhancements

### Current State

- Background image relies heavily on a generic blur.
- Subtext/metadata (`Baguio City, Benguet`, `20–28°C Year-Round`, `Easy Access`) blends into the background, risking poor contrast.

### Premium Upgrades

- **Parallax & Micro-Movements:** Implement a subtle CSS/JS parallax scroll effect on the background image with a dark linear gradient overlay (`linear-gradient(to bottom, rgba(0,0,0,0.4), #0f172a)`).
- **Glassmorphism Badges:** Replace the inline icons with micro-pill containers utilizing a high-end frosted glass aesthetic: `backdrop-filter: blur(16px); background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255,255,255,0.2)`.
- **Typography Hierarchy:** Utilize deep tracking (`tracking-tight`) on the main `H1` and introduce a high-contrast serif or refined sans-serif for subheaders to differentiate from body text.

---

## 2. Layout & Visual Hierarchy

### Current State

- The left column focuses on the activities, but the structural balance is skewed when the right column (Summary, Pricing, Instructions) becomes overly dense vertically.
- Excessive scrolling on mobile hides critical CTAs.

### Premium Upgrades

- **Sticky Floating Sidebar:** The right "Your Journey" summary should smoothly stick within the viewport bounds natively using `sticky top-24`, avoiding jagged repositions.
- **Dynamic Sizing:** Reduce the width of the summary sidebar slightly (e.g., from `1fr` to `0.85fr`) providing more horizontal breathing room for the visually heavy Activity cards.
- **Mobile Sticky CTA Bottom Bar:** On mobile, condense the full summary into a fixed bottom bar indicating "Total: ₱X,XXX | View Itinerary [Button]" to maintain a persistent conversion funnel without scroll fatigue.

---

## 3. Component Refinements

### Current State

- Native `<input type="date">` and native `<select>` are used heavily, defaulting to OS-level UI that feels inconsistent across Windows, iOS, and Android.
- Stepper component for travelers feels rudimentary.

### Premium Upgrades

- **Custom Date Range Picker:** Replace native date inputs with a unified calendar popover (e.g., utilizing `react-day-picker` or an accessible headless UI component) styled strictly to match the cyan/slate brand colors.
- **Custom Dropdowns:** Replace native select menus inside the Activity cards with bespoke, fully stylable dropdowns (using Radix UI or Headless UI `Listbox`).
- **Interactive Stepper:** Use larger, touch-friendly increment/decrement buttons with haptic-like animations (using `framer-motion` to scale `0.95` on tap).

---

## 4. Activity Cards & Micro-Interactions

### Current State

- Cards use standard shadows and basic linear hover states.
- "Add to Day" interaction resets without clear spatial feedback.

### Premium Upgrades

- **Elevation & Scale Embellishments:** Cards should elevate (`hover:-translate-y-2`) and cast a softer, widespread colored shadow (`hover:shadow-2xl hover:shadow-cyan-900/10`) on hover.
- **Quick-Add Delight:** When a user selects a day to add an activity, trigger an animated confirmation (e.g., a green checkmark ping or a satisfying `Sonner` toast that feels integrated, not intrusive).
- **Drag-and-Drop Reordering:** (Phase 2 feature) Allow users to drag selected activities between days in the "Day-by-Day Plan" sidebar.

---

## 5. Accessibility & Performance Checks

### Enhancements

- **Contrast Audits:** Verify that all `slate-500` and `slate-400` placeholder texts on light backgrounds pass WCAG AA contrast standards.
- **Keyboard Navigation:** Ensure custom dropdowns and date pickers fully support Tab and Enter key cycling.
- **ARIA Labels:** Add meaningful `aria-label` tags to all icon-only buttons (like the Wishlist Heart or the Trash Delete icon in the summary).
- **Image Optimization:** Continue utilizing Next.js `Image` but pass exact `{ width, height }` parameters or sizes strings to minimize Cumulative Layout Shift (CLS) on the main masonry grids.
