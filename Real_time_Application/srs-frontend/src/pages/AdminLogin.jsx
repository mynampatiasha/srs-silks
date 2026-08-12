import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`http://${window.location.hostname}:5000/api/admin/login`, { email, password });
      if (res.data.success) {
        localStorage.setItem('adminToken', res.data.token);
        localStorage.setItem('adminUser', JSON.stringify(res.data.user));
        navigate('/admin/dashboard');
      }
    } catch (err) {
      setError('Invalid Email or Password');
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)',
      padding: '20px'
    }}>
      <div style={{ 
        background: '#ffffff', 
        width: '100%', 
        maxWidth: '400px', 
        padding: '40px', 
        borderRadius: '16px', 
        boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
        textAlign: 'center'
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          background: '#d4b896',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px auto',
          color: 'white',
          fontSize: '24px'
        }}>
          <i className="fa-solid fa-lock"></i>
        </div>
        <h2 style={{ margin: '0 0 10px 0', color: '#333', fontFamily: '"Cormorant Garamond", serif', fontSize: '28px' }}>SRS Admin Portal</h2>
        <p style={{ color: '#666', marginBottom: '30px', fontSize: '14px' }}>Please log in to manage your inventory.</p>
        
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ textAlign: 'left' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#555', fontWeight: '500' }}>Email Address</label>
            <input 
              type="email" 
              placeholder="admin@srs.in" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '12px 15px', fontSize: '16px', border: '1px solid #ddd', borderRadius: '8px', boxSizing: 'border-box', transition: 'border-color 0.3s' }}
            />
          </div>
          <div style={{ textAlign: 'left' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#555', fontWeight: '500' }}>Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '12px 15px', fontSize: '16px', border: '1px solid #ddd', borderRadius: '8px', boxSizing: 'border-box', transition: 'border-color 0.3s' }}
            />
          </div>
          
          {error && <div style={{ color: '#d32f2f', fontSize: '14px', background: '#ffebee', padding: '10px', borderRadius: '6px' }}>{error}</div>}
          
          <button type="submit" style={{ 
            padding: '14px', 
            background: '#333', 
            color: 'white', 
            border: 'none', 
            borderRadius: '8px', 
            cursor: 'pointer', 
            fontWeight: '600',
            fontSize: '16px',
            marginTop: '10px',
            transition: 'background 0.3s'
          }}
          onMouseOver={(e) => e.target.style.background = '#000'}
          onMouseOut={(e) => e.target.style.background = '#333'}
          >
            Secure Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
