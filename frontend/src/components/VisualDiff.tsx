'use client';

import { useState } from 'react';
import { 
  ArrowRight, 
  Eye, 
  EyeOff, 
  Edit3, 
  Move, 
  X,
  CheckCircle,
  AlertTriangle,
  Download,
  Undo
} from 'lucide-react';

interface DiffChange {
  id: string;
  operation: 'hide' | 'show' | 'rename' | 'move' | 'delete';
  fieldId: string;
  fieldName: string;
  oldValue?: any;
  newValue?: any;
  impact: 'low' | 'medium' | 'high';
  description: string;
}

interface VisualDiffProps {
  reportName: string;
  changes: DiffChange[];
  onApplyChanges: () => void;
  onRevertChange: (changeId: string) => void;
  onClose: () => void;
}

export default function VisualDiff({ 
  reportName, 
  changes, 
  onApplyChanges, 
  onRevertChange, 
  onClose 
}: VisualDiffProps) {
  const [selectedChange, setSelectedChange] = useState<string | null>(null);

  const getOperationIcon = (operation: string) => {
    switch (operation) {
      case 'hide': return <EyeOff className="w-4 h-4 text-gray-500" />;
      case 'show': return <Eye className="w-4 h-4 text-green-600" />;
      case 'rename': return <Edit3 className="w-4 h-4 text-blue-600" />;
      case 'move': return <Move className="w-4 h-4 text-purple-600" />;
      case 'delete': return <X className="w-4 h-4 text-red-600" />;
      default: return <Edit3 className="w-4 h-4 text-gray-500" />;
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

  const totalChanges = changes.length;
  const highImpactChanges = changes.filter(c => c.impact === 'high').length;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Preview Changes</h3>
              <p className="text-sm text-gray-500 mt-1">
                Review changes to <span className="font-medium">{reportName}</span>
              </p>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="text-sm">
                <span className="font-medium text-gray-900">{totalChanges}</span>
                <span className="text-gray-500"> changes</span>
              </div>
              {highImpactChanges > 0 && (
                <div className="flex items-center text-sm">
                  <AlertTriangle className="w-4 h-4 text-amber-500 mr-1" />
                  <span className="font-medium text-amber-700">{highImpactChanges}</span>
                  <span className="text-amber-600"> high impact</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  // Export changes as CSV or PDF
                  console.log('Export changes');
                }}
                className="text-gray-500 hover:text-gray-700"
                title="Export changes"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Changes List */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto">
            <div className="divide-y divide-gray-200">
              {changes.map((change, index) => (
                <div 
                  key={change.id}
                  className={`p-6 hover:bg-gray-50 cursor-pointer transition-colors ${
                    selectedChange === change.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  }`}
                  onClick={() => setSelectedChange(change.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="flex-shrink-0 mt-1">
                        {getOperationIcon(change.operation)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getOperationColor(change.operation)}`}>
                            {change.operation.charAt(0).toUpperCase() + change.operation.slice(1)}
                          </span>
                          
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getImpactColor(change.impact)}`}>
                            {change.impact} impact
                          </span>
                        </div>
                        
                        <h4 className="text-sm font-medium text-gray-900 mb-1">
                          {change.fieldName}
                        </h4>
                        
                        <p className="text-sm text-gray-600 mb-3">
                          {change.description}
                        </p>

                        {/* Before/After Preview */}
                        {(change.operation === 'rename' || change.operation === 'move') && (
                          <div className="flex items-center space-x-4 text-sm">
                            <div className="flex-1">
                              <div className="text-xs text-gray-500 mb-1">Before</div>
                              <div className="bg-red-50 border border-red-200 rounded px-3 py-2 font-mono">
                                {change.oldValue}
                              </div>
                            </div>
                            
                            <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            
                            <div className="flex-1">
                              <div className="text-xs text-gray-500 mb-1">After</div>
                              <div className="bg-green-50 border border-green-200 rounded px-3 py-2 font-mono">
                                {change.newValue}
                              </div>
                            </div>
                          </div>
                        )}

                        {change.operation === 'hide' && (
                          <div className="text-sm">
                            <div className="bg-gray-50 border border-gray-200 rounded px-3 py-2 font-mono">
                              Field will be hidden from report output
                            </div>
                          </div>
                        )}

                        {change.operation === 'show' && (
                          <div className="text-sm">
                            <div className="bg-green-50 border border-green-200 rounded px-3 py-2 font-mono">
                              Field will be visible in report output
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRevertChange(change.id);
                        }}
                        className="p-1.5 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100"
                        title="Revert this change"
                      >
                        <Undo className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {totalChanges === 0 ? 'No changes to apply' : `${totalChanges} changes ready to apply`}
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              
              <button
                onClick={onApplyChanges}
                disabled={totalChanges === 0}
                className={`px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  totalChanges === 0
                    ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                    : 'text-white bg-blue-600 hover:bg-blue-700'
                }`}
              >
                <CheckCircle className="w-4 h-4 mr-2 inline" />
                Apply {totalChanges} Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}