import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import ConfirmModal from '../ConfirmModal';

const PERMISSIONS = [
  { key: 'products', label: 'Products' },
  { key: 'categories', label: 'Categories' },
  { key: 'banners', label: 'Banners' },
  { key: 'orders', label: 'Orders' },
  { key: 'returns', label: 'Returns' },
  { key: 'reviews', label: 'Reviews' },
  { key: 'customers', label: 'Customers' },
];

const emptyPermissions = Object.fromEntries(PERMISSIONS.map(p => [p.key, false]));

const emptyForm = { _id: '', name: '', email: '', password: '', role: 'staff', permissions: { ...emptyPermissions } };

const API = `http://${window.location.hostname}:5000/api/admin-team`;

const AdminAccess_Admin = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [confirmObj, setConfirmObj] = useState(null);

  const token = localStorage.getItem('adminToken');
  const currentUser = JSON.parse(localStorage.getItem('adminUser') || 'null');
  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API, authHeaders);
      setUsers(res.data);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  const openDrawer = (user = null) => {
    if (user) {
      setIsEditing(true);
      setFormData({
        _id: user._id,
        name: user.name || '',
        email: user.email,
        password: '',
        role: user.role,
        permissions: { ...emptyPermissions, ...user.permissions },
      });
    } else {
      setIsEditing(false);
      setFormData(emptyForm);
    }
    setIsDrawerOpen(true);
  };

  const togglePermission = (key) => {
    setFormData(prev => ({ ...prev, permissions: { ...prev.permissions, [key]: !prev.permissions[key] } }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return toast.error('Name and email are required');
    if (!isEditing && !formData.password) return toast.error('Password is required for a new user');
    if (formData.password && formData.password.length < 8) return toast.error('Password must be at least 8 characters');

    try {
      if (isEditing) {
        const payload = { name: formData.name, role: formData.role, permissions: formData.permissions };
        if (formData.password) payload.password = formData.password;
        await axios.put(`${API}/${formData._id}`, payload, authHeaders);
        toast.success('Team member updated');
      } else {
        await axios.post(API, formData, authHeaders);
        toast.success('Team member added');
      }
      setIsDrawerOpen(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save team member');
    }
  };

  const handleDelete = (user) => {
    setConfirmObj({
      message: `Remove ${user.name || user.email} from the admin team? They'll immediately lose access.`,
      onConfirm: async () => {
        try {
          await axios.delete(`${API}/${user._id}`, authHeaders);
          toast.success('Team member removed');
          fetchUsers();
        } catch (err) {
          toast.error(err.response?.data?.error || 'Failed to remove team member');
        } finally {
          setConfirmObj(null);
        }
      },
    });
  };

  return (
    <div className="tab-content active">
      <div className="tab-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ margin: 0 }}>Team Access</h3>
        <button onClick={() => openDrawer()} style={{ padding: '10px 18px', background: 'var(--ink)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
          <i className="fa-solid fa-user-plus" style={{ marginRight: '8px' }}></i> Add Team Member
        </button>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
              <th style={{ padding: '14px 20px', fontSize: '13px', color: '#64748b' }}>Name</th>
              <th style={{ padding: '14px 20px', fontSize: '13px', color: '#64748b' }}>Email</th>
              <th style={{ padding: '14px 20px', fontSize: '13px', color: '#64748b' }}>Role</th>
              <th style={{ padding: '14px 20px', fontSize: '13px', color: '#64748b' }}>Access</th>
              <th style={{ padding: '14px 20px', fontSize: '13px', color: '#64748b' }}>Status</th>
              <th style={{ padding: '14px 20px', fontSize: '13px', color: '#64748b' }}></th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={6} style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>Loading...</td></tr>
            )}
            {!loading && users.length === 0 && (
              <tr><td colSpan={6} style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>No team members yet.</td></tr>
            )}
            {users.map(u => (
              <tr key={u._id} style={{ borderTop: '1px solid #f1f5f9' }}>
                <td style={{ padding: '14px 20px', fontWeight: '600' }}>{u.name}</td>
                <td style={{ padding: '14px 20px', color: '#475569' }}>{u.email}</td>
                <td style={{ padding: '14px 20px' }}>
                  <span style={{
                    padding: '4px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: '600',
                    background: u.role === 'owner' ? '#fef3c7' : '#e0e7ff',
                    color: u.role === 'owner' ? '#92400e' : '#3730a3',
                  }}>
                    {u.role === 'owner' ? 'Owner' : 'Staff'}
                  </span>
                </td>
                <td style={{ padding: '14px 20px', fontSize: '13px', color: '#64748b' }}>
                  {u.role === 'owner' ? 'Full access' : (PERMISSIONS.filter(p => u.permissions?.[p.key]).map(p => p.label).join(', ') || 'None')}
                </td>
                <td style={{ padding: '14px 20px' }}>
                  <span style={{ color: u.status === 'active' ? '#16a34a' : '#94a3b8', fontWeight: '600', fontSize: '13px' }}>
                    {u.status === 'active' ? 'Active' : 'Disabled'}
                  </span>
                </td>
                <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                  <button onClick={() => openDrawer(u)} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', marginRight: '12px' }}>
                    <i className="fa-solid fa-pen"></i>
                  </button>
                  {u._id !== currentUser?.id && (
                    <button onClick={() => handleDelete(u)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer' }}>
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isDrawerOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'flex-end', zIndex: 999 }} onClick={() => setIsDrawerOpen(false)}>
          <div style={{ width: '420px', maxWidth: '100%', height: '100%', background: 'white', padding: '30px', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>{isEditing ? 'Edit Team Member' : 'Add Team Member'}</h3>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>Name</label>
                <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>Email</label>
                <input type="email" value={formData.email} disabled={isEditing} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box', background: isEditing ? '#f1f5f9' : 'white' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>
                  {isEditing ? 'New Password (leave blank to keep current)' : 'Password'}
                </label>
                <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="At least 8 characters"
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>Role</label>
                <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box' }}>
                  <option value="staff">Staff (limited access)</option>
                  <option value="owner">Owner (full access)</option>
                </select>
              </div>

              {formData.role === 'staff' && (
                <div>
                  <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '8px' }}>What can this person access?</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {PERMISSIONS.map(p => (
                      <label key={p.key} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
                        <input type="checkbox" checked={!!formData.permissions[p.key]} onChange={() => togglePermission(p.key)} />
                        {p.label}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsDrawerOpen(false)} style={{ flex: 1, padding: '12px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                  Cancel
                </button>
                <button type="submit" style={{ flex: 1, padding: '12px', background: 'var(--ink)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                  {isEditing ? 'Save Changes' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!confirmObj}
        message={confirmObj?.message}
        onConfirm={confirmObj?.onConfirm}
        onCancel={() => setConfirmObj(null)}
        confirmText="Remove"
      />
    </div>
  );
};

export default AdminAccess_Admin;
