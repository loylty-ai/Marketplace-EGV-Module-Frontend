import { Plus } from 'lucide-react';
import React from 'react';

export default function AddButton({ onClick, title }) {
  return (
    <button
      type="button"
      className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
      onClick={onClick}
    >
        <Plus size={16} />
      {title}
    </button>
  );
}