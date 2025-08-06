'use client';

import { useState } from 'react';
import { 
  FileText, 
  Folder, 
  Search, 
  Settings, 
  HelpCircle, 
  Menu,
  ChevronRight,
  Database,
  BarChart3,
  FileImage,
  MessageSquare,
  History,
  Download,
  User
} from 'lucide-react';

interface CrystalLayoutProps {
  children: React.ReactNode;
  activeView?: string;
  onViewChange?: (view: string) => void;
}

export default function CrystalLayout({ children, activeView = 'reports', onViewChange }: CrystalLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const handleViewChange = (view: string) => {
    if (onViewChange) {
      onViewChange(view);
    }
  };

  const navigationItems = [
    {
      id: 'reports',
      label: 'My Reports',
      icon: FileText,
      badge: '12'
    },
    {
      id: 'browse',
      label: 'Browse Repository',
      icon: Folder,
      badge: null
    },
    {
      id: 'recent',
      label: 'Recent Files',
      icon: History,
      badge: '5'
    },
    {
      id: 'templates',
      label: 'Report Templates',
      icon: FileImage,
      badge: null
    }
  ];

  const toolItems = [
    {
      id: 'chat',
      label: 'AI Assistant',
      icon: MessageSquare,
      badge: 'NEW'
    },
    {
      id: 'database',
      label: 'Data Sources',
      icon: Database,
      badge: null
    },
    {
      id: 'analytics',
      label: 'Report Analytics',
      icon: BarChart3,
      badge: null
    }
  ];

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      {/* Professional SAP-Style Header */}
      <div className="bg-white border-b border-slate-200 shadow-lg">
        {/* Main Header */}
        <div className="flex items-center justify-between px-8 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900">
          <div className="flex items-center space-x-6">
            {/* SAP-Style Logo and Branding */}
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg border border-blue-400">
                <FileText className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">SAP Crystal Copilot</h1>
                <p className="text-blue-200 text-sm font-medium">AI-Powered Report Editor</p>
              </div>
            </div>

            {/* Enterprise Navigation */}
            <nav className="hidden lg:flex items-center space-x-1 ml-8">
              <button className="px-4 py-2.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-all duration-200">
                File
              </button>
              <button className="px-4 py-2.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-all duration-200">
                Edit
              </button>
              <button className="px-4 py-2.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-all duration-200">
                View
              </button>
              <button className="px-4 py-2.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-all duration-200">
                Tools
              </button>
              <button className="px-4 py-2.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-all duration-200">
                Help
              </button>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            {/* Professional Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search reports, fields, or ask AI..."
                className="pl-12 pr-4 py-3 text-sm bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-slate-400 w-80 transition-all duration-200"
              />
            </div>

            {/* User Profile */}
            <div className="flex items-center space-x-3">
              <button className="p-2.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-all duration-200">
                <Settings className="w-5 h-5" />
              </button>
              <button className="p-2.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-all duration-200">
                <HelpCircle className="w-5 h-5" />
              </button>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg border border-blue-400">
                <User className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Professional Toolbar */}
        <div className="bg-slate-50 border-t border-slate-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-3 px-6 py-3 text-sm font-semibold bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200 border border-blue-500">
                <FileText className="w-4 h-4" />
                <span>New Report</span>
              </button>
              <button className="flex items-center space-x-3 px-6 py-3 text-sm font-semibold border border-slate-300 bg-white text-slate-700 rounded-lg hover:bg-slate-50 hover:border-slate-400 shadow-md hover:shadow-lg transition-all duration-200">
                <Folder className="w-4 h-4" />
                <span>Open Report</span>
              </button>
              <button className="flex items-center space-x-3 px-6 py-3 text-sm font-semibold border border-slate-300 bg-white text-slate-700 rounded-lg hover:bg-slate-50 hover:border-slate-400 shadow-md hover:shadow-lg transition-all duration-200">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>

            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3 px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 rounded-full border border-green-200">
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-semibold text-sm">AI Ready</span>
              </div>
              <div className="text-sm text-slate-500">
                <span className="font-medium">Version 1.0.0</span> • <span>Enterprise Edition</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Professional Sidebar - Enterprise Style */}
        <div className={`bg-gradient-to-b from-slate-50 to-slate-100 border-r border-slate-300 transition-all duration-300 shadow-xl ${
          sidebarCollapsed ? 'w-20' : 'w-80'
        }`}>
          <div className="flex flex-col h-full">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-300 bg-white shadow-sm">
              <h2 className={`font-bold text-slate-800 text-lg transition-opacity ${
                sidebarCollapsed ? 'opacity-0' : 'opacity-100'
              }`}>
                Report Explorer
              </h2>
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all duration-200 shadow-sm"
              >
                {sidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
              </button>
            </div>

            {/* Quick Actions */}
            {!sidebarCollapsed && (
              <div className="p-6 bg-white border-b border-slate-200">
                <div className="grid grid-cols-3 gap-3">
                  <button className="flex flex-col items-center space-y-2 p-4 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-xl border border-blue-200 shadow-sm hover:shadow-md transition-all duration-200">
                    <FileText className="w-6 h-6 text-blue-600" />
                    <span className="text-xs font-semibold text-blue-700">New Report</span>
                  </button>
                  <button className="flex flex-col items-center space-y-2 p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 hover:from-emerald-100 hover:to-emerald-200 rounded-xl border border-emerald-200 shadow-sm hover:shadow-md transition-all duration-200">
                    <Folder className="w-6 h-6 text-emerald-600" />
                    <span className="text-xs font-semibold text-emerald-700">Open</span>
                  </button>
                  <button className="flex flex-col items-center space-y-2 p-4 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-xl border border-purple-200 shadow-sm hover:shadow-md transition-all duration-200">
                    <Download className="w-6 h-6 text-purple-600" />
                    <span className="text-xs font-semibold text-purple-700">Export</span>
                  </button>
                </div>
              </div>
            )}

            {/* Navigation Items */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-3">
                {navigationItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleViewChange(item.id)}
                    className={`w-full flex items-center space-x-4 px-5 py-4 text-sm font-semibold rounded-xl transition-all duration-200 shadow-sm hover:shadow-md ${
                      activeView === item.id
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg border border-blue-400'
                        : 'bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 border border-slate-200'
                    }`}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {!sidebarCollapsed && (
                      <>
                        <span className="flex-1 text-left">{item.label}</span>
                        {item.badge && (
                          <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                            activeView === item.id
                              ? 'bg-white/20 text-white'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </button>
                ))}
              </div>

              {/* AI Tools Section */}
              {!sidebarCollapsed && (
                <div className="mt-8">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-8 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
                    <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider">
                      AI Tools
                    </h3>
                    <div className="flex-1 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                  </div>
                  <div className="space-y-3">
                    {toolItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleViewChange(item.id)}
                        className={`w-full flex items-center space-x-4 px-5 py-4 text-sm font-semibold rounded-xl transition-all duration-200 shadow-sm hover:shadow-md ${
                          item.id === 'chat' 
                            ? 'bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 text-indigo-700 border border-indigo-200'
                            : 'bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200'
                        }`}
                      >
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        {!sidebarCollapsed && (
                          <>
                            <span className="flex-1 text-left">{item.label}</span>
                            {item.badge && (
                              <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                                item.id === 'chat'
                                  ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white animate-pulse'
                                  : 'bg-green-100 text-green-700'
                              }`}>
                                {item.badge}
                              </span>
                            )}
                          </>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Status Footer */}
            {!sidebarCollapsed && (
              <div className="p-6 bg-white border-t border-slate-200">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-semibold text-slate-700">Connected</span>
                  </div>
                  <span className="text-slate-500">SAP Enterprise</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Professional Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
          {/* Enterprise Breadcrumb */}
          <div className="bg-white border-b border-slate-200 px-8 py-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 text-sm">
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-slate-100 rounded-lg">
                  <FileText className="w-4 h-4 text-slate-600" />
                  <span className="font-semibold text-slate-700">SAP Crystal Copilot</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
                <span className="text-slate-900 font-bold text-base">
                  {navigationItems.find(item => item.id === activeView)?.label || 'My Reports'}
                </span>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg border border-green-200">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold">System Ready</span>
                </div>
                <div className="text-sm text-slate-500">
                  Last updated: {new Date().toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>

          {/* Premium Content Area */}
          <div className="flex-1 overflow-auto bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="h-full p-8">
              <div className="max-w-full h-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                <div className="h-full flex flex-col">
                  {children}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Professional Status Bar */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 border-t border-slate-700 px-8 py-4 shadow-2xl">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg"></div>
              <span className="text-slate-300 font-medium">AI System Active</span>
            </div>
            <div className="w-px h-4 bg-slate-600"></div>
            <span className="text-slate-400">Reports: <span className="text-white font-semibold">12 loaded</span></span>
            <div className="w-px h-4 bg-slate-600"></div>
            <span className="text-slate-400">Storage: <span className="text-white font-semibold">2.4GB available</span></span>
          </div>
          
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-slate-300 font-medium">API Connected</span>
            </div>
            <div className="w-px h-4 bg-slate-600"></div>
            <span className="text-slate-400">Version: <span className="text-white font-semibold">Enterprise 1.0.0</span></span>
            <div className="w-px h-4 bg-slate-600"></div>
            <span className="text-slate-400">License: <span className="text-green-400 font-semibold">SAP Authorized</span></span>
          </div>
        </div>
      </div>
    </div>
  );
}