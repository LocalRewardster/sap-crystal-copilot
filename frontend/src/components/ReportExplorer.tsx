'use client';

import { useState } from 'react';
import { useQuery } from 'react-query';
import { 
  FileText, 
  Calendar, 
  Database, 
  Eye, 
  MessageSquare, 
  Download, 
  Trash2,
  MoreHorizontal,
  Grid,
  List,
  SortAsc,
  Filter,
  RefreshCw,
  FolderOpen,
  Clock,
  User,
  FileX
} from 'lucide-react';
import { format } from 'date-fns';
import { getReports, ReportInfo } from '@/services/api';

interface ReportExplorerProps {
  onViewChange?: (view: string) => void;
}

export default function ReportExplorer({ onViewChange }: ReportExplorerProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [sortBy, setSortBy] = useState<'name' | 'modified' | 'size'>('modified');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const {
    data: reports = [],
    isLoading,
    error,
    refetch
  } = useQuery(
    ['reports', filterStatus],
    () => getReports({ 
      status: filterStatus === 'all' ? undefined : filterStatus,
      limit: 100 
    }),
    {
      refetchInterval: 30000,
    }
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready':
        return <div className="w-2 h-2 bg-green-500 rounded-full" />;
      case 'parsing':
        return <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />;
      case 'error':
        return <div className="w-2 h-2 bg-red-500 rounded-full" />;
      default:
        return <div className="w-2 h-2 bg-gray-400 rounded-full" />;
    }
  };

  const getFileIcon = (filename: string) => {
    return <FileText className="w-5 h-5 text-blue-600" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 KB';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const sortedReports = [...reports].sort((a: ReportInfo, b: ReportInfo) => {
    switch (sortBy) {
      case 'name':
        return a.filename.localeCompare(b.filename);
      case 'size':
        return b.file_size - a.file_size;
      case 'modified':
      default:
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    }
  });

  const filteredReports = sortedReports.filter((report: ReportInfo) => {
    if (filterStatus === 'all') return true;
    return report.status === filterStatus;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96 p-8">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 mx-auto"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent absolute top-0 left-1/2 transform -translate-x-1/2"></div>
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Loading Reports</h3>
          <p className="text-slate-600">Fetching your Crystal Reports from the server...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96 p-8">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-gradient-to-br from-red-50 to-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg border border-red-200">
            <FileX className="w-10 h-10 text-red-600" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-3">Connection Error</h3>
          <p className="text-slate-600 mb-6 leading-relaxed">Unable to connect to the report server. Please check your connection and try again.</p>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
          >
            <RefreshCw className="w-5 h-5 mr-3" />
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-6 py-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <h2 className="text-xl font-bold text-gray-900">
              My Reports ({filteredReports.length})
            </h2>
            
            <div className="flex items-center space-x-3">
              {/* View Mode Toggle */}
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2.5 transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-blue-50 text-blue-600 border-blue-200' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2.5 transition-colors border-l border-gray-300 ${
                    viewMode === 'grid' 
                      ? 'bg-blue-50 text-blue-600 border-blue-200' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
              </div>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-sm border border-gray-300 rounded-lg px-3 py-2.5 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="modified">Sort by Modified</option>
                <option value="name">Sort by Name</option>
                <option value="size">Sort by Size</option>
              </select>

              {/* Filter Dropdown */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="text-sm border border-gray-300 rounded-lg px-3 py-2.5 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Reports</option>
                <option value="ready">Ready</option>
                <option value="parsing">Processing</option>
                <option value="error">Error</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => refetch()}
              disabled={isLoading}
              className="inline-flex items-center space-x-2 px-4 py-2.5 text-sm border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 font-medium transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <button 
              onClick={() => onViewChange?.('upload')}
              className="inline-flex items-center space-x-2 px-4 py-2.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm font-medium transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>Upload Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {filteredReports.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center py-16 px-8 max-w-md">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <FolderOpen className="w-10 h-10 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                No reports found
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Upload your first Crystal Report to get started with AI-powered analysis and editing. 
                Our AI will help you understand field lineage, make edits, and optimize your reports.
              </p>
              <button 
                onClick={() => onViewChange?.('upload')}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm transition-colors font-medium"
              >
                <FileText className="w-5 h-5" />
                <span>Upload Your First Report</span>
              </button>
              
              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500 mb-3">Quick tips to get started:</p>
                <div className="text-left space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    <span>Supports .rpt files up to 25MB</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    <span>AI analysis completes in under 15 seconds</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    <span>Ask questions in natural language</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 
            'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 
            'space-y-2'
          }>
            {filteredReports.map((report: ReportInfo) => (
              <div
                key={report.report_id}
                className={`bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer ${
                  viewMode === 'grid' ? 'p-4' : 'p-3'
                }`}
              >
                {viewMode === 'grid' ? (
                  // Grid View
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        {getFileIcon(report.filename)}
                        {getStatusIcon(report.status)}
                      </div>
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-gray-900 text-sm truncate" title={report.filename}>
                        {report.filename}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatFileSize(report.file_size)}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>{format(new Date(report.updated_at), 'MMM d, yyyy')}</span>
                    </div>

                    {report.status === 'ready' && (
                      <div className="flex space-x-1">
                        <button className="flex-1 px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100">
                          Open
                        </button>
                        <button className="px-2 py-1 text-xs bg-gray-50 text-gray-700 rounded hover:bg-gray-100">
                          <MessageSquare className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  // List View
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-3">
                      {getFileIcon(report.filename)}
                      {getStatusIcon(report.status)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 text-sm truncate">
                        {report.filename}
                      </h3>
                      <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                        <span>{formatFileSize(report.file_size)}</span>
                        <span>•</span>
                        <span>{format(new Date(report.updated_at), 'MMM d, yyyy h:mm a')}</span>
                        <span>•</span>
                        <span className="capitalize">{report.status}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {report.status === 'ready' && (
                        <>
                          <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded">
                            <MessageSquare className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}