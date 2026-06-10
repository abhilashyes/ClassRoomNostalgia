# ClassRoom Nostalgia

Recreate where you and your classmates used to sit. Real-time, no login required.

Built for **St. Johns** alumni — Class XII (2006) and Class X (2004).

---

## Run locally

The app is a single HTML file that connects to a public MQTT broker. No server or build step needed.

**Option 1 — open directly in browser**
```
open index.html
```

**Option 2 — serve over HTTP (avoids any browser file:// restrictions)**
```bash
npx serve .
# open the URL printed in the terminal (default: http://localhost:3000)
```

Or with Python:
```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

---

## How it works

- Click a class card (12A, 12B … 10C) to enter that classroom
- Tap any empty seat → enter a name, country, and group status → **Place**
- Tap an occupied seat → **Wave 👋** to send a wave to everyone watching, or edit/remove
- Seats and layout persist in your browser (`localStorage`) and sync live via MQTT
- Use **Share** in the header to copy the URL and send it to classmates

---

## Features

| Feature | Notes |
|---|---|
| 7 classrooms | 12A–12D (2006) · 10A–10C (2004) |
| Live sync | MQTT via HiveMQ public broker — no sign-in |
| Country flags | Optional per seat |
| Group toggle | Mark who's in your friend group |
| Wave reaction | Tap an occupied seat → Wave 👋 → animates for all viewers |
| Confetti | Fires when the last seat in a class is filled |
| Flexible layout | Add/remove rows and benches per class |
| Offline cache | Last known state loads instantly from localStorage |

---

## URL params

You can deep-link directly into a class:

```
# file:// (Option 1)
index.html?class=12A

# HTTP server (Option 2/3)
http://localhost:3000/?class=12A
```

Valid class values: `12A` `12B` `12C` `12D` `10A` `10B` `10C`

---

## Notes

- State is stored on the public HiveMQ broker (`broker.hivemq.com:8884`). Anyone who knows the topic path can read or modify it — this is intentional for a no-login nostalgia app, not a production system.
- The `server.js` / `public/` directory is an older Socket.io prototype and is not used by the main app.
