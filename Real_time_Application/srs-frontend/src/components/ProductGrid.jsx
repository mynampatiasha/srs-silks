import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ProductGrid = ({ onAddToCart, wishlist = [], onToggleWishlist }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    // Fetch products and categories from our Node.js backend
    const fetchData = async () => {
      try {
        const prodRes = await axios.get('http://localhost:5000/api/products');
        const catRes = await axios.get('http://localhost:5000/api/categories');
        setProducts(prodRes.data);
        setCategories(catRes.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredProducts = activeFilter === 'all' 
    ? products 
    : products.filter(p => p.cat === activeFilter);

  const formatPrice = (price) => '₹' + price.toLocaleString('en-IN');
  const getSavings = (price, orig) => orig ? Math.round(((orig - price) / orig) * 100) + '% off' : '';

  const renderSkeleton = () => (
    <div className="products-grid">
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
    <section className="collection-section" id="collection">
      <div className="section-head">
        <h2>Our Collection</h2>
        <p>Exquisite silk sarees for weddings, special occasions, and bulk wholesale</p>
      </div>

      <div className="filters">
        <span className="filter-label">Filter by:</span>
        <button 
          className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`} 
          onClick={() => setActiveFilter('all')}
        >
          All
        </button>
        {categories.map(cat => (
          <button 
            key={cat.id}
            className={`filter-btn ${activeFilter === cat.id ? 'active' : ''}`} 
            onClick={() => setActiveFilter(cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="products-meta">
        <small id="prod-count">
          Showing {activeFilter === 'all' ? `all ${products.length}` : `${filteredProducts.length} of ${products.length}`} pieces
        </small>
      </div>

      {isLoading ? (
        renderSkeleton()
      ) : (
        <div className="products-grid">
          {filteredProducts.map(p => (
            <div className="card" key={p._id}>
              <div 
                className="card-img" 
                onClick={() => navigate(`/product/${p._id}`)}
                style={{ cursor: 'pointer', position: 'relative' }}
              >
                <img src={p.imgUrls && p.imgUrls.length > 0 ? p.imgUrls[0] : p.img} alt={p.name} />
                
                {/* Wishlist Button */}
                <button 
                  onClick={(e) => { e.stopPropagation(); if(onToggleWishlist) onToggleWishlist(p); }}
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
                <div className="card-cat">{p.cat.replace('_', ' ')}</div>
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
                    onClick={() => onAddToCart(p)}
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
    </section>
  );
};

export default ProductGrid;
