
export default function StatusBadge({ status }) {
    return (
      <span
        className={`px-3 py-1 rounded-md text-xs font-medium ${status
          ? "bg-emerald-100 text-emerald-700"
          : "bg-red-100 text-red-700"
        }`}
      >
        {status ? 'Active' : 'Inactive'}
      </span>
    );
}

export { StatusBadge };