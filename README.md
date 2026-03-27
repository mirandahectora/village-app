# Village — Cooperative Finance Platform

A marketing site + app shell for Village, built with React + Vite.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev
```

Then open **http://localhost:5173** in your browser.

## Build for Production (Netlify)

```bash
npm run build
```

Drag the `dist/` folder into Netlify. The `_redirects` file for SPA routing:

```
# dist/_redirects
/* /index.html 200
```

## Project Structure

```
src/
├── components/
│   ├── Nav.jsx           # Top navigation bar
│   └── Footer.jsx        # Site footer
├── context/
│   └── AuthContext.jsx   # Auth state + all demo data
├── hooks/
│   └── useInView.js      # Scroll-triggered animation hook
├── pages/
│   ├── Landing.jsx       # Home / hero
│   ├── About.jsx         # Team, mission, timeline
│   ├── HowItWorks.jsx    # 5-step explainer, pricing, FAQ
│   ├── Community.jsx     # Who Village serves, rollout cities
│   └── Pricing.jsx       # Tier comparison, model notes, FAQ
└── index.css             # Design system — CSS variables, typography
```

## Design System

Defined in `src/index.css`:

| Variable       | Value      | Role                    |
|----------------|------------|-------------------------|
| --green        | #2A4A1E    | Primary / CTA           |
| --terracotta   | #C05030    | Accent / highlight      |
| --cream        | #F4EEE2    | Page background         |
| --ink          | #1C1A14    | Body text               |
| --serif        | Playfair Display | Headings          |
| --mono         | DM Mono    | Labels, tags, metadata  |
| --sans         | DM Sans    | Body copy               |

## Tech Stack

- React 19 + Vite 8
- react-router-dom v7
- lucide-react icons
- Google Fonts (Playfair Display, DM Sans, DM Mono)

## Demo Mode

`AuthContext.jsx` contains all demo village data — members, votes, chat, activity.
Any credentials work at login. The demo loads Hector Miranda's profile with two villages pre-populated.
