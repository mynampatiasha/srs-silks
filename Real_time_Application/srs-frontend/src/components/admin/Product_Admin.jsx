import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import ConfirmModal from '../ConfirmModal';

const Product_Admin = () => {
  // 1. Initialize formData from localStorage OR default
  const getInitialFormData = () => {
    const savedData = localStorage.getItem('srs_product_form');
    if (savedData) {
      try { return JSON.parse(savedData); } catch (e) {}
    }
    return { _id: '', name: '', price: '', orig: '', cat: '', categories: [], groupId: '', desc: '', highlights: [], tags: '', metaTitle: '', metaDesc: '', imgUrls: [''], inStock: true, stockQuantity: 10 };
  };

  const [formData, setFormData] = useState(getInitialFormData());
  const [isEditing, setIsEditing] = useState(false);
  const [confirmObj, setConfirmObj] = useState(null);
  
  // 2. Save to localStorage whenever formData changes (only if it's NOT an edit)
  useEffect(() => {
    if (!isEditing && formData.name) {
      localStorage.setItem('srs_product_form', JSON.stringify(formData));
    }
  }, [formData, isEditing]);

  const [products, setProducts] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showCatOverlay, setShowCatOverlay] = useState(false);
  const [catSearchTerm, setCatSearchTerm] = useState('');
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUser, setFilterUser] = useState('');

  const token = localStorage.getItem('adminToken');

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchProductsAndCategories();
    // Open drawer automatically if there is saved data
    if (localStorage.getItem('srs_product_form')) {
      setIsDrawerOpen(true);
    }
  }, []);

  const fetchProductsAndCategories = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        axios.get(`http://${window.location.hostname}:5000/api/products`),
        axios.get(`http://${window.location.hostname}:5000/api/categories`)
      ]);
      setProducts(prodRes.data);
      setCategories(catRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => {
          const currentUrls = prev.imgUrls.length === 1 && prev.imgUrls[0] === '' ? [] : [...prev.imgUrls];
          return { ...prev, imgUrls: [...currentUrls, reader.result] };
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (indexToRemove) => {
    setFormData(prev => {
      const newUrls = prev.imgUrls.filter((_, index) => index !== indexToRemove);
      return { ...prev, imgUrls: newUrls.length ? newUrls : [''] };
    });
  };

  const openDrawer = (product = null) => {
    if (product) {
      setIsEditing(true);
      setFormData({
        _id: product._id,
        name: product.name,
        price: product.price,
        orig: product.orig || '',
        cat: product.cat,
        desc: product.desc || '',
        tags: product.tags ? (Array.isArray(product.tags) ? product.tags.join(', ') : product.tags) : '',
        metaTitle: product.metaTitle || '',
        metaDesc: product.metaDesc || '',
        imgUrls: product.imgUrls && product.imgUrls.length > 0 ? product.imgUrls : (product.img ? [product.img] : ['']),
        inStock: product.inStock !== undefined ? product.inStock : true,
        stockQuantity: product.stockQuantity !== undefined ? product.stockQuantity : 10
      });
    } else {
      setIsEditing(false);
      setFormData({ _id: '', name: '', price: '', orig: '', cat: '', categories: [], desc: '', tags: '', metaTitle: '', metaDesc: '', imgUrls: [''], inStock: true, stockQuantity: 10 });
    }
    setIsDrawerOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.imgUrls[0]) return toast.error("Please upload at least one image!");
    
    let tagsArray = [];
    if (formData.tags) {
        tagsArray = typeof formData.tags === 'string' 
            ? formData.tags.split(',').map(t => t.trim()).filter(t => t) 
            : formData.tags;
    }

    const payload = {
      ...formData,
      tags: tagsArray
    };

    if (!isEditing) {
      delete payload._id;
    }

    try {
      if (isEditing) {
        await axios.put(`http://${window.location.hostname}:5000/api/products/admin/${formData._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`http://${window.location.hostname}:5000/api/products/admin`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        localStorage.removeItem('srs_product_form');
      }
      fetchProductsAndCategories();
      setIsDrawerOpen(false);
      toast.success(isEditing ? "Product updated successfully!" : "Product added successfully!");
      // Reset form after successful save
      if (!isEditing) {
        setFormData({ _id: '', name: '', price: '', orig: '', cat: '', categories: [], desc: '', tags: '', metaTitle: '', metaDesc: '', imgUrls: [''], inStock: true, stockQuantity: 10 });
      }
    } catch (err) {
      console.error(err);
      toast.error(`Failed to save product: ${err.response?.data?.error || err.message}`);
    }
  };

  const toggleStock = async (id, currentStock) => {
    try {
      await axios.put(`http://${window.location.hostname}:5000/api/products/admin/${id}/toggleStock`, 
        { inStock: !currentStock },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchProductsAndCategories();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteProduct = (id) => {
    setConfirmObj({
      message: "Are you sure you want to delete this product?",
      onConfirm: async () => {
        try {
          await axios.delete(`http://${window.location.hostname}:5000/api/products/admin/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          fetchProductsAndCategories();
          toast.success("Product deleted successfully");
        } catch (err) {
          console.error(err);
          toast.error("Failed to delete product");
        }
        setConfirmObj(null);
      }
    });
  };

  // Extract unique users for the filter dropdown
  const uniqueUsers = [...new Set(products.map(p => p.updatedBy || p.createdBy).filter(Boolean))];

  const parseSearchTerm = (term) => {
    const t = term.toLowerCase().trim();
    if (t.includes('under ') || t.includes('<')) {
      const val = parseFloat(t.replace(/[^\d.]/g, ''));
      if (!isNaN(val)) return { type: 'under', val };
    }
    if (t.includes('above ') || t.includes('over ') || t.includes('>')) {
      const val = parseFloat(t.replace(/[^\d.]/g, ''));
      if (!isNaN(val)) return { type: 'above', val };
    }
    return { type: 'text', val: t };
  };

  const searchConfig = parseSearchTerm(searchTerm);

  const filteredProducts = products.filter(p => {
    let matchSearch = false;
    if (searchConfig.type === 'under') {
      matchSearch = p.price <= searchConfig.val;
    } else if (searchConfig.type === 'above') {
      matchSearch = p.price >= searchConfig.val;
    } else {
      matchSearch = p.name.toLowerCase().includes(searchConfig.val) || p.cat.toLowerCase().includes(searchConfig.val);
    }
    
    const matchUser = filterUser ? (p.updatedBy === filterUser || p.createdBy === filterUser) : true;
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
      {/* Drawer Overlay & Content */}
      <div className={`drawer-overlay ${isDrawerOpen ? 'open' : ''}`} onClick={() => setIsDrawerOpen(false)}></div>
      <div className={`offcanvas-drawer ${isDrawerOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <h3>{isEditing ? 'Edit Product' : 'Add New Product'}</h3>
          <button className="close-drawer" onClick={() => setIsDrawerOpen(false)}>&times;</button>
        </div>
        <div className="drawer-body">
          <form onSubmit={handleSave} style={{ display: 'grid', gap: '15px', gridTemplateColumns: '1fr 1fr' }}>
            <div className="col-span-2" style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: '12px', color: '#666', marginBottom: '4px', display: 'block' }}>Product Name</label>
              <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
            </div>
            
            <div>
              <label style={{ fontSize: '12px', color: '#666', marginBottom: '4px', display: 'block' }}>Price (₹)</label>
              <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#666', marginBottom: '4px', display: 'block' }}>Original Price (₹)</label>
              <input type="number" value={formData.orig} onChange={e => setFormData({...formData, orig: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
            </div>
            <div className="col-span-2" style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: '12px', color: '#666', marginBottom: '4px', display: 'block' }}>Stock Quantity</label>
              <input type="number" value={formData.stockQuantity} onChange={e => setFormData({...formData, stockQuantity: parseInt(e.target.value) || 0})} required style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
            </div>

            <div className="col-span-2" style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: '12px', color: '#666', marginBottom: '4px', display: 'block' }}>Variant Group ID <span style={{color: '#94a3b8', fontWeight: 'normal'}}>(Optional: Use same ID to group different colors)</span></label>
              <input type="text" value={formData.groupId || ''} onChange={e => setFormData({...formData, groupId: e.target.value})} placeholder="e.g. KANJIVARAM-101" style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
            </div>

            <div className="col-span-2" style={{ gridColumn: 'span 2', position: 'relative' }}>
              <label style={{ fontSize: '12px', color: '#666', marginBottom: '4px', display: 'block' }}>Categories</label>
              {/* Trigger Button */}
              <div
                onClick={() => setShowCatOverlay(true)}
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', userSelect: 'none' }}
              >
                <span style={{ color: (formData.categories || []).length ? '#1e293b' : '#94a3b8', fontSize: '14px' }}>
                  {(formData.categories || []).length > 0 ? `${formData.categories.length} categor${formData.categories.length > 1 ? 'ies' : 'y'} selected` : 'Click to select categories...'}
                </span>
                <i className="fa-solid fa-chevron-down" style={{ color: '#94a3b8', fontSize: '12px' }}></i>
              </div>

              {/* Selected Pills */}
              {(formData.categories || []).length > 0 && (
                <div style={{ marginTop: '8px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {formData.categories.map(cId => {
                    const c = categories.find(x => x.id === cId);
                    return c ? (
                      <span key={cId} style={{ background: '#e0e7ff', color: '#4338ca', padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '5px' }}>
                        {c.name}
                        <span
                          onClick={e => { e.stopPropagation(); const next = formData.categories.filter(id => id !== cId); setFormData({...formData, categories: next, cat: next[0] || ''}); }}
                          style={{ cursor: 'pointer', fontWeight: 'bold', color: '#6366f1' }}
                        >×</span>
                      </span>
                    ) : null;
                  })}
                </div>
              )}

              {/* Checkbox Overlay */}
              {showCatOverlay && (
                <>
                  <div onClick={() => setShowCatOverlay(false)} style={{ position: 'fixed', inset: 0, zIndex: 999 }} />
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', boxShadow: '0 10px 40px rgba(0,0,0,0.15)', zIndex: 1000, maxHeight: '280px', overflowY: 'auto', padding: '12px 0' }}>
                    <div style={{ padding: '4px 16px 10px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, fontSize: '13px', color: '#1e293b' }}>Select Categories</span>
                      <button type="button" onClick={() => setShowCatOverlay(false)} style={{ background: '#4338ca', color: '#fff', border: 'none', borderRadius: '6px', padding: '4px 12px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>Done</button>
                    </div>
                    <div style={{ padding: '8px 16px', borderBottom: '1px solid #f1f5f9' }}>
                      <input 
                        type="text" 
                        placeholder="Search categories..." 
                        value={catSearchTerm}
                        onChange={e => setCatSearchTerm(e.target.value)}
                        style={{ width: '100%', padding: '6px 10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px' }}
                      />
                    </div>
                    {categories.filter(c => !c.parentId).map(parent => {
                      const children = categories.filter(child => child.parentId === parent.id);
                      let rows = children.length > 0 ? children : [parent];
                      
                      // Filter by search term
                      if (catSearchTerm) {
                        const term = catSearchTerm.toLowerCase();
                        const parentMatches = parent.name.toLowerCase().includes(term);
                        if (!parentMatches) {
                          rows = rows.filter(r => r.name.toLowerCase().includes(term));
                        }
                        // If neither parent nor any children match, don't show this group
                        if (!parentMatches && rows.length === 0) return null;
                      }
                      return (
                        <div key={parent.id}>
                          <div style={{ padding: '8px 16px 4px', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{parent.name}</div>
                          {rows.map(item => {
                            const checked = (formData.categories || []).includes(item.id);
                            return (
                              <label key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 20px', cursor: 'pointer', transition: 'background 0.15s' }}
                                onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => {
                                    const next = checked
                                      ? formData.categories.filter(id => id !== item.id)
                                      : [...(formData.categories || []), item.id];
                                    setFormData({...formData, categories: next, cat: next[0] || ''});
                                  }}
                                  style={{ width: '16px', height: '16px', accentColor: '#4338ca', cursor: 'pointer' }}
                                />
                                <span style={{ fontSize: '14px', color: checked ? '#4338ca' : '#1e293b', fontWeight: checked ? 500 : 400 }}>
                                  {children.length > 0 ? `↳ ${item.name}` : item.name}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            <div className="col-span-2" style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: '12px', color: '#666', marginBottom: '4px', display: 'block' }}>Upload Product Images (Select multiple)</label>
              <input type="file" multiple accept="image/*" onChange={handleImageUpload} style={{ width: '100%', padding: '10px', border: '1px dashed #ccc', borderRadius: '6px' }} />
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
                {formData.imgUrls.map((url, idx) => url ? (
                  <div key={idx} style={{ position: 'relative', width: '80px', height: '80px' }}>
                    <img src={url} alt={`preview-${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ddd' }} />
                    <button 
                      type="button" 
                      onClick={() => removeImage(idx)}
                      style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}
                    >
                      &times;
                    </button>
                  </div>
                ) : null)}
              </div>
            </div>

            <div className="col-span-2" style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: '12px', color: '#666', marginBottom: '4px', display: 'block' }}>Description</label>
              <textarea value={formData.desc} onChange={e => setFormData({...formData, desc: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', minHeight: '80px' }}></textarea>
            </div>

            {/* Product Highlights */}
            <div className="col-span-2" style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: '12px', color: '#666', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Product Highlights (Specifications)</span>
                <button 
                  type="button" 
                  onClick={() => setFormData({...formData, highlights: [...(formData.highlights || []), { key: '', value: '' }]})}
                  style={{ background: '#e0e7ff', color: '#4338ca', border: 'none', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
                >
                  + Add Highlight
                </button>
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(formData.highlights || []).map((highlight, idx) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: '8px', alignItems: 'center' }}>
                    <input 
                      type="text" 
                      placeholder="e.g. Fabric" 
                      value={highlight.key} 
                      onChange={e => {
                        const newHighlights = [...formData.highlights];
                        newHighlights[idx].key = e.target.value;
                        setFormData({...formData, highlights: newHighlights});
                      }}
                      style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px' }}
                    />
                    <input 
                      type="text" 
                      placeholder="e.g. Pure Silk" 
                      value={highlight.value} 
                      onChange={e => {
                        const newHighlights = [...formData.highlights];
                        newHighlights[idx].value = e.target.value;
                        setFormData({...formData, highlights: newHighlights});
                      }}
                      style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px' }}
                    />
                    <button 
                      type="button" 
                      onClick={() => {
                        const newHighlights = formData.highlights.filter((_, i) => i !== idx);
                        setFormData({...formData, highlights: newHighlights});
                      }}
                      style={{ background: '#fee2e2', color: '#ef4444', border: 'none', width: '32px', height: '32px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-span-2" style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: '12px', color: '#666', marginBottom: '4px', display: 'block' }}>Tags (comma separated)</label>
              <input type="text" placeholder="e.g. red, silk, wedding" value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
            </div>

            <div className="col-span-2" style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: '12px', color: '#666', marginBottom: '4px', display: 'block' }}>Meta Title (SEO)</label>
              <input type="text" value={formData.metaTitle} onChange={e => setFormData({...formData, metaTitle: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
            </div>
            
            <div className="col-span-2" style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: '12px', color: '#666', marginBottom: '4px', display: 'block' }}>Meta Description (SEO)</label>
              <textarea value={formData.metaDesc} onChange={e => setFormData({...formData, metaDesc: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}></textarea>
            </div>

            <button type="submit" style={{ gridColumn: 'span 2', padding: '12px', background: '#1e293b', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
              {isEditing ? 'Save Changes' : 'Add Product'}
            </button>
          </form>
        </div>
      </div>

      <div className="tab-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
        <h3 style={{ margin: 0, fontSize: '24px', color: '#333' }}>Manage Products</h3>
        <button onClick={() => openDrawer()} style={{ padding: '10px 20px', background: '#1e293b', color: '#d4b896', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
          + Add New Product
        </button>
      </div>
      
      <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #eee' }}>
          <h4 style={{ margin: 0, color: '#444', marginBottom: '10px' }}>Inventory List & Filters</h4>
          
          <div className="advanced-filters">
            <input 
              type="text" 
              placeholder="Search by Name or Category..." 
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
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
            <thead style={{ background: '#f8fafc', color: '#64748b', fontSize: '14px' }}>
              <tr>
                <th style={{ padding: '15px 20px', borderBottom: '1px solid #e2e8f0' }}>Product</th>
                <th style={{ padding: '15px 20px', borderBottom: '1px solid #e2e8f0' }}>Category</th>
                <th style={{ padding: '15px 20px', borderBottom: '1px solid #e2e8f0' }}>Price</th>
                <th style={{ padding: '15px 20px', borderBottom: '1px solid #e2e8f0' }}>Status & Stock</th>
                <th style={{ padding: '15px 20px', borderBottom: '1px solid #e2e8f0' }}>Audit Info</th>
                <th style={{ padding: '15px 20px', borderBottom: '1px solid #e2e8f0', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(p => (
                <tr key={p._id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#f8fafc'} onMouseOut={e => e.currentTarget.style.background = 'white'}>
                  <td style={{ padding: '15px 20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <img src={p.imgUrls && p.imgUrls[0] ? p.imgUrls[0] : p.img} alt={p.name} style={{ width: '40px', height: '50px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #e2e8f0' }} />
                    <strong style={{ color: '#1e293b', fontSize: '15px' }}>{p.name}</strong>
                  </td>
                  <td style={{ padding: '15px 20px', color: '#64748b' }}>{p.cat}</td>
                  <td style={{ padding: '15px 20px' }}>
                    <span style={{ color: '#1e293b', fontWeight: 'bold' }}>₹{p.price}</span>
                    {p.orig && <span style={{ textDecoration: 'line-through', color: '#94a3b8', marginLeft: '8px', fontSize: '12px' }}>₹{p.orig}</span>}
                  </td>
                  <td style={{ padding: '15px 20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'flex-start' }}>
                      <span style={{ 
                        background: p.inStock ? '#dcfce7' : '#fee2e2', 
                        color: p.inStock ? '#166534' : '#991b1b', 
                        padding: '4px 10px', 
                        borderRadius: '12px', 
                        fontSize: '12px', 
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }} onClick={() => toggleStock(p._id, p.inStock)}>
                        {p.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                      <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>
                        Qty: {p.stockQuantity !== undefined ? p.stockQuantity : 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '15px 20px' }}>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      <div><strong>By:</strong> {p.updatedBy || p.createdBy || 'System Admin'}</div>
                      <div><strong>On:</strong> {p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : (p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'N/A')}</div>
                    </div>
                  </td>
                  <td style={{ padding: '15px 20px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button onClick={() => openDrawer(p)} style={{ background: '#e0e7ff', color: '#4338ca', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>
                        <i className="fa-solid fa-pen"></i> Edit
                      </button>
                      <button onClick={() => deleteProduct(p._id)} style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>
                        <i className="fa-solid fa-trash"></i> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>No products found matching your filter.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Product_Admin;
