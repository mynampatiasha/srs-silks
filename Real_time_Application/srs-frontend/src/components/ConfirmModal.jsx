import React from 'react';

const ConfirmModal = ({ isOpen, message, onConfirm, onCancel, confirmText = "Confirm", cancelText = "Cancel" }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
      background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', 
      zIndex: 9999, animation: 'fadeIn 0.2s ease-out'
    }}>
      <style>
        {`
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        `}
      </style>
      <div style={{
        background: 'white', padding: '30px', borderRadius: '16px', 
        width: '90%', maxWidth: '400px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        animation: 'slideUp 0.3s ease-out', textAlign: 'center'
      }}>
        <div style={{
          width: '60px', height: '60px', background: '#fef3c7', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px', color: '#d97706', fontSize: '24px'
        }}>
          <i className="fa-solid fa-triangle-exclamation"></i>
        </div>
        
        <h3 style={{ fontSize: '18px', color: 'var(--ink)', marginBottom: '12px', fontWeight: '600' }}>Are you sure?</h3>
        <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px', lineHeight: '1.5' }}>
          {message}
        </p>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: '12px', background: 'white', color: '#64748b',
            border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer',
            fontWeight: '600', transition: 'all 0.2s'
          }}>
            {cancelText}
          </button>
          <button onClick={onConfirm} style={{
            flex: 1, padding: '12px', background: 'var(--ink)', color: 'white',
            border: 'none', borderRadius: '8px', cursor: 'pointer',
            fontWeight: '600', transition: 'all 0.2s'
          }}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
