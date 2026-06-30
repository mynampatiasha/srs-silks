/* ═══════════════════════════════════════════════
   SRS SILK TRADERS — index.js
   Handles: Products, Cart, Reviews, Gallery,
            Contact Form, Filters, Nav
═══════════════════════════════════════════════ */

'use strict';

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */

const firebaseConfig = {
  apiKey: "AIzaSyAv8WZPd7k6oGAsGX10NPAOp6iuqU3QE1w",
  authDomain: "experime-3251a.firebaseapp.com",
  projectId: "experime-3251a",
  storageBucket: "experime-3251a.firebasestorage.app",
  messagingSenderId: "256324869428",
  appId: "1:256324869428:web:02a6392b90e77b2f805961"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

let PRODUCTS = [];

const REVIEWS = [
  {
    name: 'Aashini & Gunjan Desai',
    loc: 'USA',
    stars: 5,
    text: 'Very nice sarees. Perfect stitching. Will definitely order from USA next year. Arrived in just few days!! You provided the best service. Blouses and stitching was so quick and perfect. Thank you 🙏',
    date: '2 years ago',
  },
  {
    name: 'Sunitha Suni',
    loc: 'Bengaluru',
    stars: 5,
    text: 'It was lockdown could not go out to shop, but this shop perosn was very polite shared photos of saree through watsapp ,through which I shopped lovely sarees... They have evry good collection.',
    date: '5 years ago',
  },
  {
    name: 'Tejovathi Theerdham',
    loc: 'Manufacturer',
    stars: 5,
    text: 'We r manufacturer of treditional art hand painted pen kamlakari sarees, we parches silk sarees from srs silks',
    date: '3 years ago',
  },
  {
    name: 'Verified Customer',
    loc: 'India',
    stars: 5,
    text: 'Nice collections and comfortable price Good service and happy satisfaction.',
    date: 'Recent',
  },
  {
    name: 'Happy Shopper',
    loc: 'Bengaluru',
    stars: 5,
    text: 'Nice place, helpful people & nice collection, cheap rate, very nice materials',
    date: 'Recent',
  }
];

let GALLERY_IMAGES = [];

const FREE_SHIPPING_THRESHOLD = 5000;
const SHIPPING_COST           = 150;

/* ─────────────────────────────────────────────
   STATE
───────────────────────────────────────────── */

let cart = JSON.parse(localStorage.getItem("srs_cart") || "[]");
let activeFilter = 'all';

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */

function inr(n) {
  return '₹' + n.toLocaleString('en-IN');
}

function discount(price, orig) {
  return Math.round(((orig - price) / orig) * 100) + '% off';
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2600);
}

/* ─────────────────────────────────────────────
   PRODUCTS
───────────────────────────────────────────── */

function renderProducts(filter) {
  const grid    = document.getElementById('products-grid');
  const countEl = document.getElementById('prod-count');

  const filtered = filter === 'all'
    ? PRODUCTS
    : PRODUCTS.filter(p => p.cat === filter);

  countEl.textContent = filter === 'all'
    ? `Showing all ${PRODUCTS.length} pieces`
    : `Showing ${filtered.length} of ${PRODUCTS.length} pieces`;

  grid.innerHTML = filtered.map(p => {
    const savings = discount(p.price, p.orig);
    return `
      <div class="card" data-id="${p.id}" onclick="window.location.href='product.html?id=${p.id}'" style="cursor: pointer;">
        <div class="card-img">
          <img
            src="${p.img}"
            alt="${p.name}"
            loading="lazy"
            onerror="this.style.background='#d4b896';this.removeAttribute('src')"
          />
          ${!p.inStock ? `
            <div class="out-stock-overlay">
              <div class="out-stock-label">Out of Stock</div>
            </div>` : ''}
        </div>
        <div class="card-body">
          <div class="card-cat">${p.cat.replace('_', ' ')}</div>
          <div class="card-name">${p.name}</div>
          <div class="card-desc">${p.desc}</div>
          <div class="card-row">
            <div>
              <span class="price">${inr(p.price)}</span>
              <span class="price-old">${inr(p.orig)}</span>
              <span class="savings-pill">${savings}</span>
            </div>
            <button
              class="add-btn"
              data-product-id="${p.id}"
              ${!p.inStock ? 'disabled' : ''}
              aria-label="${p.inStock ? 'Add ' + p.name + ' to cart' : 'Out of stock'}"
            >
              ${p.inStock ? 'Add to cart' : 'Sold out'}
            </button>
          </div>
          <div class="card-tags">
            ${p.tags.map(t => `<span class="card-tag">${t}</span>`).join('')}
          </div>
        </div>
      </div>
    `;
  }).join('');

  grid.querySelectorAll('.add-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      addToCart(btn.dataset.productId);
    });
  });
}

/* ─────────────────────────────────────────────
   FILTERS
───────────────────────────────────────────── */

function initFilters() {
  const container = document.getElementById('filters');
  container.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    container.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeFilter = btn.dataset.cat;
    renderProducts(activeFilter);
  });
}

/* ─────────────────────────────────────────────
   CART
───────────────────────────────────────────── */

function addToCart(id) {
  const product = PRODUCTS.find(p => p.id === id);
  if (!product || !product.inStock) return;
  cart.push({ ...product });
  renderCart();
  showToast(`${product.name} added to cart 🛍️`);
  
  const panel = document.getElementById('cart-panel');
  if (!panel.classList.contains('open')) {
    toggleCart();
  }
}

function removeFromCart(index) {
  cart.splice(index, 1);
  renderCart();
}

function renderCart() {
  localStorage.setItem('srs_cart', JSON.stringify(cart));
  const countEl = document.getElementById('cart-count');
  const itemsEl = document.getElementById('cart-items');

  countEl.textContent   = cart.length;
  countEl.style.display = cart.length ? 'flex' : 'none';

  if (cart.length === 0) {
    itemsEl.innerHTML = `
      <div class="cart-empty">
        Your cart is empty.<br>
        Explore our collection and add some pieces!
      </div>`;
    return;
  }

  const subtotal = cart.reduce((sum, p) => sum + p.price, 0);
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total    = subtotal + shipping;

  itemsEl.innerHTML = `
    ${cart.map((p, i) => `
      <div class="cart-item">
        <div class="cart-item-img">
          <img src="${p.img}" alt="${p.name}"
            onerror="this.style.background='#d4b896';this.removeAttribute('src')" />
        </div>
        <div class="cart-item-info">
          <div class="cart-item-name">${p.name}</div>
          <div class="cart-item-price">${inr(p.price)}</div>
        </div>
        <button class="cart-rm" data-index="${i}" aria-label="Remove ${p.name} from cart">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    `).join('')}
    <div class="cart-total-box">
      <div class="cart-total-row"><span>Subtotal</span><span>${inr(subtotal)}</span></div>
      <div class="cart-total-row"><span>Shipping</span><span>${shipping === 0 ? 'Free' : inr(shipping)}</span></div>
      ${shipping === 0
        ? `<div class="free-ship-note">✓ Free shipping applied on orders above ${inr(FREE_SHIPPING_THRESHOLD)}</div>`
        : `<div style="font-size:11px;color:var(--muted);margin-bottom:4px">
             Add ${inr(FREE_SHIPPING_THRESHOLD - subtotal)} more for free shipping
           </div>`}
      <div class="cart-total-row grand"><span>Total</span><span>${inr(total)}</span></div>
    </div>
    <button class="checkout-btn" id="checkout-btn">Proceed to Checkout →</button>
  `;

  itemsEl.querySelectorAll('.cart-rm').forEach(btn => {
    btn.addEventListener('click', () => removeFromCart(parseInt(btn.dataset.index, 10)));
  });

  const checkoutBtn = document.getElementById('checkout-btn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      if (cart.length === 0) return;
      document.getElementById('checkout-modal').classList.add('open');
      document.getElementById('checkout-overlay').classList.add('active');
    });
  }
}

function toggleCart() {
  const panel   = document.getElementById('cart-panel');
  const overlay = document.getElementById('cart-overlay');
  const isOpen  = panel.classList.contains('open');
  panel.classList.toggle('open', !isOpen);
  overlay.classList.toggle('active', !isOpen);
  document.body.style.overflow = isOpen ? '' : 'hidden';
}

function initCart() {
  document.getElementById('cart-toggle-btn').addEventListener('click', toggleCart);
  document.getElementById('cart-close-btn').addEventListener('click', toggleCart);
  document.getElementById('cart-overlay').addEventListener('click', toggleCart);
}

/* ── CHECKOUT ───────────────────────────────── */

function closeCheckout() {
  document.getElementById('checkout-modal').classList.remove('open');
  document.getElementById('checkout-overlay').classList.remove('active');
}

function initCheckout() {
  document.getElementById('checkout-close-btn').addEventListener('click', closeCheckout);
  document.getElementById('checkout-overlay').addEventListener('click', closeCheckout);
  
  const locBtn = document.getElementById('co-location-btn');
  locBtn.addEventListener('click', () => {
    const status = document.getElementById('co-location-status');
    status.textContent = 'Locating...';
    if (!navigator.geolocation) {
      status.textContent = 'Geolocation is not supported by your browser.';
      return;
    }
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      document.getElementById('co-coords').value = `${lat},${lon}`;
      status.textContent = `Location captured (${lat.toFixed(4)}, ${lon.toFixed(4)}). Fetching address...`;
      locBtn.style.background = '#e6f4ea';
      locBtn.style.color = '#137333';
      locBtn.style.borderColor = '#ceead6';
      
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
        const data = await res.json();
        if (data && data.display_name) {
          document.getElementById('co-address').value = data.display_name;
          status.textContent = `Location and address captured successfully.`;
        } else {
          status.textContent = `Location captured, but could not fetch street address.`;
        }
      } catch (e) {
        status.textContent = `Location captured, but could not fetch street address.`;
      }
    }, (err) => {
      status.textContent = 'Unable to retrieve your location. Please check browser permissions.';
    });
  });
  
  document.getElementById('checkout-form').addEventListener('submit', (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    const name = document.getElementById('co-name').value;
    const phone = document.getElementById('co-phone').value;
    const address = document.getElementById('co-address').value;
    const coords = document.getElementById('co-coords').value;
    
    let text = `*New Order - SRS Silk Traders*\n\n`;
    text += `*Customer Details*\nName: ${name}\nPhone: ${phone}\nAddress: ${address}\n`;
    if (coords) {
      text += `GPS Location: https://maps.google.com/?q=${coords}\n`;
    }
    
    text += `\n*Order Items*\n`;
    const subtotal = cart.reduce((sum, p) => sum + p.price, 0);
    const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
    const total = subtotal + shipping;
    
    cart.forEach((p, i) => {
      text += `${i+1}. ${p.name} - ₹${p.price.toLocaleString('en-IN')}\n`;
    });
    
    text += `\nSubtotal: ₹${subtotal.toLocaleString('en-IN')}\n`;
    text += `Shipping: ${shipping === 0 ? 'Free' : '₹' + shipping}\n`;
    text += `*Total: ₹${total.toLocaleString('en-IN')}*`;
    const waUrl = `https://wa.me/919341218059?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
    
    closeCheckout();
    cart = [];
    renderCart();
    const panel = document.getElementById('cart-panel');
    if (panel.classList.contains('open')) toggleCart();
    
    document.getElementById('checkout-form').reset();
    document.getElementById('co-location-status').textContent = '';
    locBtn.style = 'width: 100%; font-size: 13px; padding: 10px; display: flex; align-items: center; justify-content: center; gap: 8px;';
    showToast('Order placed successfully!');
  });
}

/* ─────────────────────────────────────────────
   REVIEWS
───────────────────────────────────────────── */

function renderReviews() {
  document.getElementById('reviews-grid').innerHTML = REVIEWS.map(r => `
    <div class="review-card">
      <div class="review-stars">${'★'.repeat(r.stars)}</div>
      <div class="review-text">"${r.text}"</div>
      <div class="review-author">${r.name} · ${r.loc}</div>
      <div class="review-date">${r.date}</div>
    </div>
  `).join('');
}

/* ─────────────────────────────────────────────
   GALLERY
───────────────────────────────────────────── */

function initHeroSlider() {
  const heroContainer = document.getElementById('banner-carousel');
  if (!heroContainer || GALLERY_IMAGES.length === 0) return;
  
  heroContainer.style.display = 'block';
  heroContainer.innerHTML = '';
  
  const isMobile = window.innerWidth <= 768;
  const itemsPerView = isMobile ? 1 : 2;
  
  const track = document.createElement('div');
  track.style.display = 'flex';
  track.style.width = (GALLERY_IMAGES.length * (100 / itemsPerView)) + '%';
  track.style.transition = 'transform 0.6s ease-in-out';
  
  GALLERY_IMAGES.forEach(b => {
    const slide = document.createElement('div');
    slide.style.width = (100 / GALLERY_IMAGES.length) + '%';
    slide.style.flexShrink = '0';
    slide.style.padding = '15px';
    slide.style.boxSizing = 'border-box';
    slide.innerHTML = `<img src="${b.url}" alt="${b.alt}" style="width: 100%; height: auto; display: block; border-radius: 12px; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">`;
    track.appendChild(slide);
  });
  
  heroContainer.appendChild(track);
  
  let currentIndex = 0;
  const maxIndex = GALLERY_IMAGES.length - itemsPerView;
  
  if (maxIndex > 0) {
    setInterval(() => {
      currentIndex++;
      if (currentIndex > maxIndex) {
        currentIndex = 0;
      }
      track.style.transform = `translateX(-${currentIndex * (100 / GALLERY_IMAGES.length)}%)`;
    }, 4000);
  }
}

function renderGallery() {
  document.getElementById('gallery-grid').innerHTML = PRODUCTS.slice(0, 8).map(p => `
    <div class="g-img" onclick="window.location.href='product.html?id=${p.id}'" style="cursor:pointer;">
      <img
        src="${p.img}"
        alt="${p.name}"
        loading="lazy"
        onerror="this.style.background='#d4b896';this.removeAttribute('src')"
      />
      <div class="g-label">${p.name}</div>
    </div>
  `).join('');
}

/* ─────────────────────────────────────────────
   CONTACT FORM
───────────────────────────────────────────── */

function initCustomFields() {
  const typeSelect  = document.getElementById('cf-type');
  const customFields = document.getElementById('custom-fields');
  typeSelect.addEventListener('change', () => {
    customFields.style.display = typeSelect.value === 'custom_order' ? 'flex' : 'none';
  });
}

function validateForm() {
  let valid = true;
  const rules = [
    { id: 'cf-name',    errId: 'err-name',    test: v => v.trim().length >= 2,                         msg: 'Please enter your full name.' },
    { id: 'cf-phone',   errId: 'err-phone',   test: v => /^[6-9]\d{9}$/.test(v.replace(/\s/g, '')),   msg: 'Please enter a valid 10-digit Indian mobile number.' },
    { id: 'cf-email',   errId: 'err-email',   test: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()), msg: 'Please enter a valid email address.' },
    { id: 'cf-type',    errId: 'err-type',    test: v => v !== '',                                     msg: 'Please select an enquiry type.' },
    { id: 'cf-message', errId: 'err-message', test: v => v.trim().length >= 10,                        msg: 'Please write at least a short message (10+ characters).' },
  ];
  rules.forEach(rule => {
    const field = document.getElementById(rule.id);
    const errEl = document.getElementById(rule.errId);
    const ok    = rule.test(field.value);
    errEl.textContent = ok ? '' : rule.msg;
    field.classList.toggle('error', !ok);
    if (!ok) valid = false;
  });
  return valid;
}

function clearFormErrors() {
  ['cf-name','cf-phone','cf-email','cf-type','cf-message'].forEach(id => {
    document.getElementById(id).classList.remove('error');
  });
  ['err-name','err-phone','err-email','err-type','err-message'].forEach(id => {
    document.getElementById(id).textContent = '';
  });
}

function handleFormSubmit(e) {
  e.preventDefault();
  clearFormErrors();
  if (!validateForm()) return;

  const submitBtn  = document.getElementById('form-submit');
  const submitText = document.getElementById('submit-text');
  const submitIcon = document.getElementById('submit-icon');
  const successEl  = document.getElementById('form-success');

  const name = document.getElementById('cf-name').value;
  const phone = document.getElementById('cf-phone').value;
  const email = document.getElementById('cf-email').value;
  const type = document.getElementById('cf-type').options[document.getElementById('cf-type').selectedIndex].text;
  const product = document.getElementById('cf-product').options[document.getElementById('cf-product').selectedIndex].text;
  const motif = document.getElementById('cf-motif').value;
  const fabric = document.getElementById('cf-fabric').options[document.getElementById('cf-fabric').selectedIndex].text;
  const colors = document.getElementById('cf-colors').value;
  const budget = document.getElementById('cf-budget').options[document.getElementById('cf-budget').selectedIndex].text;
  const message = document.getElementById('cf-message').value;
  const isWhatsapp = document.getElementById('cf-whatsapp').checked;

  let text = `*New Contact / Enquiry (SRS Silk Traders)*\n\n`;
  text += `*Details*\nName: ${name}\nPhone: ${phone}\nEmail: ${email}\nEnquiry Type: ${type}\n`;
  
  if (document.getElementById('cf-product').value) text += `Product Category: ${product}\n`;
  
  if (document.getElementById('cf-type').value === 'custom_order') {
    text += `\n*Customisation Preferences*\n`;
    if (motif) text += `Specific Requirements: ${motif}\n`;
    if (document.getElementById('cf-fabric').value) text += `Fabric: ${fabric}\n`;
    if (colors) text += `Colors: ${colors}\n`;
    if (document.getElementById('cf-budget').value) text += `Budget: ${budget}\n`;
  }
  
  text += `\n*Message*\n${message}\n`;
  if (isWhatsapp) text += `\n_(Customer is happy to be contacted on WhatsApp)_`;

  const waUrl = `https://wa.me/919341218059?text=${encodeURIComponent(text)}`;
  window.open(waUrl, '_blank');
  
  document.getElementById('contact-form').reset();
  document.getElementById('custom-fields').style.display = 'none';
  showToast('Redirecting to WhatsApp...');
  successEl.style.display = 'flex';
}

function initContactForm() {
  initCustomFields();
  document.getElementById('contact-form').addEventListener('submit', handleFormSubmit);
  ['cf-name','cf-phone','cf-email','cf-type','cf-message'].forEach(id => {
    const field = document.getElementById(id);
    field.addEventListener('input', () => {
      field.classList.remove('error');
      const errEl = document.getElementById(id.replace('cf-','err-'));
      if (errEl) errEl.textContent = '';
    });
  });
}

/* ─────────────────────────────────────────────
   NAV HAMBURGER
───────────────────────────────────────────── */

function initNav() {
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('nav-links');
  hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => navLinks.classList.remove('open'));
  });
}

/* ─────────────────────────────────────────────
   FAQ
───────────────────────────────────────────── */

function initFAQ() {
  document.querySelectorAll('.faq-question').forEach(question => {
    question.addEventListener('click', () => {
      const item = question.parentElement;
      const isActive = item.classList.contains('active');
      
      // Close all others
      document.querySelectorAll('.faq-item').forEach(faq => {
        faq.classList.remove('active');
      });
      
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });
}

/* ─────────────────────────────────────────────
   INIT
───────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const pSnap = await db.collection('products').get();
    PRODUCTS = pSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const gSnap = await db.collection('banners').get();
    GALLERY_IMAGES = gSnap.docs.map(doc => doc.data());

    const cSnap = await db.collection('categories').get();
    const dynamicCats = cSnap.docs.map(doc => doc.data());
    const fkContainer = document.getElementById('flipkart-cats');
    const filterGroup = document.getElementById('filters');
    
    if (fkContainer && dynamicCats.length > 0) {
      fkContainer.innerHTML = '';
      let filterHtml = `<span class="filter-label">Filter by:</span><button class="filter-btn active" data-cat="all">All</button>`;
      
      dynamicCats.forEach(cat => {
        // Flipkart style
        fkContainer.innerHTML += `
          <div class="fk-cat" onclick="document.querySelector('.filter-btn[data-cat=\\'${cat.id}\\']').click(); window.scrollTo({top: document.getElementById('collection').offsetTop, behavior: 'smooth'});">
            <img src="${cat.img}" alt="${cat.name}" onerror="this.src='https://via.placeholder.com/70/dddddd/333333?text=Img'">
            <span>${cat.name}</span>
          </div>
        `;
        // Old filter buttons
        filterHtml += `<button class="filter-btn" data-cat="${cat.id}">${cat.name}</button>`;
      });
      
      if (filterGroup) filterGroup.innerHTML = filterHtml;
    }
  } catch (err) {
    console.error("Firebase fetch error:", err);
  }

  renderProducts('all');
  renderReviews();
  renderGallery();
  initHeroSlider();
  renderCart();
  initFilters();
  initCart();
  initCheckout();
  initContactForm();
  initFAQ();
  initNav();
});



function openProductModal(id) {
  const p = PRODUCTS.find(prod => prod.id === id);
  if (!p) return;
  
  const modal = document.getElementById('product-modal');
  document.getElementById('pm-name').textContent = p.name;
  document.getElementById('pm-price').textContent = '₹' + p.price;
  document.getElementById('pm-orig').textContent = p.orig ? '₹' + p.orig : '';
  document.getElementById('pm-desc').textContent = p.desc || 'No description available.';
  
  const mainImg = document.getElementById('pm-main-img');
  mainImg.src = p.imgUrls && p.imgUrls.length > 0 ? p.imgUrls[0] : p.img;
  
  const thumbs = document.getElementById('pm-thumbnails');
  thumbs.innerHTML = '';
  if (p.imgUrls && p.imgUrls.length > 1) {
    p.imgUrls.forEach(url => {
      thumbs.innerHTML += `<img src="${url}" style="width: 60px; height: 60px; object-fit: cover; cursor: pointer; border: 2px solid transparent; border-radius: 4px;" onclick="document.getElementById('pm-main-img').src=this.src; this.parentNode.querySelectorAll('img').forEach(i=>i.style.borderColor='transparent'); this.style.borderColor='#d4b896';">`;
    });
  }

  const btnCart = document.getElementById('pm-btn-cart');
  btnCart.onclick = () => { addToCart(p.id); closeProductModal(); };
  
  const btnWa = document.getElementById('pm-btn-wa');
  btnWa.onclick = () => { window.open('https://wa.me/919999999999?text=I am interested in ' + p.name + ' (' + p.id + ')', '_blank'); };

  // Related products
  const related = PRODUCTS.filter(prod => prod.cat === p.cat && prod.id !== p.id).slice(0, 4);
  const relatedGrid = document.getElementById('pm-related-grid');
  if (related.length > 0) {
    relatedGrid.innerHTML = related.map(rp => `
      <div class="card" onclick="openProductModal('${rp.id}')">
        <div class="card-img"><img src="${rp.imgUrls ? rp.imgUrls[0] : rp.img}"></div>
        <div class="card-info">
          <h3>${rp.name}</h3>
          <div class="price">₹${rp.price}</div>
        </div>
      </div>
    `).join('');
  } else {
    relatedGrid.innerHTML = '<p style="color:#999;">No related products found.</p>';
  }

  modal.classList.add('open');
}

function closeProductModal() {
  document.getElementById('product-modal').classList.remove('open');
}













