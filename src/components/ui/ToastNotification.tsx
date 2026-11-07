'use client';

interface ToastProps {
  message?: string | null;
  type?: 'success' | 'error' | 'info';
  onClose?: () => void;
}

export default function ToastNotification(_props: ToastProps) {
  return null;
}
