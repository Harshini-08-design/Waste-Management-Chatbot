# EcoGuide – Waste Management & Recycling Guide

A React frontend for the Waste Management & Recycling Guide project.

## Pages
- **/** — Landing Page (hero, quick access, features, stats)
- **/login** — Login & Register
- **/chat** — AI Chat Agent (EcoBot, powered by Claude API)
- **/map** — Recycling Center Locator (OpenStreetMap via react-leaflet)

## Tech Stack
- React 18 + React Router v6
- react-leaflet + Leaflet (OpenStreetMap tiles)
- Claude API (claude-sonnet) for AI chat
- Google Fonts: Syne (headings) + DM Sans (body)

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure the API
The chat page calls the Claude API directly. For production, proxy this through your backend to keep the API key secure.

In `src/pages/Chat.jsx`, the API call is:
```js
fetch('https://api.anthropic.com/v1/messages', {
  headers: { 'Content-Type': 'application/json' },
  // Add your API key in the backend proxy
})
```

**Recommended:** Create a backend endpoint (e.g. `/api/chat`) that adds the `x-api-key` header server-side, then point the fetch in Chat.jsx to `/api/chat`.

### 3. Run locally
```bash
npm start
```
Opens at http://localhost:3000

### 4. Build for production
```bash
npm run build
```

## Project Structure
```
src/
├── components/
│   └── layout/
│       ├── Navbar.jsx
│       └── Navbar.css
├── data/
│   └── centers.js          # Center data + quick topics
├── pages/
│   ├── Landing.jsx / .css  # Home page
│   ├── Login.jsx / .css    # Auth page
│   ├── Chat.jsx / .css     # AI chat
│   └── Map.jsx / .css      # OpenStreetMap locator
├── styles/
│   └── global.css          # CSS variables + global styles
├── App.jsx                 # Routes
└── index.js                # Entry point
```

## Adding Real Centers
Update `src/data/centers.js` with real lat/lng coordinates:
```js
{
  id: 7,
  name: "Your Center Name",
  address: "Full Address",
  lat: 17.XXXX,   // Get from maps.google.com or openstreetmap.org
  lng: 78.XXXX,
  hours: "Mon–Sat 9am–5pm",
  distance: "X km",
  open: true,
  types: ["dry", "ewaste"],   // dry | ewaste | hazard | compost | medical
  tags: ["Dry Waste", "E-Waste"],
  phone: "+91 XXXXX XXXXX",
  icon: "♻️",
}
```

## OpenStreetMap
Uses free OpenStreetMap tiles — no API key required.
The "Get Directions" button links to OpenStreetMap's routing for the selected center.
