$css = @"

/* == CAROUSEL & LIGHTBOX == */
.main-image-container { position: relative; }
.carousel-btn { position: absolute; top: 50%; transform: translateY(-50%); background: rgba(255,255,255,0.9); border: none; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--ink); font-size: 18px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); opacity: 0; transition: opacity 0.2s; z-index: 10; }
.main-image-container:hover .carousel-btn { opacity: 1; }
.prev-btn { left: 16px; }
.next-btn { right: 16px; }

.lightbox-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.95); z-index: 9999; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(5px); }
.lightbox-close { position: absolute; top: 24px; right: 32px; background: none; border: none; color: white; font-size: 48px; cursor: pointer; line-height: 1; }
.lightbox-img { max-width: 90vw; max-height: 90vh; object-fit: contain; animation: zoomIn 0.3s ease-out forwards; }
@keyframes zoomIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }

.lightbox-btn { position: absolute; top: 50%; transform: translateY(-50%); background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; color: white; font-size: 24px; transition: all 0.2s; }
.lightbox-btn:hover { background: rgba(255,255,255,0.3); }
.lightbox-prev { left: 40px; }
.lightbox-next { right: 40px; }

/* Related products tweaks */
.related-products-section .card { border: 1px solid var(--border); box-shadow: none; }
"@
Add-Content -Path "src/index.css" -Value $css
Write-Host "Done"
