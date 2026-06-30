import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Return_Admin = () => {
  const [returnOrders, setReturnOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Action Modal State
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [actionType, setActionType] = useState(''); // 'Accept' or 'Reject'
  const [adminRejectReason, setAdminRejectReason] = useState('');
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    fetchReturnOrders();
  }, []);

  const fetchReturnOrders = async () => {
    try {
      const res = await axios.get(`http://${window.location.hostname}:5000/api/orders/admin/all`);
      // Filter only orders with return requests or returned status
      const returns = res.data.filter(o => 
        o.status === 'Return Requested' || 
        o.status === 'Return Accepted' || 
        o.status === 'Returned' ||
        o.adminRejectReason // Previously rejected
      );
      setReturnOrders(returns);
    } catch (err) {
      console.error("Failed to fetch returns", err);
    } finally {
      setLoading(false);
    }
  };

  const handleActionSubmit = async () => {
    if (actionType === 'Reject' && !adminRejectReason) {
      toast.error("Please provide a reason for rejecting the return.");
      return;
    }
    
    try {
      await axios.put(`http://${window.location.hostname}:5000/api/orders/admin/${selectedOrder._id}/return-action`, {
        action: actionType,
        adminRejectReason: actionType === 'Reject' ? adminRejectReason : undefined
      });
      toast.success(`Return request ${actionType.toLowerCase()}ed successfully.`);
      setSelectedOrder(null);
      fetchReturnOrders();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update return status.");
    }
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', color: '#1e293b' }}>Returns Management</h2>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
          <thead style={{ background: '#f8fafc', color: '#475569', fontSize: '14px' }}>
            <tr>
              <th style={{ padding: '16px', borderBottom: '1px solid #e2e8f0' }}>Order ID</th>
              <th style={{ padding: '16px', borderBottom: '1px solid #e2e8f0' }}>Customer</th>
              <th style={{ padding: '16px', borderBottom: '1px solid #e2e8f0' }}>Reason</th>
              <th style={{ padding: '16px', borderBottom: '1px solid #e2e8f0' }}>Proof Image</th>
              <th style={{ padding: '16px', borderBottom: '1px solid #e2e8f0' }}>Status</th>
              <th style={{ padding: '16px', borderBottom: '1px solid #e2e8f0' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" style={{ padding: '20px', textAlign: 'center' }}>Loading returns...</td></tr>
            ) : returnOrders.length === 0 ? (
              <tr><td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>No return requests found.</td></tr>
            ) : (
              returnOrders.map(order => (
                <tr key={order._id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '14px' }}>
                  <td style={{ padding: '16px', color: '#3b82f6', fontWeight: '500' }}>#{order._id.substring(order._id.length - 6).toUpperCase()}</td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontWeight: '500', color: 'var(--ink)' }}>{order.customer?.name}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>Requested: {formatDate(order.statusHistory.find(h => h.status === 'Return Requested')?.date || new Date())}</div>
                  </td>
                  <td style={{ padding: '16px', color: '#475569' }}>{order.returnReason || 'Not provided'}</td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {order.returnImages && order.returnImages.length > 0 ? (
                        order.returnImages.map((img, idx) => (
                          <div key={idx} style={{ width: '40px', height: '40px', borderRadius: '4px', overflow: 'hidden', border: '1px solid #cbd5e1', cursor: 'pointer', transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'} onClick={() => setPreviewImage(img)}>
                            <img src={img} alt={`Proof ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        ))
                      ) : order.returnImage ? (
                        <a href={order.returnImage} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', textDecoration: 'underline' }}>View Legacy Image</a>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '12px' }}>No Image</span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ 
                      padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '600',
                      background: order.status === 'Return Requested' ? '#fef3c7' : order.status === 'Return Accepted' ? '#dcfce7' : '#fef2f2',
                      color: order.status === 'Return Requested' ? '#92400e' : order.status === 'Return Accepted' ? '#166534' : '#991b1b'
                    }}>
                      {order.adminRejectReason ? 'Rejected' : order.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px' }}>
                    {order.status === 'Return Requested' && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          onClick={() => { setSelectedOrder(order); setActionType('Accept'); }}
                          style={{ background: '#22c55e', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                        >
                          Accept
                        </button>
                        <button 
                          onClick={() => { setSelectedOrder(order); setActionType('Reject'); }}
                          style={{ background: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Action Modal */}
      {selectedOrder && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '400px' }}>
            <h2 style={{ fontSize: '20px', color: 'var(--ink)', marginBottom: '16px' }}>{actionType} Return Request</h2>
            <p style={{ fontSize: '14px', color: '#475569', marginBottom: '20px' }}>
              Are you sure you want to {actionType.toLowerCase()} the return for Order #{selectedOrder._id.substring(selectedOrder._id.length - 6).toUpperCase()}?
            </p>
            
            {actionType === 'Reject' && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Reason for Rejection *</label>
                <textarea 
                  value={adminRejectReason} 
                  onChange={e => setAdminRejectReason(e.target.value)} 
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', minHeight: '80px' }}
                  placeholder="Explain why the return was rejected..."
                ></textarea>
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setSelectedOrder(null)} style={{ flex: 1, padding: '10px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
              <button 
                onClick={handleActionSubmit} 
                style={{ flex: 1, padding: '10px', background: actionType === 'Accept' ? '#22c55e' : '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
              >
                Confirm {actionType}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setPreviewImage(null)}>
          <img src={previewImage} alt="Preview" style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }} />
          <button onClick={() => setPreviewImage(null)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'white', color: 'var(--ink)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', fontSize: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>&times;</button>
        </div>
      )}

    </div>
  );
};

export default Return_Admin;
