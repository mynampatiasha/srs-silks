import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ cartCount, onCartClick }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const customer = localStorage.getItem('srs_customer') ? JSON.parse(localStorage.getItem('srs_customer')) : null;

  const handleLogout = () => {
    localStorage.removeItem('srs_customer');
    localStorage.removeItem('srs_customer_token');
    window.location.href = '/'; // Redirect to home and reload
  };

  return (
    <nav className="nav" id="navbar">
      <div className="nav-logo">
        SRS Silk Traders
        <span>Chickpet, Bengaluru • Premium Silks</span>
      </div>
      <div className={`nav-links ${menuOpen ? 'open' : ''}`} id="nav-links">
        <a href="/#collection" onClick={() => setMenuOpen(false)}>Collection</a>
        <a href="/#gallery" onClick={() => setMenuOpen(false)}>Gallery</a>
        <a href="/#reviews" onClick={() => setMenuOpen(false)}>Reviews</a>
        <Link to="/about" onClick={() => setMenuOpen(false)}>About</Link>
        <Link to="/contact" className="nav-contact-link" onClick={() => setMenuOpen(false)}>Contact Us</Link>
      </div>
      <div className="nav-actions">
        <Link to="/wishlist" className="nav-btn" title="Wishlist" aria-label="Open wishlist" style={{ color: 'var(--ink)' }}>
          <i className="fa-regular fa-heart"></i>
        </Link>
        <Link to="/cart" className="nav-btn" title="Cart" aria-label="Open cart" style={{ color: 'var(--ink)', position: 'relative' }}>
          <i className="fa-solid fa-bag-shopping"></i>
          {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
        </Link>

        {/* Profile Dropdown */}
        {customer && (
          <div style={{ position: 'relative' }}>
            <button 
              className="nav-btn" 
              onClick={() => setProfileOpen(!profileOpen)} 
              title="Profile" 
              style={{ background: 'none', border: 'none', color: 'var(--ink)', fontSize: '18px', cursor: 'pointer', padding: '8px' }}
            >
              <i className="fa-regular fa-user"></i>
            </button>
            {profileOpen && (
              <div style={{
                position: 'absolute', top: '100%', right: '0', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', 
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)', minWidth: '200px', zIndex: 1000, overflow: 'hidden',
                display: 'flex', flexDirection: 'column'
              }}>
                <div style={{ padding: '16px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
                  <div style={{ fontWeight: '600', color: 'var(--ink)' }}>{customer.name}</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>{customer.email}</div>
                </div>
                <Link to="/profile" style={{ padding: '12px 16px', color: '#334155', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', borderBottom: '1px solid #f1f5f9' }} onClick={() => setProfileOpen(false)}>
                  <i className="fa-solid fa-user-pen" style={{ width: '16px', color: '#94a3b8' }}></i> Edit Profile
                </Link>
                <Link to="/addresses" style={{ padding: '12px 16px', color: '#334155', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', borderBottom: '1px solid #f1f5f9' }} onClick={() => setProfileOpen(false)}>
                  <i className="fa-solid fa-location-dot" style={{ width: '16px', color: '#94a3b8' }}></i> Manage Addresses
                </Link>
                <Link to="/orders" style={{ padding: '12px 16px', color: '#334155', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', borderBottom: '1px solid #f1f5f9' }} onClick={() => setProfileOpen(false)}>
                  <i className="fa-solid fa-box" style={{ width: '16px', color: '#94a3b8' }}></i> My Orders
                </Link>
                <Link to="/wishlist" style={{ padding: '12px 16px', color: '#334155', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', borderBottom: '1px solid #f1f5f9' }} onClick={() => setProfileOpen(false)}>
                  <i className="fa-regular fa-heart" style={{ width: '16px', color: '#94a3b8' }}></i> Wishlist
                </Link>
                <button 
                  onClick={handleLogout}
                  style={{ padding: '12px 16px', color: '#ef4444', background: 'none', border: 'none', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', cursor: 'pointer', width: '100%' }}
                >
                  <i className="fa-solid fa-arrow-right-from-bracket" style={{ width: '16px' }}></i> Logout
                </button>
              </div>
            )}
          </div>
        )}
        <button className="nav-btn hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          <i className="fa-solid fa-bars"></i>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
