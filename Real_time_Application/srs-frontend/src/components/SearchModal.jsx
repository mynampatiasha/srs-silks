import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const SearchModal = ({ onClose }) => {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:5000/api/products');
        setProducts(response.data);
      } catch (error) {
        console.error('Failed to fetch products for search', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(product => {
    if (!query.trim()) return false;
    const lowerQuery = query.toLowerCase();
    return (
      (product.name && product.name.toLowerCase().includes(lowerQuery)) ||
      (product.category && product.category.toLowerCase().includes(lowerQuery)) ||
      (product.description && product.description.toLowerCase().includes(lowerQuery))
    );
  });

  const handleResultClick = (id) => {
    onClose();
    navigate(`/product/${id}`);
  };

  return (
    <div className="search-modal-overlay" onClick={onClose}>
      <div className="search-modal-content" onClick={e => e.stopPropagation()}>
        <div className="search-modal-header">
          <i className="fa-solid fa-magnifying-glass search-icon"></i>
          <input
            type="text"
            placeholder="Search for sarees, categories, or keywords..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="search-input"
          />
          <button className="close-btn" onClick={onClose}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        
        <div className="search-results">
          {loading && <div className="search-status">Loading products...</div>}
          {!loading && query && filteredProducts.length === 0 && (
            <div className="search-status">No products found for "{query}"</div>
          )}
          {!loading && filteredProducts.length > 0 && (
            <div className="search-results-list">
              {filteredProducts.map(product => (
                <div key={product._id} className="search-result-item" onClick={() => handleResultClick(product._id)}>
                  <div className="search-result-img">
                    <img src={product.imgUrls && product.imgUrls.length > 0 ? product.imgUrls[0] : product.img} alt={product.name} />
                  </div>
                  <div className="search-result-info">
                    <h4>{product.name}</h4>
                    <p className="search-result-cat">{product.category}</p>
                    <p className="search-result-price">₹{product.price}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
