import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import toast from 'react-hot-toast';
import ConfirmModal from '../ConfirmModal';

const Order_Admin = ({ setActiveTab }) => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'today', 'this_month'
  const [selectedOrderHistory, setSelectedOrderHistory] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, orderId: null, newStatus: null });
  const [confirmObj, setConfirmObj] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      // Mock admin token usage
      const res = await axios.get(`http://${window.location.hostname}:5000/api/orders/admin/all`);
      setOrders(res.data);
      setFilteredOrders(res.data);
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    applyFilter(filter);
  }, [filter, orders]);

  const applyFilter = (filterType) => {
    const now = new Date();
    if (filterType === 'today') {
      setFilteredOrders(orders.filter(o => {
        const d = new Date(o.createdAt);
        return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }));
    } else if (filterType === 'this_month') {
      setFilteredOrders(orders.filter(o => {
        const d = new Date(o.createdAt);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }));
    } else {
      setFilteredOrders(orders);
    }
  };

  const handleStatusChangeClick = (orderId, newStatus) => {
    setConfirmModal({ isOpen: true, orderId, newStatus });
  };

  const confirmStatusUpdate = async () => {
    if (!confirmModal.orderId || !confirmModal.newStatus) return;
    try {
      await axios.put(`http://${window.location.hostname}:5000/api/orders/admin/${confirmModal.orderId}/status`, { status: confirmModal.newStatus });
      fetchOrders(); // Refresh to get updated history
      setConfirmModal({ isOpen: false, orderId: null, newStatus: null });
      setConfirmModal({ isOpen: false, orderId: null, newStatus: null });
      toast.success("Order status updated successfully!");
    } catch (err) {
      console.error("Failed to update status", err);
      toast.error("Failed to update status");
      setConfirmModal({ isOpen: false, orderId: null, newStatus: null });
    }
  };

  const handleDeleteOrder = (orderId) => {
    setConfirmObj({
      message: "Are you sure you want to completely delete this order? This action cannot be undone.",
      onConfirm: async () => {
        try {
          await axios.delete(`http://${window.location.hostname}:5000/api/orders/admin/${orderId}`);
          fetchOrders();
          toast.success("Order deleted successfully");
        } catch (err) {
          console.error("Failed to delete order", err);
          toast.error("Failed to delete order");
        }
        setConfirmObj(null);
      }
    });
  };

  const formatPrice = (price) => '₹' + Number(price).toLocaleString('en-IN');
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  // Analytics Calculations
  const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalOrders = filteredOrders.length;
  
  // Dynamic Pie Data Calculation
  const categoryCounts = {};
  filteredOrders.forEach(o => {
    if (o.items && o.items.length > 0) {
      o.items.forEach(item => {
        const catName = item.product?.category?.name || item.product?.category || 'General';
        const finalName = typeof catName === 'object' ? (catName.name || 'General') : catName;
        categoryCounts[finalName] = (categoryCounts[finalName] || 0) + item.quantity;
      });
    }
  });
  
  const pieData = Object.keys(categoryCounts).length > 0 
    ? Object.keys(categoryCounts).map(key => ({ name: key, value: categoryCounts[key] }))
    : [{ name: 'No Data', value: 1 }];
    
  const PIE_COLORS = ['#ea580c', '#3b82f6', '#eab308', '#22c55e', '#a855f7', '#ec4899'];

  // Dynamic Bar Data (Last 6 months)
  const monthlyData = Array(6).fill(0).map((_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    return { name: d.toLocaleString('default', { month: 'short' }), orders: 0 };
  });

  filteredOrders.forEach(o => {
    const d = new Date(o.createdAt);
    const monthName = d.toLocaleString('default', { month: 'short' });
    const monthIndex = monthlyData.findIndex(m => m.name === monthName);
    if (monthIndex > -1) {
      monthlyData[monthIndex].orders += 1;
    }
  });

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', color: '#1e293b' }}>Order Management</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
          >
            <option value="all">All Orders</option>
            <option value="today">Today</option>
            <option value="this_month">This Month</option>
          </select>
        </div>
      </div>

      {/* Analytics Dashboard */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        
        {/* Summary Cards */}
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', borderLeft: '4px solid var(--rust)' }}>
            <h3 style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>Total Revenue ({filter})</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--ink)' }}>{formatPrice(totalRevenue)}</p>
          </div>
          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
            <h3 style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>Total Orders ({filter})</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--ink)' }}>{totalOrders}</p>
          </div>
        </div>

        {/* Dynamic Bar Chart (Monthly Orders) */}
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '16px', color: '#1e293b', marginBottom: '16px' }}>Monthly Orders Overview</h3>
          <div style={{ height: '170px', width: '100%' }}>
            <ResponsiveContainer>
              <BarChart data={monthlyData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                <RechartsTooltip cursor={{fill: '#f1f5f9'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}/>
                <Bar dataKey="orders" fill="#ea580c" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dynamic Pie Chart (Trending) */}
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h3 style={{ fontSize: '16px', color: '#1e293b', marginBottom: '16px', alignSelf: 'flex-start' }}>Sales Distribution</h3>
          <div style={{ height: '140px', width: '100%' }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={2} dataKey="value">
                  {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                </Pie>
                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', gap: '8px', fontSize: '10px', color: '#475569', flexWrap: 'wrap', justifyContent: 'center', marginTop: '10px' }}>
            {pieData.map((entry, index) => (
              <span key={index} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '8px', height: '8px', background: PIE_COLORS[index % PIE_COLORS.length], borderRadius: '50%' }}></div>
                {entry.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
          <thead style={{ background: '#f8fafc', color: '#475569', fontSize: '14px' }}>
            <tr>
              <th style={{ padding: '16px', borderBottom: '1px solid #e2e8f0' }}>Order ID</th>
              <th style={{ padding: '16px', borderBottom: '1px solid #e2e8f0' }}>Customer</th>
              <th style={{ padding: '16px', borderBottom: '1px solid #e2e8f0' }}>Date</th>
              <th style={{ padding: '16px', borderBottom: '1px solid #e2e8f0' }}>Products</th>
              <th style={{ padding: '16px', borderBottom: '1px solid #e2e8f0' }}>Total Amount</th>
              <th style={{ padding: '16px', borderBottom: '1px solid #e2e8f0' }}>Status</th>
              <th style={{ padding: '16px', borderBottom: '1px solid #e2e8f0' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{ padding: '20px', textAlign: 'center' }}>Loading orders...</td></tr>
            ) : filteredOrders.length === 0 ? (
              <tr><td colSpan="7" style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>No orders found for this period.</td></tr>
            ) : (
              filteredOrders.map(order => (
                <tr key={order._id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '14px' }}>
                  <td style={{ padding: '16px', color: '#3b82f6', fontWeight: '500' }}>#{order._id.substring(order._id.length - 6).toUpperCase()}</td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontWeight: '500', color: 'var(--ink)' }}>{order.customer?.name || 'Unknown'}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{order.customer?.phone || ''}</div>
                  </td>
                  <td style={{ padding: '16px', color: '#475569' }}>{formatDate(order.createdAt)}</td>
                  <td style={{ padding: '16px', maxWidth: '250px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {order.items?.map((item, idx) => (
                        <div 
                          key={idx} 
                          onClick={() => {
                            if (setActiveTab) {
                              setActiveTab('products');
                            }
                          }}
                          style={{ fontSize: '12px', color: '#3b82f6', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', cursor: 'pointer', textDecoration: 'underline' }} 
                          title={`View Product: ${item.product?.name || 'Unknown'}`}
                        >
                          <span style={{ fontWeight: '600', color: 'var(--ink)', textDecoration: 'none', display: 'inline-block', marginRight: '4px' }}>{item.quantity}x</span> 
                          {item.product?.name || 'Unknown Product'}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: '16px', fontWeight: '600', color: 'var(--ink)' }}>{formatPrice(order.totalAmount)}</td>
                  <td style={{ padding: '16px' }}>
                    <select 
                      value={order.status}
                      onChange={(e) => handleStatusChangeClick(order._id, e.target.value)}
                      style={{ 
                        padding: '6px 12px', borderRadius: '20px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '13px', fontWeight: '500',
                        background: order.status === 'Delivered' ? '#dcfce7' : order.status === 'Shipped' ? '#dbeafe' : order.status === 'Return Requested' ? '#fee2e2' : '#f8fafc',
                        color: order.status === 'Delivered' ? '#166534' : order.status === 'Shipped' ? '#1e40af' : order.status === 'Return Requested' ? '#991b1b' : '#334155'
                      }}
                    >
                      <option value="Processing">Processing</option>
                      <option value="Dispatched">Dispatched</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Return Requested">Return Requested</option>
                      <option value="Return Accepted">Return Accepted</option>
                      <option value="Returned">Returned</option>
                    </select>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => setSelectedOrderHistory(order)}
                        style={{ background: '#f1f5f9', color: '#475569', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}
                      >
                        View History
                      </button>
                      <button 
                        onClick={() => handleDeleteOrder(order._id)}
                        style={{ background: '#fee2e2', color: '#991b1b', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* History Modal */}
      {selectedOrderHistory && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '500px', maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', color: 'var(--ink)' }}>Order History</h2>
              <button onClick={() => setSelectedOrderHistory(null)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>&times;</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
              <div style={{ position: 'absolute', left: '15px', top: '10px', bottom: '10px', width: '2px', background: '#e2e8f0', zIndex: 0 }}></div>
              {selectedOrderHistory.statusHistory.map((historyItem, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
                  <div style={{ width: '32px', height: '32px', background: 'white', border: '2px solid var(--rust)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <div style={{ width: '12px', height: '12px', background: 'var(--rust)', borderRadius: '50%' }}></div>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', flex: 1, border: '1px solid #e2e8f0' }}>
                    <div style={{ fontWeight: '600', color: 'var(--ink)' }}>{historyItem.status}</div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>{formatDate(historyItem.date)}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>Ordered Items (Packing List)</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {selectedOrderHistory.items.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'center', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <img 
                      src={item.product?.imgUrls && item.product.imgUrls.length > 0 ? item.product.imgUrls[0] : item.product?.img} 
                      alt={item.product?.name} 
                      style={{ width: '50px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} 
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '500', fontSize: '14px', color: 'var(--ink)' }}>{item.product?.name || 'Unknown Product'}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>Qty: {item.quantity} × {formatPrice(item.price)}</div>
                    </div>
                    <div style={{ fontWeight: '600', fontSize: '14px', color: 'var(--ink)' }}>
                      {formatPrice(item.quantity * item.price)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>Delivery Address</h3>
              <p style={{ fontSize: '14px', color: '#475569' }}>
                {selectedOrderHistory.shippingAddress.name} ({selectedOrderHistory.shippingAddress.phone})<br/>
                {selectedOrderHistory.shippingAddress.street}, {selectedOrderHistory.shippingAddress.city}<br/>
                {selectedOrderHistory.shippingAddress.state} - {selectedOrderHistory.shippingAddress.pincode}
              </p>
            </div>
            
            <div style={{ marginTop: '24px', width: '100%' }}>
               <button onClick={() => setSelectedOrderHistory(null)} style={{ width: '100%', padding: '12px', background: 'var(--ink)', color: 'white', borderRadius: '8px', cursor: 'pointer', border: 'none', fontWeight: '600' }}>Close Modal</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal 
        isOpen={!!confirmObj} 
        message={confirmObj?.message} 
        onConfirm={confirmObj?.onConfirm} 
        onCancel={() => setConfirmObj(null)} 
      />

      {/* Custom Confirmation Modal */}
      {confirmModal.isOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '30px', width: '100%', maxWidth: '400px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', animation: 'slideUp 0.3s ease-out' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', marginBottom: '20px' }}>
                <i className="fa-solid fa-triangle-exclamation"></i>
              </div>
              <h3 style={{ fontSize: '18px', color: 'var(--ink)', marginBottom: '10px' }}>Update Order Status</h3>
              <p style={{ color: '#64748b', fontSize: '15px', marginBottom: '24px', lineHeight: '1.5' }}>
                Are you sure you want to update the status to <strong style={{ color: 'var(--ink)' }}>{confirmModal.newStatus}</strong>?
              </p>
              <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                <button 
                  onClick={() => setConfirmModal({ isOpen: false, orderId: null, newStatus: null })}
                  style={{ flex: 1, padding: '12px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#475569', fontWeight: '600', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmStatusUpdate}
                  style={{ flex: 1, padding: '12px', background: 'var(--rust)', border: 'none', borderRadius: '8px', color: 'white', fontWeight: '600', cursor: 'pointer' }}
                >
                  Yes, Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Order_Admin;
