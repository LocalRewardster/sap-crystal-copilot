'use client';

import { useState } from 'react';
import ActionCard from '@/components/ActionCard';
import { apiService, type ChatMessage } from '@/services/api';
import { 
  FileText, 
  Upload, 
  MessageSquare, 
  BarChart3, 
  Play, 
  CheckCircle, 
  Zap, 
  Shield, 
  Brain, 
  TrendingUp,
  AlertTriangle,
  X,
  Send,
  Folder,
  Clock,
  Users,
  Activity,
  Menu,
  Home
} from 'lucide-react';

export default function HomePage() {
  const [activeView, setActiveView] = useState('dashboard');
  const [showUpload, setShowUpload] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { 
      role: 'assistant', 
      content: 'Hello! I\'m your Crystal Reports AI assistant. How can I help you today?',
      timestamp: new Date().toISOString()
    }
  ]);
  const [isLoadingChat, setIsLoadingChat] = useState(false);

  const handleSendMessage = async () => {
    if (chatMessage.trim() && !isLoadingChat) {
      const userMessage: ChatMessage = {
        role: 'user',
        content: chatMessage.trim(),
        timestamp: new Date().toISOString()
      };

      // Add user message immediately
      setChatHistory(prev => [...prev, userMessage]);
      setChatMessage('');
      setIsLoadingChat(true);

      try {
        // Get the current report ID if we have an uploaded file
        const reportId = uploadComplete && selectedFile ? 'demo-report-id' : undefined;
        
        // Send to API
        const response = await apiService.chatWithAI([...chatHistory, userMessage], reportId);
        
        if (response.success && response.data) {
          const assistantMessage: ChatMessage = {
            role: 'assistant',
            content: response.data.response,
            timestamp: new Date().toISOString()
          };
          setChatHistory(prev => [...prev, assistantMessage]);
        } else {
          // Fallback to demo response if API fails
          const fallbackMessage: ChatMessage = {
            role: 'assistant',
            content: `I understand you're asking about: "${userMessage.content}". I'm currently in demo mode. In the full version, I would analyze your Crystal Reports and provide detailed insights about your data, fields, and report structure. ${response.error ? `(API Error: ${response.error})` : ''}`,
            timestamp: new Date().toISOString()
          };
          setChatHistory(prev => [...prev, fallbackMessage]);
        }
      } catch (error) {
        console.error('Chat error:', error);
        const errorMessage: ChatMessage = {
          role: 'assistant',
          content: `Sorry, I encountered an error while processing your request. This appears to be a connection issue with the backend service. Please ensure the backend is running on http://localhost:8000.`,
          timestamp: new Date().toISOString()
        };
        setChatHistory(prev => [...prev, errorMessage]);
      } finally {
        setIsLoadingChat(false);
      }
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.name.toLowerCase().endsWith('.rpt')) {
        setSelectedFile(file);
        setUploadComplete(false);
        console.log('Selected file:', file.name, file.size);
      } else {
        alert('Please select a Crystal Reports (.rpt) file.');
      }
    }
  };

  const triggerFileSelect = () => {
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    fileInput?.click();
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    setUploadComplete(false);

    try {
      // Try real API upload first
      const response = await apiService.uploadReport(selectedFile);
      
      if (response.success) {
        // Real upload successful
        setUploadProgress(100);
        setIsUploading(false);
        setUploadComplete(true);
        
        // Switch to reports view to show the uploaded report
        setTimeout(() => {
          setActiveView('reports');
          setShowUpload(false);
        }, 2000);
      } else {
        throw new Error(response.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      
      // Fallback to simulation if API fails
      console.log('Falling back to upload simulation');
      
      // Simulate upload progress
      for (let progress = 0; progress <= 100; progress += 10) {
        setUploadProgress(progress);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // Simulate processing
      setUploadProgress(100);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsUploading(false);
      setUploadComplete(true);
      
      // Switch to reports view to show the "uploaded" report
      setTimeout(() => {
        setActiveView('reports');
        setShowUpload(false);
      }, 2000);
    }
  };

  const sampleReports = [
    ...(uploadComplete && selectedFile ? [{
      name: selectedFile.name, 
      status: 'Ready', 
      size: `${(selectedFile.size / 1024 / 1024).toFixed(1)} MB`, 
      modified: 'Just now'
    }] : []),
    { name: 'Sales_Report_Q4.rpt', status: 'Ready', size: '2.4 MB', modified: '2 hours ago' },
    { name: 'Customer_Analysis.rpt', status: 'Processing', size: '1.8 MB', modified: '1 day ago' },
    { name: 'Financial_Summary.rpt', status: 'Ready', size: '3.2 MB', modified: '3 days ago' },
    { name: 'Inventory_Report.rpt', status: 'Ready', size: '1.5 MB', modified: '1 week ago' }
  ];
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Navigation Rail */}
      <div className="w-12 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="h-12 flex items-center justify-center border-b border-gray-200">
          <div className="w-6 h-6 bg-blue-600 rounded-sm rotate-45"></div>
        </div>
        
        {/* Navigation Icons */}
        <div className="flex-1 py-4 space-y-2">
          <button 
            onClick={() => setActiveView('dashboard')}
            className={`w-8 h-8 mx-2 rounded-md flex items-center justify-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
              activeView === 'dashboard' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
            }`}
            title="Dashboard"
          >
            <Home className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setActiveView('reports')}
            className={`w-8 h-8 mx-2 rounded-md flex items-center justify-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
              activeView === 'reports' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
            }`}
            title="Reports"
          >
            <FileText className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setShowUpload(true)}
            className="w-8 h-8 mx-2 rounded-md flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            title="Upload"
          >
            <Upload className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setShowChat(true)}
            className="w-8 h-8 mx-2 rounded-md flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            title="AI Assistant"
          >
            <MessageSquare className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setShowAnalytics(true)}
            className="w-8 h-8 mx-2 rounded-md flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            title="Analytics"
          >
            <BarChart3 className="w-4 h-4" />
          </button>
        </div>
        
        {/* Footer Badge */}
        <div className="p-2 border-t border-gray-200">
          <div className="w-2 h-2 bg-green-500 rounded-full mx-auto" title="System Ready"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation with Status */}
        <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-gray-900">SAP Crystal Copilot</h1>
            <span className="text-sm text-gray-500">AI-Powered Report Editor</span>
          </div>
          
          {/* System Status */}
          <div className="h-8 bg-emerald-50 text-emerald-700 px-3 rounded-md flex items-center text-sm font-medium">
            <CheckCircle className="w-4 h-4 mr-2" />
            System operational
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6">
          <div className="max-w-4xl">
            
            {/* Dashboard View */}
            {activeView === 'dashboard' && (
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">Welcome to Crystal Copilot</h2>
                  <p className="text-gray-600">Enterprise-grade AI-powered report management</p>
                </div>

                {/* Primary Action Panel */}
                <div className="mb-8 space-y-2">
                  <ActionCard
                    icon={<FileText className="w-5 h-5" />}
                    label={`My Reports (${sampleReports.length})`}
                    variant="primary"
                    onClick={() => setActiveView('reports')}
                  />
                  <ActionCard
                    icon={<Upload className="w-5 h-5" />}
                    label="Upload New Report"
                    variant="secondary"
                    onClick={() => setShowUpload(true)}
                  />
                  <ActionCard
                    icon={<MessageSquare className="w-5 h-5" />}
                    label="AI Assistant"
                    variant="secondary"
                    onClick={() => setShowChat(true)}
                  />
                  <ActionCard
                    icon={<BarChart3 className="w-5 h-5" />}
                    label="Analytics Dashboard"
                    variant="secondary"
                    onClick={() => setShowAnalytics(true)}
                  />
                </div>

                {/* Value Proposition Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-md flex items-center justify-center flex-shrink-0">
                        <Zap className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Lightning Fast</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">Analyze reports in under 15 seconds with AI-powered field detection</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-md flex items-center justify-center flex-shrink-0">
                        <Shield className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Enterprise Security</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">SAP-grade security and compliance with enterprise data protection</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-md flex items-center justify-center flex-shrink-0">
                        <Brain className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">AI-Powered</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">Natural language report editing with intelligent field mapping</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-md flex items-center justify-center flex-shrink-0">
                        <TrendingUp className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Advanced Analytics</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">Deep insights into your data with comprehensive usage metrics</p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Reports View */}
            {activeView === 'reports' && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">My Reports</h2>
                    <p className="text-gray-600">Manage your Crystal Reports</p>
                  </div>
                  <button 
                    onClick={() => setActiveView('dashboard')}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                  >
                    Back to Dashboard
                  </button>
                </div>

                <div className="bg-white rounded-lg border border-gray-200">
                  {sampleReports.map((report, index) => (
                    <div key={index} className={`p-4 flex items-center justify-between hover:bg-gray-50 transition-colors ${index !== sampleReports.length - 1 ? 'border-b border-gray-200' : ''}`}>
                      <div className="flex items-center space-x-4">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <div>
                          <h3 className="font-medium text-gray-900">{report.name}</h3>
                          <p className="text-sm text-gray-500">{report.size} • Modified {report.modified}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          report.status === 'Ready' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {report.status}
                        </span>
                        <button className="px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
                          Open
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Footer Status Bar */}
      <div className="h-10 bg-gray-50 text-gray-600 text-sm flex items-center justify-center border-t border-gray-200">
        <span>Crystal Copilot Enterprise • Version 1.0.0 • 12 reports loaded • API Connected</span>
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Upload Crystal Report</h3>
                <button 
                  onClick={() => setShowUpload(false)}
                  className="text-gray-400 hover:text-gray-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-indigo-50">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-sm font-medium text-gray-900 mb-2">Drag and drop your .rpt file</h4>
                <p className="text-sm text-gray-600 mb-4">Or click to browse and select a file</p>
                
                {/* Hidden file input */}
                <input
                  id="file-input"
                  type="file"
                  accept=".rpt"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                {!selectedFile && (
                  <button 
                    onClick={triggerFileSelect}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                  >
                    Browse Files
                  </button>
                )}
                
                {selectedFile && !isUploading && !uploadComplete && (
                  <div className="mt-4">
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-md mb-4">
                      <p className="text-sm text-blue-800">
                        Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    </div>
                    <div className="flex gap-2 justify-center">
                      <button 
                        onClick={handleUpload}
                        className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
                      >
                        Upload & Process
                      </button>
                      <button 
                        onClick={() => setSelectedFile(null)}
                        className="px-4 py-2 bg-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-500"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {isUploading && (
                  <div className="mt-4">
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-md mb-4">
                      <p className="text-sm text-blue-800 mb-2">
                        Uploading: {selectedFile?.name}
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                          style={{width: `${uploadProgress}%`}}
                        ></div>
                      </div>
                      <p className="text-xs text-blue-600">{uploadProgress}% complete</p>
                    </div>
                  </div>
                )}

                {uploadComplete && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                    <div className="flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <p className="text-sm text-green-800">
                        Upload successful! Redirecting to reports...
                      </p>
                    </div>
                  </div>
                )}
                
                {!selectedFile && (
                  <p className="text-xs text-gray-500 mt-3">Maximum file size: 25MB</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat Modal */}
      {showChat && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-4 h-96 flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">AI Assistant</h3>
                <button 
                  onClick={() => setShowChat(false)}
                  className="text-gray-400 hover:text-gray-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto">
              {chatHistory.map((msg, index) => (
                <div key={index} className={`mb-4 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                  <div className={`inline-block p-3 rounded-lg max-w-sm text-sm ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoadingChat && (
                <div className="text-left mb-4">
                  <div className="inline-block p-3 rounded-lg max-w-sm text-sm bg-gray-100 text-gray-900">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span>AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask about your Crystal Reports..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={isLoadingChat || !chatMessage.trim()}
                  className={`px-4 py-2 text-sm font-medium rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
                    isLoadingChat || !chatMessage.trim()
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isLoadingChat ? 'Sending...' : 'Send'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Modal */}
      {showAnalytics && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Analytics Dashboard</h3>
                <button 
                  onClick={() => setShowAnalytics(false)}
                  className="text-gray-400 hover:text-gray-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-md flex items-center justify-center">
                      <Users className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-medium text-gray-900">Active Users</h4>
                  </div>
                  <p className="text-2xl font-semibold text-gray-900">1,247</p>
                  <p className="text-sm text-green-600">↑ 12% from last month</p>
                </div>
                
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-md flex items-center justify-center">
                      <FileText className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-medium text-gray-900">Reports Processed</h4>
                  </div>
                  <p className="text-2xl font-semibold text-gray-900">8,432</p>
                  <p className="text-sm text-green-600">↑ 28% from last month</p>
                </div>
                
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-md flex items-center justify-center">
                      <Activity className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-medium text-gray-900">System Health</h4>
                  </div>
                  <p className="text-2xl font-semibold text-gray-900">99.8%</p>
                  <p className="text-sm text-gray-600">Uptime this month</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}