'use client';

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
  AlertTriangle 
} from 'lucide-react';

export default function HomePage() {
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
                    onClick={() => alert('My Reports clicked!\n\nThis would show your uploaded Crystal Reports with:\n\n• Report status and metadata\n• Recent modifications\n• Usage analytics\n• Quick preview options')}
                    className="professional-button bg-gradient-blue flex items-center space-x-3"
                  >
                    <FileText className="w-5 h-5" />
                    <span>My Reports (12)</span>
                  </button>
                  <button 
                    onClick={() => alert('Upload New Report clicked!\n\nThis would open the file upload interface with:\n\n• Drag & drop functionality\n• File format validation\n• Progress tracking\n• Automatic AI analysis')}
                    className="professional-button bg-gradient-green flex items-center space-x-3"
                  >
                    <Upload className="w-5 h-5" />
                    <span>Upload New Report</span>
                  </button>
                  <button 
                    onClick={() => alert('AI Assistant clicked!\n\nThis would open the AI chat interface for:\n\n• Natural language queries\n• Report field analysis\n• Automated recommendations\n• Real-time assistance')}
                    className="professional-button bg-gradient-purple flex items-center space-x-3"
                  >
                    <MessageSquare className="w-5 h-5" />
                    <span>AI Assistant</span>
                  </button>
                  <button 
                    onClick={() => alert('Analytics clicked!\n\nThis would show comprehensive analytics:\n\n• Usage patterns\n• Performance metrics\n• User activity\n• System health')}
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
                      onClick={() => alert('Demo Started!\n\nWelcome to SAP Crystal Copilot!\n\nThis professional interface is ready for your customer presentation.\n\nKey Features:\n• AI-powered report analysis\n• Natural language queries\n• Enterprise-grade security\n• Real-time collaboration')}
                      className="professional-button bg-gradient-blue flex items-center space-x-3"
                      style={{width: 'auto', padding: '12px 32px'}}
                    >
                      <Play className="w-5 h-5" />
                      <span>Start Demo</span>
                    </button>
                    <button 
                      onClick={() => alert('Upload Report!\n\nThis would open the file upload interface where you can:\n\n• Drag & drop .rpt files\n• Browse and select files\n• Upload up to 25MB\n• Automatic AI analysis\n• Instant field lineage mapping')}
                      className="professional-button bg-gradient-green flex items-center space-x-3"
                      style={{width: 'auto', padding: '12px 32px'}}
                    >
                      <Upload className="w-5 h-5" />
                      <span>Upload Report</span>
                    </button>
                  </div>
                </div>
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
    </div>
  );
}