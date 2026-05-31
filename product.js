const firebaseConfig = {
  apiKey: "AIzaSyAv8WZPd7k6oGAsGX10NPAOp6iuqU3QE1w",
  authDomain: "experime-3251a.firebaseapp.com",
  projectId: "experime-3251a",
  storageBucket: "experime-3251a.firebasestorage.app",
  messagingSenderId: "256324869428",
  appId: "1:256324869428:web:02a6392b90e77b2f805961"
};

// ========================
// CART & TOAST FUNCTIONALITY
// ========================
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('srs_cart') || '[]');
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  const countSpan = document.getElementById('cart-count');
  if (countSpan) {
    countSpan.textContent = count;
    countSpan.style.display = count > 0 ? 'flex' : 'none';
  }
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

function renderCart() {
  const cart = JSON.parse(localStorage.getItem('srs_cart') || '[]');
  const cartItems = document.getElementById('cart-items');
  if (!cartItems) return;
  
  if (cart.length === 0) {
    cartItems.innerHTML = `
      <div class="cart-empty" style="padding: 40px 20px; text-align: center; color: #666;">
        Your cart is empty.<br>
        <button onclick="window.location.href='index.html#collection'" style="margin-top:20px; padding:10px 20px; background:#d4b896; border:none; color:#fff; border-radius:6px; cursor:pointer;">Continue Shopping</button>
      </div>`;
    return;
  }

  let subtotal = 0;
  cartItems.innerHTML = cart.map((item, index) => {
    subtotal += item.price * (item.qty || 1);
    return `
      <div class="cart-item">
        <div class="cart-item-img">
          <img src="${item.img}" alt="${item.name}" onerror="this.style.background='#d4b896';this.removeAttribute('src')" />
        </div>
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name} ${item.qty > 1 ? `(x${item.qty})` : ''}</div>
          <div class="cart-item-price">₹${item.price.toLocaleString('en-IN')}</div>
        </div>
        <button class="cart-rm" onclick="removeFromCart(${index})" aria-label="Remove item">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    `;
  }).join('');

  const shipping = subtotal >= 5000 ? 0 : 150; // Example flat shipping rate
  const total = subtotal + shipping;
  
  cartItems.innerHTML += `
    <div class="cart-total-box">
      <div class="cart-total-row" style="display:flex; justify-content:space-between; margin-bottom:8px;">
        <span>Subtotal</span>
        <span>₹${subtotal.toLocaleString('en-IN')}</span>
      </div>
      <div class="cart-total-row" style="display:flex; justify-content:space-between; margin-bottom:8px;">
        <span>Shipping</span>
        <span>${shipping === 0 ? 'Free' : '₹' + shipping}</span>
      </div>
      ${shipping === 0 ? '<div style="color:#2ecc71; font-size:12px; margin-bottom:10px; text-align:right;">✓ Free shipping applied on orders above ₹5,000</div>' : ''}
      <div class="cart-total-row total-row" style="display:flex; justify-content:space-between; font-weight:bold; font-size:18px; margin-top:10px; padding-top:10px; border-top:1px solid #ccc;">
        <span>Total</span>
        <span>₹${total.toLocaleString('en-IN')}</span>
      </div>
    </div>
    <button class="btn-primary" style="width:100%; margin-top:15px; padding: 14px; background: #8b4513; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;" onclick="window.location.href='index.html#checkout'">Proceed to Checkout →</button>
  `;
}

window.updateQty = (index, change) => {
  let cart = JSON.parse(localStorage.getItem('srs_cart') || '[]');
  if (cart[index].qty + change > 0) {
    cart[index].qty += change;
    localStorage.setItem('srs_cart', JSON.stringify(cart));
    updateCartCount();
    renderCart();
  }
};

window.removeFromCart = (index) => {
  let cart = JSON.parse(localStorage.getItem('srs_cart') || '[]');
  const itemName = cart[index].name;
  cart.splice(index, 1);
  localStorage.setItem('srs_cart', JSON.stringify(cart));
  updateCartCount();
  renderCart();
  showToast(itemName + " removed");
};

document.addEventListener('DOMContentLoaded', () => {
  updateCartCount();
  renderCart();

  const cartPanel = document.getElementById('cart-panel');
  const cartOverlay = document.getElementById('cart-overlay');
  
  document.getElementById('nav-cart-btn')?.addEventListener('click', () => {
    cartPanel.classList.add('open');
    cartOverlay.classList.add('open');
  });
  
  document.getElementById('cart-close-btn')?.addEventListener('click', () => {
    cartPanel.classList.remove('open');
    cartOverlay.classList.remove('open');
  });
  
  cartOverlay?.addEventListener('click', () => {
    cartPanel.classList.remove('open');
    cartOverlay.classList.remove('open');
  });
});

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');

  const loading = document.getElementById('product-loading');
  const errorNode = document.getElementById('product-error');
  const container = document.getElementById('product-container');

  if (!productId) {
    loading.style.display = 'none';
    errorNode.style.display = 'block';
    return;
  }

  try {
    const doc = await db.collection('products').doc(productId).get();
    if (!doc.exists) {
      loading.style.display = 'none';
      errorNode.style.display = 'block';
      return;
    }

    const p = doc.data();
    p.id = doc.id; // Store ID

    // Setup UI
    document.title = p.name + " - SRS Silk Traders";
    
    document.getElementById('main-img').src = p.img;
    document.getElementById('p-title').textContent = p.name;
    document.getElementById('p-price').textContent = "₹" + p.price;
    if (p.orig) {
      document.getElementById('p-orig').textContent = "₹" + p.orig;
    }
    document.getElementById('p-desc').textContent = p.desc || '';

    // Thumbnails (if any)
    const thumbContainer = document.getElementById('thumbnails');
    let allImages = [p.img];
    if (p.imgUrls && p.imgUrls.length > 0) {
      allImages = p.imgUrls;
    }
    
    thumbContainer.innerHTML = '';
    allImages.forEach(url => {
      const img = document.createElement('img');
      img.src = url;
      img.onclick = () => { document.getElementById('main-img').src = url; };
      thumbContainer.appendChild(img);
    });

    // Buttons
    const btnAddCart = document.getElementById('btn-add-cart');
    const btnWa = document.getElementById('btn-wa');
    const btnShare = document.getElementById('btn-share');

    if (p.inStock) {
      btnAddCart.onclick = () => {
        let cart = JSON.parse(localStorage.getItem('srs_cart') || '[]');
        const existing = cart.find(i => i.id === p.id);
        if (existing) {
          existing.qty++;
        } else {
          cart.push({ id: p.id, name: p.name, price: p.price, img: p.img, qty: 1 });
        }
        localStorage.setItem('srs_cart', JSON.stringify(cart));
        updateCartCount();
        renderCart();
        showToast(p.name + " added to cart 🛍️");
        document.getElementById('cart-panel').classList.add('open');
        document.getElementById('cart-overlay').classList.add('open');
      };
      
      btnWa.onclick = () => {
        const text = `Hi SRS Silk Traders, I am interested in this product:\n\n*` + p.name + `*\nPrice: ?` + p.price + `\nLink: ` + window.location.href;
        window.open('https://wa.me/919341218059?text=' + encodeURIComponent(text), '_blank');
      };
    } else {
      btnAddCart.textContent = "Sold Out";
      btnAddCart.style.background = "#ccc";
      btnAddCart.disabled = true;
      btnWa.textContent = "Notify me when back in stock (WhatsApp)";
      btnWa.onclick = () => {
        const text = `Hi SRS Silk Traders, please notify me when this product is back in stock:\n\n*` + p.name + `*\nLink: ` + window.location.href;
        window.open('https://wa.me/919341218059?text=' + encodeURIComponent(text), '_blank');
      };
    }

    if (navigator.share) {
      btnShare.onclick = () => {
        navigator.share({
          title: p.name,
          text: 'Check out ' + p.name + ' at SRS Silk Traders!',
          url: window.location.href
        }).catch(console.error);
      };
    } else {
      btnShare.onclick = () => {
        navigator.clipboard.writeText(window.location.href);
        alert('Product link copied to clipboard!');
      };
    }

    // Related Products
    loadRelatedProducts(p.cat, p.id);

    // Show container
    loading.style.display = 'none';
    container.style.display = 'flex';

  } catch (err) {
    console.error(err);
    loading.style.display = 'none';
    errorNode.style.display = 'block';
    errorNode.textContent = 'Error loading product details.';
  }
});

async function loadRelatedProducts(category, currentId) {
  try {
    const snap = await db.collection('products').where('cat', '==', category).limit(5).get();
    let related = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    related = related.filter(r => r.id !== currentId); // exclude current

    if (related.length > 0) {
      document.getElementById('related-container').style.display = 'block';
      const grid = document.getElementById('related-grid');
      grid.innerHTML = related.map(p => `
        <div class="product-card" onclick="window.location.href='product.html?id=${p.id}'" style="cursor:pointer; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
          <div class="product-img-wrap" style="position:relative;">
            <img src="${p.img}" alt="${p.name}" style="width: 100%; height: 250px; object-fit: cover;">
            ${!p.inStock ? '<div style="position:absolute; top:0; left:0; right:0; bottom:0; background:rgba(255,255,255,0.7); display:flex; align-items:center; justify-content:center; font-weight:bold; color:red;">Out of Stock</div>' : ''}
          </div>
          <div class="product-info" style="padding: 15px;">
            <div class="product-title" style="font-weight:600; margin-bottom:5px;">${p.name}</div>
            <div class="product-price" style="color:#d4b896; font-weight:bold;">₹${p.price} <strike style="color:#999; font-size:12px; margin-left:5px;">₹${p.orig}</strike></div>
          </div>
        </div>
      `).join('');
    }
  } catch (err) {
    console.error("Error loading related products", err);
  }
}



