$catCSS = @"

/* == FEATURED CATEGORIES BAR == */
.featured-categories-bar { background: #fff; border-bottom: 1px solid var(--border); padding: 15px 0; box-shadow: 0 2px 5px rgba(0,0,0,0.02); }
.featured-categories-container { max-width: var(--max-w); margin: 0 auto; display: flex; justify-content: center; gap: 30px; overflow-x: auto; padding: 0 32px; }
.featured-category-item { display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer; transition: transform 0.2s; min-width: 70px; }
.featured-category-item:hover { transform: translateY(-3px); }
.featured-category-item img { width: 56px; height: 56px; border-radius: 50%; object-fit: cover; border: 2px solid var(--border); padding: 2px; transition: border-color 0.2s; }
.featured-category-item:hover img { border-color: var(--rust); }
.featured-category-item span { font-size: 12px; font-weight: 500; color: var(--ink); text-align: center; }
"@
Add-Content -Path "src/index.css" -Value $catCSS
Write-Host "CSS appended successfully"
