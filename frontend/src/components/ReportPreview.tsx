'use client';

import { useState, useEffect } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Download, 
  Eye,
  EyeOff,
  Edit3,
  Move,
  Maximize2,
  Grid,
  Layers
} from 'lucide-react';

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

interface ReportPreviewProps {
  reportId: string;
  reportName: string;
  fields: ReportField[];
  onFieldSelect: (fieldId: string) => void;
  onFieldOperation: (operation: string, fieldId: string, details?: any) => void;
  selectedFieldId?: string;
}

const SECTION_COLORS = {
  'Report Header': 'bg-purple-100 border-purple-300',
  'Page Header': 'bg-blue-100 border-blue-300', 
  'Details': 'bg-gray-50 border-gray-300',
  'Page Footer': 'bg-green-100 border-green-300',
  'Report Footer': 'bg-orange-100 border-orange-300'
};

const SECTION_ORDER = [
  'Report Header',
  'Page Header', 
  'Details',
  'Page Footer',
  'Report Footer'
];

export default function ReportPreview({ 
  reportId, 
  reportName, 
  fields, 
  onFieldSelect, 
  onFieldOperation,
  selectedFieldId 
}: ReportPreviewProps) {
  const [zoom, setZoom] = useState(100);
  const [showGrid, setShowGrid] = useState(true);
  const [showHiddenFields, setShowHiddenFields] = useState(false);
  const [viewMode, setViewMode] = useState<'design' | 'preview'>('design');

  // Group fields by section
  const fieldsBySection = fields.reduce((acc, field) => {
    const section = field.section || 'Details';
    if (!acc[section]) acc[section] = [];
    acc[section].push(field);
    return acc;
  }, {} as Record<string, ReportField[]>);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50));
  const handleResetZoom = () => setZoom(100);

  const getFieldTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'string': return '📝';
      case 'number': return '🔢';
      case 'date': return '📅';
      case 'currency': return '💰';
      case 'boolean': return '☑️';
      default: return '📄';
    }
  };

  const handleFieldDoubleClick = (fieldId: string) => {
    const field = fields.find(f => f.id === fieldId);
    if (field) {
      const newName = prompt('Enter new field name:', field.name);
      if (newName && newName !== field.name) {
        onFieldOperation('rename', fieldId, { newName });
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex flex-col">
      {/* Header with Controls */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h3 className="font-medium text-gray-900">Report Preview</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('design')}
              className={`px-3 py-1 text-xs font-medium rounded ${
                viewMode === 'design' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Design
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`px-3 py-1 text-xs font-medium rounded ${
                viewMode === 'preview' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Preview
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`p-1.5 rounded hover:bg-gray-100 ${
              showGrid ? 'text-blue-600' : 'text-gray-400'
            }`}
            title="Toggle grid"
          >
            <Grid className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setShowHiddenFields(!showHiddenFields)}
            className={`p-1.5 rounded hover:bg-gray-100 ${
              showHiddenFields ? 'text-blue-600' : 'text-gray-400'
            }`}
            title="Show hidden fields"
          >
            <Layers className="w-4 h-4" />
          </button>

          <div className="flex items-center space-x-1 border-l pl-2">
            <button
              onClick={handleZoomOut}
              className="p-1.5 rounded hover:bg-gray-100 text-gray-600"
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            
            <span className="text-xs font-medium text-gray-600 min-w-[3rem] text-center">
              {zoom}%
            </span>
            
            <button
              onClick={handleZoomIn}
              className="p-1.5 rounded hover:bg-gray-100 text-gray-600"
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            
            <button
              onClick={handleResetZoom}
              className="p-1.5 rounded hover:bg-gray-100 text-gray-600"
              title="Reset zoom"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 overflow-auto bg-gray-100 p-4">
        <div 
          className="bg-white shadow-lg mx-auto relative"
          style={{ 
            width: `${8.5 * 96}px`, // 8.5" at 96 DPI
            minHeight: `${11 * 96}px`, // 11" at 96 DPI
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top center'
          }}
        >
          {/* Grid overlay */}
          {showGrid && (
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: `
                  linear-gradient(to right, #e5e7eb 1px, transparent 1px),
                  linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
                `,
                backgroundSize: '20px 20px'
              }}
            />
          )}

          {/* Render sections */}
          {SECTION_ORDER.map((sectionName, sectionIndex) => {
            const sectionFields = fieldsBySection[sectionName] || [];
            const sectionHeight = Math.max(80, Math.max(...sectionFields.map(f => f.position.y + f.position.height)) + 20);
            
            return (
              <div
                key={sectionName}
                className={`relative border-b-2 border-dashed ${SECTION_COLORS[sectionName] || 'bg-gray-50 border-gray-300'}`}
                style={{ height: `${sectionHeight}px` }}
              >
                {/* Section Label */}
                <div className="absolute top-1 left-1 text-xs font-medium text-gray-600 bg-white px-2 py-0.5 rounded border">
                  {sectionName}
                </div>

                {/* Fields in this section */}
                {sectionFields.map(field => {
                  const isVisible = field.visible || showHiddenFields;
                  const isSelected = selectedFieldId === field.id;
                  
                  if (!isVisible) return null;

                  return (
                    <div
                      key={field.id}
                      className={`absolute cursor-pointer border-2 transition-all ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50' 
                          : field.visible 
                            ? 'border-gray-300 bg-white hover:border-gray-400' 
                            : 'border-dashed border-gray-400 bg-gray-100 opacity-60'
                      }`}
                      style={{
                        left: `${field.position.x}px`,
                        top: `${field.position.y}px`,
                        width: `${field.position.width}px`,
                        height: `${field.position.height}px`,
                      }}
                      onClick={() => onFieldSelect(field.id)}
                      onDoubleClick={() => handleFieldDoubleClick(field.id)}
                      title={`${field.name} (${field.type})`}
                    >
                      {/* Field Content */}
                      <div className="h-full flex items-center px-2 text-xs">
                        <span className="mr-1">{getFieldTypeIcon(field.type)}</span>
                        <span className={`truncate ${field.visible ? 'text-gray-900' : 'text-gray-500'}`}>
                          {viewMode === 'design' ? field.name : `[${field.name}]`}
                        </span>
                        {field.formula && (
                          <span className="ml-1 text-purple-600" title="Has formula">
                            ƒ
                          </span>
                        )}
                      </div>

                      {/* Field Actions (on hover/select) */}
                      {isSelected && (
                        <div className="absolute -top-8 left-0 flex items-center space-x-1 bg-white border border-gray-300 rounded px-2 py-1 shadow-lg z-10">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onFieldOperation(field.visible ? 'hide' : 'show', field.id);
                            }}
                            className={`p-1 rounded hover:bg-gray-100 ${
                              field.visible ? 'text-green-600' : 'text-gray-400'
                            }`}
                            title={field.visible ? 'Hide field' : 'Show field'}
                          >
                            {field.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                          </button>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFieldDoubleClick(field.id);
                            }}
                            className="p-1 rounded hover:bg-gray-100 text-blue-600"
                            title="Rename field"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onFieldOperation('move', field.id);
                            }}
                            className="p-1 rounded hover:bg-gray-100 text-purple-600"
                            title="Move field"
                          >
                            <Move className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Status Bar */}
      <div className="px-4 py-2 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
        <div>
          {fields.filter(f => f.visible).length} visible fields, {fields.filter(f => !f.visible).length} hidden
        </div>
        <div>
          {selectedFieldId ? `Selected: ${fields.find(f => f.id === selectedFieldId)?.name}` : 'Click a field to select'}
        </div>
      </div>
    </div>
  );
}