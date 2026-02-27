import React from 'react';

export default function StatCard({ title, value }) {
    return (
      <div className="bg-white border border-neutral-200 shadow-md rounded-xl p-6 flex flex-col">
        <span className="text-neutral-500 text-sm">{title}</span>
        <span className="text-3xl font-semibold text-neutral-900 mt-2">
          {value}
        </span>
      </div>
    )
  }