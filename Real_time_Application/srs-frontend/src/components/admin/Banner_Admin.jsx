import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import ConfirmModal from '../ConfirmModal';

const Banner_Admin = () => {
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({ _id: '', label: '', alt: '', url: '', linkCategoryId: '' });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUser, setFilterUser] = useState('');
  const [confirmObj, setConfirmObj] = useState(null);
  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    fetchBanners();
    axios.get(`http://${window.location.hostname}:5000/api/categories`)
      .then(res => setCategories(res.data))
      .catch(err => console.error(err));
  }, []);

  const fetchBanners = async () => {
    try {
      const res = await axios.get(`http://${window.location.hostname}:5000/api/banners`);
      setBanners(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData({ ...formData, url: reader.result });
      reader.readAsDataURL(file);
    }
  };

  const openDrawer = (banner = null) => {
    if (banner) {
      setIsEditing(true);
      setFormData({
        _id: banner._id,
        label: banner.label,
        alt: banner.alt || '',
        url: banner.url,
        linkCategoryId: banner.linkCategoryId || ''
      });
    } else {
      setIsEditing(false);
      setFormData({ _id: '', label: '', alt: '', url: '', linkCategoryId: '' });
    }
    setIsDrawerOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.url) return toast.error("Please upload an image!");
    try {
      if (isEditing) {
        await axios.put(`http://${window.location.hostname}:5000/api/banners/admin/${formData._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`http://${window.location.hostname}:5000/api/banners/admin`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      fetchBanners();
      setIsDrawerOpen(false);
      toast.success(isEditing ? "Banner updated successfully!" : "Banner added successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save banner");
    }
  };

  const deleteBanner = (id) => {
    setConfirmObj({
      message: "Are you sure you want to delete this banner?",
      onConfirm: async () => {
        try {
          await axios.delete(`http://${window.location.hostname}:5000/api/banners/admin/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          fetchBanners();
          toast.success("Banner deleted successfully");
        } catch (err) {
          console.error(err);
          toast.error("Failed to delete banner");
        }
        setConfirmObj(null);
      }
    });
  };

  const uniqueUsers = [...new Set(banners.map(b => b.createdBy || 'System Admin').filter(Boolean))];

  const filteredBanners = banners.filter(b => {
    const matchSearch = b.label.toLowerCase().includes(searchTerm.toLowerCase());
    const cUser = b.createdBy || 'System Admin';
    const matchUser = filterUser ? cUser === filterUser : true;
    return matchSearch && matchUser;
  });

  return (
    <div className="tab-content active">
      <ConfirmModal 
        isOpen={!!confirmObj} 
        message={confirmObj?.message} 
        onConfirm={confirmObj?.onConfirm} 
        onCancel={() => setConfirmObj(null)} 
      />
      <div className={`drawer-overlay ${isDrawerOpen ? 'open' : ''}`} onClick={() => setIsDrawerOpen(false)}></div>
      <div className={`offcanvas-drawer ${isDrawerOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <h3>{isEditing ? 'Edit Banner' : 'Add New Banner'}</h3>
          <button className="close-drawer" onClick={() => setIsDrawerOpen(false)}>&times;</button>
        </div>
        <div className="drawer-body">
          <form onSubmit={handleSave} style={{ display: 'grid', gap: '15px', gridTemplateColumns: '1fr' }}>
            <div>
              <label style={{ fontSize: '12px', color: '#666', marginBottom: '4px', display: 'block' }}>Label (e.g., Festival Sale)</label>
              <input type="text" value={formData.label} onChange={e => setFormData({...formData, label: e.target.value})} required style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#666', marginBottom: '4px', display: 'block' }}>Upload Banner Image</label>
              <input type="file" accept="image/*" onChange={handleImageUpload} style={{ width: '100%', padding: '10px', border: '1px dashed #ccc', borderRadius: '6px' }} />
              {formData.url && <img src={formData.url} alt="preview" style={{ width: '100%', height: '120px', objectFit: 'contain', marginTop: '10px', border: '1px solid #eee', borderRadius: '4px', background: '#f8fafc' }} />}
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#666', marginBottom: '4px', display: 'block' }}>Link to Category (when clicked)</label>
              <select
                value={formData.linkCategoryId}
                onChange={e => setFormData({...formData, linkCategoryId: e.target.value})}
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
              >
                <option value="">No link (decorative only)</option>
                {categories.filter(c => !c.parentId).map(parent => (
                  <optgroup key={parent.id} label={`── ${parent.name}`}>
                    <option value={parent.id}>{parent.name} (All)</option>
                    {categories.filter(child => child.parentId === parent.id).map(child => (
                      <option key={child.id} value={child.id}>&nbsp;&nbsp;↳ {child.name}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
            <button type="submit" style={{ padding: '12px', background: '#1e293b', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
              {isEditing ? 'Save Changes' : 'Add Banner'}
            </button>
          </form>
        </div>
      </div>

      <div className="tab-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
        <h3 style={{ margin: 0, fontSize: '24px', color: '#333' }}>Manage Promotional Banners</h3>
        <button onClick={() => openDrawer()} style={{ padding: '10px 20px', background: '#1e293b', color: '#d4b896', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
          + Add New Banner
        </button>
      </div>
      
      <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #eee' }}>
          <h4 style={{ margin: 0, color: '#444', marginBottom: '10px' }}>Active Banners & Filters</h4>
          <div className="advanced-filters">
            <input 
              type="text" 
              placeholder="Search Banners..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: '8px 12px', minWidth: '220px', border: '1px solid #ddd', borderRadius: '20px', outline: 'none', fontSize: '13px' }}
            />
            <select value={filterUser} onChange={(e) => setFilterUser(e.target.value)}>
              <option value="">All Authors</option>
              {uniqueUsers.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
            <thead style={{ background: '#f8fafc', color: '#64748b', fontSize: '14px' }}>
              <tr>
                <th style={{ padding: '15px 20px', borderBottom: '1px solid #e2e8f0' }}>Banner Image</th>
                <th style={{ padding: '15px 20px', borderBottom: '1px solid #e2e8f0' }}>Label Details</th>
                <th style={{ padding: '15px 20px', borderBottom: '1px solid #e2e8f0' }}>Audit Info</th>
                <th style={{ padding: '15px 20px', borderBottom: '1px solid #e2e8f0', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBanners.map(b => (
                <tr key={b._id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#f8fafc'} onMouseOut={e => e.currentTarget.style.background = 'white'}>
                  <td style={{ padding: '15px 20px', width: '250px' }}>
                    <img src={b.url} alt={b.alt || b.label} style={{ width: '100%', maxHeight: '60px', objectFit: 'contain', borderRadius: '4px', border: '1px solid #e2e8f0', background: '#f8fafc' }} />
                  </td>
                  <td style={{ padding: '15px 20px' }}>
                    <strong style={{ display: 'block', color: '#1e293b', fontSize: '16px' }}>{b.label}</strong>
                  </td>
                  <td style={{ padding: '15px 20px' }}>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      <div><strong>By:</strong> {b.createdBy || 'System Admin'}</div>
                      <div><strong>On:</strong> {b.createdAt ? new Date(b.createdAt).toLocaleDateString() : 'N/A'}</div>
                    </div>
                  </td>
                  <td style={{ padding: '15px 20px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button onClick={() => openDrawer(b)} style={{ background: '#e0e7ff', color: '#4338ca', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>
                        <i className="fa-solid fa-pen"></i> Edit
                      </button>
                      <button onClick={() => deleteBanner(b._id)} style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>
                        <i className="fa-solid fa-trash"></i> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredBanners.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>No banners found matching your filter.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Banner_Admin;
