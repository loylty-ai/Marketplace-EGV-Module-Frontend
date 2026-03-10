import { Plus } from 'lucide-react';
import React from 'react';

export default function AddButton({ onClick, title }) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-medium shadow-card hover:opacity-95 transition-opacity duration-fast focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      onClick={onClick}
    >
      <Plus size={16} />
      {title}
    </button>
  );
}