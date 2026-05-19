import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useDebounce } from '../hooks/useDebounce';
import { FilterBar } from '../components/FilterBar';
import { LeadTable } from '../components/LeadTable';
import type { LeadType } from '../components/LeadTable';
import { LeadModal } from '../components/LeadModal';

export const Dashboard: React.FC = () => {
  const { token, logout } = useAuth();
  
  const [leads, setLeads] = useState<LeadType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filtering & Pagination State
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [source, setSource] = useState('');
  const [sort, setSort] = useState('latest');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [leadToEdit, setLeadToEdit] = useState<LeadType | null>(null);
  
  const [exportLoading, setExportLoading] = useState(false);

  // Debounced search term
  const debouncedSearch = useDebounce(search, 500);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, source, sort]);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      const response = await axios.get(`${apiUrl}/leads`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          search: debouncedSearch,
          status,
          source,
          sort,
          page
        }
      });

      setLeads(response.data.leads);
      setPages(response.data.pagination.pages);
      setTotal(response.data.pagination.total);
    } catch (err: any) {
      if (err.response?.status === 401) {
        logout();
      } else {
        setError('Failed to fetch leads. Please check your network connection.');
      }
    } finally {
      setLoading(false);
    }
  }, [token, debouncedSearch, status, source, sort, page, logout]);

  useEffect(() => {
    if (token) {
      fetchLeads();
    }
  }, [fetchLeads, token]);

  const handleEdit = (lead: LeadType) => {
    setLeadToEdit(lead);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setLeadToEdit(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this lead?')) {
      return;
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      await axios.delete(`${apiUrl}/leads/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      fetchLeads();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete lead.');
    }
  };

  const handleExportCSV = async () => {
    setExportLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      const response = await axios.get(`${apiUrl}/leads/export`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          search: debouncedSearch,
          status,
          source,
          sort
        },
        responseType: 'blob' // Essential to get the raw text/csv blob
      });

      // Handle the blob download
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'leads_export.csv');
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to export leads. Please try again.');
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Leads Overview</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Monitor and manage incoming client queries and sales opportunities.
          </p>
        </div>
      </div>

      {/* API Error Banner */}
      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-400 border border-red-200 dark:border-red-900/30">
          {error}
        </div>
      )}

      {/* Filters and Actions */}
      <FilterBar
        search={search}
        setSearch={setSearch}
        status={status}
        setStatus={setStatus}
        source={source}
        setSource={setSource}
        sort={sort}
        setSort={setSort}
        onAddLead={handleAdd}
        onExportCSV={handleExportCSV}
        exportLoading={exportLoading}
      />

      {/* Main Leads Table */}
      <LeadTable
        leads={leads}
        loading={loading}
        page={page}
        pages={pages}
        total={total}
        limit={limit}
        onPageChange={setPage}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Lead Create/Edit Dialog */}
      <LeadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        leadToEdit={leadToEdit}
        onSaveSuccess={fetchLeads}
      />
    </div>
  );
};
