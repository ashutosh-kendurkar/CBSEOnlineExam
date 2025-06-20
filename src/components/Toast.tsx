import { useEffect } from 'react';

interface ToastProps {
  message: string;
  show: boolean;
  onClose: () => void;
}

export default function Toast({ message, show, onClose }: ToastProps) {
  useEffect(() => {
    if (show) {
      const id = setTimeout(onClose, 3000);
      return () => clearTimeout(id);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="fixed top-4 right-4 bg-gray-800 text-white px-4 py-2 rounded shadow">
      {message}
    </div>
  );
}
