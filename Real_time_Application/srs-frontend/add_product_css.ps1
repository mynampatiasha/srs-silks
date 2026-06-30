$css = @"

/* == PRODUCT PAGE == */
.product-page-container { max-width: 1200px; margin: 0 auto; padding: 40px 32px; }
.product-split { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; }
.product-gallery { display: flex; flex-direction: column; gap: 16px; }
.main-image-container { width: 100%; aspect-ratio: 3/4; background: var(--card-bg); border-radius: 12px; overflow: hidden; position: relative; border: 1px solid var(--border); }
.main-image { width: 100%; height: 100%; object-fit: cover; }
.thumbnail-list { display: flex; gap: 12px; overflow-x: auto; padding-bottom: 8px; }
.thumbnail { width: 80px; height: 100px; object-fit: cover; border-radius: 8px; cursor: pointer; border: 2px solid transparent; opacity: 0.7; transition: all 0.2s; }
.thumbnail:hover { opacity: 1; }
.thumbnail.active { opacity: 1; border-color: var(--rust); }

.product-info { display: flex; flex-direction: column; }
.product-cat-label { font-size: 13px; font-weight: 600; color: var(--rust); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
.product-title { font-family: var(--font-serif); font-size: 42px; color: var(--ink); line-height: 1.2; margin-bottom: 24px; }
.product-pricing { display: flex; alignItems: center; gap: 12px; margin-bottom: 30px; }
.current-price { font-size: 28px; font-weight: 700; color: var(--ink); }
.original-price { font-size: 20px; color: var(--muted); text-decoration: line-through; }
.discount-badge { background: #fee2e2; color: #b91c1c; padding: 4px 10px; border-radius: 6px; font-size: 14px; font-weight: 700; }

.product-description { font-size: 16px; line-height: 1.7; color: #4b5563; margin-bottom: 30px; white-space: pre-line; }
.product-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 40px; }
.detail-tag { background: var(--bg); border: 1px solid var(--border); padding: 6px 14px; border-radius: 20px; font-size: 13px; color: var(--muted); }

.action-buttons { display: flex; flex-direction: column; gap: 16px; margin-bottom: 40px; }
.add-to-cart-btn { padding: 18px; font-size: 18px; width: 100%; }
.whatsapp-btn { background: #25D366; color: white; border: none; padding: 18px; border-radius: 8px; font-size: 18px; font-weight: 600; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 10px; }
.whatsapp-btn:hover { background: #20bd5a; }

.delivery-info { border-top: 1px solid var(--border); padding-top: 24px; display: flex; flex-direction: column; gap: 16px; }
.info-item { display: flex; align-items: center; gap: 16px; color: var(--ink); font-weight: 500; font-size: 15px; }
.info-item i { font-size: 20px; color: var(--muted); width: 24px; text-align: center; }

@media (max-width: 900px) {
  .product-split { grid-template-columns: 1fr; gap: 40px; }
  .product-title { font-size: 32px; }
}
"@
Add-Content -Path "src/index.css" -Value $css
Write-Host "Done"
