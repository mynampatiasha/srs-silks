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

## ⚠️ Stray file

`billing_main_shell.dart` at the repo root is **not part of this project** —
its imports (`finance_secure_storage`, `finance_auth_service`,
`erp_users_management_screen`, invoices, vendor credits, chart of accounts,
etc.) match the [abra-finance-app](https://github.com/mynampatiasha/abra-finance-app)
codebase, and its relative import paths (`../../core/...`,
`../../app/config/...`) point to a folder structure that doesn't exist in
this repo. It looks like it was committed here by accident and isn't
wired into or runnable as part of SRS Silks — safe to delete if you confirm
it's not needed.

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
