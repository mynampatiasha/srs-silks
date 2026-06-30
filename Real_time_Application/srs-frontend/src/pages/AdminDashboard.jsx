import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Product_Admin from '../components/admin/Product_Admin';
import Category_Admin from '../components/admin/Category_Admin';
import Banner_Admin from '../components/admin/Banner_Admin';
import Customer_Admin from '../components/admin/Customer_Admin';
import Order_Admin from '../components/admin/Order_Admin';
import Return_Admin from '../components/admin/Return_Admin';
import Review_Admin from '../components/admin/Review_Admin';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [lowStockProducts, setLowStockProducts] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin');
      return;
    }

    const fetchLowStock = async () => {
      try {
        const res = await axios.get(`http://${window.location.hostname}:5000/api/products`);
        const lowStock = res.data.filter(p => p.stockQuantity !== undefined && p.stockQuantity <= 2);
        setLowStockProducts(lowStock);
      } catch (err) {
        console.error("Failed to fetch low stock", err);
      }
    };
    fetchLowStock();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'products': return <Product_Admin />;
      case 'categories': return <Category_Admin />;
      case 'banners': return <Banner_Admin />;
      case 'customers': return <Customer_Admin />;
      case 'orders': return <Order_Admin setActiveTab={setActiveTab} />;
      case 'returns': return <Return_Admin />;
      case 'reviews': return <Review_Admin />;
      default:
        return (
          <div className="tab-content active" id="tab-dashboard">
            <div className="tab-header" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
              <button className="hamburger-menu" onClick={() => setIsSidebarOpen(true)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>
                <i className="fa-solid fa-bars" style={{ color: '#333' }}></i>
              </button>
              <h3 style={{ margin: 0 }}>Admin Dashboard</h3>
            </div>
            <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', marginBottom: '20px' }}>
              <h2>Welcome back, Admin!</h2>
              <p style={{ color: '#666', marginTop: '10px' }}>Select an option from the sidebar to manage your store content.</p>
            </div>

            {/* LOW STOCK ALERT */}
            {lowStockProducts.length > 0 && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
                <h3 style={{ color: '#991b1b', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="fa-solid fa-triangle-exclamation"></i> Low Stock Alerts
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '12px' }}>
                  {lowStockProducts.map(p => (
                    <div key={p._id} style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid #fca5a5', display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <img src={p.imgUrls && p.imgUrls.length > 0 ? p.imgUrls[0] : p.img} alt={p.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: '600', color: 'var(--ink)', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                        <div style={{ color: p.stockQuantity <= 1 ? '#dc2626' : '#d97706', fontSize: '13px', marginTop: '2px', fontWeight: '600' }}>
                          {p.stockQuantity <= 1 ? 'Out of Stock' : `Only ${p.stockQuantity} left`}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="admin-layout" style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9' }}>
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', zIndex: 998 }}
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`} style={{ width: '250px', background: '#1e293b', color: 'white', display: 'flex', flexDirection: 'column' }}>
        <div className="sidebar-header" style={{ padding: '20px', textAlign: 'center', borderBottom: '1px solid #334155', position: 'relative' }}>
          <h2 style={{ color: '#d4b896', margin: 0, fontFamily: 'serif', fontSize: '24px' }}>SRS Admin</h2>
          {isSidebarOpen && (
            <button onClick={() => setIsSidebarOpen(false)} style={{ position: 'absolute', right: '15px', top: '22px', background: 'none', border: 'none', color: 'white', fontSize: '20px', cursor: 'pointer' }}>
              <i className="fa-solid fa-times"></i>
            </button>
          )}
        </div>
        
        <nav style={{ flex: 1, padding: '20px 0' }}>
          <a href="#" className={activeTab === 'dashboard' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveTab('dashboard'); setIsSidebarOpen(false); }} style={{ display: 'block', padding: '15px 25px', color: activeTab === 'dashboard' ? 'white' : '#94a3b8', background: activeTab === 'dashboard' ? '#334155' : 'transparent', textDecoration: 'none' }}>
            <i className="fa-solid fa-chart-pie" style={{ width: '25px' }}></i> Dashboard
          </a>
          <a href="#" className={activeTab === 'orders' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveTab('orders'); setIsSidebarOpen(false); }} style={{ display: 'block', padding: '15px 25px', color: activeTab === 'orders' ? 'white' : '#94a3b8', background: activeTab === 'orders' ? '#334155' : 'transparent', textDecoration: 'none' }}>
            <i className="fa-solid fa-cart-shopping" style={{ width: '25px' }}></i> Orders
          </a>
          <a href="#" className={activeTab === 'returns' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveTab('returns'); setIsSidebarOpen(false); }} style={{ display: 'block', padding: '15px 25px', color: activeTab === 'returns' ? 'white' : '#94a3b8', background: activeTab === 'returns' ? '#334155' : 'transparent', textDecoration: 'none' }}>
            <i className="fa-solid fa-arrow-rotate-left" style={{ width: '25px' }}></i> Returns
          </a>
          <a href="#" className={activeTab === 'reviews' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveTab('reviews'); setIsSidebarOpen(false); }} style={{ display: 'block', padding: '15px 25px', color: activeTab === 'reviews' ? 'white' : '#94a3b8', background: activeTab === 'reviews' ? '#334155' : 'transparent', textDecoration: 'none' }}>
            <i className="fa-solid fa-star" style={{ width: '25px' }}></i> Reviews
          </a>
          <a href="#" className={activeTab === 'products' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveTab('products'); setIsSidebarOpen(false); }} style={{ display: 'block', padding: '15px 25px', color: activeTab === 'products' ? 'white' : '#94a3b8', background: activeTab === 'products' ? '#334155' : 'transparent', textDecoration: 'none' }}>
            <i className="fa-solid fa-box" style={{ width: '25px' }}></i> Products
          </a>
          <a href="#" className={activeTab === 'categories' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveTab('categories'); setIsSidebarOpen(false); }} style={{ display: 'block', padding: '15px 25px', color: activeTab === 'categories' ? 'white' : '#94a3b8', background: activeTab === 'categories' ? '#334155' : 'transparent', textDecoration: 'none' }}>
            <i className="fa-solid fa-tags" style={{ width: '25px' }}></i> Categories
          </a>
          <a href="#" className={activeTab === 'banners' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveTab('banners'); setIsSidebarOpen(false); }} style={{ display: 'block', padding: '15px 25px', color: activeTab === 'banners' ? 'white' : '#94a3b8', background: activeTab === 'banners' ? '#334155' : 'transparent', textDecoration: 'none' }}>
            <i className="fa-solid fa-image" style={{ width: '25px' }}></i> Banners
          </a>
          <a href="#" className={activeTab === 'customers' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveTab('customers'); setIsSidebarOpen(false); }} style={{ display: 'block', padding: '15px 25px', color: activeTab === 'customers' ? 'white' : '#94a3b8', background: activeTab === 'customers' ? '#334155' : 'transparent', textDecoration: 'none' }}>
            <i className="fa-solid fa-users" style={{ width: '25px' }}></i> Customers
          </a>
        </nav>
        <div className="sidebar-footer" style={{ padding: '20px', borderTop: '1px solid #334155' }}>
          <button onClick={handleLogout} style={{ width: '100%', padding: '10px', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', textAlign: 'left', fontWeight: 'bold' }}>
            <i className="fa-solid fa-sign-out-alt" style={{ width: '25px' }}></i> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-content" style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
        {renderContent()}
      </main>
    </div>
  );
};

export default AdminDashboard;
