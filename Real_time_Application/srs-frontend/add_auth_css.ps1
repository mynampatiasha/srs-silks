$css = @"

/* == CUSTOMER AUTH MODAL == */
.auth-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); z-index: 9999; display: flex; align-items: center; justify-content: center; }
.auth-modal { background: #fff; width: 100%; max-width: 440px; border-radius: 16px; padding: 40px; position: relative; box-shadow: 0 20px 40px rgba(0,0,0,0.2); animation: slideUp 0.3s ease-out; }
@keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

.close-btn { position: absolute; top: 16px; right: 20px; background: none; border: none; font-size: 28px; color: var(--muted); cursor: pointer; }
.auth-header { margin-bottom: 30px; text-align: center; }
.auth-header h2 { font-family: var(--font-serif); font-size: 28px; color: var(--ink); margin-bottom: 8px; }
.auth-header p { color: var(--muted); font-size: 14px; }

.auth-form { display: flex; flex-direction: column; gap: 20px; }
.form-group { display: flex; flex-direction: column; gap: 8px; }
.form-group label { font-size: 13px; font-weight: 600; color: var(--ink); }
.form-group input { padding: 14px 16px; border: 1px solid var(--border); border-radius: 8px; font-size: 15px; transition: border-color 0.2s; }
.form-group input:focus { outline: none; border-color: var(--rust); box-shadow: 0 0 0 3px rgba(185, 28, 28, 0.1); }

.auth-submit { padding: 16px; font-size: 16px; margin-top: 10px; }
.auth-footer { margin-top: 24px; text-align: center; font-size: 14px; color: var(--muted); border-top: 1px solid var(--border); padding-top: 20px; }
.auth-footer span { color: var(--rust); font-weight: 600; cursor: pointer; transition: color 0.2s; }
.auth-footer span:hover { text-decoration: underline; }

.auth-error { background: #fee2e2; color: #b91c1c; padding: 12px 16px; border-radius: 8px; font-size: 14px; margin-bottom: 20px; text-align: center; font-weight: 500; }
"@
Add-Content -Path "src/index.css" -Value $css
Write-Host "Done"
