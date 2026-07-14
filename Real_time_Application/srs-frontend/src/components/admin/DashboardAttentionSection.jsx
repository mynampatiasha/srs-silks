import React from 'react';

const CARD_CONFIG = [
  { key: 'orders', label: 'New orders', icon: 'ti-shopping-cart', link: '/admin/orders' },
  { key: 'returns', label: 'Return requests', icon: 'ti-arrow-back-up', link: '/admin/returns' },
  { key: 'reviews', label: 'Pending reviews', icon: 'ti-star', link: '/admin/reviews' },
  { key: 'customers', label: 'New customers', icon: 'ti-users', link: '/admin/customers' },
];

function renderItemLine(cardKey, item) {
  switch (cardKey) {
    case 'orders':
    case 'returns':
      return `${item.customer?.name || item.shippingAddress?.name || 'Unknown'} — ₹${item.totalAmount}`;
    case 'reviews':
      return `${item.product?.name || 'Product'} — ${item.user?.name || 'Customer'} (${item.rating}★)`;
    case 'customers':
      return `${item.name} — ${item.email}`;
    default:
      return '';
  }
}

function DashboardAttentionSection({ summary, loading }) {
  if (loading) return <p style={{ color: '#666' }}>Loading dashboard summary...</p>;
  if (!summary) return null;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '24px' }}>
      {CARD_CONFIG.map(({ key, label, icon, link }) => {
        const data = summary[key];
        if (!data) return null;
        return (
          <div key={key} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontWeight: 500, fontSize: '15px' }}>{label}</span>
              <span style={{
                background: data.count > 0 ? '#fee2e2' : '#f3f4f6',
                color: data.count > 0 ? '#b91c1c' : '#6b7280',
                fontSize: '12px', padding: '2px 8px', borderRadius: '6px'
              }}>
                {data.count} {data.count === 1 ? 'item' : 'new'}
              </span>
            </div>
            <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {data.items.length === 0 && <span style={{ fontSize: '13px', color: '#9ca3af' }}>Nothing pending</span>}
              {data.items.map(item => (
                <div key={item._id} style={{ fontSize: '13px', color: '#374151' }}>
                  {renderItemLine(key, item)}
                </div>
              ))}
            </div>
            {data.count > 5 && (
              <a href={link} style={{ fontSize: '13px', color: '#2563eb', marginTop: '8px', display: 'inline-block' }}>
                View all →
              </a>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default DashboardAttentionSection;
