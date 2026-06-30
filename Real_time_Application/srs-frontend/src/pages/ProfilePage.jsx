import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const [cartCount, setCartCount] = useState(0);
  const [profile, setProfile] = useState({ name: '', email: '', phone: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', phone: '' });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const savedCart = localStorage.getItem('srs_cart');
    if (savedCart) {
      setCartCount(JSON.parse(savedCart).length);
    }

    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('srs_customer_token');
        if (!token) {
          navigate('/?login=true');
          return;
        }
        
        const base = `http://${window.location.hostname}:5000`;
        const res = await axios.get(`${base}/api/customer/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setProfile({
          name: res.data.name || '',
          email: res.data.email || '',
          phone: res.data.phone || ''
        });
        setEditForm({
          name: res.data.name || '',
          phone: res.data.phone || ''
        });
      } catch (err) {
        console.error("Failed to fetch profile", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('srs_customer_token');
      const base = `http://${window.location.hostname}:5000`;
      const res = await axios.put(`${base}/api/customer/profile`, editForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data.success) {
        setProfile(res.data.user);
        setIsEditing(false);
        // update token in localstorage
        localStorage.setItem('srs_customer_token', res.data.token);
        localStorage.setItem('srs_customer', JSON.stringify(res.data.user));
        toast.success('Profile updated successfully!');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to update profile');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords don't match!");
      return;
    }
    
    try {
      const token = localStorage.getItem('srs_customer_token');
      const base = `http://${window.location.hostname}:5000`;
      const res = await axios.put(`${base}/api/customer/change-password`, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data.success) {
        setIsChangingPassword(false);
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        toast.success('Password changed successfully!');
      }
    } catch (err) {
      setPasswordError(err.response?.data?.error || 'Failed to change password');
    }
  };

  return (
    <>
      <Navbar cartCount={cartCount} onCartClick={() => navigate('/cart')} />
      <div style={{ minHeight: '80vh', maxWidth: '800px', margin: '0 auto', padding: '40px 20px 40px' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', color: 'var(--ink)', marginBottom: '30px' }}>My Profile</h1>
        
        {isLoading ? (
          <p>Loading profile...</p>
        ) : (
          <div style={{ background: 'white', borderRadius: '12px', padding: '30px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--rust)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: '600' }}>
                {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <h2 style={{ fontSize: '24px', color: 'var(--ink)', margin: '0 0 5px 0' }}>{profile.name}</h2>
                <p style={{ color: '#64748b', margin: 0 }}>{profile.email}</p>
              </div>
            </div>

            {isEditing ? (
              <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#475569', marginBottom: '8px' }}>Full Name</label>
                  <input 
                    type="text" 
                    value={editForm.name} 
                    onChange={e => setEditForm({...editForm, name: e.target.value})} 
                    style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1' }} 
                    required 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#475569', marginBottom: '8px' }}>Email Address (Cannot be changed)</label>
                  <input 
                    type="email" 
                    value={profile.email} 
                    disabled 
                    style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#94a3b8' }} 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#475569', marginBottom: '8px' }}>Phone Number</label>
                  <input 
                    type="tel" 
                    value={editForm.phone} 
                    onChange={e => setEditForm({...editForm, phone: e.target.value})} 
                    style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1' }} 
                    required 
                  />
                </div>
                <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                  <button type="button" onClick={() => { setIsEditing(false); setEditForm({name: profile.name, phone: profile.phone}); }} style={{ flex: 1, padding: '12px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#475569', fontWeight: '500', cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" style={{ flex: 1, padding: '12px', background: 'var(--rust)', border: 'none', borderRadius: '6px', color: 'white', fontWeight: '600', cursor: 'pointer' }}>Save Changes</button>
                </div>
              </form>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', background: '#f8fafc', borderRadius: '8px' }}>
                  <div style={{ color: '#64748b', fontSize: '14px' }}>Phone Number</div>
                  <div style={{ color: 'var(--ink)', fontWeight: '500' }}>{profile.phone || 'Not provided'}</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', background: '#f8fafc', borderRadius: '8px' }}>
                  <div style={{ color: '#64748b', fontSize: '14px' }}>Password</div>
                  <div style={{ color: 'var(--ink)', fontWeight: '500' }}>••••••••</div>
                </div>
                
                <div style={{ display: 'flex', gap: '15px' }}>
                  <button 
                    onClick={() => setIsEditing(true)} 
                    style={{ flex: 1, marginTop: '10px', padding: '12px', background: 'white', border: '1px solid var(--rust)', color: 'var(--rust)', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
                  >
                    <i className="fa-regular fa-pen-to-square"></i> Edit Profile
                  </button>
                  <button 
                    onClick={() => setIsChangingPassword(true)} 
                    style={{ flex: 1, marginTop: '10px', padding: '12px', background: 'white', border: '1px solid #475569', color: '#475569', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
                  >
                    <i className="fa-solid fa-lock"></i> Change Password
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Change Password Modal */}
      {isChangingPassword && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '12px', width: '100%', maxWidth: '400px' }}>
            <h2 style={{ fontSize: '20px', color: 'var(--ink)', marginBottom: '20px' }}>Change Password</h2>
            {passwordError && <div style={{ color: '#dc2626', background: '#fef2f2', padding: '10px', borderRadius: '6px', fontSize: '14px', marginBottom: '15px', border: '1px solid #fecaca' }}>{passwordError}</div>}
            
            <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#475569', marginBottom: '8px' }}>Current Password</label>
                <input 
                  type="password" 
                  value={passwordForm.currentPassword} 
                  onChange={e => setPasswordForm({...passwordForm, currentPassword: e.target.value})} 
                  style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1' }} 
                  required 
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#475569', marginBottom: '8px' }}>New Password</label>
                <input 
                  type="password" 
                  value={passwordForm.newPassword} 
                  onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})} 
                  style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1' }} 
                  required 
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#475569', marginBottom: '8px' }}>Confirm New Password</label>
                <input 
                  type="password" 
                  value={passwordForm.confirmPassword} 
                  onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})} 
                  style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1' }} 
                  required 
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button type="button" onClick={() => { setIsChangingPassword(false); setPasswordError(''); setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' }); }} style={{ flex: 1, padding: '12px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#475569', fontWeight: '500', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '12px', background: 'var(--ink)', border: 'none', borderRadius: '6px', color: 'white', fontWeight: '600', cursor: 'pointer' }}>Update Password</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfilePage;
