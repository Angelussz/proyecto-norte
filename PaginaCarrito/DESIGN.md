---
name: Norte Editorial System
colors:
  surface: '#fff9ed'
  surface-dim: '#e0dacb'
  surface-bright: '#fff9ed'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#faf3e4'
  surface-container: '#f4eddf'
  surface-container-high: '#eee8d9'
  surface-container-highest: '#e8e2d4'
  on-surface: '#1e1c13'
  on-surface-variant: '#534438'
  inverse-surface: '#333027'
  inverse-on-surface: '#f7f0e2'
  outline: '#857466'
  outline-variant: '#d8c3b2'
  surface-tint: '#8c4f00'
  primary: '#894d00'
  on-primary: '#ffffff'
  primary-container: '#a96415'
  on-primary-container: '#fffbff'
  inverse-primary: '#ffb874'
  secondary: '#54624f'
  on-secondary: '#ffffff'
  secondary-container: '#d5e4cc'
  on-secondary-container: '#596653'
  tertiary: '#5e5c59'
  on-tertiary: '#ffffff'
  tertiary-container: '#777471'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdcbf'
  primary-fixed-dim: '#ffb874'
  on-primary-fixed: '#2d1600'
  on-primary-fixed-variant: '#6b3b00'
  secondary-fixed: '#d8e7cf'
  secondary-fixed-dim: '#bccbb4'
  on-secondary-fixed: '#131f10'
  on-secondary-fixed-variant: '#3d4a39'
  tertiary-fixed: '#e6e2de'
  tertiary-fixed-dim: '#cac6c2'
  on-tertiary-fixed: '#1c1b19'
  on-tertiary-fixed-variant: '#484644'
  background: '#fff9ed'
  on-background: '#1e1c13'
  surface-variant: '#e8e2d4'
typography:
  display-lg:
    fontFamily: Bebas Neue
    fontSize: 80px
    fontWeight: '400'
    lineHeight: 80px
    letterSpacing: 0.02em
  display-lg-mobile:
    fontFamily: Bebas Neue
    fontSize: 48px
    fontWeight: '400'
    lineHeight: 48px
    letterSpacing: 0.02em
  headline-lg:
    fontFamily: Bebas Neue
    fontSize: 48px
    fontWeight: '400'
    lineHeight: 48px
    letterSpacing: 0.02em
  headline-lg-mobile:
    fontFamily: Bebas Neue
    fontSize: 32px
    fontWeight: '400'
    lineHeight: 32px
    letterSpacing: 0.02em
  headline-md:
    fontFamily: Bebas Neue
    fontSize: 32px
    fontWeight: '400'
    lineHeight: 36px
    letterSpacing: 0.02em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-bold:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
spacing:
  unit: 4px
  container-max: 1280px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 20px
  stack-sm: 16px
  stack-md: 32px
  stack-lg: 64px
---

## Brand & Style

The design system is rooted in a **Premium Editorial** aesthetic that balances local authenticity with direct, high-end sophistication. It draws inspiration from modern lifestyle journalism and boutique commerce, emphasizing quality and origin.

The visual style is a blend of **Minimalism** and **Modern Corporate**, utilizing expansive whitespace (using the Off-white base), structured grid alignments, and a sophisticated interplay between earthy tones and sharp, authoritative typography. The brand personality is "Local but World-Class"—achieved through a tactile color palette paired with an uncompromisingly bold typographic hierarchy. It avoids unnecessary decoration, relying on structural lines and high-quality imagery to convey value.

## Colors

The palette is inspired by natural materials and urban sophistication. 

- **Background (#F3EFE7):** A warm off-white that acts as the canvas, providing a softer, more premium feel than pure white.
- **Text/Base (#1C1B19):** A deep Warm Black used for maximum legibility and authoritative headings.
- **Primary Accent (#C77D2E):** Mustard is reserved strictly for high-priority calls to action (CTAs) and interactive highlights.
- **Secondary Accent (#33402F):** Forest Green is used for labels, category badges, and subtle details to ground the design in its "local" roots.
- **Neutrals (#D8D2C4):** Stone Grey is utilized for structural elements like hair-lines, borders, and dividers, maintaining a low-contrast separation between content blocks.

## Typography

The typography system relies on a high-contrast pairing:
1. **Headings:** Use **Bebas Neue**. This bold, condensed uppercase font provides a striking, cinematic feel. It must always be set in uppercase with a slight positive letter spacing to ensure it feels premium rather than crowded.
2. **Body & UI:** Use **Inter**. This clean, neutral sans-serif ensures maximum utility and readability. It provides the "professional" counterbalance to the expressive headers.

Large display sizes should be used sparingly for hero sections to create visual impact. For long-form text, maintain generous line heights to preserve the airy, editorial feel.

## Layout & Spacing

This design system uses a **Fixed Grid** approach for desktop to maintain an editorial, magazine-like composition, transitioning to a fluid model for mobile.

- **Desktop (1440px+):** A 12-column grid with a max-width of 1280px. Gutters are fixed at 24px. Side margins are 64px to create a "framed" look.
- **Tablet (768px - 1024px):** 8-column grid with 40px margins.
- **Mobile (<768px):** 4-column fluid grid with 20px margins.

Spacing follows a strict 4px base unit. Vertical rhythm is established using large "Stack" increments (64px) between major content sections to emphasize the minimalist "luxury of space."

## Elevation & Depth

To maintain the premium, flat editorial aesthetic, this design system avoids traditional shadows. Depth is communicated through:

1.  **Low-contrast outlines:** Use `Stone Grey (#D8D2C4)` for borders (1px) to define zones without adding visual weight.
2.  **Tonal layering:** Using the `Secondary Accent (#33402F)` or `Text/Base (#1C1B19)` as full-bleed background sections creates a "stacked" vertical experience.
3.  **Flat overlays:** Overlapping images or text blocks slightly (using negative margins) to create a sense of physical layout without needing drop shadows.

## Shapes

The shape language is **Sharp (0px)**. 

To reinforce the "Direct" and "Architectural" brand personality, all containers, buttons, and input fields must have square corners. This geometric rigidity provides a sophisticated contrast to the organic colors and soft background. This applies to all UI elements, including image carousels and cards.

## Components

- **Buttons:** Primary CTAs use a solid `Mustard (#C77D2E)` fill with `Warm Black (#1C1B19)` uppercase text. Secondary buttons are ghost-style with a 1px `Stone Grey` border. All buttons are rectangular with no corner radius.
- **Chips/Labels:** Small labels used for categories or status should use the `Forest Green (#33402F)` as a background with off-white text, or as a 1px bordered outline.
- **Input Fields:** Minimalist design with only a bottom border in `Stone Grey`. Upon focus, the border transitions to `Warm Black`. Labels are small, uppercase Inter.
- **Cards:** Content cards should have no background or shadow. They rely on strict alignment and Stone Grey dividers to separate items. Images within cards must fill the width and maintain sharp corners.
- **Dividers:** Horizontal and vertical lines are strictly 1px `Stone Grey`, used to separate editorial sections or navigation items.
- **Navigation:** Top-level navigation uses small, tracked-out uppercase `Inter` labels. Active states are indicated by a 2px Mustard underline.