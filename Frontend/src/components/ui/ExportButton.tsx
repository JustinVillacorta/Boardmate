import React from 'react';
import { Download } from 'lucide-react';

interface ExportButtonProps {
  onClick: () => void | Promise<void>;
  disabled?: boolean;
  loading?: boolean;
  label?: string;
}

const ExportButton: React.FC<ExportButtonProps> = ({ 
  onClick, 
  disabled = false, 
  loading = false,
  label = 'Export to Excel'
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {loading ? (
        <>
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-green-600">Exporting...</span>
        </>
      ) : (
        <>
          <Download className="w-4 h-4 text-green-600" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
};

export default ExportButton;

