---
name: Cognitive Concierge
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#45464d'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#0058be'
  on-secondary: '#ffffff'
  secondary-container: '#2170e4'
  on-secondary-container: '#fefcff'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#07006c'
  on-tertiary-container: '#7073ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#adc6ff'
  on-secondary-fixed: '#001a42'
  on-secondary-fixed-variant: '#004395'
  tertiary-fixed: '#e1e0ff'
  tertiary-fixed-dim: '#c0c1ff'
  on-tertiary-fixed: '#07006c'
  on-tertiary-fixed-variant: '#2f2ebe'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
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
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.05em
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-padding: 24px
  element-gap: 16px
  section-margin: 32px
  max-width: 600px
---

## Brand & Style

The design system is centered on the persona of a highly capable, invisible assistant. It balances **Corporate Modernism** with **High-Tech Minimalism**, aiming to evoke a sense of calm efficiency and technical mastery. The target audience includes busy professionals and enterprise leads who require a tool that feels both authoritative and frictionless.

The aesthetic utilizes expansive whitespace to reduce cognitive load, paired with high-precision typography to communicate clarity. It avoids excessive decoration, relying instead on purposeful motion and subtle depth to guide the user through complex AI-driven interactions. The result is a UI that feels "intelligent"—not because it is flashy, but because it is exceptionally organized and responsive.

## Colors

This color palette is engineered to establish immediate trust. The **Deep Navy** (#0F172A) serves as the anchor, used for primary headings and high-emphasis containers to represent stability. The **Electric Blue** (#3B82F6) acts as the primary action color, signaling intelligence and interactive points.

A secondary **Indigo** (#6366F1) is reserved for AI-specific states, such as "processing" or "listening" modes, differentiating machine-driven actions from standard UI navigation. Backgrounds utilize a hierarchy of **Soft Grays** and whites to maintain a breathable, premium feel, ensuring that the dark primary tones never feel heavy or oppressive.

## Typography

The design system utilizes **Inter** for all primary communication. Its tall x-height and neutral character ensure maximum legibility on mobile screens during fast-paced receptionist tasks. Headings should utilize a tighter letter-spacing and heavier weights to create a sense of "premium density."

For technical data—such as timestamps, call durations, or AI status codes—**JetBrains Mono** is introduced as a label font. This monospaced addition reinforces the "High-Tech" aspect of the brand, signaling to the user that they are interacting with a precise, data-driven engine.

## Layout & Spacing

The layout follows a **Fluid Grid** model optimized for mobile-first interactions. A 4-column grid is used for handsets, expanding to a centered 8-column layout on tablets. 

The spacing rhythm is strictly based on an 8px scale. Generous 24px horizontal margins are mandatory to maintain the high-end, airy aesthetic. Elements within a card should utilize 16px gaps, while major functional sections are separated by 32px to create clear visual "chapters" in the user journey.

## Elevation & Depth

This design system uses **Ambient Shadows** to create a natural sense of hierarchy. Shadows are never pure black; they are tinted with the Primary Navy color at very low opacities (2-4%) to keep them feeling clean and "airy."

- **Level 0 (Base):** Flat, Soft Gray (#F1F5F9) background.
- **Level 1 (Cards):** White surface with a 16px blur, 4px Y-offset shadow. Used for standard information blocks.
- **Level 2 (Active Elements):** White surface with a 32px blur, 12px Y-offset. Used for modals and active "Now Calling" overlays.
- **Glassmorphism:** Navigation bars and sticky headers should use a 20px backdrop-blur with a 70% white tint to maintain context of the content scrolling beneath.

## Shapes

The shape language is defined by **High-Radius Curves**. While the base `roundedness` is set to 2, specific components like main feature cards and input fields should lean toward the `rounded-xl` (1.5rem / 24px) value. 

This extreme roundness serves to "soften" the AI's technical edge, making the software feel approachable and human-centric. Circles are used exclusively for user avatars and AI status indicators (e.g., a pulsing blue ring for "Listening").

## Components

### Buttons
- **Primary:** Deep Navy background, white text, 24px corner radius. Includes a subtle inner-glow to suggest a physical "pressable" surface.
- **Secondary:** White background, 1px Navy border, Deep Navy text.

### Cards
- Standard cards use a 24px corner radius and Level 1 elevation. 
- AI-insight cards feature a 2px left-accent border in Electric Blue to denote machine-generated content.

### Input Fields
- High-contrast fields with a 16px radius. 
- Backgrounds should be slightly darker than the base surface (#F1F5F9) to provide a clear "target" for the user. Focus states trigger an Electric Blue 2px border.

### Chips & Tags
- Used for call categories (e.g., "Spam," "Urgent," "Inquiry"). 
- These use the `label-md` monospaced font and a pill-shape (32px radius) with low-saturation background tints.

### AI Visualizer
- A custom component consisting of a series of vertical bars or a pulsing orb that uses the Tertiary Indigo color. It represents the AI's active presence and should always be accompanied by a "Listening..." or "Thinking..." label.