'use client';

import { useState } from 'react';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import { 
  File, 
  Calendar, 
  Database, 
  Eye, 
  MessageCircle, 
  Download, 
  Trash2,
  Filter,
  Search,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { getReports, deleteReport, ReportInfo } from '@/services/api';

export default function ReportList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'created_at' | 'filename' | 'file_size'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const {
    data: reports = [],
    isLoading,
    error,
    refetch
  } = useQuery(
    ['reports', statusFilter],
    () => getReports({ 
      status: statusFilter === 'all' ? undefined : statusFilter,
      limit: 100 
    }),
    {
      refetchInterval: 10000, // Refetch every 10 seconds to update status
      refetchIntervalInBackground: false,
    }
  );

  const handleDeleteReport = async (reportId: string, filename: string) => {
    if (!confirm(`Are you sure you want to delete "${filename}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteReport(reportId);
      toast.success('Report deleted successfully');
      refetch();
    } catch (error: any) {
      const message = error?.response?.data?.detail || 'Failed to delete report';
      toast.error(message);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ready: { class: 'badge-success', text: 'Ready' },
      parsing: { class: 'badge-info', text: 'Processing' },
      uploading: { class: 'badge-warning', text: 'Uploading' },
      error: { class: 'badge-error', text: 'Error' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      class: 'badge-gray',
      text: status
    };

    return (
      <span className={`badge ${config.class}`}>
        {config.text}
      </span>
    );
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredAndSortedReports = reports
    .filter((report: ReportInfo) => {
      if (searchTerm) {
        return report.filename.toLowerCase().includes(searchTerm.toLowerCase());
      }
      return true;
    })
    .sort((a: ReportInfo, b: ReportInfo) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'created_at') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = (bValue as string).toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  if (error) {
    return (
      <div className="card">
        <div className="card-body text-center py-12">
          <div className="text-error-500 mb-4">
            <Database className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Failed to load reports
          </h3>
          <p className="text-gray-600 mb-4">
            There was an error loading your reports. Please try again.
          </p>
          <button
            onClick={() => refetch()}
            className="btn btn-primary"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Reports</h2>
          <p className="text-gray-600">
            {reports.length} report{reports.length !== 1 ? 's' : ''} total
          </p>
        </div>
        
        <button
          onClick={() => refetch()}
          disabled={isLoading}
          className="btn btn-outline"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Filters and Search */}
      <div className="card">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input"
              >
                <option value="all">All Status</option>
                <option value="ready">Ready</option>
                <option value="parsing">Processing</option>
                <option value="error">Error</option>
              </select>
            </div>

            {/* Sort */}
            <div className="sm:w-48">
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field as any);
                  setSortOrder(order as any);
                }}
                className="input"
              >
                <option value="created_at-desc">Newest First</option>
                <option value="created_at-asc">Oldest First</option>
                <option value="filename-asc">Name A-Z</option>
                <option value="filename-desc">Name Z-A</option>
                <option value="file_size-desc">Largest First</option>
                <option value="file_size-asc">Smallest First</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Reports List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="card-body">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-300 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-1/3" />
                    <div className="h-3 bg-gray-300 rounded w-1/2" />
                  </div>
                  <div className="w-20 h-6 bg-gray-300 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredAndSortedReports.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-12">
            <File className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No reports found' : 'No reports yet'}
            </h3>
            <p className="text-gray-600">
              {searchTerm 
                ? `No reports match "${searchTerm}". Try adjusting your search.`
                : 'Upload your first Crystal Report to get started.'
              }
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAndSortedReports.map((report: ReportInfo, index: number) => (
            <motion.div
              key={report.report_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="card hover:shadow-lg transition-all duration-200"
            >
              <div className="card-body">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-sap-blue bg-opacity-10 rounded-lg flex items-center justify-center">
                        <File className="w-6 h-6 text-sap-blue" />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {report.filename}
                        </h3>
                        {getStatusBadge(report.status)}
                      </div>
                      
                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Database className="w-4 h-4" />
                          <span>{formatFileSize(report.file_size)}</span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {format(new Date(report.created_at), 'MMM d, yyyy')}
                          </span>
                        </div>
                      </div>
                      
                      {report.error_message && (
                        <div className="mt-2 p-2 bg-error-50 border border-error-200 rounded text-sm text-error-700">
                          {report.error_message}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    {report.status === 'ready' && (
                      <>
                        <a
                          href={`/reports/${report.report_id}`}
                          className="btn btn-outline btn-sm"
                          title="View Report"
                        >
                          <Eye className="w-4 h-4" />
                        </a>
                        
                        <a
                          href={`/reports/${report.report_id}/chat`}
                          className="btn btn-primary btn-sm"
                          title="Chat with Report"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>
                      </>
                    )}
                    
                    {report.status === 'parsing' && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <div className="loading-spinner w-4 h-4" />
                        <span>Processing...</span>
                      </div>
                    )}
                    
                    <button
                      onClick={() => handleDeleteReport(report.report_id, report.filename)}
                      className="btn btn-outline btn-sm text-error-600 hover:text-error-700 hover:border-error-300"
                      title="Delete Report"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}