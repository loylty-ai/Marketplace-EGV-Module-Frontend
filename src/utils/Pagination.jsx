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
      <nav className={`p-4 flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground border-t border-border ${className}`}>
        <div>
          Page <span className="font-semibold text-foreground">{page + 1}</span> of <span className="font-semibold text-foreground">{totalPages}</span>
          <span className="ml-2">• {total} {itemLabel}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            className="px-2.5 py-1.5 rounded-lg hover:bg-muted disabled:opacity-50 transition-colors duration-fast font-medium"
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
              className={`min-w-[2rem] px-2.5 py-1.5 rounded-lg transition-colors duration-fast font-medium ${
                p === page ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-foreground'
              }`}
              onClick={() => setPage(p)}
              disabled={p === page}
              type="button"
            >
              {p + 1}
            </button>
          ))}
          <button
            className="px-2.5 py-1.5 rounded-lg hover:bg-muted disabled:opacity-50 transition-colors duration-fast font-medium"
            disabled={page === totalPages - 1 || totalPages === 0}
            onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
            aria-label="Next page"
            type="button"
          >
            &gt;
          </button>
          <select
            className="ml-2 px-2.5 py-1.5 border border-border rounded-lg bg-background text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring"
            value={size}
            onChange={e => { setSize(Number(e.target.value)); setPage(0); }}
          >
            {pageSizeOptions.map(opt => (
              <option key={opt} value={opt}>{opt} / page</option>
            ))}
          </select>
        </div>
      </nav>
    );
  }