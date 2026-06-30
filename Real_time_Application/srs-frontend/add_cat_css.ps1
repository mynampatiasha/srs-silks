$css = @"

/* == CATEGORY PAGE == */
.category-page-wrapper { max-width: 1100px; margin: 0 auto; padding: 28px 32px; }
.cat-breadcrumb { font-size: 13px; color: var(--muted); margin-bottom: 16px; }
.cat-page-header { margin-bottom: 24px; }
.cat-page-header h1 { font-family: var(--font-serif); font-size: 36px; color: var(--ink); margin-bottom: 4px; }
.cat-page-header p { color: var(--muted); font-size: 14px; }
.sub-cat-chips { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 28px; }
.sub-cat-chip { background: none; border: 1px solid var(--border); border-radius: 20px; padding: 7px 18px; font-size: 13px; color: var(--muted); cursor: pointer; font-family: var(--font-sans); font-weight: 500; transition: all 0.2s; }
.sub-cat-chip:hover { background: var(--rust); color: #fff; border-color: var(--rust); }
.sub-cat-chip.active { background: var(--rust); color: #fff; border-color: var(--rust); }
.cat-empty { text-align: center; padding: 80px 32px; color: var(--muted); }
.cat-empty h3 { font-family: var(--font-serif); font-size: 26px; color: var(--ink); margin: 16px 0 8px; }
.cat-empty p { font-size: 14px; margin-bottom: 24px; }
.featured-category-item.active-cat img { border-color: var(--rust); border-width: 3px; }
.featured-category-item.active-cat span { color: var(--rust); font-weight: 700; }
"@
Add-Content -Path "src/index.css" -Value $css
Write-Host "Done"
