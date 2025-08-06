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
    <div className="space-y-8">
      {/* Upload Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div {...getRootProps()} className={getDropzoneClass()}>
          <input {...getInputProps()} />
          
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-sap-blue bg-opacity-10 rounded-full flex items-center justify-center">
              <Upload className="w-8 h-8 text-sap-blue" />
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {isDragActive ? 'Drop your Crystal Reports here' : 'Upload Crystal Reports'}
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Drag & drop .rpt files here, or click to browse
              </p>
            </div>
            
            <div className="flex items-center justify-center space-x-6 text-xs text-gray-500">
              <span>Max file size: 25MB</span>
              <span>•</span>
              <span>Supported: .rpt files</span>
              <span>•</span>
              <span>Multiple files allowed</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Upload Progress */}
      {uploadMutation.isLoading && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="card"
        >
          <div className="card-body">
            <div className="flex items-center space-x-3">
              <div className="loading-spinner w-5 h-5 text-sap-blue" />
              <span className="text-sm font-medium text-gray-900">
                Uploading and processing...
              </span>
            </div>
            <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
              <div className="bg-sap-blue h-2 rounded-full animate-pulse" style={{ width: '60%' }} />
            </div>
          </div>
        </motion.div>
      )}

      {/* Recently Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recently Uploaded</h3>
          <div className="space-y-3">
            {uploadedFiles.map((file) => (
              <div key={file.report_id} className="card hover:shadow-md transition-shadow">
                <div className="card-body py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <File className="w-8 h-8 text-sap-blue" />
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
                      <span className={`badge ${getStatusColor(file.status)}`}>
                        {file.status}
                      </span>
                      {getStatusIcon(file.status)}
                    </div>
                  </div>
                  
                  {file.status === 'ready' && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex space-x-3">
                        <a
                          href={`/reports/${file.report_id}`}
                          className="btn btn-primary btn-sm"
                        >
                          Analyze Report
                        </a>
                        <a
                          href={`/reports/${file.report_id}/chat`}
                          className="btn btn-outline btn-sm"
                        >
                          Start Chat
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Help Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="card"
      >
        <div className="card-body">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Getting Started</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-primary-600 font-semibold">1</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Upload Report</h4>
              <p className="text-sm text-gray-600">
                Drag & drop your Crystal Reports (.rpt) file to start analysis
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-primary-600 font-semibold">2</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Ask Questions</h4>
              <p className="text-sm text-gray-600">
                Use natural language to understand field lineage and structure
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-primary-600 font-semibold">3</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Make Changes</h4>
              <p className="text-sm text-gray-600">
                Edit fields with live preview and complete audit trail
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}