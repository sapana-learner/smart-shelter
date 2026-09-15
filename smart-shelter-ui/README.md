# smart-shelter-ui

React dashboard front-end for **Smart Shelter AI** — AI-assisted shelter
design and climate simulation for extreme environments (Ladakh, Leh,
Manali, Srinagar, Spiti Valley).

## Run locally
```bash
npm install
npm run dev
```
Then open the printed local URL (usually http://localhost:5173).

## Build for production
```bash
npm run build
```
Outputs a static `dist/` folder you can deploy anywhere (GitHub Pages,
Vercel, Netlify, etc).

## Structure
```
smart-shelter-ui/
├── index.html        # Vite entry HTML
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx       # React root mount
    └── App.jsx        # Smart Shelter AI app (5-screen wizard)
```
