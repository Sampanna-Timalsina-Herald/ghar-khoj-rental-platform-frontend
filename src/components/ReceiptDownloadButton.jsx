/**
 * Receipt Download Button Component
 * Reusable button for viewing and downloading payment receipts
 */

import React, { useState } from 'react';
import { Download, FileText, Eye } from 'lucide-react';
import ReceiptViewerModal from './ReceiptViewerModal';

const ReceiptDownloadButton = ({ 
  paymentId, 
  transactionUuid, 
  hasReceipt = true,
  variant = 'primary', // 'primary', 'secondary', 'icon'
  size = 'md', // 'sm', 'md', 'lg'
  className = ''
}) => {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [error, setError] = useState(null);

  const handleViewClick = () => {
    const id = transactionUuid || paymentId;
    if (!id) {
      setError('Payment ID not provided');
      setTimeout(() => setError(null), 3000);
      return;
    }

    // Open modal regardless of receipt status
    // If no receipt, modal will show "Generate" button
    setIsViewerOpen(true);
  };

  // Size classes
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  // Variant classes
  const variantClasses = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300',
    icon: 'bg-transparent hover:bg-gray-100 text-gray-600 p-2'
  };

  // Icon size based on button size
  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 18
  };

  const id = transactionUuid || paymentId;

  if (variant === 'icon') {
    // Icon variant - show Generate icon for missing receipts
    return (
      <>
        <button
          onClick={handleViewClick}
          title={hasReceipt ? 'View Receipt' : 'Generate Receipt'}
          className={`
            relative rounded-md transition-all duration-200 
            ${hasReceipt ? variantClasses[variant] : 'bg-yellow-50 hover:bg-yellow-100 text-yellow-600 p-2'}
            ${error ? 'bg-red-50 hover:bg-red-100 text-red-600' : ''}
            ${className}
          `}
        >
          {hasReceipt ? <Eye size={iconSizes[size]} /> : <FileText size={iconSizes[size]} />}
        </button>
        
        <ReceiptViewerModal 
          transactionUuid={id}
          isOpen={isViewerOpen}
          onClose={() => setIsViewerOpen(false)}
        />
      </>
    );
  }

  return (
    <>
      <button
        onClick={handleViewClick}
        className={`
          inline-flex items-center gap-2 
          rounded-md font-medium transition-all duration-200
          ${sizeClasses[size]} 
          ${hasReceipt ? variantClasses[variant] : 'bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border border-yellow-300'}
          ${error ? 'bg-red-600 hover:bg-red-700 text-white' : ''}
          ${className}
        `}
      >
        {hasReceipt ? <Eye size={iconSizes[size]} /> : <FileText size={iconSizes[size]} />}
        {variant !== 'icon' && <span>{error || (hasReceipt ? 'View Receipt' : 'Generate Receipt')}</span>}
      </button>

      <ReceiptViewerModal 
        transactionUuid={id}
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
      />
    </>
  );
};

export default ReceiptDownloadButton;
