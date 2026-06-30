import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const CartPage = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  
  useEffect(() => {
    // Read from localStorage and group by ID to count quantities
    const savedCart = localStorage.getItem('srs_cart');
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      const grouped = [];
      parsedCart.forEach(product => {
        const existing = grouped.find(item => item.product._id === product._id);
        if (existing) {
          existing.quantity += 1;
        } else {
          grouped.push({ product, quantity: 1 });
        }
      });
      setCartItems(grouped);
    }
  }, []);

  const updateCartStorage = (newGroupedCart) => {
    // Convert back to flat array for other components relying on it
    const flatCart = [];
    newGroupedCart.forEach(item => {
      const p = item.product;
      const lightP_with_img = { _id: p._id, name: p.name, price: p.price, orig: p.orig, cat: p.cat, img: p.imgUrls && p.imgUrls.length > 0 ? p.imgUrls[0] : p.img };
      const lightP_without_img = { _id: p._id, name: p.name, price: p.price, orig: p.orig, cat: p.cat };
      for (let i = 0; i < item.quantity; i++) {
        if (i === 0) {
          flatCart.push(lightP_with_img);
        } else {
          flatCart.push(lightP_without_img);
        }
      }
    });
    localStorage.setItem('srs_cart', JSON.stringify(flatCart));
    setCartItems(newGroupedCart);
    // Dispatch custom event to update navbar if needed (optional since we reload or rely on local state)
    window.dispatchEvent(new Event('storage'));
  };

  const handleIncrement = (index) => {
    const newCart = cartItems.map((item, i) => {
      if (i === index) {
        return { ...item, quantity: item.quantity + 1 };
      }
      return item;
    });
    updateCartStorage(newCart);
  };

  const handleDecrement = (index) => {
    const newCart = cartItems.map((item, i) => {
      if (i === index && item.quantity > 1) {
        return { ...item, quantity: item.quantity - 1 };
      }
      return item;
    });
    updateCartStorage(newCart);
  };

  const handleRemove = (index) => {
    const newCart = cartItems.filter((_, i) => i !== index);
    updateCartStorage(newCart);
  };

  const formatPrice = (price) => '₹' + Number(price).toLocaleString('en-IN');

  const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <Navbar cartCount={totalCartCount} onCartClick={() => {}} />
      <div style={{ minHeight: '80vh', maxWidth: '1200px', margin: '0 auto', padding: '40px 20px 40px' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '32px', color: 'var(--ink)', marginBottom: '30px' }}>Your Shopping Cart</h1>
        
        {cartItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
            <div style={{ width: '80px', height: '80px', background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <i className="fa-solid fa-bag-shopping" style={{ fontSize: '32px', color: '#94a3b8' }}></i>
            </div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', color: 'var(--ink)', marginBottom: '12px' }}>Your cart is empty</h2>
            <p style={{ color: '#64748b', marginBottom: '24px' }}>Looks like you haven't added any elegant silks yet.</p>
            <button className="btn-primary" onClick={() => navigate('/')}>Explore Collections</button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            
            {/* Left: Cart Items */}
            <div style={{ flex: '1 1 60%', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                <h2 style={{ fontSize: '18px', color: 'var(--ink)', fontWeight: '600' }}>Cart Items ({totalCartCount})</h2>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {cartItems.map((item, index) => (
                  <div key={index} style={{ display: 'flex', padding: '20px', borderBottom: '1px solid #f1f5f9', gap: '20px', position: 'relative' }}>
                    <img 
                      src={item.product.imgUrls && item.product.imgUrls.length > 0 ? item.product.imgUrls[0] : item.product.img} 
                      alt={item.product.name} 
                      style={{ width: '100px', height: '120px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0', cursor: 'pointer' }}
                      onClick={() => navigate(`/product/${item.product._id}`)}
                    />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <h3 style={{ fontSize: '16px', color: 'var(--ink)', cursor: 'pointer' }} onClick={() => navigate(`/product/${item.product._id}`)}>{item.product.name}</h3>
                        <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Category: {item.product.cat?.replace('_', ' ')}</p>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '6px', overflow: 'hidden' }}>
                          <button onClick={() => handleDecrement(index)} style={{ padding: '6px 12px', background: '#f8fafc', border: 'none', borderRight: '1px solid #cbd5e1', cursor: 'pointer', color: '#475569' }}>-</button>
                          <span style={{ padding: '6px 16px', fontSize: '14px', fontWeight: '500' }}>{item.quantity}</span>
                          <button onClick={() => handleIncrement(index)} style={{ padding: '6px 12px', background: '#f8fafc', border: 'none', borderLeft: '1px solid #cbd5e1', cursor: 'pointer', color: '#475569' }}>+</button>
                        </div>
                        <div style={{ fontWeight: '600', fontSize: '16px', color: 'var(--ink)' }}>
                          {formatPrice(item.product.price * item.quantity)}
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleRemove(index)}
                      style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '14px' }}
                      title="Remove Item"
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Order Summary */}
            <div style={{ flex: '1 1 30%', minWidth: '300px', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px' }}>
              <h2 style={{ fontSize: '18px', color: 'var(--ink)', fontWeight: '600', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '20px' }}>Order Summary</h2>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', color: '#475569', fontSize: '15px' }}>
                <span>Subtotal ({totalCartCount} items)</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', color: '#475569', fontSize: '15px' }}>
                <span>Shipping</span>
                <span style={{ color: '#22c55e', fontWeight: '500' }}>Free</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', paddingTop: '16px', borderTop: '1px dashed #cbd5e1', color: 'var(--ink)', fontSize: '18px', fontWeight: '700' }}>
                <span>Total Amount</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              
              <button 
                onClick={() => {
                  sessionStorage.setItem('srs_checkout_step', '2');
                  navigate('/checkout');
                }}
                style={{ width: '100%', padding: '14px', background: 'var(--rust)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s', boxShadow: '0 4px 12px rgba(139, 58, 26, 0.2)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--rust-dark)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--rust)'}
              >
                Proceed to Checkout
              </button>
              
              <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#64748b', fontSize: '12px' }}>
                <i className="fa-solid fa-shield-halved"></i> 100% Safe & Secure Payments
              </div>
            </div>
            
          </div>
        )}
      </div>
    </>
  );
};

export default CartPage;
