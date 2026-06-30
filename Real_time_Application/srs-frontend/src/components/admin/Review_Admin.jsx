import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Review_Admin = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Pending'); // Pending, Approved, Rejected

  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const base = `http://${window.location.hostname}:5000`;
      const res = await axios.get(`${base}/api/products/admin/all-reviews`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReviews(res.data);
    } catch (err) {
      console.error("Failed to fetch reviews", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleStatusChange = async (reviewId, newStatus) => {
    try {
      const token = localStorage.getItem('adminToken');
      const base = `http://${window.location.hostname}:5000`;
      await axios.put(`${base}/api/products/admin/reviews/${reviewId}`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local state
      setReviews(prev => prev.map(r => r._id === reviewId ? { ...r, status: newStatus } : r));
    } catch (err) {
      console.error("Failed to update status", err);
      alert("Failed to update review status");
    }
  };

  const filteredReviews = reviews.filter(r => r.status === filter);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: 'var(--ink)' }}>Product Reviews</h2>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
        {['Pending', 'Approved', 'Rejected'].map(status => (
          <button 
            key={status}
            onClick={() => setFilter(status)}
            style={{
              padding: '8px 16px',
              background: filter === status ? 'var(--ink)' : 'transparent',
              color: filter === status ? 'white' : '#64748b',
              border: 'none',
              borderRadius: '20px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            {status} ({reviews.filter(r => r.status === status).length})
          </button>
        ))}
      </div>

      {loading ? (
        <p>Loading reviews...</p>
      ) : filteredReviews.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', background: 'white', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
          <p style={{ color: '#64748b' }}>No {filter.toLowerCase()} reviews found.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredReviews.map(review => (
            <div key={review._id} style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
              
              {/* Product Info */}
              <div style={{ width: '80px', flexShrink: 0 }}>
                <img 
                  src={review.product?.imgUrls?.[0] || review.product?.img || 'https://via.placeholder.com/80'} 
                  alt="Product" 
                  style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '8px' }}
                />
                <div style={{ fontSize: '11px', textAlign: 'center', marginTop: '4px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {review.product?.name}
                </div>
              </div>

              {/* Review Content */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div>
                    <h4 style={{ margin: 0, color: 'var(--ink)' }}>{review.user?.name || 'Unknown User'}</h4>
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>{review.user?.email}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                    {new Date(review.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '4px', color: '#eab308', marginBottom: '8px', fontSize: '14px' }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <i key={star} className={star <= review.rating ? "fa-solid fa-star" : "fa-regular fa-star"}></i>
                  ))}
                </div>

                <p style={{ color: '#334155', fontSize: '14px', lineHeight: '1.5', margin: 0 }}>
                  {review.comment}
                </p>

                {review.image && (
                  <div style={{ marginTop: '12px' }}>
                    <img src={review.image} alt="Review" style={{ height: '80px', borderRadius: '4px', cursor: 'pointer', border: '1px solid #e2e8f0' }} onClick={() => window.open(review.image, '_blank')} />
                  </div>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '120px' }}>
                {filter !== 'Approved' && (
                  <button onClick={() => handleStatusChange(review._id, 'Approved')} style={{ padding: '8px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}>
                    <i className="fa-solid fa-check"></i> Approve
                  </button>
                )}
                {filter !== 'Rejected' && (
                  <button onClick={() => handleStatusChange(review._id, 'Rejected')} style={{ padding: '8px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}>
                    <i className="fa-solid fa-times"></i> Reject
                  </button>
                )}
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Review_Admin;
