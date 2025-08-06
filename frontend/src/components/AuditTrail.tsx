'use client';

import { useState, useEffect } from 'react';
import { 
  Download, 
  Clock, 
  User, 
  FileText, 
  Eye,
  EyeOff,
  Edit3,
  Move,
  Trash2,
  Filter,
  Calendar,
  Search
} from 'lucide-react';
import { apiService } from '@/services/api';

interface AuditEntry {
  id: string;
  timestamp: string;
  operation: string;
  fieldId: string;
  fieldName: string;
  oldValue?: any;
  newValue?: any;
  description: string;
  user: string;
  impact: 'low' | 'medium' | 'high';
}

interface AuditTrailProps {
  reportId: string;
  reportName: string;
}

export default function AuditTrail({ reportId, reportName }: AuditTrailProps) {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('all');

  useEffect(() => {
    loadAuditTrail();
  }, [reportId]);

  const loadAuditTrail = async () => {
    try {
      setLoading(true);
      const response = await apiService.getChangeLog(reportId);
      
      if (response.success && response.data) {
        setEntries(response.data);
      } else {
        // Fallback to demo data
        setEntries([
          {
            id: '1',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            operation: 'hide',
            fieldId: 'field_004',
            fieldName: 'Customer ID',
            description: 'Hidden field via UI interaction',
            user: 'Current User',
            impact: 'low'
          },
          {
            id: '2',
            timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
            operation: 'rename',
            fieldId: 'field_003',
            fieldName: 'Total Amount',
            oldValue: 'Amount',
            newValue: 'Total Amount',
            description: 'Renamed field for clarity',
            user: 'Current User',
            impact: 'medium'
          },
          {
            id: '3',
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            operation: 'move',
            fieldId: 'field_002',
            fieldName: 'Order Date',
            oldValue: 'Position: (170, 20)',
            newValue: 'Position: (200, 20)',
            description: 'Repositioned field for better layout',
            user: 'Current User',
            impact: 'low'
          }
        ]);
      }
    } catch (error) {
      console.error('Failed to load audit trail:', error);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadLog = async () => {
    try {
      const blob = await apiService.downloadChangeLog(reportId);
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${reportName}_changelog.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Failed to download changelog:', error);
    }
  };

  const getOperationIcon = (operation: string) => {
    switch (operation) {
      case 'hide': return <EyeOff className="w-4 h-4 text-gray-500" />;
      case 'show': return <Eye className="w-4 h-4 text-green-600" />;
      case 'rename': return <Edit3 className="w-4 h-4 text-blue-600" />;
      case 'move': return <Move className="w-4 h-4 text-purple-600" />;
      case 'delete': return <Trash2 className="w-4 h-4 text-red-600" />;
      default: return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const getOperationColor = (operation: string) => {
    switch (operation) {
      case 'hide': return 'text-gray-600 bg-gray-100';
      case 'show': return 'text-green-700 bg-green-100';
      case 'rename': return 'text-blue-700 bg-blue-100';
      case 'move': return 'text-purple-700 bg-purple-100';
      case 'delete': return 'text-red-700 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'low': return 'text-green-700 bg-green-100';
      case 'medium': return 'text-yellow-700 bg-yellow-100';
      case 'high': return 'text-red-700 bg-red-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return `${diffMins} minutes ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const filteredEntries = entries.filter(entry => {
    if (filter !== 'all' && entry.operation !== filter) return false;
    if (searchTerm && !entry.fieldName.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !entry.description.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    
    if (dateRange !== 'all') {
      const entryDate = new Date(entry.timestamp);
      const now = new Date();
      const diffHours = (now.getTime() - entryDate.getTime()) / (1000 * 60 * 60);
      
      switch (dateRange) {
        case 'today': if (diffHours > 24) return false; break;
        case 'week': if (diffHours > 168) return false; break;
        case 'month': if (diffHours > 720) return false; break;
      }
    }
    
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading audit trail...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-blue-600" />
              Change History
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Complete audit trail for {reportName}
            </p>
          </div>
          <button
            onClick={handleDownloadLog}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search changes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded-md text-sm py-2 pl-3 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Operations</option>
            <option value="hide">Hide</option>
            <option value="show">Show</option>
            <option value="rename">Rename</option>
            <option value="move">Move</option>
            <option value="delete">Delete</option>
          </select>
          
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="border border-gray-300 rounded-md text-sm py-2 pl-3 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>

      {/* Timeline */}
      <div className="divide-y divide-gray-200">
        {filteredEntries.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No changes found matching your filters</p>
          </div>
        ) : (
          filteredEntries.map((entry, index) => (
            <div key={entry.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center">
                    {getOperationIcon(entry.operation)}
                  </div>
                  {index < filteredEntries.length - 1 && (
                    <div className="w-px h-12 bg-gray-200 mx-auto mt-2"></div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getOperationColor(entry.operation)}`}>
                      {entry.operation.charAt(0).toUpperCase() + entry.operation.slice(1)}
                    </span>
                    
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getImpactColor(entry.impact)}`}>
                      {entry.impact} impact
                    </span>
                    
                    <span className="text-xs text-gray-500">
                      {formatTimestamp(entry.timestamp)}
                    </span>
                  </div>
                  
                  <h4 className="text-sm font-medium text-gray-900 mb-1">
                    {entry.fieldName}
                  </h4>
                  
                  <p className="text-sm text-gray-600 mb-2">
                    {entry.description}
                  </p>
                  
                  {(entry.oldValue || entry.newValue) && (
                    <div className="text-xs text-gray-500 bg-gray-50 rounded p-2">
                      {entry.oldValue && (
                        <div><strong>Before:</strong> {entry.oldValue}</div>
                      )}
                      {entry.newValue && (
                        <div><strong>After:</strong> {entry.newValue}</div>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center mt-2 text-xs text-gray-500">
                    <User className="w-3 h-3 mr-1" />
                    {entry.user}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}