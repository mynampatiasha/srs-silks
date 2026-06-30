import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import ConfirmModal from '../components/ConfirmModal';

const AddressesPage = () => {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: '', phone: '', street: '', city: '', state: '', pincode: '', type: 'Home'
  });
  const [isLocating, setIsLocating] = useState(false);
  const [confirmObj, setConfirmObj] = useState(null);

  const captureLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        if (res.data && res.data.address) {
          const addr = res.data.address;
          setNewAddress(prev => ({
            ...prev,
            street: addr.road || addr.suburb || addr.neighbourhood || '',
            city: addr.city || addr.town || addr.village || addr.county || '',
            state: addr.state || '',
            pincode: addr.postcode || ''
          }));
        }
      } catch (err) {
        console.error("Error fetching location details", err);
        toast.error("Could not fetch address details automatically.");
      } finally {
        setIsLocating(false);
      }
    }, () => {
      toast.error("Unable to retrieve your location. Please allow location access.");
      setIsLocating(false);
    });
  };

  // Check auth and fetch addresses
  useEffect(() => {
    const token = localStorage.getItem('srs_customer_token');
    if (!token) {
      navigate('/');
      return;
    }

    const fetchAddresses = async () => {
      try {
        const base = `http://${window.location.hostname}:5000`;
        const res = await axios.get(`${base}/api/customer/addresses`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAddresses(res.data);
      } catch (err) {
        console.error("Error fetching addresses", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAddresses();
  }, [navigate]);

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!newAddress.name || !newAddress.phone || !newAddress.street || !newAddress.city || !newAddress.state || !newAddress.pincode) {
      toast.error("Please fill all required address fields");
      return;
    }
    
    try {
      const token = localStorage.getItem('srs_customer_token');
      const base = `http://${window.location.hostname}:5000`;
      const res = await axios.post(`${base}/api/customer/addresses`, newAddress, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAddresses(res.data);
      setIsAddingNew(false);
      setNewAddress({ name: '', phone: '', street: '', city: '', state: '', pincode: '', type: 'Home' });
    } catch (err) {
      console.error(err);
      toast.error("Error saving address");
    }
  };

  const handleDeleteAddress = (id) => {
    setConfirmObj({
      message: "Are you sure you want to delete this address?",
      onConfirm: async () => {
        try {
          const token = localStorage.getItem('srs_customer_token');
          const base = `http://${window.location.hostname}:5000`;
          const res = await axios.delete(`${base}/api/customer/addresses/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setAddresses(res.data);
          toast.success("Address deleted successfully");
        } catch (err) {
          console.error(err);
          toast.error("Error deleting address");
        }
        setConfirmObj(null);
      }
    });
  };

  return (
    <>
      <ConfirmModal 
        isOpen={!!confirmObj} 
        message={confirmObj?.message} 
        onConfirm={confirmObj?.onConfirm} 
        onCancel={() => setConfirmObj(null)} 
      />
      <Navbar cartCount={0} onCartClick={() => navigate('/cart')} />
      <div style={{ minHeight: '80vh', maxWidth: '1000px', margin: '0 auto', padding: '40px 20px 40px' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', color: 'var(--ink)', marginBottom: '30px' }}>Manage Addresses</h1>
        
        {loading ? (
          <p style={{ color: '#64748b' }}>Loading addresses...</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            
            {/* Add New Address Card */}
            <div 
              onClick={() => setIsAddingNew(true)}
              style={{ 
                border: '2px dashed #cbd5e1', borderRadius: '12px', padding: '30px', display: 'flex', flexDirection: 'column', 
                alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: '#f8fafc', color: '#64748b',
                minHeight: '200px', transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--rust)'}
              onMouseOut={(e) => e.currentTarget.style.borderColor = '#cbd5e1'}
            >
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', color: 'var(--rust)', fontSize: '20px' }}>
                <i className="fa-solid fa-plus"></i>
              </div>
              <span style={{ fontWeight: '500' }}>Add New Address</span>
            </div>

            {/* Existing Addresses */}
            {addresses.map(addr => (
              <div key={addr._id} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', background: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
                  <button onClick={() => handleDeleteAddress(addr._id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '5px' }} title="Delete Address">
                    <i className="fa-regular fa-trash-can"></i>
                  </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <span style={{ background: '#f1f5f9', color: '#475569', fontSize: '12px', padding: '4px 8px', borderRadius: '4px', fontWeight: '500', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <i className={addr.type === 'Home' ? 'fa-solid fa-house' : addr.type === 'Work' ? 'fa-solid fa-briefcase' : 'fa-solid fa-location-dot'}></i>
                    {addr.type}
                  </span>
                </div>
                <h3 style={{ fontSize: '16px', color: 'var(--ink)', marginBottom: '8px' }}>{addr.name}</h3>
                <p style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.6', marginBottom: '8px' }}>
                  {addr.street}<br/>
                  {addr.city}, {addr.state} - {addr.pincode}
                </p>
                <p style={{ color: 'var(--ink)', fontSize: '14px', fontWeight: '500' }}>
                  <i className="fa-solid fa-phone" style={{ marginRight: '6px', color: '#94a3b8' }}></i> {addr.phone}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Add Address Modal/Form */}
        {isAddingNew && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ background: 'white', borderRadius: '12px', padding: '30px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '20px', color: 'var(--ink)' }}>Add New Address</h2>
                <button onClick={() => setIsAddingNew(false)} style={{ background: 'none', border: 'none', fontSize: '24px', color: '#64748b', cursor: 'pointer' }}>&times;</button>
              </div>
              
              <form onSubmit={handleSaveAddress} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                  <input type="text" placeholder="Full Name" required value={newAddress.name} onChange={e => setNewAddress({...newAddress, name: e.target.value})} style={{ padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                  <input type="text" placeholder="Mobile Number" required value={newAddress.phone} onChange={e => setNewAddress({...newAddress, phone: e.target.value})} style={{ padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                  <div style={{ gridColumn: '1 / -1', position: 'relative' }}>
                    <input type="text" placeholder="Street Address / Area" required value={newAddress.street} onChange={e => setNewAddress({...newAddress, street: e.target.value})} style={{ width: '100%', padding: '12px', paddingRight: '140px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                    <button type="button" onClick={captureLocation} disabled={isLocating} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: '#e0f2fe', color: '#0284c7', border: 'none', padding: '6px 12px', borderRadius: '4px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <i className="fa-solid fa-location-crosshairs"></i> {isLocating ? 'Locating...' : 'Locate Me'}
                    </button>
                  </div>
                  <input type="text" placeholder="City" required value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} style={{ padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                  <input type="text" placeholder="State" required value={newAddress.state} onChange={e => setNewAddress({...newAddress, state: e.target.value})} style={{ padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                  <input type="text" placeholder="Pincode" required value={newAddress.pincode} onChange={e => setNewAddress({...newAddress, pincode: e.target.value})} style={{ padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                  <select value={newAddress.type} onChange={e => setNewAddress({...newAddress, type: e.target.value})} style={{ padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                    <option>Home</option>
                    <option>Work</option>
                    <option>Other</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                  <button type="button" onClick={() => setIsAddingNew(false)} style={{ flex: 1, padding: '12px', background: 'white', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>Cancel</button>
                  <button type="submit" style={{ flex: 1, padding: '12px', background: 'var(--rust)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Save Address</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AddressesPage;
