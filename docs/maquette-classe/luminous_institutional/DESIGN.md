---
name: Luminous Institutional
colors:
  surface: '#FFFFFF'
  surface-dim: '#dfd7e6'
  surface-bright: '#fef7ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f9f1ff'
  surface-container: '#f3ebfa'
  surface-container-high: '#ede5f4'
  surface-container-highest: '#e8dfee'
  on-surface: '#1d1a24'
  on-surface-variant: '#4a4455'
  inverse-surface: '#332f39'
  inverse-on-surface: '#f6eefc'
  outline: '#7b7487'
  outline-variant: '#ccc3d8'
  surface-tint: '#732ee4'
  primary: '#630ed4'
  on-primary: '#ffffff'
  primary-container: '#7c3aed'
  on-primary-container: '#ede0ff'
  inverse-primary: '#d2bbff'
  secondary: '#b4136d'
  on-secondary: '#ffffff'
  secondary-container: '#fd56a7'
  on-secondary-container: '#600037'
  tertiary: '#4f4d59'
  on-tertiary: '#ffffff'
  tertiary-container: '#686572'
  on-tertiary-container: '#e8e4f2'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#eaddff'
  primary-fixed-dim: '#d2bbff'
  on-primary-fixed: '#25005a'
  on-primary-fixed-variant: '#5a00c6'
  secondary-fixed: '#ffd9e4'
  secondary-fixed-dim: '#ffb0cd'
  on-secondary-fixed: '#3e0022'
  on-secondary-fixed-variant: '#8c0053'
  tertiary-fixed: '#e5e0ef'
  tertiary-fixed-dim: '#c9c4d3'
  on-tertiary-fixed: '#1c1a25'
  on-tertiary-fixed-variant: '#474551'
  background: '#fef7ff'
  on-background: '#1d1a24'
  surface-variant: '#e8dfee'
  success: '#10B981'
  warning: '#F59E0B'
  danger: '#EF4444'
  text-primary: '#1E293B'
  text-secondary: '#64748B'
typography:
  display-hero:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  display-stats:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '700'
    lineHeight: '1.2'
  heading-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  heading-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.5'
  body-base:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.4'
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: '1.4'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  container-padding: 20px
  gutter: 16px
---

## Brand & Style

The visual identity of the design system centers on a "Professional yet Playful" narrative, bridging the gap between rigorous academic administration and a vibrant, student-centric environment. It prioritizes clarity and high-energy aesthetics to reduce the cognitive load of school management tasks.

The chosen style is **Modern Corporate with Glassmorphic accents**. This approach utilizes a luminous, airy foundation (Lavender-White) punctuated by deep violet brand moments. The "Maya Le Clark" influence manifests through high-gloss surfaces, extreme roundedness, and a sense of depth created by backdrop blurs rather than heavy shadows. The resulting interface feels "premium" and "clean," evoking a sense of institutional reliability and modern innovation.

## Colors

This design system utilizes a palette designed for "Luminous Functionalism." 

- **Primary Violet:** Used for core brand actions, QR scan perimeters, and active navigation states.
- **Accent Coral:** Reserved for "Premium" moments, highlights, and secondary interactive calls-to-action that require distinct visual separation from the primary brand color.
- **Soft Lavender (Tertiary):** Serves as the primary canvas color, replacing harsh whites with a warmer, more sophisticated school-friendly tone.
- **Semantic Colors:** Success (Green), Warning (Amber), and Danger (Red) are strictly applied to data states like payment status, sync updates, and validation errors.

Glassmorphism is achieved by applying a 70% opacity to white surfaces against the Soft Lavender background, combined with a high-intensity backdrop blur.

## Typography

Typography is built exclusively on **Inter**, chosen for its systematic and utilitarian nature which ensures readability across dense data tables and mobile interfaces.

- **Scale & Hierarchy:** The system uses a tight scale for body text (14px-18px) to maintain information density, while using large, bold display sizes (30px+) for dashboard statistics and "Hello" greetings to create a friendly, accessible entry point.
- **Weight Usage:** Bold (700) is reserved for display and hero titles. SemiBold (600) is the standard for subheaders and interactive labels to provide clear affordance. Regular (400) is used for all primary body content and metadata.
- **Mobile Optimization:** On mobile devices, `display-hero` should scale down to 28px to prevent excessive line wrapping while maintaining visual impact.

## Layout & Spacing

The design system employs a **12-column fluid grid** for desktop and a **4-column grid** for mobile, with a standardized **20px container padding** for internal card content.

- **Spacing Rhythm:** A 4px baseline grid ensures vertical consistency. Layouts should prioritize whitespace to emphasize the glassmorphic "floating" effect.
- **Component Spacing:** Use `lg` (24px) spacing between primary layout sections and `md` (16px) for spacing between internal card elements.
- **Mobile Reflow:** For complex data like "Time Tables," the layout shifts from a horizontal grid to a vertical "Slot List" view to accommodate touch targets. Sticky bottom navigation or action buttons are used on mobile to keep primary school functions (like "Take Attendance") within thumb reach.

## Elevation & Depth

Hierarchy is established through **Tonal Layers** and **Glassmorphism**.

- **Surface Strategy:** Backgrounds use the tertiary Soft Lavender. Above this, primary content sits in cards with a `white/70` background and a `backdrop-blur-xl` (24px blur).
- **Shadows:** Instead of neutral grays, the system uses **Ambient Shadows** tinted with the brand primary. Use a diffused shadow (`0px 10px 30px`) with the color `#DDD6FE` (Primary 200) at 40% opacity to create a "luminous" glow rather than a dark void.
- **Depth Levels:**
    - **Level 0:** Background Lavender.
    - **Level 1:** Glassmorphic Cards (Floating).
    - **Level 2:** Modals and Popovers (Higher blur intensity, slightly darker primary shadow).

## Shapes

The shape language is "Extra-Rounded," conveying a modern, approachable, and premium feel. 

- **Primary Cards & Modals:** Use `rounded-3xl` (1.5rem / 24px) to create the soft, "squishy" aesthetic required by the brand narrative.
- **Buttons & Inputs:** Follow the `rounded-xl` (0.75rem / 12px) standard for a refined but friendly touch target.
- **Status Indicators:** Pills and badges use `rounded-full` to distinguish them from interactive buttons.
- **Avatars:** Circular (`rounded-full`) to maintain a soft profile throughout the UI.

## Components

- **Buttons:** Primary buttons use a solid `#7C3AED` fill with white text. On hover, apply a `scale(1.02)` and increase the primary shadow intensity. Secondary buttons use a glassmorphic white background with primary-colored text.
- **Glass Cards:** The signature component. Always feature `rounded-3xl` corners, a `white/70` background, and `backdrop-blur-xl`. Borders should be a subtle 1px `primary-300` at 20% opacity.
- **Floating Inputs:** Labels float above the input field on focus. Use a `12px` border radius. The border transitions from `primary-100` to `primary-600` on focus.
- **Progress Bars:** Use a `6px` height with a `rounded-full` track. The fill uses a gradient from `primary-400` to `primary-600`.
- **Chips/Badges:** Small, `rounded-full` elements using semantic colors (Success/Warning/Danger) with high-contrast text and a 10% opacity background of the same hue.
- **Checkboxes & Radios:** Stylized with the primary violet color. Interaction should feel tactile with a 200ms ease-in-out transition on the checkmark appearance.
- **QR Scan Zone:** A specialized component with a `2px` primary violet dashed border and a pulsating animation to guide user focus.