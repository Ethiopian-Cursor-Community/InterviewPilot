---
name: InterviewPilot Design System
colors:
  surface: '#f8f9ff'
  surface-dim: '#d5dae5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e9eefa'
  surface-container-high: '#e3e8f4'
  surface-container-highest: '#dde3ee'
  on-surface: '#161c24'
  on-surface-variant: '#464555'
  inverse-surface: '#2b3139'
  inverse-on-surface: '#ebf1fc'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#4d44e3'
  primary: '#3525cd'
  on-primary: '#ffffff'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#c3c0ff'
  secondary: '#831ada'
  on-secondary: '#ffffff'
  secondary-container: '#9e41f5'
  on-secondary-container: '#fffbff'
  tertiary: '#7e3000'
  on-tertiary: '#ffffff'
  tertiary-container: '#a44100'
  on-tertiary-container: '#ffd2be'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#f0dbff'
  secondary-fixed-dim: '#ddb8ff'
  on-secondary-fixed: '#2c0051'
  on-secondary-fixed-variant: '#6800b4'
  tertiary-fixed: '#ffdbcc'
  tertiary-fixed-dim: '#ffb695'
  on-tertiary-fixed: '#351000'
  on-tertiary-fixed-variant: '#7b2f00'
  background: '#f8f9ff'
  on-background: '#161c24'
  surface-variant: '#dde3ee'
  gradient-start: '#4F46E5'
  gradient-end: '#9333EA'
  surface-accent: '#F1F7F6'
  success-teal: '#299A8D'
  muted-blue: '#305968'
typography:
  headline-xl:
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
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
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
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  section-gap: 80px
  component-gap: 16px
---

## Brand & Style

The design system is engineered for a high-performance AI interview simulator, balancing the cold precision of technology with the warm encouragement of a personal coach. The brand personality is **Professional, Trustworthy, and High-Tech**. It aims to reduce candidate anxiety by providing a structured, "cockpit-like" environment that feels authoritative yet accessible.

The visual style is **Corporate / Modern** with subtle **Glassmorphism** used to highlight AI-driven insights. It utilizes expansive white space, a refined indigo-to-purple gradient to signal intelligence and creativity, and high-polish components that mirror the sophistication of the underlying LLM technology. The aesthetic prioritizes clarity and focus, ensuring the user's attention remains on the interview practice.

## Colors

The palette revolves around a signature **Indigo-Purple gradient**, representing the intersection of logic (Blue) and innovation (Purple). 

- **Primary & Secondary:** Used exclusively for high-priority actions, progress indicators, and AI status states. The gradient flows from #4F46E5 to #9333EA.
- **Neutrals:** The system uses a deep, ink-like neutral (#161C24) for primary text to ensure maximum legibility and a sense of "Established Professionalism."
- **Backgrounds:** Clean white (#FFFFFF) is the primary surface, with a very light teal-tinted neutral (#F1F7F6) used for secondary sections and "empty state" containers to keep the UI feeling fresh and breathable.
- **Accents:** Success states and feedback loops utilize the Teal (#299A8D) extracted from the core inspiration to provide a calming, positive reinforcement.

## Typography

This design system utilizes **Inter** across all levels to maintain a systematic, utilitarian, and highly legible appearance typical of top-tier SaaS products.

- **Headlines:** Use tighter letter spacing and semi-bold to bold weights to create a strong visual anchor.
- **Body:** Set with generous line heights to ensure long-form interview feedback and transcripts are easy to digest.
- **Labels:** Used for metadata, category tags, and overline text, often employing a medium weight to distinguish from body copy without requiring larger sizes.
- **Scale:** On mobile devices, headline sizes scale down approximately 15-20% to prevent awkward line breaks while maintaining hierarchy.

## Layout & Spacing

The layout follows a **Fixed Grid** philosophy for the central content area, maxing out at 1280px to ensure focus on the dashboard and interview simulator. 

- **Grid System:** A 12-column grid is used for desktop, collapsing to 1 column for mobile. Gutters are fixed at 24px to provide clear separation between cards and navigation elements.
- **Vertical Rhythm:** Sections are separated by an 80px gap to create a distinct narrative flow between "The Simulator," "Feedback," and "Historical Progress."
- **Alignment:** Inspired by the reference, content is often center-aligned for landing pages but left-aligned for the dashboard to provide a functional, data-heavy workspace.

## Elevation & Depth

Visual hierarchy is achieved through **Tonal Layers** and **Ambient Shadows**. 

1. **The Floor:** The main background is flat white (#FFFFFF).
2. **The Cards:** Primary content sits on white cards with a very soft, diffused shadow (15% opacity of the Neutral color, 30px blur, 10px offset).
3. **The Interactive Layer:** Hover states on primary buttons and active cards trigger a secondary shadow with a slight Indigo tint, creating a "lift" effect that signals interactivity.
4. **The AI Layer:** Overlays and modals use a backdrop blur (12px) to create a glassmorphic effect, separating automated AI insights from the static interview content.

## Shapes

The design system employs a **Rounded** shape language to soften the high-tech aesthetic and make the platform feel more approachable.

- **Core Radius:** Most UI elements (buttons, inputs) use 0.5rem (8px).
- **Container Radius:** Cards and main dashboard containers utilize `rounded-xl` (1.5rem / 24px) to create a distinctive, modern look that matches the "2xl" request in the design brief.
- **Interactive Elements:** Checkboxes and small indicators use a 4px radius to maintain precision at smaller scales.

## Components

- **Buttons:** Primary buttons feature the Indigo-to-Purple gradient with white text. They have a "high-polish" look with a subtle inner top-light border (1px, 20% white) to give them a tactile, 3D feel.
- **Cards:** White backgrounds, 24px corner radius, and soft ambient shadows. Cards should have a 1px border using #F1F7F6 to define edges against the white background.
- **Inputs:** Fields use a 1px border (#E5E7EB) which transitions to an Indigo (#4F46E5) glow on focus. Labels sit 8px above the field in `label-md` style.
- **Chips/Badges:** Used for "Skills Found" or "Interview Score." These use the Success Teal (#299A8D) or Secondary Purple with 10% opacity backgrounds and full-saturation text.
- **AI Simulator Window:** A specialized component featuring a dark-themed sidebar (using #161C24) and a glassmorphic transcript area to differentiate the "Simulated Experience" from the "Analytical Dashboard."
- **Lists:** Data lists utilize a horizontal divider system with 16px of vertical padding between items, following the clean, airy rhythm of the reference site.