import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export interface LeadType {
  _id: string;
  name: string;
  email: string;
  status: 'New' | 'Contacted' | 'Qualified' | 'Lost';
  source: 'Website' | 'Instagram' | 'Referral';
  createdAt: string;
  createdBy?: {
    name: string;
    email: string;
  };
}

interface LeadTableProps {
  leads: LeadType[];
  loading: boolean;
  page: number;
  pages: number;
  total: number;
  limit: number;
  onPageChange: (newPage: number) => void;
  onEdit: (lead: LeadType) => void;
  onDelete: (id: string) => void;
}

export const LeadTable: React.FC<LeadTableProps> = ({
  leads,
  loading,
  page,
  pages,
  total,
  limit,
  onPageChange,
  onEdit,
  onDelete
}) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';

  const getStatusBadge = (status: LeadType['status']) => {
    switch (status) {
      case 'New':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-900/30';
      case 'Contacted':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-900/30';
      case 'Qualified':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/30';
      case 'Lost':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-900/30';
      default:
        return 'bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  const getSourceBadge = (source: LeadType['source']) => {
    switch (source) {
      case 'Website':
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
      case 'Instagram':
        return 'bg-pink-50 text-pink-700 dark:bg-pink-950/30 dark:text-pink-300';
      case 'Referral':
        return 'bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-300';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  const startRecord = (page - 1) * limit + 1;
  const endRecord = Math.min(page * limit, total);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-indigo-600"></div>
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white py-16 px-4 text-center dark:border-slate-800 dark:bg-slate-900 transition-colors duration-200">
        <span className="text-4xl">📭</span>
        <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">No leads found</h3>
        <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
          Try adjusting your search criteria, filters, or add a new lead to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4">
      {/* Table Container */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-colors duration-200">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
          <thead className="bg-slate-50 dark:bg-slate-900/50">
            <tr>
              <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Lead
              </th>
              <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Email
              </th>
              <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Status
              </th>
              <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Source
              </th>
              <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Created
              </th>
              <th scope="col" className="relative px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900">
            {leads.map((lead) => (
              <tr key={lead._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors duration-150">
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="font-semibold text-slate-950 dark:text-slate-100 text-sm">
                    {lead.name}
                  </div>
                  {lead.createdBy?.name && (
                    <div className="text-xs text-slate-400">
                      Created by: {lead.createdBy.name}
                    </div>
                  )}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                  {lead.email}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm">
                  <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${getStatusBadge(lead.status)}`}>
                    {lead.status}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm">
                  <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${getSourceBadge(lead.source)}`}>
                    {lead.source}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                  {new Date(lead.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => onEdit(lead)}
                      className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                      title="Edit Lead"
                    >
                      <Edit2 size={16} />
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => onDelete(lead._id)}
                        className="rounded p-1 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/30 dark:hover:text-red-300"
                        title="Delete Lead"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between border border-slate-200 bg-white px-4 py-3 sm:px-6 rounded-xl dark:border-slate-800 dark:bg-slate-900 transition-colors duration-200 text-sm">
        <div className="flex flex-1 items-center justify-between sm:hidden">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="relative inline-flex items-center rounded-lg border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 hover:bg-slate-50 disabled:bg-slate-100 disabled:text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:disabled:bg-slate-800/40"
          >
            Previous
          </button>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= pages}
            className="relative ml-3 inline-flex items-center rounded-lg border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 hover:bg-slate-50 disabled:bg-slate-100 disabled:text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:disabled:bg-slate-800/40"
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-slate-600 dark:text-slate-400">
              Showing <span className="font-semibold text-slate-800 dark:text-slate-200">{startRecord}</span> to{' '}
              <span className="font-semibold text-slate-800 dark:text-slate-200">{endRecord}</span> of{' '}
              <span className="font-semibold text-slate-800 dark:text-slate-200">{total}</span> leads
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
              <button
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 1}
                className="relative inline-flex items-center rounded-l-md border border-slate-300 bg-white px-3 py-2 font-medium text-slate-500 hover:bg-slate-50 disabled:bg-slate-100 disabled:text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:disabled:bg-slate-800/40"
              >
                Previous
              </button>
              
              {/* Simple page numbers */}
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => onPageChange(p)}
                  className={`relative inline-flex items-center border px-4 py-2 font-medium text-sm ${
                    p === page
                      ? 'z-10 border-indigo-500 bg-indigo-50 text-indigo-600 dark:border-indigo-500 dark:bg-indigo-950/40 dark:text-indigo-300'
                      : 'border-slate-300 bg-white text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                  }`}
                >
                  {p}
                </button>
              ))}

              <button
                onClick={() => onPageChange(page + 1)}
                disabled={page >= pages}
                className="relative inline-flex items-center rounded-r-md border border-slate-300 bg-white px-3 py-2 font-medium text-slate-500 hover:bg-slate-50 disabled:bg-slate-100 disabled:text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:disabled:bg-slate-800/40"
              >
                Next
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};
