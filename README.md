# SRS Silks — Ecommerce Platform

A full-stack ecommerce site for SRS Silks (a saree and ethnic-wear store) —
product catalog, orders, reviews, and admin management, plus a separate
Flutter billing/POS shell.

This repo contains a few stages of the same project side by side:

- **`Real_time_Application/`** — the current full-stack app: React (Vite)
  frontend + Express/MongoDB backend with Cloudinary image storage. This is
  the one to run for active development.
- **`demo/`** — an earlier static HTML/CSS/JS prototype (storefront +
  admin panel) used before the real-time app was built.
- **`srs-backend/`** — an earlier/parallel copy of the backend (kept
  alongside `Real_time_Application/srs-backend/`, which is more current).
- **`billing_main_shell.dart`** — a Flutter shell for a POS/billing app.

## Tech stack

- **Frontend**: React (Vite)
- **Backend**: Node.js, Express 5, MongoDB (Mongoose), JWT auth, bcrypt,
  Cloudinary (via `multer-storage-cloudinary`) for product images
- **Data models**: Product, Order, Review, AdminUser
- **Billing app**: Flutter (`billing_main_shell.dart`)

## Running locally

```bash
cd Real_time_Application/srs-backend
npm install
npm start
```
Requires a `.env` with `MONGO_URI`, a JWT secret, and Cloudinary credentials.

```bash
cd Real_time_Application/srs-frontend
npm install
npm run dev
```
