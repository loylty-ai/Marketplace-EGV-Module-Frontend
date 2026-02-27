import React from 'react';

// Skeleton row for loading animation
function SkeletonTable() {
    // 5 table cells: ID, Name, Code, Status, Actions
    return (
      <tr>
        <td className="px-4 py-4 w-28">
          <div className="h-4 w-16 bg-neutral-200 rounded animate-pulse" />
        </td>
        <td className="px-4 py-4">
          <div className="h-4 w-32 bg-neutral-200 rounded animate-pulse" />
        </td>
        <td className="px-4 py-4">
          <div className="h-4 w-20 bg-neutral-200 rounded animate-pulse" />
        </td>
        <td className="px-4 py-4">
          <div className="h-4 w-16 bg-neutral-200 rounded animate-pulse" />
        </td>
        <td className="px-4 py-4 flex justify-end items-center">
          <div className="h-8 w-8 bg-neutral-200 rounded-full animate-pulse" />
        </td>
      </tr>
    );
  }

  export default SkeletonTable;