# YouTube Music URL Sync (Firefox + Node.js)

This project automatically tracks URL changes in YouTube Music (including SPA navigation)
in Mozilla Firefox and sends them in real time to a local Node.js server.

## Features
- Automatic URL change detection (SPA-safe)
- Firefox-compatible (Manifest V2)
- Sends data to Node.js via HTTP
- No user interaction required after setup

## Setup

### 1. Install dependencies
```bash
npm install express cors ytmusic-api fs
```

### 2. Start server
```bash
node index.js
```

Test:
http://127.0.0.1:8787/test

### 3. Load Firefox extension
- Open about:debugging#/runtime/this-firefox
- Load Temporary Add-on
- Select manifest.json

## Data Sent
```json
{
  "url": "https://music.youtube.com/...",
}
```

## License
MIT
