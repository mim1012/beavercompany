# Beaver Company Design System

## 1. Atmosphere & Identity

A warm, trustworthy children’s performance brand: playful without becoming noisy, with real photography and generous cream space. The signature is a friendly beaver-orange accent carried across soft paper-like surfaces, dark video-gallery contrast, and rounded media cards.

## 2. Color

| Role | Token | Value | Usage |
|---|---|---:|---|
| Surface/primary | `--surface-primary` | `#FEF9E7` | Main cream sections |
| Surface/secondary | `--surface-secondary` | `#F5F5F4` | Neutral media and page areas |
| Surface/elevated | `--surface-elevated` | `#FFFFFF` | Cards and forms |
| Text/primary | `--text-primary` | `#1C1917` | Headings and card titles |
| Text/secondary | `--text-secondary` | `#57534E` | Descriptions |
| Video surface | `--surface-video` | `#1C1917` | Video gallery background |
| Accent/primary | `--accent-primary` | `#F59E0B` | CTAs, tags, interactive emphasis |
| Accent/hover | `--accent-hover` | `#D97706` | Hover states |
| Border/default | `--border-default` | `#E7E5E4` | Card and form borders |

## 3. Typography

- Primary: project font-heading plus system sans fallback.
- Body: system sans fallback.
- Display: responsive 4xl to 6xl, bold.
- Section heading: 4xl to 5xl, bold.
- Card title: lg to 2xl, bold.
- Body: base to xl; descriptions use sm to base.

## 4. Spacing & Layout

- Base unit: 4px.
- Content container: Tailwind `container` with responsive page padding.
- Section rhythm: 16, 24, 48, 64, 96px equivalents.
- Video gallery: one column on small screens, two columns from `md`, max width 5xl, 32px gap.

## 5. Components

### Video Card
- Structure: media aspect-ratio frame, title, description.
- Variants: live YouTube item; loading/empty state.
- States: default, hover scale/shadow, keyboard focus through iframe/browser controls, loading placeholder.
- Accessibility: iframe title is the video title; media retains a 16:9 frame.

### Inquiry Form
- Structure: labeled fields, consent checkbox, submit button.
- States: default, invalid, disabled, submitting, success, error.
- Accessibility: visible labels, required consent, disabled submit until required fields are complete.

### News Card
- Structure: linked thumbnail/title/date/description.
- States: default, hover, loading, empty.
- Accessibility: entire card is a descriptive link.

## 6. Motion & Interaction

- Card hover uses transform and shadow over 300ms.
- Interactive controls use the existing Tailwind transition utilities.
- No layout-property animation is introduced.
- Respect reduced-motion preferences through the existing motion stack.

## 7. Depth & Surface

- Strategy: mixed. White cards use soft shadows and a subtle stone border; dark video gallery uses tonal contrast.
- Media frames keep a stable 16:9 aspect ratio to prevent layout shift.
