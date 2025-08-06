'use client';

import { useState, useEffect } from 'react';
import { 
  FileText, 
  Database, 
  Eye, 
  EyeOff, 
  Edit3, 
  Move, 
  Download,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  Layout
} from 'lucide-react';
import ReportPreview from './ReportPreview';
import AuditTrail from './AuditTrail';
import { apiService } from '@/services/api';

interface ReportField {
  id: string;
  name: string;
  type: string;
  section: string;
  visible: boolean;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  formula?: string;
}

interface ReportMetadata {
  id: string;
  name: string;
  size: number;
  upload_date: string;
  status: string;
  fields: ReportField[];
  tables: string[];
  parameters: any[];
}

interface ReportAnalysisProps {
  reportId: string;
  reportName: string;
  onFieldOperation: (operation: string, fieldId: string, details?: any) => void;
}

export default function ReportAnalysis({ reportId, reportName, onFieldOperation }: ReportAnalysisProps) {
  const [metadata, setMetadata] = useState<ReportMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'fields' | 'tables' | 'parameters' | 'preview' | 'audit'>('preview');

  useEffect(() => {
    loadReportMetadata();
  }, [reportId]);

  const loadReportMetadata = async () => {
    try {
      setLoading(true);
      const response = await apiService.getReportMetadata(reportId);
      
      if (response.success && response.data) {
        setMetadata(response.data);
      } else {
        // Fallback to demo data if API fails
        setMetadata({
          id: reportId,
          name: reportName,
          size: 2400000,
          upload_date: new Date().toISOString(),
          status: 'ready',
          fields: [
            {
              id: 'field_001',
              name: 'Customer Name',
              type: 'String',
              section: 'Details',
              visible: true,
              position: { x: 10, y: 20, width: 150, height: 20 },
            },
            {
              id: 'field_002', 
              name: 'Order Date',
              type: 'Date',
              section: 'Details',
              visible: true,
              position: { x: 170, y: 20, width: 100, height: 20 },
            },
            {
              id: 'field_003',
              name: 'Total Amount',
              type: 'Currency',
              section: 'Details', 
              visible: true,
              position: { x: 280, y: 20, width: 100, height: 20 },
              formula: '{Orders.Quantity} * {Products.UnitPrice}'
            },
            {
              id: 'field_004',
              name: 'Customer ID',
              type: 'Number',
              section: 'Details',
              visible: false,
              position: { x: 390, y: 20, width: 80, height: 20 },
            }
          ],
          tables: ['Orders', 'Customers', 'Products', 'OrderDetails'],
          parameters: [
            { name: 'StartDate', type: 'Date', required: true },
            { name: 'Region', type: 'String', required: false }
          ]
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load report metadata');
    } finally {
      setLoading(false);
    }
  };

  const handleFieldToggleVisibility = async (fieldId: string, currentlyVisible: boolean) => {
    try {
      const response = await apiService.hideField(reportId, fieldId, 
        `${currentlyVisible ? 'Hide' : 'Show'} field via UI`);
      
      if (response.success) {
        // Update local state
        setMetadata(prev => prev ? {
          ...prev,
          fields: prev.fields.map(field => 
            field.id === fieldId 
              ? { ...field, visible: !currentlyVisible }
              : field
          )
        } : null);
        
        onFieldOperation(currentlyVisible ? 'hide' : 'show', fieldId);
      }
    } catch (error) {
      console.error('Field operation failed:', error);
    }
  };

  const handleFieldRename = async (fieldId: string, newName: string) => {
    try {
      const response = await apiService.renameField(reportId, fieldId, newName, 
        `Rename field to "${newName}" via UI`);
      
      if (response.success) {
        // Update local state
        setMetadata(prev => prev ? {
          ...prev,
          fields: prev.fields.map(field => 
            field.id === fieldId 
              ? { ...field, name: newName }
              : field
          )
        } : null);
        
        onFieldOperation('rename', fieldId, { newName });
      }
    } catch (error) {
      console.error('Field rename failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Analyzing report structure...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <span className="text-red-800">{error}</span>
        </div>
      </div>
    );
  }

  if (!metadata) {
    return (
      <div className="text-center text-gray-500 py-8">
        No report metadata available
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
              <FileText className="h-5 w-5 mr-2 text-blue-600" />
              {metadata?.name || reportName}
            </h3>
                      <p className="text-sm text-gray-500 mt-1">
            {metadata?.fields?.length || 0} fields • {metadata?.tables?.length || 0} tables • {metadata?.parameters?.length || 0} parameters
          </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Ready
            </span>
            <button className="text-gray-400 hover:text-gray-600">
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 px-6">
          {[
            { id: 'preview', label: 'Preview', count: null },
            { id: 'fields', label: 'Fields', count: metadata?.fields?.length || 0 },
            { id: 'tables', label: 'Tables', count: metadata?.tables?.length || 0 },
            { id: 'parameters', label: 'Parameters', count: metadata?.parameters?.length || 0 },
            { id: 'audit', label: 'History', count: null }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}{tab.count !== null ? ` (${tab.count})` : ''}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className={activeTab === 'preview' || activeTab === 'audit' ? 'h-96' : 'p-6'}>
        {activeTab === 'preview' && (
          <ReportPreview
            reportId={reportId}
            reportName={reportName}
            fields={metadata?.fields || []}
            onFieldSelect={setSelectedField}
            onFieldOperation={onFieldOperation}
            selectedFieldId={selectedField}
          />
        )}

        {activeTab === 'fields' && (
          <div className="space-y-3">
            {(metadata?.fields || []).map(field => (
              <div
                key={field.id}
                className={`border rounded-lg p-4 transition-all ${
                  selectedField === field.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedField(field.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${field.visible ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <div>
                      <h4 className="font-medium text-gray-900">{field.name}</h4>
                      <p className="text-sm text-gray-500">
                        {field.type} • {field.section} section
                        {field.formula && ' • Has formula'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFieldToggleVisibility(field.id, field.visible);
                      }}
                      className={`p-1.5 rounded hover:bg-gray-100 ${
                        field.visible ? 'text-green-600' : 'text-gray-400'
                      }`}
                      title={field.visible ? 'Hide field' : 'Show field'}
                    >
                      {field.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const newName = prompt('Enter new field name:', field.name);
                        if (newName && newName !== field.name) {
                          handleFieldRename(field.id, newName);
                        }
                      }}
                      className="p-1.5 rounded hover:bg-gray-100 text-blue-600"
                      title="Rename field"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onFieldOperation('move', field.id);
                      }}
                      className="p-1.5 rounded hover:bg-gray-100 text-purple-600"
                      title="Move field"
                    >
                      <Move className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                {field.formula && (
                  <div className="mt-3 p-2 bg-gray-50 rounded text-xs font-mono text-gray-600">
                    {field.formula}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'tables' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(metadata?.tables || []).map(table => (
              <div key={table} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center">
                  <Database className="h-5 w-5 text-blue-600 mr-3" />
                  <h4 className="font-medium text-gray-900">{table}</h4>
                </div>
                <p className="text-sm text-gray-500 mt-1">Database table</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'parameters' && (
          <div className="space-y-3">
            {(metadata?.parameters || []).map((param, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{param.name}</h4>
                    <p className="text-sm text-gray-500">{param.type}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    param.required 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {param.required ? 'Required' : 'Optional'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'audit' && (
          <AuditTrail
            reportId={reportId}
            reportName={reportName}
          />
        )}
      </div>
    </div>
  );
}