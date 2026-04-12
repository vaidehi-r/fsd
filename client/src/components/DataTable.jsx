import { useState } from 'react';
import { HiChevronUp, HiChevronDown, HiChevronLeft, HiChevronRight } from 'react-icons/hi';

/**
 * Reusable DataTable component with sortable columns and pagination.
 */
const DataTable = ({ columns, data, totalPages = 1, currentPage = 1, onPageChange, onSort, emptyMessage = 'No data found.' }) => {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  const handleSort = (key) => {
    const newDir = sortKey === key && sortDir === 'asc' ? 'desc' : 'asc';
    setSortKey(key);
    setSortDir(newDir);
    if (onSort) onSort(key, newDir);
  };

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {col.sortable ? (
                    <button onClick={() => handleSort(col.key)}
                      className="flex items-center gap-1 hover:text-primary-700 transition-colors">
                      {col.label}
                      <span className="flex flex-col">
                        <HiChevronUp className={`text-xs -mb-1 ${sortKey === col.key && sortDir === 'asc' ? 'text-primary-700' : 'text-gray-300'}`} />
                        <HiChevronDown className={`text-xs ${sortKey === col.key && sortDir === 'desc' ? 'text-primary-700' : 'text-gray-300'}`} />
                      </span>
                    </button>
                  ) : (
                    col.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.length === 0 ? (
              <tr><td colSpan={columns.length} className="px-4 py-12 text-center text-slate-400">{emptyMessage}</td></tr>
            ) : (
              data.map((row, idx) => (
                <tr key={row._id || idx} className="hover:bg-gray-50/50 transition-colors">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3.5 text-sm text-slate-600">
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
          <p className="text-sm text-slate-500">Page {currentPage} of {totalPages}</p>
          <div className="flex items-center gap-1">
            <button onClick={() => onPageChange?.(currentPage - 1)} disabled={currentPage <= 1}
              className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              <HiChevronLeft className="text-lg text-slate-600" />
            </button>
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              const page = i + 1;
              return (
                <button key={page} onClick={() => onPageChange?.(page)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                    page === currentPage ? 'bg-primary-700 text-white' : 'text-slate-600 hover:bg-gray-100'
                  }`}>{page}</button>
              );
            })}
            <button onClick={() => onPageChange?.(currentPage + 1)} disabled={currentPage >= totalPages}
              className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              <HiChevronRight className="text-lg text-slate-600" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
