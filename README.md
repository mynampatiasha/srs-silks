# 🥻 SRS Silks — Ecommerce Platform

`React (Vite)` `Node.js` `Express` `MongoDB` `Cloudinary` `Flutter`

> A full-stack ecommerce platform for a saree and ethnic-wear store.

## What is this?

A full-stack ecommerce site for SRS Silks (a saree and ethnic-wear store) —
product catalog, orders, reviews, and admin management.

This repo contains a few stages of the same project side by side:

| Folder | What it is |
|---|---|
| `Real_time_Application/` | ✅ Current full-stack app — the one to run for active development |
| `demo/` | Earlier static HTML/CSS/JS prototype (storefront + admin panel) |
| `srs-backend/` | Earlier/parallel backend copy |

## 🛠️ Tech Stack

- **Frontend**: React (Vite)
- **Backend**: Node.js, Express 5, MongoDB (Mongoose), JWT auth, bcrypt,
  Cloudinary (via `multer-storage-cloudinary`) for product images
- **Data models**: Product, Order, Review, AdminUser


## 🚀 Running Locally

```bash
cd Real_time_Application/srs-backend
npm install
npm start
```

```bash
cd Real_time_Application/srs-frontend
npm install
npm run dev
```

## 🔒 Security

Requires a `.env` with `MONGO_URI`, a JWT secret, and Cloudinary credentials
— never commit real values for these.
