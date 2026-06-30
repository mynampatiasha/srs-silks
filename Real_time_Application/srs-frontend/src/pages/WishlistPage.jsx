import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import CustomerAuthModal from '../components/CustomerAuthModal';

const WishlistPage = () => {
  const [wishlist, setWishlist] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('srs_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [showToast, setShowToast] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWishlist = async () => {
      const token = localStorage.getItem('srs_customer_token');
      if (!token) {
        navigate('/'); // Redirect to home if not logged in
        return;
      }

      try {
        const base = `http://${window.location.hostname}:5000`;
        const res = await axios.get(`${base}/api/customer/wishlist`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setWishlist(res.data);
      } catch (err) {
        console.error("Error fetching wishlist:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWishlist();
  }, [navigate]);

  const handleRemove = async (productId) => {
    const token = localStorage.getItem('srs_customer_token');
    try {
      const base = `http://${window.location.hostname}:5000`;
      const res = await axios.post(`${base}/api/customer/wishlist/toggle`, { productId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWishlist(res.data);
    } catch (err) {
      console.error("Error removing from wishlist:", err);
    }
  };

  const formatPrice = (price) => '₹' + Number(price).toLocaleString('en-IN');

  return (
    <>
      <Navbar cartCount={cart.length} onCartClick={() => {}} />
      <div className="cat-page-container" style={{ paddingTop: '40px', minHeight: '80vh' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '36px', color: 'var(--ink)', textAlign: 'center', marginBottom: '10px' }}>Your Wishlist</h1>
        
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
            <p style={{ color: 'var(--muted)', fontSize: '18px' }}>Loading your exquisite selections...</p>
          </div>
        ) : wishlist.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '80px 20px', 
            background: 'linear-gradient(145deg, #ffffff, #f8fafc)', 
            borderRadius: '24px', 
            boxShadow: '0 10px 40px -10px rgba(0,0,0,0.05)', 
            maxWidth: '600px', 
            margin: '40px auto' 
          }}>
            <div style={{ 
              width: '100px', height: '100px', background: '#fef2f2', 
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', 
              margin: '0 auto 30px', color: '#be123c'
            }}>
              <i className="fa-regular fa-heart" style={{ fontSize: '40px' }}></i>
            </div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '32px', color: 'var(--ink)', marginBottom: '16px' }}>Your Wishlist is Empty</h2>
            <p style={{ color: '#64748b', fontSize: '16px', lineHeight: '1.6', maxWidth: '400px', margin: '0 auto 40px' }}>
              Discover the perfect drape for your next occasion. Save your favorite silk sarees here to review them later.
            </p>
            <button 
              onClick={() => navigate('/')}
              style={{ 
                background: 'var(--ink)', color: 'white', border: 'none', padding: '16px 40px', 
                borderRadius: '8px', fontSize: '16px', fontWeight: '500', cursor: 'pointer', 
                transition: 'all 0.3s ease', letterSpacing: '0.5px'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--rust)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--ink)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              Explore Collections
            </button>
          </div>
        ) : (
          <div className="products-grid">
            {wishlist.map(p => (
              <div className="card" key={p._id}>
                <div className="card-img" onClick={() => navigate(`/product/${p._id}`)} style={{ cursor: 'pointer', position: 'relative' }}>
                  <img src={p.imgUrls && p.imgUrls.length > 0 ? p.imgUrls[0] : p.img} alt={p.name} />
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleRemove(p._id); }}
                    style={{ position: 'absolute', top: '10px', right: '10px', background: 'white', border: 'none', width: '32px', height: '32px', borderRadius: '50%', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}
                  >
                    <i className="fa-solid fa-heart"></i>
                  </button>
                </div>
                <div className="card-body">
                  <div className="card-cat">{p.cat ? p.cat.replace('_', ' ') : ''}</div>
                  <div className="card-name" onClick={() => navigate(`/product/${p._id}`)} style={{ cursor: 'pointer' }}>{p.name}</div>
                  <div className="card-row">
                    <div>
                      <span className="price">{formatPrice(p.price)}</span>
                    </div>
                    <button className="add-btn" disabled={!p.inStock} onClick={() => {
                      const lightP = { _id: p._id, name: p.name, price: p.price, orig: p.orig, cat: p.cat, img: p.imgUrls && p.imgUrls.length > 0 ? p.imgUrls[0] : p.img };
                      const newCart = [...cart, lightP];
                      setCart(newCart);
                      localStorage.setItem('srs_cart', JSON.stringify(newCart));
                      setShowToast(true);
                      setTimeout(() => setShowToast(false), 3000);
                    }}>
                      {p.inStock ? 'Move to Cart' : 'Sold out'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div style={{
          position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
          background: '#22c55e', color: 'white', padding: '12px 24px', borderRadius: '30px',
          boxShadow: '0 10px 25px rgba(34, 197, 94, 0.4)', fontWeight: '600', zIndex: 9999,
          display: 'flex', alignItems: 'center', gap: '8px', animation: 'fadeUp 0.3s ease-out'
        }}>
          <i className="fa-solid fa-circle-check"></i> Added to Cart!
        </div>
      )}
    </>
  );
};

export default WishlistPage;
