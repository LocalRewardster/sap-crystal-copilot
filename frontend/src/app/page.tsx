'use client';

import { useState } from 'react';
import './emergency-styles.css';
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
  Activity
} from 'lucide-react';

export default function HomePage() {
  const [activeView, setActiveView] = useState('dashboard');
  const [showUpload, setShowUpload] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { type: 'assistant', message: 'Hello! I\'m your Crystal Reports AI assistant. How can I help you today?' }
  ]);

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      setChatHistory([...chatHistory, 
        { type: 'user', message: chatMessage },
        { type: 'assistant', message: `I can help you with "${chatMessage}". This would connect to our AI service to provide detailed assistance with Crystal Reports analysis, field mapping, and report optimization.` }
      ]);
      setChatMessage('');
    }
  };

  const sampleReports = [
    { name: 'Sales_Report_Q4.rpt', status: 'Ready', size: '2.4 MB', modified: '2 hours ago' },
    { name: 'Customer_Analysis.rpt', status: 'Processing', size: '1.8 MB', modified: '1 day ago' },
    { name: 'Financial_Summary.rpt', status: 'Ready', size: '3.2 MB', modified: '3 days ago' },
    { name: 'Inventory_Report.rpt', status: 'Ready', size: '1.5 MB', modified: '1 week ago' }
  ];
  return (
    <div className="min-h-screen bg-gradient-main">
      {/* PROFESSIONAL STATUS BANNER */}
      <div className="bg-gradient-header text-white text-center py-8">
        <div className="flex items-center justify-center space-x-4 mb-4">
          <CheckCircle className="w-12 h-12" />
          <h1 className="text-6xl font-bold">
            SYSTEM OPERATIONAL
          </h1>
          <CheckCircle className="w-12 h-12" />
        </div>
        <p className="text-2xl mt-4">Enterprise UI Successfully Loaded</p>
      </div>

      {/* PROFESSIONAL SAP HEADER */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white px-8 py-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-xl">
              <span className="text-3xl font-bold">SC</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold">SAP Crystal Copilot</h1>
              <p className="text-blue-300 text-xl">AI-Powered Enterprise Report Editor</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-green-500 text-white px-6 py-3 rounded-full font-bold text-lg animate-pulse flex items-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <span>SYSTEM READY</span>
            </div>
            <div className="bg-blue-500 text-white px-6 py-3 rounded-full font-bold text-lg flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>ENTERPRISE EDITION</span>
            </div>
          </div>
        </div>
      </div>

      {/* MODERN CONTENT AREA */}
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* SIDEBAR */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-2xl p-6 border border-slate-200">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Report Explorer</h2>
                
                <div className="space-y-4">
                  <button 
                    onClick={() => setActiveView('reports')}
                    className={`professional-button flex items-center space-x-3 ${activeView === 'reports' ? 'bg-gradient-blue' : 'bg-gradient-blue'}`}
                  >
                    <FileText className="w-5 h-5" />
                    <span>My Reports ({sampleReports.length})</span>
                  </button>
                  <button 
                    onClick={() => setShowUpload(true)}
                    className="professional-button bg-gradient-green flex items-center space-x-3"
                  >
                    <Upload className="w-5 h-5" />
                    <span>Upload New Report</span>
                  </button>
                  <button 
                    onClick={() => setShowChat(true)}
                    className="professional-button bg-gradient-purple flex items-center space-x-3"
                  >
                    <MessageSquare className="w-5 h-5" />
                    <span>AI Assistant</span>
                  </button>
                  <button 
                    onClick={() => setShowAnalytics(true)}
                    className="professional-button bg-gradient-orange flex items-center space-x-3"
                  >
                    <BarChart3 className="w-5 h-5" />
                    <span>Analytics</span>
                  </button>
                </div>

                <div className="mt-8 p-4 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl border border-emerald-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-bold text-emerald-700">Connected to SAP</span>
                  </div>
                </div>
              </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-2xl p-8 border border-slate-200">
                {activeView === 'dashboard' && (
                  <>
                    <div className="mb-8">
                      <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome to Crystal Copilot</h2>
                      <p className="text-xl text-slate-600">Enterprise-grade AI-powered report management</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                        <div className="flex items-center justify-center w-16 h-16 bg-blue-500 rounded-xl mb-4">
                          <Zap className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-blue-900 mb-2">Lightning Fast</h3>
                        <p className="text-blue-700">Analyze reports in under 15 seconds</p>
                      </div>
                      <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
                        <div className="flex items-center justify-center w-16 h-16 bg-green-500 rounded-xl mb-4">
                          <Shield className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-green-900 mb-2">Enterprise Security</h3>
                        <p className="text-green-700">SAP-grade security and compliance</p>
                      </div>
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
                        <div className="flex items-center justify-center w-16 h-16 bg-purple-500 rounded-xl mb-4">
                          <Brain className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-purple-900 mb-2">AI-Powered</h3>
                        <p className="text-purple-700">Natural language report editing</p>
                      </div>
                      <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200">
                        <div className="flex items-center justify-center w-16 h-16 bg-orange-500 rounded-xl mb-4">
                          <TrendingUp className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-orange-900 mb-2">Advanced Analytics</h3>
                        <p className="text-orange-700">Deep insights into your data</p>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-6 rounded-xl border border-slate-200">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="flex items-center justify-center w-10 h-10 bg-blue-500 rounded-lg">
                          <CheckCircle className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900">Ready for Your Demo</h3>
                      </div>
                      <p className="text-slate-700 text-lg mb-4">
                        This professional interface is now ready to impress your prospective customer!
                      </p>
                      <div className="flex space-x-4">
                        <button 
                          onClick={() => setActiveView('reports')}
                          className="professional-button bg-gradient-blue flex items-center space-x-3"
                          style={{width: 'auto', padding: '12px 32px'}}
                        >
                          <Play className="w-5 h-5" />
                          <span>Start Demo</span>
                        </button>
                        <button 
                          onClick={() => setShowUpload(true)}
                          className="professional-button bg-gradient-green flex items-center space-x-3"
                          style={{width: 'auto', padding: '12px 32px'}}
                        >
                          <Upload className="w-5 h-5" />
                          <span>Upload Report</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {activeView === 'reports' && (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-3xl font-bold text-slate-900 mb-2">My Reports</h2>
                        <p className="text-xl text-slate-600">Manage your Crystal Reports</p>
                      </div>
                      <button 
                        onClick={() => setActiveView('dashboard')}
                        className="professional-button bg-gradient-blue flex items-center space-x-2"
                        style={{width: 'auto', padding: '8px 16px'}}
                      >
                        <Folder className="w-4 h-4" />
                        <span>Dashboard</span>
                      </button>
                    </div>

                    <div className="space-y-4">
                      {sampleReports.map((report, index) => (
                        <div key={index} className="bg-slate-50 p-4 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <FileText className="w-8 h-8 text-blue-600" />
                              <div>
                                <h3 className="font-bold text-slate-900">{report.name}</h3>
                                <p className="text-slate-600 text-sm">{report.size} • Modified {report.modified}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                report.status === 'Ready' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                {report.status}
                              </span>
                              <button className="professional-button bg-gradient-blue" style={{width: 'auto', padding: '6px 12px'}}>
                                <span className="text-sm">Open</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PROFESSIONAL FOOTER */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-6 mt-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="font-bold">AI System Active</span>
            </div>
            <span className="text-slate-400">•</span>
            <span>12 Reports Loaded</span>
            <span className="text-slate-400">•</span>
            <span>Enterprise License Active</span>
          </div>
          <div className="text-slate-400">
            Crystal Copilot Enterprise v1.0.0 | © 2024 SAP
          </div>
        </div>
      </div>

      {/* UPLOAD MODAL */}
      {showUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Upload className="w-8 h-8 text-blue-600" />
                <h2 className="text-2xl font-bold text-slate-900">Upload Crystal Report</h2>
              </div>
              <button onClick={() => setShowUpload(false)} className="text-slate-500 hover:text-slate-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center bg-slate-50 hover:bg-slate-100 transition-colors">
              <Upload className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-700 mb-2">Drag & Drop Your .rpt File</h3>
              <p className="text-slate-500 mb-4">Or click to browse and select a file</p>
              <button className="professional-button bg-gradient-blue" style={{width: 'auto', padding: '12px 24px'}}>
                <span>Browse Files</span>
              </button>
              <p className="text-sm text-slate-400 mt-4">Maximum file size: 25MB</p>
            </div>
          </div>
        </div>
      )}

      {/* CHAT MODAL */}
      {showChat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-4xl w-full mx-4 h-96 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <MessageSquare className="w-8 h-8 text-purple-600" />
                <h2 className="text-2xl font-bold text-slate-900">AI Assistant</h2>
              </div>
              <button onClick={() => setShowChat(false)} className="text-slate-500 hover:text-slate-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 bg-slate-50 rounded-xl p-4 overflow-y-auto mb-4">
              {chatHistory.map((msg, index) => (
                <div key={index} className={`mb-4 ${msg.type === 'user' ? 'text-right' : 'text-left'}`}>
                  <div className={`inline-block p-3 rounded-xl max-w-xs ${
                    msg.type === 'user' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-white text-slate-900 border border-slate-200'
                  }`}>
                    {msg.message}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex space-x-3">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask about your Crystal Reports..."
                className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button 
                onClick={handleSendMessage}
                className="professional-button bg-gradient-purple flex items-center space-x-2"
                style={{width: 'auto', padding: '12px 24px'}}
              >
                <Send className="w-5 h-5" />
                <span>Send</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ANALYTICS MODAL */}
      {showAnalytics && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-6xl w-full mx-4 max-h-96 overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <BarChart3 className="w-8 h-8 text-orange-600" />
                <h2 className="text-2xl font-bold text-slate-900">Analytics Dashboard</h2>
              </div>
              <button onClick={() => setShowAnalytics(false)} className="text-slate-500 hover:text-slate-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                <div className="flex items-center space-x-3 mb-4">
                  <Users className="w-8 h-8 text-blue-600" />
                  <h3 className="text-lg font-bold text-blue-900">Active Users</h3>
                </div>
                <p className="text-3xl font-bold text-blue-600">1,247</p>
                <p className="text-blue-700 text-sm">↑ 12% from last month</p>
              </div>
              
              <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                <div className="flex items-center space-x-3 mb-4">
                  <FileText className="w-8 h-8 text-green-600" />
                  <h3 className="text-lg font-bold text-green-900">Reports Processed</h3>
                </div>
                <p className="text-3xl font-bold text-green-600">8,432</p>
                <p className="text-green-700 text-sm">↑ 28% from last month</p>
              </div>
              
              <div className="bg-orange-50 p-6 rounded-xl border border-orange-200">
                <div className="flex items-center space-x-3 mb-4">
                  <Activity className="w-8 h-8 text-orange-600" />
                  <h3 className="text-lg font-bold text-orange-900">System Health</h3>
                </div>
                <p className="text-3xl font-bold text-orange-600">99.8%</p>
                <p className="text-orange-700 text-sm">Uptime this month</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}