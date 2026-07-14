import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import CustomerAuthModal from '../components/CustomerAuthModal';
import confetti from 'canvas-confetti';

const CategoryPage = () => {
  const { categoryId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Support two modes: single category (/category/:categoryId) or combined (/category?ids=a,b,c)
  const idsParam = searchParams.get('ids');
  const multiCatIds = idsParam ? idsParam.split(',').filter(Boolean) : [];
  const isMultiMode = multiCatIds.length > 0;
  const [allCategories, setAllCategories] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('srs_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [savingsBlast, setSavingsBlast] = useState(null);
  const [activeSubCat, setActiveSubCat] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [customer, setCustomer] = useState(null);
  const [pendingProduct, setPendingProduct] = useState(null);
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('srs_customer');
    if (saved) {
      try { setCustomer(JSON.parse(saved)); } catch(e){}
    }

    setIsLoading(true);
    const base = `http://${window.location.hostname}:5000`;
    Promise.all([
      axios.get(`${base}/api/categories`),
      axios.get(`${base}/api/products`)
    ]).then(([catRes, prodRes]) => {
      setAllCategories(catRes.data);
      setAllProducts(prodRes.data);
    }).catch(console.error).finally(() => setIsLoading(false));

    if (saved) {
      const token = localStorage.getItem('srs_customer_token');
      axios.get(`${base}/api/customer/wishlist`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => setWishlist(res.data.map(p => p._id)))
        .catch(err => console.error(err));
    }
  }, []);

  useEffect(() => {
    setActiveSubCat('all'); // reset sub-filter when category changes
  }, [categoryId, idsParam]);

  const handleToggleWishlist = async (product) => {
    if (!customer) {
      setShowAuthModal(true);
      return;
    }
    try {
      const token = localStorage.getItem('srs_customer_token');
      const base = `http://${window.location.hostname}:5000`;
      const res = await axios.post(`${base}/api/customer/wishlist/toggle`, { productId: product._id }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWishlist(res.data.map(p => p._id));
    } catch (err) {
      console.error("Error toggling wishlist", err);
    }
  };

  // All parent cats for the sticky bar
  const featuredParents = allCategories.filter(c => c.showInHeader && !c.parentId);

  // Current category (single mode only)
  const currentCat = allCategories.find(c => c.id === categoryId);

  // Determine if current is a parent → get its children (single mode only)
  const isParent = currentCat && !currentCat.parentId;
  const childCats = isParent ? allCategories.filter(c => c.parentId === categoryId) : [];

  // Collect all category IDs to filter products by
  let relevantCatIds = [];
  if (isMultiMode) {
    // Combined mode: expand each selected ID — if it's a parent, include its children too
    relevantCatIds = multiCatIds.reduce((acc, id) => {
      const cat = allCategories.find(c => c.id === id);
      const isP = cat && !cat.parentId;
      const expanded = isP
        ? [id, ...allCategories.filter(c => c.parentId === id).map(c => c.id)]
        : [id];
      return [...acc, ...expanded];
    }, []);
  } else {
    relevantCatIds = isParent
      ? [categoryId, ...allCategories.filter(c => c.parentId === categoryId).map(c => c.id)]
      : [categoryId];
  }

  // Filter products: match cat or any entry in categories[]
  let filteredProducts = allProducts.filter(p => {
    const inCat = relevantCatIds.includes(p.cat) || (p.categories || []).some(c => relevantCatIds.includes(c));
    return inCat;
  });

  // Further filter by selected sub-category (single mode only — combined mode has no sub-chips)
  if (!isMultiMode && activeSubCat !== 'all') {
    filteredProducts = filteredProducts.filter(p =>
      p.cat === activeSubCat || (p.categories || []).includes(activeSubCat)
    );
  }

  // Page title / breadcrumb label for combined mode
  const multiCatNames = isMultiMode
    ? multiCatIds.map(id => allCategories.find(c => c.id === id)?.name).filter(Boolean)
    : [];
  const pageTitle = isMultiMode
    ? (multiCatNames.length > 0 ? multiCatNames.join(' + ') : 'Selected Collection')
    : (currentCat?.name || categoryId);

  const formatPrice = (price) => '₹' + Number(price).toLocaleString('en-IN');
  const getSavings = (price, orig) => orig ? Math.round(((orig - price) / orig) * 100) + '% off' : '';

  const renderSkeleton = () => (
    <div className="products-grid" style={{ padding: '0 0 48px' }}>
      {[...Array(8)].map((_, i) => (
        <div className="card" key={i} style={{ animation: 'pulse 1.5s infinite' }}>
          <div className="card-img" style={{ backgroundColor: '#e2e8f0' }}></div>
          <div className="card-body">
            <div style={{ height: '14px', width: '40%', backgroundColor: '#e2e8f0', marginBottom: '8px', borderRadius: '4px' }}></div>
            <div style={{ height: '18px', width: '80%', backgroundColor: '#e2e8f0', marginBottom: '12px', borderRadius: '4px' }}></div>
            <div style={{ height: '14px', width: '100%', backgroundColor: '#e2e8f0', marginBottom: '4px', borderRadius: '4px' }}></div>
            <div style={{ height: '14px', width: '90%', backgroundColor: '#e2e8f0', marginBottom: '16px', borderRadius: '4px' }}></div>
            <div className="card-row">
              <div style={{ height: '24px', width: '40%', backgroundColor: '#e2e8f0', borderRadius: '4px' }}></div>
              <div style={{ height: '36px', width: '100px', backgroundColor: '#e2e8f0', borderRadius: '20px' }}></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <>
      <Navbar cartCount={cart.length} onCartClick={() => {}} />

      {/* Sticky Category Bar */}
      {featuredParents.length > 0 && (
        <div className="featured-categories-bar">
          <div className="featured-categories-container">
            {featuredParents.map(cat => (
              <div
                key={cat._id}
                className={`featured-category-item ${!isMultiMode && cat.id === categoryId ? 'active-cat' : ''}`}
                onClick={() => navigate(`/category/${cat.id}`)}
              >
                <img src={cat.img} alt={cat.name} />
                <span>{cat.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="category-page-wrapper">
        {/* Breadcrumb */}
        <div className="cat-breadcrumb">
          <span onClick={() => navigate('/')} style={{ cursor: 'pointer', color: 'var(--rust)' }}>Home</span>
          <span> / </span>
          <span style={{ color: 'var(--muted)' }}>{pageTitle}</span>
        </div>

        {/* Page title */}
        <div className="cat-page-header">
          <h1>{pageTitle}</h1>
          <p>{filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found</p>
        </div>

        {/* Sub-category filter chips (only shown in single-category mode, if parent has children) */}
        {!isMultiMode && childCats.length > 0 && (
          <div className="sub-cat-chips">
            <button
              className={`sub-cat-chip ${activeSubCat === 'all' ? 'active' : ''}`}
              onClick={() => setActiveSubCat('all')}
            >
              All {currentCat?.name}
            </button>
            {childCats.map(child => (
              <button
                key={child.id}
                className={`sub-cat-chip ${activeSubCat === child.id ? 'active' : ''}`}
                onClick={() => setActiveSubCat(child.id)}
              >
                {child.name}
              </button>
            ))}
          </div>
        )}

        {/* Products Grid */}
        {isLoading ? (
          renderSkeleton()
        ) : filteredProducts.length === 0 ? (
          <div className="cat-empty">
            <div style={{ fontSize: '48px' }}>🧵</div>
            <h3>No products in this category yet</h3>
            <p>Check back soon or explore other categories</p>
            <button className="btn-primary" onClick={() => navigate('/')}>Back to Home</button>
          </div>
        ) : (
          <div className="products-grid" style={{ padding: '0 0 48px' }}>
            {filteredProducts.map(p => (
              <div className="card" key={p._id}>
                <div className="card-img" onClick={() => navigate(`/product/${p._id}`)} style={{ cursor: 'pointer', position: 'relative' }}>
                  <img src={p.imgUrls && p.imgUrls.length > 0 ? p.imgUrls[0] : p.img} alt={p.name} />
                  
                  {/* Wishlist Button */}
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleToggleWishlist(p); }}
                    style={{ 
                      position: 'absolute', top: '10px', right: '10px', 
                      background: 'white', border: 'none', width: '32px', height: '32px', borderRadius: '50%', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', 
                      boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                      color: wishlist.includes(p._id) ? '#ef4444' : '#94a3b8'
                    }}
                  >
                    <i className={wishlist.includes(p._id) ? "fa-solid fa-heart" : "fa-regular fa-heart"}></i>
                  </button>

                  {!p.inStock && (
                    <div className="out-stock-overlay">
                      <div className="out-stock-label">Out of Stock</div>
                    </div>
                  )}
                </div>
                <div className="card-body">
                  <div className="card-cat">{p.cat}</div>
                  <div 
                    className="card-name"
                    onClick={() => navigate(`/product/${p._id}`)}
                    style={{ cursor: 'pointer' }}
                  >{p.name}</div>
                  <div className="card-desc">{p.desc}</div>
                  <div className="card-row">
                    <div>
                      <span className="price">{formatPrice(p.price)}</span>
                      {p.orig && <span className="price-old">{formatPrice(p.orig)}</span>}
                      {p.orig && <span className="savings-pill">{getSavings(p.price, p.orig)}</span>}
                    </div>
                  <button 
                    className="add-btn" 
                    disabled={!p.inStock} 
                    onClick={() => {
                      if (!customer) {
                        setPendingProduct(p);
                        setShowAuthModal(true);
                        return;
                      }
                      const lightP = { _id: p._id, name: p.name, price: p.price, orig: p.orig, cat: p.cat, img: p.imgUrls && p.imgUrls.length > 0 ? p.imgUrls[0] : p.img };
                      const newCart = [...cart, lightP];
                      setCart(newCart);
                      localStorage.setItem('srs_cart', JSON.stringify(newCart));
                      const savings = p.orig ? p.orig - p.price : 0;
                      setSavingsBlast({ show: true, savings });
                      
                      // Trigger Splash Blast Confetti
                      confetti({
                        particleCount: 100,
                        spread: 70,
                        origin: { y: 0.6 },
                        colors: ['#10b981', '#fbbf24', '#f43f5e', '#3b82f6'],
                        zIndex: 100000
                      });
                    }}
                  >
                    {p.inStock ? 'Add to cart' : 'Sold out'}
                  </button>
                </div>
                  <div className="card-tags">
                    {p.tags?.map((t, i) => <span key={i} className="card-tag">{t}</span>)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAuthModal && (
        <CustomerAuthModal 
          onClose={() => {
            setShowAuthModal(false);
            setPendingProduct(null);
          }}
          onSuccess={(user) => {
            setCustomer(user);
            setShowAuthModal(false);
            if (pendingProduct) {
              const lightP = { _id: pendingProduct._id, name: pendingProduct.name, price: pendingProduct.price, orig: pendingProduct.orig, cat: pendingProduct.cat, img: pendingProduct.imgUrls && pendingProduct.imgUrls.length > 0 ? pendingProduct.imgUrls[0] : pendingProduct.img };
              const newCart = [...cart, lightP];
              setCart(newCart);
              localStorage.setItem('srs_cart', JSON.stringify(newCart));
              setPendingProduct(null);
              const savings = pendingProduct.orig ? pendingProduct.orig - pendingProduct.price : 0;
              setSavingsBlast({ show: true, savings });
              
              // Trigger Splash Blast Confetti
              confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#10b981', '#fbbf24', '#f43f5e', '#3b82f6'],
                zIndex: 100000
              });
            }
          }}
        />
      )}

      {/* Savings Blast Popup */}
      {savingsBlast && (
        <div className="savings-blast-overlay" style={{ zIndex: 99999 }}>
          <div className="savings-blast-card">
            <div style={{ background: '#ecfdf5', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <i className="fa-solid fa-tags" style={{ fontSize: '24px', color: '#10b981' }}></i>
            </div>
            <h2 style={{ fontSize: '24px', color: 'var(--ink)', marginBottom: '8px' }}>Added to Cart!</h2>
            {savingsBlast.savings > 0 ? (
              <p style={{ fontSize: '18px', color: '#047857', fontWeight: 'bold' }}>
                Awesome! You saved {formatPrice(savingsBlast.savings)}!
              </p>
            ) : (
              <p style={{ fontSize: '16px', color: '#64748b' }}>Item successfully added to your cart.</p>
            )}
            <button 
              onClick={() => navigate('/cart')}
              style={{ width: '100%', padding: '12px', background: 'var(--rust)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', marginTop: '20px', cursor: 'pointer' }}
            >
              View Cart & Checkout
            </button>
            <button 
              onClick={() => setSavingsBlast(null)}
              style={{ width: '100%', padding: '12px', background: 'transparent', color: '#64748b', border: 'none', fontSize: '14px', fontWeight: '600', marginTop: '8px', cursor: 'pointer' }}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default CategoryPage;
