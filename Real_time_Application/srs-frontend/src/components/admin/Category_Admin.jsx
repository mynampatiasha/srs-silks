import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import ConfirmModal from '../ConfirmModal';

const Category_Admin = () => {
  const [formData, setFormData] = useState({ _id: '', id: '', name: '', img: '', parentId: '' });
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [confirmObj, setConfirmObj] = useState(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUser, setFilterUser] = useState('');
  
  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [catRes, prodRes] = await Promise.all([
        axios.get(`http://${window.location.hostname}:5000/api/categories`),
        axios.get(`http://${window.location.hostname}:5000/api/products`)
      ]);
      setCategories(catRes.data);
      setProducts(prodRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData({ ...formData, img: reader.result });
      reader.readAsDataURL(file);
    }
  };

  const openDrawer = (cat = null, parentId = '') => {
    if (cat) {
      setIsEditing(true);
      setFormData({
        _id: cat._id,
        id: cat.id,
        name: cat.name,
        img: cat.img,
        parentId: cat.parentId || ''
      });
    } else {
      setIsEditing(false);
      setFormData({ _id: '', id: '', name: '', img: '', parentId });
    }
    setIsDrawerOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.img) return toast.error("Please upload a category image!");
    
    try {
      if (isEditing) {
        await axios.put(`http://${window.location.hostname}:5000/api/categories/admin/${formData.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`http://${window.location.hostname}:5000/api/categories/admin`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      fetchData();
      setIsDrawerOpen(false);
      toast.success(isEditing ? "Category updated successfully!" : "Category added successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save category");
    }
  };

  const deleteCategory = (id) => {
    setConfirmObj({
      message: "Are you sure you want to delete this category?",
      onConfirm: async () => {
        try {
          await axios.delete(`http://${window.location.hostname}:5000/api/categories/admin/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          fetchData();
          toast.success("Category deleted successfully");
        } catch (err) {
          console.error(err);
          toast.error("Failed to delete category");
        }
        setConfirmObj(null);
      }
    });
  };

  const toggleHeaderFeatured = (cat) => {
    setConfirmObj({
      message: `Are you sure you want to ${cat.showInHeader ? 'remove' : 'feature'} this category in the header?`,
      onConfirm: async () => {
        try {
          await axios.post(`http://${window.location.hostname}:5000/api/categories/admin`, { ...cat, showInHeader: !cat.showInHeader }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          fetchData();
          toast.success(`Category ${cat.showInHeader ? 'removed from' : 'featured in'} header`);
        } catch (err) {
          console.error(err);
          toast.error("Failed to update category");
        }
        setConfirmObj(null);
      }
    });
  };

  const uniqueUsers = [...new Set(categories.map(c => c.updatedBy || 'System Admin').filter(Boolean))];

  const filteredCategories = categories.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.id.toLowerCase().includes(searchTerm.toLowerCase());
    const cUser = c.updatedBy || 'System Admin';
    const matchUser = filterUser ? cUser === filterUser : true;
    return matchSearch && matchUser;
  });

  const parentCategories = categories.filter(c => !c.parentId);
  const featuredCount = parentCategories.filter(c => c.showInHeader).length;

  return (
    <div className="tab-content active">
      <ConfirmModal 
        isOpen={!!confirmObj} 
        message={confirmObj?.message} 
        onConfirm={confirmObj?.onConfirm} 
        onCancel={() => setConfirmObj(null)} 
      />
      {/* Drawer Overlay & Content */}
      <div className={`drawer-overlay ${isDrawerOpen ? 'open' : ''}`} onClick={() => setIsDrawerOpen(false)}></div>
      <div className={`offcanvas-drawer ${isDrawerOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <h3>{isEditing ? 'Edit Category' : 'Add New Category'}</h3>
          <button className="close-drawer" onClick={() => setIsDrawerOpen(false)}>&times;</button>
        </div>
        <div className="drawer-body">
          <form onSubmit={handleSave} style={{ display: 'grid', gap: '15px', gridTemplateColumns: '1fr' }}>
            <div>
              <label style={{ fontSize: '12px', color: '#666', marginBottom: '4px', display: 'block' }}>URL ID (e.g., bridal)</label>
              <input type="text" value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} disabled={isEditing} required style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', background: isEditing ? '#f1f5f9' : 'white' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#666', marginBottom: '4px', display: 'block' }}>Display Name (e.g., Bridal Silks)</label>
              <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#666', marginBottom: '4px', display: 'block' }}>Upload Thumbnail</label>
              <input type="file" accept="image/*" onChange={handleImageUpload} style={{ width: '100%', padding: '10px', border: '1px dashed #ccc', borderRadius: '6px' }} />
              {formData.img && <img src={formData.img} alt="preview" style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', marginTop: '10px', border: '2px solid #d4b896' }} />}
            </div>
            <button type="submit" style={{ padding: '12px', background: '#1e293b', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
              {isEditing ? 'Save Changes' : 'Add Category'}
            </button>
          </form>
        </div>
      </div>

      <div className="tab-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <h3 style={{ margin: 0, fontSize: '24px', color: '#333' }}>Manage Categories</h3>
          <div style={{ padding: '6px 12px', background: featuredCount > 7 ? '#fee2e2' : '#e0e7ff', color: featuredCount > 7 ? '#ef4444' : '#4338ca', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold' }}>
            {featuredCount} / 7 Featured in Header
          </div>
        </div>
        <button onClick={() => openDrawer()} style={{ padding: '10px 20px', background: '#1e293b', color: '#d4b896', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
          + Add New Parent Category
        </button>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #eee' }}>
          <h4 style={{ margin: 0, color: '#444', marginBottom: '10px' }}>Categories List & Filters</h4>
          <div className="advanced-filters">
            <input 
              type="text" 
              placeholder="Search Categories..." 
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
                <th style={{ padding: '15px 20px', borderBottom: '1px solid #e2e8f0' }}>Thumbnail</th>
                <th style={{ padding: '15px 20px', borderBottom: '1px solid #e2e8f0' }}>Category Details</th>
                <th style={{ padding: '15px 20px', borderBottom: '1px solid #e2e8f0' }}>Products</th>
                <th style={{ padding: '15px 20px', borderBottom: '1px solid #e2e8f0' }}>Audit Info</th>
                <th style={{ padding: '15px 20px', borderBottom: '1px solid #e2e8f0', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.filter(c => !c.parentId).map(c => {
                const childCats = categories.filter(child => child.parentId === c.id);
                const pCount = products.filter(p => p.cat === c.id || childCats.some(ch => ch.id === p.cat)).length;
                return (
                  <React.Fragment key={c._id}>
                    <tr style={{ borderBottom: '1px solid #f1f5f9', background: '#fafafa' }}>
                      <td style={{ padding: '15px 20px' }}>
                        <img src={c.img} alt={c.name} style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #e2e8f0' }} />
                      </td>
                      <td style={{ padding: '15px 20px' }}>
                        <strong style={{ display: 'block', color: '#1e293b', fontSize: '16px' }}>{c.name}</strong>
                        <span style={{ color: '#64748b', fontSize: '13px' }}>ID: {c.id}</span>
                      </td>
                      <td style={{ padding: '15px 20px' }}>
                        <span style={{ background: '#e0e7ff', color: '#4338ca', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
                          {childCats.length} Sub-Categories
                        </span>
                        <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>{pCount} Total Products</div>
                      </td>
                      <td style={{ padding: '15px 20px' }}>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                          <div><strong>By:</strong> {c.updatedBy || 'System Admin'}</div>
                          <div><strong>On:</strong> {c.updatedAt ? new Date(c.updatedAt).toLocaleDateString() : 'N/A'}</div>
                        </div>
                      </td>
                      <td style={{ padding: '15px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                          <button onClick={() => toggleHeaderFeatured(c)} style={{ background: c.showInHeader ? '#fef08a' : '#f1f5f9', color: c.showInHeader ? '#854d0e' : '#64748b', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }} title="Toggle Header Display">
                            <i className={`fa-solid ${c.showInHeader ? 'fa-star' : 'fa-star-o'}`}></i> {c.showInHeader ? 'Hide' : 'Feature'}
                          </button>
                          <button onClick={() => openDrawer(null, c.id)} style={{ background: '#ecfdf5', color: '#059669', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }} title="Add Child Category">
                            <i className="fa-solid fa-plus"></i> Child
                          </button>
                          <button onClick={() => openDrawer(c)} style={{ background: '#e0e7ff', color: '#4338ca', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>
                            <i className="fa-solid fa-pen"></i>
                          </button>
                          <button onClick={() => deleteCategory(c.id)} style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                    {childCats.map(child => {
                       const childPCount = products.filter(p => p.cat === child.id).length;
                       return (
                        <tr key={child._id} style={{ borderBottom: '1px solid #f1f5f9', background: 'white' }}>
                          <td style={{ padding: '10px 20px', paddingLeft: '50px' }}>
                             <img src={child.img} alt={child.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #e2e8f0' }} />
                          </td>
                          <td style={{ padding: '10px 20px' }}>
                             <strong style={{ display: 'block', color: '#334155', fontSize: '14px' }}>└ {child.name}</strong>
                             <span style={{ color: '#94a3b8', fontSize: '12px' }}>ID: {child.id}</span>
                          </td>
                          <td style={{ padding: '10px 20px' }}>
                             <span style={{ background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
                               {childPCount} Items
                             </span>
                          </td>
                          <td style={{ padding: '10px 20px' }}>
                            <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                              By: {child.updatedBy || 'System Admin'}
                            </div>
                          </td>
                          <td style={{ padding: '10px 20px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                              <button onClick={() => openDrawer(child)} style={{ background: 'transparent', color: '#4338ca', border: 'none', cursor: 'pointer', fontSize: '14px' }}>
                                <i className="fa-solid fa-pen"></i>
                              </button>
                              <button onClick={() => deleteCategory(child.id)} style={{ background: 'transparent', color: '#ef4444', border: 'none', cursor: 'pointer', fontSize: '14px' }}>
                                <i className="fa-solid fa-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                       );
                    })}
                  </React.Fragment>
                );
              })}
              {filteredCategories.filter(c => !c.parentId).length === 0 && (
                <tr>
                  <td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>No categories found matching your filter.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Category_Admin;
