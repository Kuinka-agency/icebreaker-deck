# pSEO Implementation Guide — Icebreaker Deck

## URL Architecture

### Layer 1: Occasion Pages (`/[occasion]`)
- `/conversation-starters` — catch-all, no filter
- `/date-night-questions` — couples/dating audience
- `/team-icebreakers` — friends, work-safe
- `/family-dinner-questions` — family/kids, wholesome
- `/party-questions` — funny, allow spicy

### Layer 2: Tone Modifier Pages (`/[occasion]/[tone]`)
- `/conversation-starters/deep`, `/conversation-starters/funny`, etc.
- `/date-night-questions/spicy`, `/date-night-questions/flirty`, etc.
- Generated via `generateStaticParams()` at build time

### Layer 3: Individual Questions (`/q/[slug]`) — Phase 2
- `/q/if-your-pet-could-speak-what-would-its-first-comment-be`
- Not yet implemented (post-MVP)

## Page Template Structure

Each pSEO page includes:
1. **H1** — Exact target keyword
2. **Description** — 1-2 sentences matching search intent
3. **Interactive spinner** — Pre-filtered DeckBuilder component
4. **Question list** — 20-30 curated questions below the spinner
5. **Tone badges** — Visible metadata per question
6. **Internal links** — Related occasion/tone pages
7. **JSON-LD** — FAQPage schema for rich snippets

## Content Quality Rules

- **Minimum 15 questions** per page (thin content filter in `[tone]/page.tsx`)
- Pages with fewer than 15 matching questions return 404
- Each question shows tone badges for context
- No duplicate questions across the same page

## KEYWORD-MODIFIER-MATRIX Integration

Source: `QuestionMonopoly/data/competitors/KEYWORD-MODIFIER-MATRIX.json`

Priority combinations target:
- `conversation_starters` (30K/mo base volume)
- Audience modifiers: `for-couples` (0.2x), `for-kids` (0.4x)
- Tone modifiers: `funny` (0.2x), `deep` (0.15x), `spicy` (0.15x)

## Technical SEO

- `generateMetadata()` for dynamic title/description
- `app/sitemap.ts` generates all routes
- `app/robots.ts` blocks `/api/` and `/play`
- Static generation at build time = fast TTFB
- JSON data bundled in the build

## Cross-Linking Strategy

- Each pSEO page links to 3-5 related pages
- Tone pages link back to their parent occasion page
- Occasion pages link to all their tone variants
- Footer links to all occasion pages
