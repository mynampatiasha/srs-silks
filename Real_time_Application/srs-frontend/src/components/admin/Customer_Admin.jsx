import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const Customer_Admin = () => {
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const base = `http://${window.location.hostname}:5000`;
      const res = await axios.get(`${base}/api/users?search=${searchTerm}&sortBy=${sortBy}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const base = `http://${window.location.hostname}:5000`;
      const res = await axios.get(`${base}/api/users/analytics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnalytics(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchUsers(), fetchAnalytics()]);
      setIsLoading(false);
    };
    loadData();
  }, [searchTerm, sortBy]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this customer?")) return;
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`http://${window.location.hostname}:5000/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  // Chart Data
  const barData = analytics ? [
    { name: 'Last Month', users: analytics.lastMonthUsers },
    { name: 'This Month', users: analytics.thisMonthUsers }
  ] : [];

  const pieData = analytics ? [
    { name: 'Active (30d)', value: analytics.activeUsers },
    { name: 'Inactive', value: analytics.inactiveUsers }
  ] : [];
  const COLORS = ['#4338ca', '#94a3b8'];

  return (
    <div className="admin-content">
      <div className="admin-header">
        <h1>Customers & Analytics</h1>
      </div>

      {isLoading && !analytics ? <p>Loading data...</p> : (
        <>
          {/* Analytics Section */}
          <div className="analytics-dashboard" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '40px' }}>
            <div className="stat-card" style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <h3 style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>Total Registered Customers</h3>
              <div style={{ fontSize: '36px', fontWeight: '700', color: '#1e293b' }}>{analytics?.totalUsers || 0}</div>
            </div>

            <div className="chart-card" style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '14px', color: '#64748b', marginBottom: '16px', textAlign: 'center' }}>User Growth (Registrations)</h3>
              <div style={{ height: '200px', width: '100%' }}>
                <ResponsiveContainer>
                  <BarChart data={barData}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}/>
                    <Bar dataKey="users" fill="#4338ca" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="chart-card" style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '14px', color: '#64748b', marginBottom: '16px', textAlign: 'center' }}>User Activity (Last 30 Days)</h3>
              <div style={{ height: '200px', width: '100%' }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '10px' }}>
                <span style={{ fontSize: '12px', color: '#64748b' }}><span style={{ display: 'inline-block', width: '8px', height: '8px', background: '#4338ca', borderRadius: '50%', marginRight: '4px'}}></span>Active</span>
                <span style={{ fontSize: '12px', color: '#64748b' }}><span style={{ display: 'inline-block', width: '8px', height: '8px', background: '#94a3b8', borderRadius: '50%', marginRight: '4px'}}></span>Inactive</span>
              </div>
            </div>
          </div>

          {/* Filters & View Toggles */}
          <div className="admin-filters" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <input 
                type="text" 
                placeholder="Search by name or email..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ padding: '10px 16px', border: '1px solid #e2e8f0', borderRadius: '8px', width: '280px' }}
              />
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ padding: '10px 16px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name">Sort by Name</option>
                <option value="lastLogin">Recent Logins</option>
              </select>
            </div>
            
            <div className="view-toggles" style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '8px' }}>
              <button 
                onClick={() => setViewMode('table')} 
                style={{ padding: '6px 12px', border: 'none', background: viewMode === 'table' ? '#fff' : 'transparent', borderRadius: '4px', boxShadow: viewMode === 'table' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', cursor: 'pointer', color: viewMode === 'table' ? '#1e293b' : '#64748b' }}
              ><i className="fa-solid fa-list"></i> Table</button>
              <button 
                onClick={() => setViewMode('grid')} 
                style={{ padding: '6px 12px', border: 'none', background: viewMode === 'grid' ? '#fff' : 'transparent', borderRadius: '4px', boxShadow: viewMode === 'grid' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', cursor: 'pointer', color: viewMode === 'grid' ? '#1e293b' : '#64748b' }}
              ><i className="fa-solid fa-border-all"></i> Grid</button>
            </div>
          </div>

          {/* User List */}
          {users.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No customers found.</div>
          ) : viewMode === 'table' ? (
            <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                <thead style={{ background: '#f8fafc', color: '#475569', fontSize: '14px' }}>
                  <tr>
                    <th style={{ padding: '16px', borderBottom: '1px solid #e2e8f0' }}>Name</th>
                    <th style={{ padding: '16px', borderBottom: '1px solid #e2e8f0' }}>Email</th>
                    <th style={{ padding: '16px', borderBottom: '1px solid #e2e8f0' }}>Registered On</th>
                    <th style={{ padding: '16px', borderBottom: '1px solid #e2e8f0' }}>Last Login</th>
                    <th style={{ padding: '16px', borderBottom: '1px solid #e2e8f0' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '14px' }}>
                      <td style={{ padding: '16px', fontWeight: '500', color: 'var(--ink)' }}>
                        {u.name}
                        {u.authProvider === 'google' && (
                          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: '14px', height: '14px', marginLeft: '8px', verticalAlign: 'middle' }} title="Signed in with Google" />
                        )}
                      </td>
                      <td style={{ padding: '16px', color: '#475569' }}>{u.email}</td>
                      <td style={{ padding: '16px', color: '#475569' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td style={{ padding: '16px', color: '#475569' }}>{u.lastLogin ? new Date(u.lastLogin).toLocaleString() : 'Never'}</td>
                      <td style={{ padding: '16px' }}>
                        <button onClick={() => handleDelete(u._id)} style={{ background: '#fee2e2', color: '#b91c1c', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '500' }}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
              {users.map(u => (
                <div key={u._id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#e0e7ff', color: '#4338ca', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 600, marginBottom: '16px' }}>
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                  <h3 style={{ fontSize: '16px', margin: '0 0 4px', color: '#1e293b' }}>{u.name}</h3>
                  <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>{u.email}</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span>Registered: {new Date(u.createdAt).toLocaleDateString()}</span>
                    <span>Last Login: {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never'}</span>
                  </div>
                  <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f1f5f9', textAlign: 'right' }}>
                    <button onClick={() => handleDelete(u._id)} style={{ background: 'transparent', color: '#ef4444', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}>Delete User</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Customer_Admin;
