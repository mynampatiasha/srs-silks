import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';
import ConfirmModal from '../components/ConfirmModal';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const [cartCount, setCartCount] = useState(0);
  const [confirmObj, setConfirmObj] = useState(null);

  useEffect(() => {
    if (location.state?.orderSuccess) {
      // Trigger confetti celebration
      var duration = 4 * 1000;
      var animationEnd = Date.now() + duration;
      var defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

      function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
      }

      var interval = setInterval(function() {
        var timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        var particleCount = 50 * (timeLeft / duration);
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
      }, 250);
      
      // Clear state so it doesn't replay on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Return Modal State
  const [selectedReturnOrder, setSelectedReturnOrder] = useState(null);
  const [returnReason, setReturnReason] = useState('');
  const [returnImages, setReturnImages] = useState([]);
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);

  // Review Modal State
  const [selectedReviewProduct, setSelectedReviewProduct] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewImage, setReviewImage] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem('srs_cart');
    if (savedCart) {
      setCartCount(JSON.parse(savedCart).length);
    }

    const fetchOrders = async () => {
      const token = localStorage.getItem('srs_customer_token');
      if (!token) {
        navigate('/');
        return;
      }
      try {
        const base = `http://${window.location.hostname}:5000`;
        const res = await axios.get(`${base}/api/orders/my-orders`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrders(res.data);
      } catch (err) {
        console.error("Failed to fetch orders", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [navigate]);

  const handleReturnImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReturnImages(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeReturnImage = (indexToRemove) => {
    setReturnImages(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleReturnSubmit = async () => {
    if (!returnReason || returnImages.length === 0) {
      toast.error("Please provide a reason and at least one image.");
      return;
    }
    setIsSubmittingReturn(true);
    try {
      const token = localStorage.getItem('srs_customer_token');
      const base = `http://${window.location.hostname}:5000`;
      await axios.put(`${base}/api/orders/${selectedReturnOrder._id}/return`, {
        returnReason, returnImages
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      toast.success("Return requested successfully");
      setSelectedReturnOrder(null);
      setReturnImages([]);
      // Wait for toast to show before reloading, or better yet, don't reload and just update state.
      setTimeout(() => window.location.reload(), 1500); 
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit return request");
    } finally {
      setIsSubmittingReturn(false);
    }
  };

  const handleReviewSubmit = async () => {
    if (!reviewComment.trim()) {
      toast.error("Please write a review comment.");
      return;
    }
    setIsSubmittingReview(true);
    try {
      const token = localStorage.getItem('srs_customer_token');
      const base = `http://${window.location.hostname}:5000`;
      await axios.post(`${base}/api/products/${selectedReviewProduct._id}/reviews`, {
        rating: reviewRating, comment: reviewComment, image: reviewImage
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      toast.success("Review submitted successfully! Thank you.");
      
      if (reviewRating >= 4) {
        setConfirmObj({
          message: "We are glad you loved it! Would you mind sharing your experience on our Google page? Click Confirm to leave a Google Review.",
          onConfirm: () => {
            window.open("https://maps.app.goo.gl/m6rg6QRFszdZFoDN9", "_blank");
            setConfirmObj(null);
          }
        });
      }

      setSelectedReviewProduct(null);
      setReviewComment('');
      setReviewImage('');
      setReviewRating(5);
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit review");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const formatPrice = (price) => '₹' + Number(price).toLocaleString('en-IN');
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

  const handleBuyItAgain = (product) => {
    if (!product) return;
    const currentCart = JSON.parse(localStorage.getItem('srs_cart') || '[]');
    const lightP = { _id: product._id, name: product.name, price: product.price, orig: product.orig, cat: product.cat, img: product.imgUrls && product.imgUrls.length > 0 ? product.imgUrls[0] : product.img };
    const newCart = [...currentCart, lightP];
    localStorage.setItem('srs_cart', JSON.stringify(newCart));
    setCartCount(newCart.length);
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <>
      <ConfirmModal 
        isOpen={!!confirmObj} 
        message={confirmObj?.message} 
        onConfirm={confirmObj?.onConfirm} 
        onCancel={() => setConfirmObj(null)} 
      />
      <Navbar cartCount={cartCount} onCartClick={() => navigate('/cart')} />
      <div style={{ minHeight: '80vh', maxWidth: '1000px', margin: '0 auto', padding: '40px 20px 40px' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '32px', color: 'var(--ink)', marginBottom: '30px' }}>My Orders</h1>

        {loading ? (
          <p>Loading your orders...</p>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
            <i className="fa-solid fa-box-open" style={{ fontSize: '48px', color: '#cbd5e1', marginBottom: '20px' }}></i>
            <h2>No orders found</h2>
            <p style={{ color: '#64748b', marginTop: '10px', marginBottom: '30px' }}>You haven't placed any orders yet.</p>
            <button className="btn-primary" onClick={() => navigate('/')}>Start Shopping</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {orders.map(order => (
              <div key={order._id} style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', transition: 'transform 0.2s', marginBottom: '10px' }}>
                <div style={{ background: 'linear-gradient(to right, #f8fafc, #ffffff)', padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1.2px', fontWeight: '600', marginBottom: '4px' }}>Order Placed</div>
                    <div style={{ fontWeight: '600', color: 'var(--ink)', fontSize: '15px' }}>{formatDate(order.createdAt)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1.2px', fontWeight: '600', marginBottom: '4px' }}>Total</div>
                    <div style={{ fontWeight: '700', color: 'var(--rust)', fontSize: '15px' }}>{formatPrice(order.totalAmount)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1.2px', fontWeight: '600', marginBottom: '4px' }}>Ship To</div>
                    <div style={{ fontWeight: '600', color: 'var(--ink)', fontSize: '15px' }}>{order.shippingAddress.name}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexGrow: 1 }}>
                    <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1.2px', fontWeight: '600', marginBottom: '4px' }}>Order #</div>
                    <div style={{ fontWeight: '600', color: 'var(--ink)', fontSize: '15px' }}>{order._id.substring(order._id.length - 8).toUpperCase()}</div>
                  </div>
                </div>

                <div style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: order.status === 'Delivered' ? '#166534' : 'var(--ink)' }}>
                      Status: {order.status}
                    </h3>
                  </div>

                  {/* Status Timeline */}
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '40px', marginTop: '10px', position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '12%', right: '12%', top: '15px', height: '3px', background: '#f1f5f9', zIndex: 0, borderRadius: '4px' }}></div>
                    {['Processing', 'Dispatched', 'Shipped', 'Delivered'].map((step, idx) => {
                      const isActive = order.statusHistory.some(h => h.status === step);
                      return (
                        <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                          <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: isActive ? 'var(--rust)' : 'white', border: `3px solid ${isActive ? 'var(--rust)' : '#e2e8f0'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: isActive ? 'white' : '#cbd5e1', marginBottom: '10px', boxShadow: isActive ? '0 0 0 4px rgba(255, 237, 213, 0.5)' : 'none', transition: 'all 0.3s' }}>
                            <i className="fa-solid fa-check" style={{ fontSize: '14px' }}></i>
                          </div>
                          <span style={{ fontSize: '13px', fontWeight: isActive ? '700' : '500', color: isActive ? 'var(--ink)' : '#94a3b8', letterSpacing: '0.5px' }}>{step}</span>
                        </div>
                      )
                    })}
                  </div>

                  {/* Items */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {order.items.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '20px', padding: '20px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', alignItems: 'center', transition: 'box-shadow 0.2s' }} onMouseOver={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)'} onMouseOut={e => e.currentTarget.style.boxShadow = 'none'}>
                        <div style={{ width: '90px', height: '110px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                          <img 
                            src={item.product?.imgUrls && item.product.imgUrls.length > 0 ? item.product.imgUrls[0] : item.product?.img} 
                            alt={item.product?.name} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer', transition: 'transform 0.3s' }} 
                            onClick={() => navigate(`/product/${item.product?._id}`)}
                            onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
                            onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--ink)', marginBottom: '6px', cursor: 'pointer' }} onClick={() => navigate(`/product/${item.product?._id}`)}>{item.product?.name || 'Product Unavailable'}</h4>
                          <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '12px', fontWeight: '500' }}>Quantity: <span style={{ color: 'var(--ink)' }}>{item.quantity}</span></p>
                          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            <button 
                              onClick={() => handleBuyItAgain(item.product)}
                              style={{ padding: '8px 16px', background: 'white', color: 'var(--rust)', border: '1px solid var(--rust)', borderRadius: '20px', fontSize: '13px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }} 
                              onMouseOver={e => {e.currentTarget.style.background = 'var(--rust)'; e.currentTarget.style.color = 'white'}} 
                              onMouseOut={e => {e.currentTarget.style.background = 'white'; e.currentTarget.style.color = 'var(--rust)'}}
                            >
                              <i className="fa-solid fa-rotate-left"></i> Buy it again
                            </button>
                            {order.status === 'Delivered' && (
                              <button 
                                onClick={() => setSelectedReviewProduct(item.product)}
                                style={{ padding: '8px 16px', background: 'var(--ink)', color: 'white', border: 'none', borderRadius: '20px', fontSize: '13px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}
                              >
                                <i className="fa-regular fa-star"></i> Write a Review
                              </button>
                            )}
                          </div>
                        </div>
                        <div style={{ fontWeight: '700', fontSize: '18px', color: 'var(--ink)' }}>
                          {formatPrice(item.price * item.quantity)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Return Logic */}
                  {order.status === 'Delivered' && (() => {
                    const deliveredHistory = order.statusHistory.find(h => h.status === 'Delivered');
                    if (deliveredHistory) {
                      const daysSince = (new Date() - new Date(deliveredHistory.date)) / (1000 * 60 * 60 * 24);
                      if (daysSince <= 3) {
                        return (
                          <div style={{ marginTop: '20px', padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <h4 style={{ fontSize: '14px', color: 'var(--ink)' }}>Return Policy Active</h4>
                              <p style={{ fontSize: '12px', color: '#64748b' }}>You can return this order until {new Date(new Date(deliveredHistory.date).getTime() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString()}.</p>
                            </div>
                            <button onClick={() => setSelectedReturnOrder(order)} style={{ padding: '8px 16px', background: 'white', border: '1px solid var(--rust)', color: 'var(--rust)', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}>Return Order</button>
                          </div>
                        );
                      } else {
                        return (
                          <div style={{ marginTop: '20px', padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <h4 style={{ fontSize: '14px', color: '#94a3b8' }}>Return Window Expired</h4>
                            <p style={{ fontSize: '12px', color: '#94a3b8' }}>This item is no longer eligible for return as it has passed the 3-day return window.</p>
                          </div>
                        );
                      }
                    }
                    return null;
                  })()}

                  {order.status === 'Return Requested' && (
                    <div style={{ marginTop: '20px', padding: '16px', background: '#fffbeb', borderRadius: '8px', border: '1px solid #fde68a' }}>
                      <h4 style={{ fontSize: '14px', color: '#92400e' }}>Return Requested</h4>
                      <p style={{ fontSize: '12px', color: '#b45309' }}>We are reviewing your return request. We will update the status soon.</p>
                    </div>
                  )}

                  {order.adminRejectReason && (
                    <div style={{ marginTop: '20px', padding: '16px', background: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca' }}>
                      <h4 style={{ fontSize: '14px', color: '#991b1b' }}>Return Rejected</h4>
                      <p style={{ fontSize: '12px', color: '#b91c1c' }}>Reason: {order.adminRejectReason}</p>
                      <p style={{ fontSize: '12px', color: '#b91c1c', marginTop: '4px' }}>Please contact support if you need further assistance.</p>
                    </div>
                  )}

                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Return Modal */}
      {selectedReturnOrder && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '500px' }}>
            <h2 style={{ fontSize: '20px', color: 'var(--ink)', marginBottom: '16px' }}>Request Return</h2>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px' }}>Order #{selectedReturnOrder._id.substring(selectedReturnOrder._id.length - 8).toUpperCase()}</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Reason for Return *</label>
                <select value={returnReason} onChange={e => setReturnReason(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                  <option value="">Select a reason</option>
                  <option value="Damaged Product">Damaged Product</option>
                  <option value="Wrong Item Delivered">Wrong Item Delivered</option>
                  <option value="Color/Quality Issue">Color/Quality Issue</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Upload Images (Required) *</label>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
                  {returnImages.map((img, idx) => (
                    <div key={idx} style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
                      <img src={img} alt={`Return Proof ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button 
                        onClick={() => removeReturnImage(idx)}
                        style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', fontSize: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}
                      >
                        <i className="fa-solid fa-times"></i>
                      </button>
                    </div>
                  ))}
                  <label style={{ width: '80px', height: '80px', borderRadius: '8px', border: '2px dashed #cbd5e1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b', background: '#f8fafc', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.borderColor = 'var(--rust)'} onMouseOut={e => e.currentTarget.style.borderColor = '#cbd5e1'}>
                    <i className="fa-solid fa-camera" style={{ fontSize: '20px', marginBottom: '4px', color: 'var(--rust)' }}></i>
                    <span style={{ fontSize: '10px', fontWeight: '600' }}>Add Photo</span>
                    <input type="file" multiple accept="image/*" capture="environment" onChange={handleReturnImageUpload} style={{ display: 'none' }} />
                  </label>
                </div>
                <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Take a photo or upload multiple images showing the issue.</p>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button onClick={() => { setSelectedReturnOrder(null); setReturnImages([]); }} style={{ flex: 1, padding: '12px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleReturnSubmit} disabled={isSubmittingReturn} style={{ flex: 1, padding: '12px', background: 'var(--rust)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                  {isSubmittingReturn ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {selectedReviewProduct && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '500px' }}>
            <h2 style={{ fontSize: '20px', color: 'var(--ink)', marginBottom: '16px' }}>Write a Review</h2>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px' }}>{selectedReviewProduct.name}</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Rating</label>
                <div style={{ display: 'flex', gap: '8px', fontSize: '24px' }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <i 
                      key={star}
                      className={star <= reviewRating ? "fa-solid fa-star" : "fa-regular fa-star"} 
                      style={{ color: star <= reviewRating ? '#eab308' : '#cbd5e1', cursor: 'pointer' }}
                      onClick={() => setReviewRating(star)}
                    ></i>
                  ))}
                </div>
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Your Review</label>
                <textarea 
                  rows="4"
                  placeholder="What did you like or dislike about this product?" 
                  value={reviewComment} 
                  onChange={e => setReviewComment(e.target.value)} 
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', resize: 'vertical', marginBottom: '16px' }} 
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Upload Image (Optional)</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={e => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setReviewImage(reader.result);
                      reader.readAsDataURL(file);
                    }
                  }} 
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'white' }} 
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button onClick={() => setSelectedReviewProduct(null)} style={{ flex: 1, padding: '12px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleReviewSubmit} disabled={isSubmittingReview} style={{ flex: 1, padding: '12px', background: 'var(--rust)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                  {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OrdersPage;
