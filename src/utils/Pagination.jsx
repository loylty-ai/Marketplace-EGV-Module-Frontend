import React from 'react';


/**
   * Generic Pagination component for React.
   *
   * Props:
   *   - page (number): Current page (0-based)
   *   - setPage (function): Setter for current page
   *   - total (number): Total number of items
   *   - totalPages (number): Total number of pages
   *   - size (number): Current page size
   *   - setSize (function): Setter for page size
   *   - itemLabel (string): Singular or plural label for the items (optional, defaults to 'Items')
   *   - pageSizeOptions (array): Array of allowed page size numbers (optional, defaults to [5,10,20,50,100])
*/

export function Pagination({
    page,
    setPage,
    total,
    totalPages,
    size,
    setSize,
    itemLabel = 'Items',
    pageSizeOptions = [5, 10, 20, 50, 100],
    className = '',
  }) {
    // Show at most 5 page numbers, values in 0-based but user sees 1-based
    // Clamp start & end for 0-based pages
    const startPage = Math.max(0, page - 2);
    const endPage = Math.min(totalPages - 1, startPage + 4);
    const pageNumbers = [];
    for (let p = startPage; p <= endPage; p++) {
      pageNumbers.push(p);
    }
    return (
      <nav className={`p-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-700 ${className}`}>
        <div>
          Page <span className="font-bold">{page + 1}</span> of <span className="font-bold">{totalPages}</span> &bull;{" "}
          <span className="ml-2">{total} {itemLabel}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="px-2 py-1 rounded hover:bg-slate-100 disabled:opacity-60"
            disabled={page === 0}
            onClick={() => setPage(Math.max(0, page - 1))}
            aria-label="Previous page"
            type="button"
          >
            &lt;
          </button>
          {pageNumbers.map((p) => (
            <button
              key={p}
              className={`px-2 py-1 rounded ${p === page ? 'bg-emerald-600 text-white' : 'hover:bg-slate-100'}`}
              onClick={() => setPage(p)}
              disabled={p === page}
              type="button"
            >
              {p + 1}
            </button>
          ))}
          <button
            className="px-2 py-1 rounded hover:bg-slate-100 disabled:opacity-60"
            disabled={page === totalPages - 1 || totalPages === 0}
            onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
            aria-label="Next page"
            type="button"
          >
            &gt;
          </button>
          <select
            className="ml-2 px-1 py-1 border border-slate-200 rounded"
            value={size}
            onChange={e => { setSize(Number(e.target.value)); setPage(0); }}
          >
            {pageSizeOptions.map(opt =>
              <option key={opt} value={opt}>{opt} / page</option>
            )}
          </select>
        </div>
      </nav>
    );
  }