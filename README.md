# Ektaa Couture — Customer Storefront

The customer-facing storefront for Ektaa Couture, built with React + Vite + Tailwind.

Pairs with the backend API at https://github.com/ektakhatwani2-code/backend_code
and the admin panel at https://github.com/ektakhatwani2-code/admin_code.

## Stack

- **Build tool:** Vite 5
- **UI:** React 18 + React Router 6
- **Styling:** Tailwind CSS, custom design tokens (Karla font, brand palette)
- **State:** Context API (`AuthContext`, `CartContext`, `WishlistContext`)
- **HTTP:** Axios with token-refresh interceptor
- **Payments:** Razorpay Checkout (client-side modal + server-side verification)
- **Notifications:** react-toastify

## Features

- Browse collections (EK TAAR, Cutwork, Kahaani, …)
- Product detail pages with image gallery + variant picker
- Search and filtering
- Persistent cart (synced to backend when logged in)
- Wishlist
- User registration, login, password reset
- Multi-address checkout (saved on profile)
- Razorpay (UPI / cards / net banking / wallets) and Cash on Delivery
- Order history with detail view + tracking
- Newsletter subscription

## Project structure

```
src/
├── components/    # Header, Footer, Cart drawer, Product card, Loader, Button, ...
├── pages/         # Home, Collections, ProductDetails, Cart, Checkout, Account*, ...
├── context/       # Auth, Cart, Wishlist providers
├── services/      # api.js — axios client with refresh interceptor
├── styles/        # global.css and design tokens
└── App.jsx
```

## Getting started (local development)

```bash
# 1. install deps
npm install

# 2. copy and configure env
cp .env.example .env
# edit .env so VITE_API_URL points to your local backend

# 3. start dev server
npm run dev
```

Vite will serve at http://localhost:5173.
The backend should be running on http://localhost:5000 (default in `.env.example`).

## Environment variables

| Variable | Purpose |
|---|---|
| `VITE_API_URL` | Backend API base URL **including `/api`**. e.g. `http://localhost:5000/api` for dev, `https://api.example.com/api` for prod. |
| `VITE_RAZORPAY_KEY_ID` | Razorpay public key (`rzp_test_*` or `rzp_live_*`). Optional — the backend also returns it from `/payments/create-order`. |

In production builds (`import.meta.env.PROD`) the app will throw at startup if
`VITE_API_URL` is missing — the previous behavior of silently falling back to
`localhost:5000` was removed because it caused deployed builds to point at the
developer's machine.

## Build

```bash
npm run build      # output to dist/
npm run preview    # serve the production bundle locally
npm run lint       # ESLint
```

The build is a static SPA suitable for any CDN host (Vercel, Netlify, S3 +
CloudFront, GitHub Pages with a fallback to `index.html`).

## Deploying

```bash
# Vercel example
VITE_API_URL=https://api.your-store.com/api \
VITE_RAZORPAY_KEY_ID=rzp_live_yourKey \
npm run build
```

Make sure the deployed origin matches the `FRONTEND_URL` configured on the
backend — CORS will reject any other origin in production.

## License

Private project — All rights reserved.
