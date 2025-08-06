'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { Upload, File, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useMutation } from 'react-query';
import toast from 'react-hot-toast';
import { uploadReport, UploadResponse } from '@/services/api';

interface FileUploadProps {
  onUploadSuccess?: (response: UploadResponse) => void;
}

export default function FileUpload({ onUploadSuccess }: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadResponse[]>([]);

  const uploadMutation = useMutation(uploadReport, {
    onSuccess: (response) => {
      toast.success(`${response.filename} uploaded successfully!`);
      setUploadedFiles(prev => [...prev, response]);
      onUploadSuccess?.(response);
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detail || 'Upload failed. Please try again.';
      toast.error(message);
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      // Validate file type
      if (!file.name.toLowerCase().endsWith('.rpt')) {
        toast.error(`${file.name} is not a valid Crystal Reports file (.rpt)`);
        return;
      }

      // Validate file size (25MB limit)
      const maxSize = 25 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error(`${file.name} is too large. Maximum size is 25MB.`);
        return;
      }

      uploadMutation.mutate(file);
    });
  }, [uploadMutation]);

  const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/octet-stream': ['.rpt'],
    },
    multiple: true,
    maxSize: 25 * 1024 * 1024, // 25MB
  });

  const getDropzoneClass = () => {
    let baseClass = 'dropzone p-12 text-center cursor-pointer transition-all duration-200';
    
    if (isDragActive) {
      baseClass += ' dropzone-active transform scale-105';
    }
    if (isDragAccept) {
      baseClass += ' dropzone-accept';
    }
    if (isDragReject) {
      baseClass += ' dropzone-reject';
    }
    
    return baseClass;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready':
        return <CheckCircle className="w-5 h-5 text-success-500" />;
      case 'parsing':
        return <div className="loading-spinner w-5 h-5 text-primary-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-error-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-warning-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready':
        return 'badge-success';
      case 'parsing':
        return 'badge-info';
      case 'error':
        return 'badge-error';
      default:
        return 'badge-gray';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors">
        <div {...getRootProps()} className={`p-8 text-center cursor-pointer ${
          isDragActive ? 'bg-blue-50 border-blue-400' : ''
        }`}>
          <input {...getInputProps()} />
          
          <div className="space-y-4">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Upload className="w-6 h-6 text-blue-600" />
            </div>
            
            <div>
              <h3 className="text-base font-medium text-gray-900">
                {isDragActive ? 'Drop your Crystal Reports here' : 'Upload Crystal Reports'}
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                Drag and drop .rpt files here, or <span className="text-blue-600 font-medium">browse</span> to choose files
              </p>
            </div>
            
            <div className="flex items-center justify-center space-x-4 text-xs text-gray-500 bg-gray-50 rounded px-4 py-2 mx-8">
              <span>Maximum: 25MB</span>
              <span>•</span>
              <span>Format: .rpt</span>
              <span>•</span>
              <span>Multiple files supported</span>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Progress */}
      {uploadMutation.isLoading && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="loading-spinner w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-900">
              Uploading and processing report...
            </span>
          </div>
          <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }} />
          </div>
        </div>
      )}

      {/* Recently Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div>
          <h3 className="text-base font-semibold text-gray-900 mb-4">Recently Uploaded</h3>
          <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
            {uploadedFiles.map((file) => (
              <div key={file.report_id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <File className="w-5 h-5 text-blue-600" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        {file.filename}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.file_size)} • Uploaded just now
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(file.status)}`}>
                      {file.status}
                    </span>
                    {getStatusIcon(file.status)}
                  </div>
                </div>
                
                {file.status === 'ready' && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex space-x-2">
                      <button className="inline-flex items-center px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700">
                        Open Report
                      </button>
                      <button className="inline-flex items-center px-3 py-1.5 text-xs font-medium border border-gray-300 bg-white text-gray-700 rounded hover:bg-gray-50">
                        AI Chat
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Quick Start Guide</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-semibold">1</span>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 text-sm mb-1">Upload Report</h4>
              <p className="text-xs text-gray-600">
                Drop your .rpt file to start AI analysis
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-semibold">2</span>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 text-sm mb-1">Ask Questions</h4>
              <p className="text-xs text-gray-600">
                Use natural language to explore your report
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-semibold">3</span>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 text-sm mb-1">Edit & Preview</h4>
              <p className="text-xs text-gray-600">
                Make changes with live preview and audit trail
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}