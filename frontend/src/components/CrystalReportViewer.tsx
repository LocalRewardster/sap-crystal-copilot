'use client';

import { useState, useEffect } from 'react';
import { 
  Download, 
  FileText, 
  Printer,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';

interface CrystalReportViewerProps {
  reportId: string;
  reportName: string;
  format?: 'PDF' | 'HTML' | 'Excel' | 'Word';
  parameters?: Record<string, any>;
  onError?: (error: string) => void;
}

export default function CrystalReportViewer({ 
  reportId, 
  reportName, 
  format = 'PDF',
  parameters = {},
  onError 
}: CrystalReportViewerProps) {
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [serviceAvailable, setServiceAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    checkCrystalService();
  }, []);

  useEffect(() => {
    if (serviceAvailable) {
      generatePreview();
    }
  }, [reportId, format, parameters, serviceAvailable]);

  const checkCrystalService = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/crystal/health');
      const data = await response.json();
      setServiceAvailable(data.available);
      
      if (!data.available) {
        setError('Crystal Reports service is not available. Please ensure the C# service is running on port 5001.');
        onError?.('Crystal Reports service is not available');
      }
    } catch (err) {
      setServiceAvailable(false);
      setError('Failed to connect to Crystal Reports service');
      onError?.('Failed to connect to Crystal Reports service');
    }
  };

  const generatePreview = async () => {
    if (!serviceAvailable) return;
    
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`http://localhost:8000/api/v1/crystal/${reportId}/preview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          format,
          parameters
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      // Create blob URL for the preview
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      // Clean up previous URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      
      setPreviewUrl(url);
      setIsLoading(false);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate preview';
      setError(errorMessage);
      setIsLoading(false);
      onError?.(errorMessage);
    }
  };

  const handleDownload = async (downloadFormat: string = format) => {
    try {
      const response = await fetch(`http://localhost:8000/api/v1/crystal/${reportId}/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          format: downloadFormat,
          parameters
        })
      });

      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }

      // Download the file
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportName}.${downloadFormat.toLowerCase()}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to download report';
      setError(errorMessage);
      onError?.(errorMessage);
    }
  };

  const handleRefresh = () => {
    generatePreview();
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (serviceAvailable === null) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-3">
          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
          <span className="text-gray-600">Checking Crystal Reports service...</span>
        </div>
      </div>
    );
  }

  if (!serviceAvailable) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-amber-800 font-medium mb-2">Crystal Reports Service Required</h3>
            <p className="text-amber-700 text-sm mb-4">
              To view high-quality Crystal Reports previews, the Crystal Reports C# service must be running.
            </p>
            <div className="space-y-2 text-sm text-amber-700">
              <p><strong>To start the service:</strong></p>
              <ol className="list-decimal list-inside space-y-1 ml-4">
                <li>Navigate to the <code className="bg-amber-100 px-1 rounded">crystal-service</code> directory</li>
                <li>Run: <code className="bg-amber-100 px-1 rounded">dotnet run</code></li>
                <li>Service should start on <code className="bg-amber-100 px-1 rounded">http://localhost:5001</code></li>
              </ol>
            </div>
            <button 
              onClick={checkCrystalService}
              className="mt-4 px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
            >
              Retry Connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${
      isFullscreen ? 'fixed inset-0 z-50' : 'h-full'
    }`}>
      {/* Toolbar */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h3 className="font-medium text-gray-900 flex items-center">
            <FileText className="w-4 h-4 mr-2 text-blue-600" />
            Crystal Reports Preview
          </h3>
          
          {serviceAvailable && (
            <div className="flex items-center text-xs text-green-600">
              <CheckCircle className="w-3 h-3 mr-1" />
              SDK Connected
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* Format selector */}
          <select
            value={format}
            onChange={(e) => {
              const newFormat = e.target.value as 'PDF' | 'HTML' | 'Excel' | 'Word';
              // Trigger regeneration with new format
              generatePreview();
            }}
            className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="PDF">PDF</option>
            <option value="HTML">HTML</option>
            <option value="Excel">Excel</option>
            <option value="Word">Word</option>
          </select>

          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            title="Refresh preview"
          >
            <RotateCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => handleDownload('PDF')}
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            title="Download as PDF"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
            <div className="flex items-center space-x-3">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <span className="text-gray-600">Generating Crystal Reports preview...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="p-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-red-800 font-medium">Preview Error</h4>
                  <p className="text-red-700 text-sm mt-1">{error}</p>
                  <button 
                    onClick={handleRefresh}
                    className="mt-3 px-3 py-1 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Retry
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {previewUrl && !error && (
          <div className="h-full">
            {format === 'PDF' && (
              <iframe
                src={previewUrl}
                className="w-full h-full border-none"
                title={`${reportName} Preview`}
              />
            )}
            
            {format === 'HTML' && (
              <iframe
                src={previewUrl}
                className="w-full h-full border-none bg-white"
                title={`${reportName} Preview`}
              />
            )}
            
            {(format === 'Excel' || format === 'Word') && (
              <div className="p-6 text-center">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  {format} Preview Generated
                </h4>
                <p className="text-gray-600 mb-4">
                  {format} files cannot be previewed in the browser. Download to view.
                </p>
                <button
                  onClick={() => handleDownload(format)}
                  className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Download className="w-4 h-4 mr-2 inline" />
                  Download {format}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="px-4 py-2 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
        <div>
          Crystal Reports SDK • {reportName} • {format} Format
        </div>
        <div>
          {isLoading ? 'Generating...' : previewUrl ? 'Ready' : 'No preview'}
        </div>
      </div>
    </div>
  );
}