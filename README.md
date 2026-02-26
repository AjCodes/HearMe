# HearMe

HearMe is an interactive, customizable music room web app where users can build playlists, personalize their room, and share their setup with others.

## What You Can Do
- Create playlists and add songs from the built-in song library.
- Play songs directly from the room radio UI.
- Customize radio colors with presets or manual color picks.
- Customize shelf colors and choose a dancing mascot.
- Edit profile fields and upload a profile photo.
- Choose a profile frame style.
- Change room background color or upload a background image.
- Upload a poster image.
- Add and drag stickers around the room.
- Generate a shareable room link.

## Tech Stack
- HTML
- CSS
- Vanilla JavaScript (ES modules)
- `serve` (for local static hosting)

## Project Structure
- `index.html` - main app shell and page sections
- `style.css` - layout, component styling, responsive behavior
- `js/app.js` - app bootstrapping and event handling
- `js/state.js` - centralized client-side state
- `js/render.js` - UI rendering functions
- `js/router.js` - URL navigation and room sharing encode/decode
- `js/params.js` - presets, defaults, and asset config
- `songs.json` - local song dataset used in search/playlist flow
- `photos/` - frames, radio assets, mascots, and other visuals

## Setup and Run
1. Install Node.js (LTS recommended).
2. Open a terminal in the project folder:
   - `c:\Users\AJ\Documents\Projects\HearMe\HearMe`
3. Install dependencies:
   - `npm install`
4. Start the app:
   - `npm run dev`
5. Open the local URL printed in terminal (commonly `http://localhost:3000`).

## Mascots
- Mascot assets are loaded from `photos/mascots/`.
- Add transparent GIFs there and register them in `js/params.js` under `MASCOT_GIFS`.

## Team
- Lisa-Marie
- Sam
- AJ
