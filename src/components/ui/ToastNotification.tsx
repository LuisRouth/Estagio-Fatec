'use client';

import React from 'react';

interface ToastProps {
  message: string | null;
  type?: 'success' | 'error' | 'info';
  onClose?: () => void;
}

export default function ToastNotification({ message, type = 'success', onClose }: ToastProps) {
  if (!message) return null;

  const isSuccess = type === 'success';
  const isError = type === 'error';

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 300,
        animation: 'slideDown 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div
        className="custom-toast-pill"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.75rem 1.25rem',
          borderRadius: '50px',
          backgroundColor: isSuccess ? '#10b981' : isError ? '#ef4444' : '#0284c7',
          color: '#ffffff',
          fontWeight: 700,
          fontSize: '0.875rem',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.25)',
        }}
      >
        <span>{isSuccess ? '✓' : isError ? '⚠️' : 'ℹ️'}</span>
        <span>{message}</span>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#ffffff',
              fontSize: '1rem',
              cursor: 'pointer',
              marginLeft: '0.5rem',
              opacity: 0.8,
            }}
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
