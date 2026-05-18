# Passify — Frontend Code

Password manager frontend for web (React/Vite) and mobile (React Native/Expo).

---

## Project Structure

```
passify-web/               ← React web app (Vite + React Router)
├── src/
│   ├── api/client.js      ← All API calls to Flask backend
│   ├── context/AuthContext.jsx
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   ├── DashboardPage.jsx
│   │   └── AddPasswordPage.jsx
│   ├── App.jsx            ← Router setup
│   ├── main.jsx
│   └── index.css          ← Global theme (dark vault design)
└── package.json

passify-mobile/            ← React Native app (Expo)
├── src/
│   ├── api/client.js      ← All API calls to Flask backend
│   ├── context/AuthContext.jsx
│   ├── components/theme.js ← Shared colors & StyleSheet
│   ├── screens/
│   │   ├── LoginScreen.jsx
│   │   ├── DashboardScreen.jsx
│   │   └── AddPasswordScreen.jsx
│   └── navigation/AppNavigator.jsx
├── App.jsx
└── package.json
```

---

## Screens / Pages

| Screen | Web route | Description |
|---|---|---|
| Login | `/` | Username + DB password + master password |
| Dashboard | `/dashboard` | List all entries, view, delete |
| Add Password | `/add` | Name, tag, password (with strength meter & generator) |
| View (modal) | — | Decrypt & show password in-place |

---

## Setup

### Web (React + Vite)

```bash
cd passify-web
npm install
npm run dev
```

> Runs at `http://localhost:5173`

### Mobile (React Native + Expo)

```bash
cd passify-mobile
npm install
npx expo start
```

> Scan QR code with Expo Go app, or press `a` for Android / `i` for iOS emulator.

---

## Connecting to the Flask Backend

**Web** — Edit `passify-web/src/api/client.js`:
```js
export const API_BASE = 'http://localhost:5000/api';
```

**Mobile** — Edit `passify-mobile/src/api/client.js`:
```js
// Android emulator:
export const API_BASE = 'http://10.0.2.2:5000/api';

// iOS simulator or physical device on same WiFi:
export const API_BASE = 'http://192.168.x.x:5000/api';  // your machine's LAN IP
```

---

## Expected Flask API Endpoints

Your backend (`app.py`) should expose:

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Body: `{ username, password, master_password }` → `{ token, username }` |
| `GET` | `/api/passwords` | Header: `Authorization: Bearer <token>` → `[{ id, name, tag }]` |
| `GET` | `/api/passwords/:id` | Header: `X-Master-Password` → `{ id, name, tag, password }` (decrypted) |
| `POST` | `/api/passwords` | Body: `{ name, tag, password, master_password }` → `{ id, message }` |
| `DELETE` | `/api/passwords/:id` | → `{ message }` |

---

## Features

- 🔐 **Login** with DB credentials + master password
- 📋 **Dashboard** with search, stats strip, entry cards
- 👁️ **View & decrypt** password in a modal (web) or overlay (mobile)
- 📋 **Copy to clipboard** from the password modal
- ✨ **Add password** with strength meter and random generator
- 🗑️ **Delete** with confirmation dialog
- 🔓 **Logout** clears session (master password never persisted)
