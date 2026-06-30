const firebaseConfig = {
  apiKey: "AIzaSyAv8WZPd7k6oGAsGX10NPAOp6iuqU3QE1w",
  authDomain: "experime-3251a.firebaseapp.com",
  projectId: "experime-3251a",
  storageBucket: "experime-3251a.firebasestorage.app",
  messagingSenderId: "256324869428",
  appId: "1:256324869428:web:02a6392b90e77b2f805961"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();

// UI Elements
const statusMsg = document.getElementById('status-msg');

function showStatus(msg) {
  statusMsg.textContent = msg;
  statusMsg.style.display = 'block';
  setTimeout(() => statusMsg.style.display = 'none', 3000);
}

// Tab Switching
document.querySelectorAll('.admin-sidebar nav a').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelectorAll('.admin-sidebar nav a').forEach(a => a.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
    
    link.classList.add('active');
    document.getElementById(`tab-${link.dataset.tab}`).classList.add('active');
  });
});

// ========================
// CATEGORIES MANAGEMENT
// ========================
const catForm = document.getElementById('cat-form');
const catsList = document.getElementById('cats-list');
const pCatSelect = document.getElementById('p-cat');

function loadCategories() {
  db.collection('categories').onSnapshot(snapshot => {
    catsList.innerHTML = '';
    pCatSelect.innerHTML = '<option value="">Select Category...</option>';
    
    snapshot.forEach(doc => {
      const cat = doc.data();
      catsList.innerHTML += `
        <div class="item-card">
          <img src="${cat.img}" alt="${cat.name}" style="border-radius:50%; width:60px; height:60px; object-fit:cover; margin:0 auto 10px auto;">
          <strong>${cat.name}</strong>
          <span>ID: ${cat.id}</span>
          <div style="margin-top: 10px; display: flex; gap: 5px; flex-wrap: wrap;">
            <button onclick="editCat('${doc.id}')" style="background: #2196F3;">Edit</button>
            <button onclick="deleteCat('${doc.id}')">Delete</button>
          </div>
        </div>
      `;
      pCatSelect.innerHTML += `<option value="${cat.id}">${cat.name}</option>`;
    });
  });
}

// Image Compression Helper
function compressImage(file, maxWidth = 800) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = event => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7)); // Compress to 70% JPEG to save space
      };
      img.onerror = error => reject(error);
    };
    reader.onerror = error => reject(error);
  });
}

const btnAddCat = document.getElementById('btn-add-cat');

catForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const idInput = document.getElementById('c-id');
  const id = idInput.value.toLowerCase().replace(/\s+/g, '_');
  const name = document.getElementById('c-name').value;
  const fileInput = document.getElementById('c-img');
  const file = fileInput.files[0];
  
  if (!window.editingCatId && !file) {
    alert("Please select an image.");
    return;
  }

  btnAddCat.disabled = true;
  btnAddCat.textContent = window.editingCatId ? "Updating..." : "Uploading...";

  try {
    let updateData = { id, name };
    
    if (file) {
      const base64Img = await compressImage(file, 400); // Small size for category circles
      updateData.img = base64Img;
    }
    
    // Always use the ID field value as the document ID for categories to keep it clean
    await db.collection('categories').doc(id).set(updateData, { merge: true });
    
    // If the ID changed during edit, delete the old document
    if (window.editingCatId && window.editingCatId !== id) {
      await db.collection('categories').doc(window.editingCatId).delete();
    }
    
    catForm.reset();
    idInput.readOnly = false;
    window.editingCatId = null;
    btnAddCat.textContent = "Add Category";
    showStatus('Category Saved!');
  } catch (error) {
    console.error(error);
    alert('Error saving category!');
    btnAddCat.textContent = window.editingCatId ? "Update Category" : "Add Category";
  }

  btnAddCat.disabled = false;
});

window.editCat = async (id) => {
  const doc = await db.collection('categories').doc(id).get();
  if(!doc.exists) return;
  const cat = doc.data();
  
  document.getElementById('c-id').value = cat.id;
  document.getElementById('c-name').value = cat.name;
  document.getElementById('c-img').value = '';
  // Removing required attribute temporarily for editing since image is optional on edit
  document.getElementById('c-img').removeAttribute('required'); 
  
  window.editingCatId = id;
  document.getElementById('btn-add-cat').textContent = "Update Category";
  window.scrollTo(0,0);
};

window.deleteCat = async (id) => {
  if(confirm('Are you sure you want to delete this category?')) {
    await db.collection('categories').doc(id).delete();
  }
};

// ========================
// PRODUCTS MANAGEMENT
// ========================
const productForm = document.getElementById('product-form');
const productsList = document.getElementById('products-list');
const btnAddProduct = document.getElementById('btn-add-product');

function loadProducts() {
  db.collection('products').onSnapshot(snapshot => {
    productsList.innerHTML = '';
    snapshot.forEach(doc => {
      const p = doc.data();
      productsList.innerHTML += `
        <div class="item-card">
          <img src="${p.img}" alt="${p.name}">
          <strong>${p.name}</strong>
          <span>₹${p.price} <strike>₹${p.orig}</strike></span>
          <span>Cat: ${p.cat}</span>
          <div style="margin-top: 10px; display: flex; gap: 5px; flex-wrap: wrap;">
            <button onclick="toggleStock('${doc.id}', ${p.inStock})" style="background: ${p.inStock ? '#4CAF50' : '#ff9800'};">${p.inStock ? 'In Stock' : 'Out of Stock'}</button>
            <button onclick="editProduct('${doc.id}')" style="background: #2196F3;">Edit</button>
            <button onclick="deleteProduct('${doc.id}')">Delete</button>
          </div>
        </div>
      `;
    });
  });
}

let productFiles = [];
const pImgInput = document.getElementById('p-img');
const previewContainer = document.getElementById('image-preview-container');

pImgInput.addEventListener('change', (e) => {
  const files = Array.from(e.target.files);
  files.forEach(file => {
    productFiles.push(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const div = document.createElement('div');
      div.style.position = 'relative';
      div.innerHTML = `
        <img src="${e.target.result}" style="width:80px;height:80px;object-fit:cover;border-radius:4px;">
        <button type="button" style="position:absolute;top:-5px;right:-5px;background:red;color:white;border-radius:50%;border:none;width:20px;height:20px;font-size:12px;cursor:pointer;padding:0;line-height:20px;text-align:center;" onclick="removeProductImage(this, '${file.name}')">X</button>
      `;
      previewContainer.appendChild(div);
    };
    reader.readAsDataURL(file);
  });
  // Clear input so same file can be selected again if removed
  pImgInput.value = '';
});

window.removeProductImage = (btn, fileName) => {
  productFiles = productFiles.filter(f => f.name !== fileName);
  btn.parentElement.remove();
};

productForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  if (!window.editingProductId && productFiles.length === 0) {
    alert("Please select at least one image.");
    return;
  }

  btnAddProduct.disabled = true;
  btnAddProduct.textContent = window.editingProductId ? "Updating..." : "Uploading...";

  const name = document.getElementById('p-name').value;
  const price = Number(document.getElementById('p-price').value);
  const orig = Number(document.getElementById('p-orig').value);
  const cat = document.getElementById('p-cat').value;
  const desc = document.getElementById('p-desc').value;
  const tagsStr = document.getElementById('p-tags').value;
  const tags = tagsStr.split(',').map(t => t.trim()).filter(t => t);
  const metaTitle = document.getElementById('p-meta-title').value;
  const metaDesc = document.getElementById('p-meta-desc').value;

  try {
    let updateData = { name, price, orig, cat, desc, tags, metaTitle, metaDesc };

    if (productFiles.length > 0) {
      let uploadedUrls = [];
      for (let file of productFiles) {
        const base64Img = await compressImage(file, 800);
        uploadedUrls.push(base64Img);
      }
      updateData.img = uploadedUrls[0];
      updateData.imgUrls = uploadedUrls;
    }

    if (window.editingProductId) {
      await db.collection('products').doc(window.editingProductId).update(updateData);
      window.editingProductId = null;
      showStatus('Product Updated Successfully!');
    } else {
      updateData.inStock = true;
      updateData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
      await db.collection('products').add(updateData);
      showStatus('Product Added Successfully!');
    }

    productForm.reset();
    productFiles = [];
    previewContainer.innerHTML = '';
  } catch (error) {
    console.error(error);
    alert('Error saving product!');
  }

  btnAddProduct.disabled = false;
  btnAddProduct.textContent = "Add Product";
});

window.toggleStock = async (id, currentStock) => {
  await db.collection('products').doc(id).update({
    inStock: !currentStock
  });
};

window.editProduct = async (id) => {
  const doc = await db.collection('products').doc(id).get();
  if(!doc.exists) return;
  const p = doc.data();
  
  document.getElementById('p-name').value = p.name;
  document.getElementById('p-price').value = p.price;
  document.getElementById('p-orig').value = p.orig || '';
  document.getElementById('p-cat').value = p.cat;
  document.getElementById('p-desc').value = p.desc || '';
  document.getElementById('p-tags').value = p.tags ? p.tags.join(', ') : '';
  
  // We can't easily populate file inputs due to browser security, so we clear them.
  productFiles = [];
  document.getElementById('image-preview-container').innerHTML = '';
  document.getElementById('p-img').value = '';
  
  window.editingProductId = id;
  document.getElementById('btn-add-product').textContent = "Update Product";
  
  window.scrollTo(0,0);
};

window.deleteProduct = async (id) => {
  if(confirm('Are you sure you want to delete this product?')) {
    await db.collection('products').doc(id).delete();
  }
};

// ========================
// BANNERS MANAGEMENT
// ========================
const bannerForm = document.getElementById('banner-form');
const bannersList = document.getElementById('banners-list');
const btnAddBanner = document.getElementById('btn-add-banner');

function loadBanners() {
  db.collection('banners').onSnapshot(snapshot => {
    bannersList.innerHTML = '';
    snapshot.forEach(doc => {
      const b = doc.data();
      bannersList.innerHTML += `
        <div class="item-card">
          <img src="${b.url}" alt="${b.alt}">
          <strong>${b.label}</strong>
          <div style="margin-top: 10px; display: flex; gap: 5px; flex-wrap: wrap;">
            <button onclick="editBanner('${doc.id}')" style="background: #2196F3;">Edit</button>
            <button onclick="deleteBanner('${doc.id}')">Delete</button>
          </div>
        </div>
      `;
    });
  });
}

bannerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const fileInput = document.getElementById('b-img');
  const file = fileInput.files[0];
  
  if (!window.editingBannerId && !file) {
    alert("Please select an image.");
    return;
  }

  btnAddBanner.disabled = true;
  btnAddBanner.textContent = window.editingBannerId ? "Updating..." : "Uploading...";

  const label = document.getElementById('b-label').value;
  const alt = document.getElementById('b-alt').value;

  try {
    let updateData = { label, alt };
    
    if (file) {
      const base64Img = await compressImage(file, 1200);
      updateData.url = base64Img;
    }

    if (window.editingBannerId) {
      await db.collection('banners').doc(window.editingBannerId).update(updateData);
      window.editingBannerId = null;
      showStatus('Banner Updated!');
    } else {
      updateData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
      await db.collection('banners').add(updateData);
      showStatus('Banner Added!');
    }

    bannerForm.reset();
    document.getElementById('b-img').setAttribute('required', 'required');
  } catch (error) {
    console.error(error);
    alert('Error saving banner!');
  }

  btnAddBanner.disabled = false;
  btnAddBanner.textContent = "Add Banner";
});

window.editBanner = async (id) => {
  const doc = await db.collection('banners').doc(id).get();
  if(!doc.exists) return;
  const b = doc.data();
  
  document.getElementById('b-label').value = b.label;
  document.getElementById('b-alt').value = b.alt;
  document.getElementById('b-img').value = '';
  // Image is optional when editing
  document.getElementById('b-img').removeAttribute('required');
  
  window.editingBannerId = id;
  document.getElementById('btn-add-banner').textContent = "Update Banner";
  window.scrollTo(0,0);
};

window.deleteBanner = async (id) => {
  if(confirm('Are you sure you want to delete this banner?')) {
    await db.collection('banners').doc(id).delete();
  }
};

// Initialize Admin Data
function initAdmin() {
  loadCategories();
  loadProducts();
  loadBanners();
}

window.checkPin = () => {
  const pin = document.getElementById('admin-pin').value;
  if (pin === '8059' || pin === '1234') { // Using parts of their phone number as default PIN
    document.getElementById('login-overlay').style.display = 'none';
    document.getElementById('main-admin-content').style.display = 'flex';
    initAdmin();
  } else {
    document.getElementById('pin-error').style.display = 'block';
  }
};




