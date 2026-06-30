import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Helper to fetch address from coordinates
const fetchAddress = async (lat, lon, setNewAddress) => {
  try {
    const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
    if (res.data && res.data.address) {
      const addr = res.data.address;
      const streetParts = [
        addr.amenity, addr.building, addr.house_number, 
        addr.road, addr.neighbourhood, addr.suburb
      ].filter(Boolean);
      
      setNewAddress(prev => ({
        ...prev,
        street: streetParts.join(', ') || addr.city_district || '',
        city: addr.city || addr.town || addr.village || '',
        state: addr.state || '',
        pincode: addr.postcode || ''
      }));
    }
  } catch (err) {
    console.error("Error fetching location", err);
  }
};

const LocationMarker = ({ coords, setCoords, setNewAddress }) => {
  const map = useMap();

  useEffect(() => {
    if (coords) {
      map.flyTo([coords.lat, coords.lon], 15);
    }
  }, [coords, map]);

  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setCoords({ lat, lon: lng });
      fetchAddress(lat, lng, setNewAddress);
    },
  });

  return coords ? (
    <Marker
      position={[coords.lat, coords.lon]}
      draggable={true}
      eventHandlers={{
        dragend: (e) => {
          const marker = e.target;
          const position = marker.getLatLng();
          setCoords({ lat: position.lat, lon: position.lng });
          fetchAddress(position.lat, position.lng, setNewAddress);
        },
      }}
    ></Marker>
  ) : null;
};

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(() => {
    const savedStep = sessionStorage.getItem('srs_checkout_step');
    return savedStep ? parseInt(savedStep, 10) : 1;
  });
  const [cartItems, setCartItems] = useState([]);
  const [customer, setCustomer] = useState(null);
  const [addresses, setAddresses] = useState([]);
  
  // Form State
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: '', phone: '', street: '', city: '', state: '', pincode: '', type: 'Home'
  });
  
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [mapCoords, setMapCoords] = useState(null);
  const [mapSearchQuery, setMapSearchQuery] = useState('');

  // Persist step to sessionStorage
  useEffect(() => {
    sessionStorage.setItem('srs_checkout_step', step.toString());
  }, [step]);

  useEffect(() => {
    const savedCustomer = localStorage.getItem('srs_customer');
    if (!savedCustomer) {
      navigate('/');
      return;
    }
    const parsedCustomer = JSON.parse(savedCustomer);
    setCustomer(parsedCustomer);

    const savedCart = localStorage.getItem('srs_cart');
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      if (parsedCart.length === 0) {
        navigate('/cart');
        return;
      }
      const grouped = [];
      parsedCart.forEach(product => {
        const existing = grouped.find(item => item.product._id === product._id);
        if (existing) {
          existing.quantity += 1;
        } else {
          grouped.push({ product, quantity: 1 });
        }
      });
      setCartItems(grouped);
    } else {
      navigate('/cart');
    }

    // Fetch user addresses from backend
    const fetchAddresses = async () => {
      try {
        const token = localStorage.getItem('srs_customer_token');
        const base = `http://${window.location.hostname}:5000`;
        const res = await axios.get(`${base}/api/customer/addresses`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAddresses(res.data);
      } catch (err) {
        console.error("Error fetching addresses", err);
      }
    };
    fetchAddresses();
  }, [navigate]);

  const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const totalMrp = cartItems.reduce((sum, item) => sum + ((item.product.orig || item.product.price) * item.quantity), 0);
  const totalSavings = totalMrp - subtotal;
  const discountPercentage = totalMrp > 0 ? Math.round((totalSavings / totalMrp) * 100) : 0;
  
  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const formatPrice = (price) => '₹' + Number(price).toLocaleString('en-IN');

  const triggerConfetti = () => {
    const duration = 4 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };
    
    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }
    
    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);
      const particleCount = 50 * (timeLeft / duration);
      confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
      confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
    }, 250);
  };

  const handleCaptureLocation = () => {
    setLocationLoading(true);
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      setLocationLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      setMapCoords({ lat: latitude, lon: longitude });
      await fetchAddress(latitude, longitude, setNewAddress);
      setLocationLoading(false);
    }, () => {
      toast.error("Unable to retrieve your location. Please check browser permissions.");
      setLocationLoading(false);
    });
  };

  const handleMapSearch = async () => {
    if (!mapSearchQuery) return;
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/search?q=${mapSearchQuery}&format=json&limit=1`);
      if (res.data && res.data.length > 0) {
        const { lat, lon } = res.data[0];
        setMapCoords({ lat: parseFloat(lat), lon: parseFloat(lon) });
        fetchAddress(lat, lon, setNewAddress);
      } else {
        toast.error("Location not found. Try a more specific search.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error searching location");
    }
  };

  const handleSaveAddress = async () => {
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
      if (res.data.length > 0) {
        setSelectedAddressId(res.data[res.data.length - 1]._id);
      }
      setIsAddingNew(false);
    } catch (err) {
      console.error(err);
      toast.error("Error saving address");
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast.error("Please select a delivery address");
      return;
    }
    setIsPlacingOrder(true);
    const selectedAddress = addresses.find(a => a._id === selectedAddressId);
    
    try {
      const token = localStorage.getItem('srs_customer_token');
      const base = `http://${window.location.hostname}:5000`;
      
      const orderData = {
        items: cartItems.map(item => ({
          product: item.product._id,
          quantity: item.quantity,
          price: item.product.price
        })),
        shippingAddress: selectedAddress,
        paymentMethod,
        totalAmount: subtotal
      };

      await axios.post(`${base}/api/orders`, orderData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Clear cart and checkout session
      localStorage.removeItem('srs_cart');
      sessionStorage.removeItem('srs_checkout_step');
      window.dispatchEvent(new Event('storage'));
      
      // Go to success screen and trigger confetti
      setStep(4);
      triggerConfetti();
      setIsPlacingOrder(false);
    } catch (err) {
      console.error("Error placing order", err);
      toast.error("There was an issue placing your order. Please try again.");
      setIsPlacingOrder(false);
    }
  };

  return (
    <>
      <Navbar cartCount={totalCartCount} onCartClick={() => navigate('/cart')} />
      <div style={{ minHeight: '80vh', maxWidth: '1000px', margin: '0 auto', padding: '40px 20px 40px' }}>
        
        {/* Stepper Header */}
        {step < 4 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '50%', left: '0', right: '0', height: '2px', background: '#e2e8f0', zIndex: -1, transform: 'translateY(-50%)' }}></div>
            {['Review Cart', 'Delivery Address', 'Payment'].map((label, index) => (
              <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'white', padding: '0 10px' }}>
                <div style={{ 
                  width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: step > index + 1 ? '#22c55e' : step === index + 1 ? 'var(--rust)' : '#e2e8f0',
                  color: step >= index + 1 ? 'white' : '#64748b', fontWeight: 'bold', transition: 'all 0.3s'
                }}>
                  {step > index + 1 ? <i className="fa-solid fa-check"></i> : index + 1}
                </div>
                <span style={{ marginTop: '8px', fontSize: '14px', fontWeight: step === index + 1 ? '600' : '400', color: step >= index + 1 ? 'var(--ink)' : '#94a3b8' }}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          
          {/* Main Content Area */}
          <div style={{ flex: '1 1 60%', minWidth: '300px' }}>
            
            {/* STEP 1: REVIEW CART */}
            {step === 1 && (
              <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px' }}>
                <h2 style={{ fontSize: '20px', color: 'var(--ink)', marginBottom: '20px' }}>Order Items ({totalCartCount})</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {cartItems.map((item) => (
                    <div key={item.product._id} style={{ display: 'flex', gap: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
                      <img src={item.product.imgUrls && item.product.imgUrls.length > 0 ? item.product.imgUrls[0] : item.product.img} alt={item.product.name} style={{ width: '80px', height: '100px', objectFit: 'cover', borderRadius: '8px' }} />
                      <div>
                        <h3 style={{ fontSize: '16px', color: 'var(--ink)' }}>{item.product.name}</h3>
                        <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Qty: {item.quantity}</p>
                        <p style={{ fontWeight: '600', color: 'var(--ink)', marginTop: '8px' }}>{formatPrice(item.product.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button 
                  onClick={() => setStep(2)}
                  style={{ width: '100%', marginTop: '24px', padding: '14px', background: 'var(--rust)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}
                >
                  Continue to Address
                </button>
              </div>
            )}

            {/* STEP 2: DELIVERY ADDRESS */}
            {step === 2 && (
              <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px' }}>
                <h2 style={{ fontSize: '20px', color: 'var(--ink)', marginBottom: '20px' }}>Select Delivery Address</h2>
                
                {addresses.length > 0 && !isAddingNew && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                    {addresses.map(addr => (
                      <div 
                        key={addr._id}
                        onClick={() => setSelectedAddressId(addr._id)}
                        style={{ border: `2px solid ${selectedAddressId === addr._id ? 'var(--rust)' : '#e2e8f0'}`, borderRadius: '8px', padding: '16px', cursor: 'pointer', background: selectedAddressId === addr._id ? '#fff9f5' : 'white' }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span style={{ fontWeight: '600', color: 'var(--ink)' }}>{addr.name}</span>
                          <span style={{ fontSize: '12px', background: '#e2e8f0', padding: '2px 8px', borderRadius: '12px' }}>{addr.type}</span>
                        </div>
                        <p style={{ color: '#475569', fontSize: '14px', marginBottom: '4px' }}>{addr.street}, {addr.city}</p>
                        <p style={{ color: '#475569', fontSize: '14px', marginBottom: '8px' }}>{addr.state} - {addr.pincode}</p>
                        <p style={{ color: '#475569', fontSize: '14px', fontWeight: '500' }}>Phone: {addr.phone}</p>
                      </div>
                    ))}
                    <button onClick={() => setIsAddingNew(true)} style={{ background: 'none', border: '1px dashed #cbd5e1', color: 'var(--rust)', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                      + Add New Address
                    </button>
                  </div>
                )}

                {(addresses.length === 0 || isAddingNew) && (
                  <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Add New Address</h3>
                      <button 
                        onClick={handleCaptureLocation} 
                        disabled={locationLoading}
                        style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: locationLoading ? 'not-allowed' : 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', opacity: locationLoading ? 0.7 : 1 }}
                      >
                        {locationLoading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-location-crosshairs"></i>} 
                        {locationLoading ? 'Locating...' : 'Use Current Location'}
                      </button>
                    </div>

                    {mapCoords && (
                      <div style={{ marginBottom: '20px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #cbd5e1', background: 'white' }}>
                        <div style={{ padding: '8px', background: '#f8fafc', fontSize: '12px', color: '#64748b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span><i className="fa-solid fa-map-pin"></i> Drag the pin or click on the map to change address</span>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <input 
                              type="text" 
                              placeholder="Search location..." 
                              value={mapSearchQuery} 
                              onChange={(e) => setMapSearchQuery(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleMapSearch()}
                              style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                            />
                            <button onClick={handleMapSearch} style={{ padding: '4px 8px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}><i className="fa-solid fa-search"></i></button>
                          </div>
                        </div>
                        <MapContainer center={[mapCoords.lat, mapCoords.lon]} zoom={15} style={{ height: '300px', width: '100%' }}>
                          <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          />
                          <LocationMarker coords={mapCoords} setCoords={setMapCoords} setNewAddress={setNewAddress} />
                        </MapContainer>
                      </div>
                    )}
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                      <input type="text" placeholder="Full Name" value={newAddress.name} onChange={e => setNewAddress({...newAddress, name: e.target.value})} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                      <input type="text" placeholder="Mobile Number" value={newAddress.phone} onChange={e => setNewAddress({...newAddress, phone: e.target.value})} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                      <input type="text" placeholder="Street Address / Area" value={newAddress.street} onChange={e => setNewAddress({...newAddress, street: e.target.value})} style={{ gridColumn: '1 / -1', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                      <input type="text" placeholder="City" value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                      <input type="text" placeholder="State" value={newAddress.state} onChange={e => setNewAddress({...newAddress, state: e.target.value})} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                      <input type="text" placeholder="Pincode" value={newAddress.pincode} onChange={e => setNewAddress({...newAddress, pincode: e.target.value})} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                      <select value={newAddress.type} onChange={e => setNewAddress({...newAddress, type: e.target.value})} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                        <option>Home</option>
                        <option>Work</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                      {addresses.length > 0 && (
                        <button onClick={() => setIsAddingNew(false)} style={{ flex: 1, padding: '10px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                      )}
                      <button onClick={handleSaveAddress} style={{ flex: 1, padding: '10px', background: 'var(--ink)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Save Address</button>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
                  <button onClick={() => setStep(1)} style={{ padding: '12px 24px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', color: '#475569', fontWeight: '600' }}>Back</button>
                  <button 
                    onClick={() => {
                      if (!selectedAddressId) toast.error("Please select an address");
                      else setStep(3);
                    }} 
                    style={{ padding: '12px 24px', background: 'var(--rust)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
                  >
                    Continue to Payment
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: PAYMENT */}
            {step === 3 && (
              <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px' }}>
                <h2 style={{ fontSize: '20px', color: 'var(--ink)', marginBottom: '20px' }}>Payment Method</h2>
                
                <div style={{ border: '2px solid var(--rust)', background: '#fff9f5', borderRadius: '8px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }}>
                  <input type="radio" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} style={{ accentColor: 'var(--rust)', width: '20px', height: '20px' }} />
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Cash on Delivery (COD)</h3>
                    <p style={{ color: '#64748b', fontSize: '14px' }}>Pay when your order is delivered to your doorstep.</p>
                  </div>
                </div>

                <div style={{ border: '1px solid #e2e8f0', opacity: 0.6, borderRadius: '8px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', marginTop: '16px', cursor: 'not-allowed' }}>
                  <input type="radio" disabled style={{ width: '20px', height: '20px' }} />
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Online Payment <span style={{ fontSize: '10px', background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px', marginLeft: '8px' }}>Coming Soon</span></h3>
                    <p style={{ color: '#64748b', fontSize: '14px' }}>Credit/Debit Card, UPI, Net Banking.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
                  <button onClick={() => setStep(2)} style={{ padding: '12px 24px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', color: '#475569', fontWeight: '600' }}>Back</button>
                  <button 
                    onClick={handlePlaceOrder}
                    disabled={isPlacingOrder}
                    style={{ padding: '14px 32px', background: '#22c55e', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: isPlacingOrder ? 'not-allowed' : 'pointer' }}
                  >
                    {isPlacingOrder ? 'Placing Order...' : 'Place Order'}
                  </button>
                </div>
              </div>
            )}
            
          </div>

          {/* STEP 4: SUCCESS SCREEN */}
          {step === 4 && (
            <div style={{ flex: '1 1 100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
              
              {/* Animated Checkmark */}
              <svg className="success-checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52" style={{ width: '100px', height: '100px', borderRadius: '50%', display: 'block', margin: '0 auto 20px' }}>
                <circle className="success-circle" cx="26" cy="26" r="25" fill="none"/>
                <path className="success-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
              </svg>

              <h1 style={{ fontSize: '32px', color: '#16a34a', fontFamily: 'var(--font-serif)', marginBottom: '12px' }}>Order Placed Successfully!</h1>
              <p style={{ color: '#64748b', fontSize: '16px', maxWidth: '400px', margin: '0 auto 30px', lineHeight: '1.5' }}>
                Thank you for your purchase. We have received your order and are processing it right away.
              </p>
              
              <button 
                onClick={() => navigate('/orders')}
                style={{ padding: '16px 36px', background: 'var(--rust)', color: 'white', border: 'none', borderRadius: '30px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 14px rgba(185, 28, 28, 0.3)', transition: 'transform 0.2s', display: 'flex', alignItems: 'center', gap: '8px' }}
                onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <i className="fa-solid fa-box-open"></i> View My Order
              </button>
            </div>
          )}

          {/* Right: Order Summary Sticky */}
          {step < 4 && (
            <div style={{ flex: '1 1 30%', minWidth: '300px', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px', position: 'sticky', top: '100px' }}>
              <h2 style={{ fontSize: '18px', color: 'var(--ink)', fontWeight: '600', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '20px' }}>Order Summary</h2>
              
              {/* Detailed Calculations */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px dashed #cbd5e1' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569', fontSize: '15px' }}>
                  <span>Total MRP ({totalCartCount} items)</span>
                  <span style={{ textDecoration: totalSavings > 0 ? 'line-through' : 'none' }}>{formatPrice(totalMrp)}</span>
                </div>
                
                {totalSavings > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a', fontSize: '15px', fontWeight: '500' }}>
                    <span>Discount on MRP ({discountPercentage}%)</span>
                    <span>- {formatPrice(totalSavings)}</span>
                  </div>
                )}
                
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569', fontSize: '15px' }}>
                  <span>Shipping Fee</span>
                  <span style={{ color: '#16a34a', fontWeight: '600' }}>FREE</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', color: 'var(--ink)', fontSize: '20px', fontWeight: '800' }}>
                <span>Total Amount</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              
              {totalSavings > 0 && (
                <div style={{ background: '#ecfdf5', color: '#047857', padding: '12px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', textAlign: 'center', marginBottom: '20px', border: '1px solid #a7f3d0' }}>
                  <i className="fa-solid fa-tags" style={{ marginRight: '6px' }}></i>
                  You are saving {formatPrice(totalSavings)} on this order!
                </div>
              )}
            {selectedAddressId && (
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', fontSize: '13px', color: '#475569', marginTop: '20px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontWeight: '600', display: 'block', marginBottom: '6px', color: 'var(--ink)' }}>Delivering to:</span>
                {(() => {
                  const addr = addresses.find(a => a.id === selectedAddressId);
                  if (!addr) return null;
                  return (
                    <div>
                      <div style={{ fontWeight: '600', color: 'var(--ink)', marginBottom: '4px' }}>{addr.name} ({addr.phone})</div>
                      <div>{addr.street}, {addr.city}</div>
                      <div>{addr.state} - {addr.pincode} ({addr.type})</div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
          )}
          
        </div>
      </div>
    </>
  );
};

export default CheckoutPage;
