import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import ProductGrid from '../components/ProductGrid';
import CustomerAuthModal from '../components/CustomerAuthModal';
import confetti from 'canvas-confetti';

const Home = () => {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('srs_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [savingsBlast, setSavingsBlast] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [customer, setCustomer] = useState(null);
  const [pendingProduct, setPendingProduct] = useState(null);
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('srs_customer');
    if (saved) {
      try { setCustomer(JSON.parse(saved)); } catch(e){}
    }

    axios.get(`http://${window.location.hostname}:5000/api/categories`)
      .then(res => setCategories(res.data))
      .catch(err => console.error(err));

    if (saved) {
      const token = localStorage.getItem('srs_customer_token');
      axios.get(`http://${window.location.hostname}:5000/api/customer/wishlist`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => setWishlist(res.data.map(p => p._id)))
        .catch(err => console.error(err));
    }
  }, []);

  const featuredCats = categories.filter(c => c.showInHeader && !c.parentId);

  const handleAddToCart = (product) => {
    if (!customer) {
      setPendingProduct(product);
      setShowAuthModal(true);
      return;
    }
    const lightP = { _id: product._id, name: product.name, price: product.price, orig: product.orig, cat: product.cat, img: product.imgUrls && product.imgUrls.length > 0 ? product.imgUrls[0] : product.img };
    const newCart = [...cart, lightP];
    setCart(newCart);
    localStorage.setItem('srs_cart', JSON.stringify(newCart));
    const savings = product.orig ? product.orig - product.price : 0;
    setSavingsBlast({ show: true, savings });
    
    // Trigger Splash Blast Confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10b981', '#fbbf24', '#f43f5e', '#3b82f6'],
      zIndex: 100000
    });
  };

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

  return (
    <>
      <Navbar cartCount={cart.length} onCartClick={() => setCartOpen(!cartOpen)} />
      
      {featuredCats.length > 0 && (
        <div className="featured-categories-bar">
          <div className="featured-categories-container">
            {featuredCats.map(cat => (
              <div
                key={cat._id}
                className="featured-category-item"
                onClick={() => navigate(`/category/${cat.id}`)}
              >
                <img src={cat.img} alt={cat.name} />
                <span>{cat.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <Hero />
      <div className="divider-strip">
        ✨ &nbsp; Premium Quality • Women & Kids Wear • In-store Shopping • Fast Delivery &nbsp; ✨
      </div>
      <ProductGrid 
        onAddToCart={handleAddToCart} 
        wishlist={wishlist} 
        onToggleWishlist={handleToggleWishlist} 
      />
      
      {/* Footer and other sections can go here */}
      <footer className="footer">
        <div className="footer-bottom">
          <p>© 2026 SRS Silk Traders. All rights reserved.</p>
        </div>
      </footer>

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
                Awesome! You saved <span style={{ fontFamily: 'sans-serif' }}>₹</span>{Number(savingsBlast.savings).toLocaleString('en-IN')}!
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

export default Home;
