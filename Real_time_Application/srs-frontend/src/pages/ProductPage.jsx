import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import CustomerAuthModal from '../components/CustomerAuthModal';
import confetti from 'canvas-confetti';

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('srs_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [savingsBlast, setSavingsBlast] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);

  const isInCart = product ? cart.some(item => item._id === product._id) : false;

  const handleShare = async () => {
    const shareUrl = `https://srssilks.in/product/${product?._id}`;
    const imageToShare = product?.imgUrls?.[0] || product?.img || '';
    const shareData = {
      title: 'SRS Silk Traders',
      text: `Check out this beautiful saree from SRS Silk Traders: ${product?.name}!\n\nPrice: ₹${Number(product?.price).toLocaleString('en-IN')}\nView Image: ${imageToShare}\n\n`,
      url: shareUrl
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        window.open(`https://wa.me/?text=${encodeURIComponent(shareData.text + ' ' + shareData.url)}`, '_blank');
      }
    } catch (err) {
      console.log('Error sharing', err);
    }
  };
  const [activeImg, setActiveImg] = useState('');
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [colorVariants, setColorVariants] = useState([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [customer, setCustomer] = useState(null);
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('srs_customer');
    if (saved) {
      try { setCustomer(JSON.parse(saved)); } catch(e){}
    }
    
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [prodRes, allProdRes, reviewsRes] = await Promise.all([
          axios.get(`http://${window.location.hostname}:5000/api/products/${id}`),
          axios.get(`http://${window.location.hostname}:5000/api/products`),
          axios.get(`http://${window.location.hostname}:5000/api/products/${id}/reviews`)
        ]);
        const fetchedProduct = prodRes.data;
        setProduct(fetchedProduct);
        
        const fetchedReviews = reviewsRes.data;
        setReviews(fetchedReviews);
        if (fetchedReviews.length > 0) {
          const avg = fetchedReviews.reduce((acc, r) => acc + r.rating, 0) / fetchedReviews.length;
          setAverageRating(avg.toFixed(1));
        }

        setActiveImg(fetchedProduct.imgUrls && fetchedProduct.imgUrls.length > 0 ? fetchedProduct.imgUrls[0] : fetchedProduct.img);
        
        // Find variants with same groupId
        if (fetchedProduct.groupId) {
          const variants = allProdRes.data.filter(p => p.groupId === fetchedProduct.groupId && p._id !== fetchedProduct._id);
          setColorVariants(variants);
        } else {
          setColorVariants([]);
        }

        // Find related products in same category (excluding current and variants)
        const related = allProdRes.data.filter(p => p.cat === fetchedProduct.cat && p._id !== fetchedProduct._id && p.groupId !== fetchedProduct.groupId).slice(0, 4);
        setRelatedProducts(related);
      } catch (err) {
        console.error("Error fetching product details:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    if (customer) {
      const fetchWishlist = async () => {
        try {
          const token = localStorage.getItem('srs_customer_token');
          const base = `http://${window.location.hostname}:5000`;
          const res = await axios.get(`${base}/api/customer/wishlist`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setWishlist(res.data.map(p => p._id));
        } catch (err) {
          console.error("Error fetching wishlist", err);
        }
      };
      fetchWishlist();
    }
  }, [customer]);

  const toggleWishlist = async () => {
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

  const formatPrice = (price) => '₹' + Number(price).toLocaleString('en-IN');
  const getSavings = (price, orig) => orig ? Math.round(((orig - price) / orig) * 100) + '% off' : '';

  if (isLoading) {
    return (
      <>
        <Navbar cartCount={cart.length} onCartClick={() => {}} />
        <div className="product-page-container skeleton-page">
          <div className="product-gallery">
            <div className="main-image skeleton-box" style={{ height: '500px' }}></div>
          </div>
          <div className="product-details">
            <div className="skeleton-box" style={{ height: '30px', width: '70%', marginBottom: '20px' }}></div>
            <div className="skeleton-box" style={{ height: '20px', width: '40%', marginBottom: '30px' }}></div>
            <div className="skeleton-box" style={{ height: '100px', width: '100%', marginBottom: '30px' }}></div>
            <div className="skeleton-box" style={{ height: '50px', width: '200px' }}></div>
          </div>
        </div>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Navbar cartCount={cart.length} onCartClick={() => {}} />
        <div className="cat-empty" style={{ marginTop: '100px' }}>
          <h2>Product Not Found</h2>
          <p>The product you are looking for does not exist or has been removed.</p>
          <button className="btn-primary" onClick={() => navigate('/')}>Back to Home</button>
        </div>
      </>
    );
  }

  let allImages = (product.imgUrls || []).filter(url => url && url.trim() !== '');
  if (allImages.length === 0 && product.img) allImages.push(product.img);

  const handlePrevImage = (e) => {
    e.stopPropagation();
    const currentIndex = allImages.indexOf(activeImg);
    const newIndex = currentIndex === 0 ? allImages.length - 1 : currentIndex - 1;
    setActiveImg(allImages[newIndex]);
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    const currentIndex = allImages.indexOf(activeImg);
    const newIndex = currentIndex === allImages.length - 1 ? 0 : currentIndex + 1;
    setActiveImg(allImages[newIndex]);
  };

  return (
    <>
      <Navbar cartCount={cart.length} onCartClick={() => {}} />
      
      <div className="product-page-container">
        {/* Breadcrumb */}
        <div className="cat-breadcrumb" style={{ width: '100%', marginBottom: '30px' }}>
          <span onClick={() => navigate('/')} style={{ cursor: 'pointer', color: 'var(--rust)' }}>Home</span>
          <span> / </span>
          <span onClick={() => navigate(`/category/${product.cat}`)} style={{ cursor: 'pointer', color: 'var(--rust)' }}>{product.cat}</span>
          <span> / </span>
          <span style={{ color: 'var(--muted)' }}>{product.name}</span>
        </div>

        <div className="product-split">
          {/* Left: Image Gallery (Meesho Style) */}
          <div className="product-gallery" style={{ display: 'flex', gap: '20px', flexDirection: 'row', alignItems: 'flex-start' }}>
            
            {/* Thumbnail Strip (Left Column) */}
            {allImages.length > 1 && (
              <div className="thumbnail-strip" style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '70px', flexShrink: 0, maxHeight: '550px', overflowY: 'auto', paddingRight: '4px' }}>
                {allImages.map((img, idx) => (
                  <img 
                    key={idx} 
                    src={img} 
                    alt={`Thumbnail ${idx}`} 
                    onClick={(e) => { e.stopPropagation(); setActiveImg(img); }}
                    style={{ 
                      width: '100%', 
                      height: '90px', 
                      objectFit: 'cover', 
                      cursor: 'pointer',
                      borderRadius: '6px',
                      border: activeImg === img ? '2px solid var(--rust)' : '1px solid #e2e8f0',
                      opacity: activeImg === img ? 1 : 0.6,
                      transition: 'all 0.2s ease-in-out'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.opacity = 1; }}
                    onMouseLeave={(e) => { if(activeImg !== img) e.currentTarget.style.opacity = 0.6; }}
                  />
                ))}
              </div>
            )}

            {/* Main Image (Right Column) */}
            <div className="main-image-container" onClick={() => setIsLightboxOpen(true)} style={{ flex: 1, position: 'relative', cursor: 'zoom-in', height: '550px', backgroundColor: '#f8fafc', borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0' }}>
              <img src={activeImg} alt={product.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              {!product.inStock && (
                <div className="out-stock-badge" style={{ position: 'absolute', top: '16px', left: '16px', background: '#ef4444', color: 'white', padding: '4px 12px', borderRadius: '4px', fontWeight: 'bold', fontSize: '12px' }}>Out of Stock</div>
              )}
            </div>
          </div>

          {/* Right: Product Details */}
          <div className="product-info">
            <div className="product-cat-label">{product.cat.replace('_', ' ')}</div>
            <h1 className="product-title">{product.name}</h1>
            
            {reviews.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <div style={{ background: '#16a34a', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {averageRating} <i className="fa-solid fa-star" style={{ fontSize: '10px' }}></i>
                </div>
                <span style={{ color: '#64748b', fontSize: '13px' }}>({reviews.length} Ratings)</span>
              </div>
            )}
            
            <div className="product-pricing">
              <span className="current-price">{formatPrice(product.price)}</span>
              {product.orig && <span className="original-price">{formatPrice(product.orig)}</span>}
              {product.orig && <span className="discount-badge">{getSavings(product.price, product.orig)}</span>}
            </div>

            {/* Color Variants Section */}
            {colorVariants.length > 0 && (
              <div className="product-variants" style={{ marginBottom: '30px' }}>
                <h3 style={{ fontSize: '14px', color: '#64748b', marginBottom: '12px', fontWeight: 600 }}>Available Colors</h3>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {/* Current Product Thumbnail (highlighted) */}
                  <div style={{ border: '2px solid var(--rust)', padding: '2px', borderRadius: '6px' }}>
                    <img src={activeImg} alt="Current Color" style={{ width: '60px', height: '80px', objectFit: 'cover', borderRadius: '4px' }} />
                  </div>
                  {/* Other Variants */}
                  {colorVariants.map(v => (
                    <div 
                      key={v._id} 
                      onClick={() => navigate(`/product/${v._id}`)}
                      style={{ border: '1px solid #e2e8f0', padding: '2px', borderRadius: '6px', cursor: 'pointer', transition: 'border 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = '#94a3b8'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}
                    >
                      <img src={v.imgUrls && v.imgUrls.length > 0 ? v.imgUrls[0] : v.img} alt={v.name} style={{ width: '60px', height: '80px', objectFit: 'cover', borderRadius: '4px' }} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Product Highlights */}
            {product.highlights && product.highlights.length > 0 && (
              <div className="product-highlights" style={{ marginBottom: '24px', padding: '20px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#f8fafc' }}>
                <h3 style={{ fontSize: '16px', color: '#1e293b', marginBottom: '16px', fontWeight: 600 }}>Product Highlights</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {product.highlights.map((h, i) => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>{h.key}</span>
                      <span style={{ fontSize: '14px', color: '#1e293b', fontWeight: 500 }}>{h.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="product-description">{product.desc}</p>

            <div className="product-tags">
              {product.tags && product.tags.map((t, i) => (
                <span key={i} className="detail-tag">{t}</span>
              ))}
            </div>

            <div className="action-buttons" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  className="add-to-cart-btn btn-primary"
                  style={{ 
                    flex: 1, 
                    padding: '12px 20px', 
                    fontSize: '15px', 
                    fontWeight: '600',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                  disabled={!product.inStock}
                  onClick={() => {
                    if (isInCart) {
                      navigate('/cart');
                    } else if (!customer) {
                      setShowAuthModal(true);
                    } else {
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
                    }
                  }}
                >
                  {product.inStock ? (
                    isInCart ? (
                      <>View Cart <i className="fa-solid fa-arrow-right"></i></>
                    ) : (
                      <>Add to Cart <i className="fa-solid fa-cart-plus"></i></>
                    )
                  ) : 'Out of Stock'}
                </button>
                <button 
                  onClick={toggleWishlist}
                  style={{ 
                    background: 'white', border: '1px solid #cbd5e1', borderRadius: '6px', width: '48px', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                    color: wishlist.includes(product._id) ? '#ef4444' : '#64748b', fontSize: '20px',
                    transition: 'all 0.2s'
                  }}
                  title="Add to Wishlist"
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#94a3b8'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#cbd5e1'}
                >
                  <i className={wishlist.includes(product._id) ? "fa-solid fa-heart" : "fa-regular fa-heart"}></i>
                </button>
                <button 
                  onClick={handleShare}
                  style={{ 
                    background: 'white', border: '1px solid #cbd5e1', borderRadius: '6px', width: '48px', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                    color: '#64748b', fontSize: '18px',
                    transition: 'all 0.2s'
                  }}
                  title="Share Product"
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#94a3b8'; e.currentTarget.style.color = '#334155'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.color = '#64748b'; }}
                >
                  <i className="fa-solid fa-share-nodes"></i>
                </button>
              </div>
              <button 
                className="whatsapp-btn" 
                onClick={() => {
                  const shareUrl = `https://srssilks.in/product/${product._id}`;
                  const imageToShare = product?.imgUrls?.[0] || product?.img || '';
                  const inquiryText = `Hi SRS Silks! I'm interested in purchasing the "${product.name}".\n\nPrice: ${formatPrice(product.price)}\nImage Reference: ${imageToShare}\n\nProduct Link: ${shareUrl}`;
                  window.open(`https://wa.me/919876543210?text=${encodeURIComponent(inquiryText)}`, '_blank');
                }}
                style={{
                  background: 'white',
                  color: '#25D366',
                  border: '1px solid #25D366',
                  padding: '10px 16px',
                  fontSize: '14px',
                  fontWeight: '600',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  alignSelf: 'flex-start'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#f0fdf4'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'white'; }}
              >
                <i className="fa-brands fa-whatsapp" style={{ fontSize: '18px' }}></i> Inquire on WhatsApp
              </button>
            </div>

            <div className="delivery-info">
              <div className="info-item">
                <i className="fa-solid fa-truck"></i>
                <span>Free shipping across India</span>
              </div>
              <div className="info-item">
                <i className="fa-solid fa-rotate-left"></i>
                <span>7-day easy returns</span>
              </div>
              <div className="info-item">
                <i className="fa-solid fa-check-double"></i>
                <span>100% Authentic Silk mark certified</span>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Reviews Section */}
        {reviews && reviews.length > 0 && (
          <div className="reviews-section" style={{ marginTop: '40px', borderTop: '1px solid var(--border)', paddingTop: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '24px' }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', color: 'var(--ink)', margin: 0 }}>Customer Reviews</h2>
              <div style={{ background: '#fef3c7', color: '#d97706', padding: '4px 12px', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {averageRating} <i className="fa-solid fa-star"></i>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {reviews.map((review, idx) => (
                <div key={review._id || idx} style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ fontWeight: '600', color: 'var(--ink)' }}>{review.user?.name || 'Customer'}</div>
                    <div style={{ color: '#64748b', fontSize: '13px' }}>{new Date(review.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '4px', color: '#eab308', marginBottom: '12px', fontSize: '14px' }}>
                    {Array(5).fill(0).map((_, i) => (
                      <i key={i} className={i < review.rating ? "fa-solid fa-star" : "fa-regular fa-star"}></i>
                    ))}
                  </div>
                  <p style={{ color: '#334155', fontSize: '15px', lineHeight: '1.5' }}>{review.comment}</p>
                  {review.image && (
                    <div style={{ marginTop: '12px' }}>
                      <img src={review.image} alt="Review" style={{ height: '100px', width: '100px', objectFit: 'cover', borderRadius: '6px', cursor: 'pointer', border: '1px solid #e2e8f0' }} onClick={() => { setActiveImg(review.image); setIsLightboxOpen(true); }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="related-products-section" style={{ marginTop: '60px', borderTop: '1px solid var(--border)', paddingTop: '40px' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', color: 'var(--ink)', marginBottom: '24px' }}>You Might Also Like</h2>
            <div className="products-grid">
              {relatedProducts.map(p => (
                <div className="card" key={p._id}>
                  <div className="card-img" onClick={() => navigate(`/product/${p._id}`)} style={{ cursor: 'pointer' }}>
                    <img src={p.imgUrls && p.imgUrls.length > 0 ? p.imgUrls[0] : p.img} alt={p.name} />
                  </div>
                  <div className="card-body">
                    <div className="card-cat">{p.cat.replace('_', ' ')}</div>
                    <div className="card-name" onClick={() => navigate(`/product/${p._id}`)} style={{ cursor: 'pointer' }}>{p.name}</div>
                    <div className="card-row">
                      <div>
                        <span className="price">{formatPrice(p.price)}</span>
                        {p.orig && <span className="price-old">{formatPrice(p.orig)}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Overlay */}
      {isLightboxOpen && (
        <div className="lightbox-overlay" onClick={() => setIsLightboxOpen(false)}>
          <button className="lightbox-close" onClick={() => setIsLightboxOpen(false)}>&times;</button>
          <img src={activeImg} alt="Zoomed" className="lightbox-img" onClick={(e) => e.stopPropagation()} />
          {allImages.length > 1 && (
            <>
              <button className="lightbox-btn lightbox-prev" onClick={handlePrevImage}><i className="fa-solid fa-chevron-left"></i></button>
              <button className="lightbox-btn lightbox-next" onClick={handleNextImage}><i className="fa-solid fa-chevron-right"></i></button>
            </>
          )}
        </div>
      )}

      {showAuthModal && (
        <CustomerAuthModal 
          onClose={() => setShowAuthModal(false)}
          onSuccess={(user) => {
            setCustomer(user);
            setShowAuthModal(false);
            const lightP = { _id: product._id, name: product.name, price: product.price, orig: product.orig, cat: product.cat, img: product.imgUrls && product.imgUrls.length > 0 ? product.imgUrls[0] : product.img };
            const newCart = [...cart, lightP];
            setCart(newCart);
            localStorage.setItem('srs_cart', JSON.stringify(newCart));
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
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

export default ProductPage;
