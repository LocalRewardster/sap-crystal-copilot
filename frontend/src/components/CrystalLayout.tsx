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
}

export default function CrystalLayout({ children }: CrystalLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeView, setActiveView] = useState('reports');

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
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top Menu Bar - Crystal Reports Style */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center space-x-6">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-sm">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Crystal Copilot</h1>
                <p className="text-sm text-gray-500">AI Report Editor</p>
              </div>
            </div>

            {/* Main Menu */}
            <nav className="hidden md:flex items-center space-x-2">
              <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-md transition-colors">
                File
              </button>
              <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-md transition-colors">
                Edit
              </button>
              <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-md transition-colors">
                View
              </button>
              <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-md transition-colors">
                Insert
              </button>
              <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-md transition-colors">
                Tools
              </button>
              <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-md transition-colors">
                Help
              </button>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search reports..."
                className="pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors w-64"
              />
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-3">
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <Settings className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <HelpCircle className="w-5 h-5" />
              </button>
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-sm">
                <User className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm transition-colors">
                <FileText className="w-4 h-4" />
                <span>New Report</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 shadow-sm transition-colors">
                <Folder className="w-4 h-4" />
                <span>Open</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 shadow-sm transition-colors">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>

            <div className="flex items-center space-x-3 text-sm">
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="font-medium">Ready</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Crystal Reports Explorer Style */}
        <div className={`bg-white border-r border-gray-200 transition-all duration-300 shadow-sm ${
          sidebarCollapsed ? 'w-16' : 'w-72'
        }`}>
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
            {!sidebarCollapsed && (
              <h2 className="text-base font-semibold text-gray-900">Explorer</h2>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <div className="p-3 space-y-2">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  activeView === item.id
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!sidebarCollapsed && (
                  <>
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full font-medium">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </button>
            ))}
          </div>

          {/* Tools Section */}
          <div className="border-t border-gray-200 mt-6">
            <div className="p-3">
              {!sidebarCollapsed && (
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 px-1">
                  AI Tools
                </h3>
              )}
              <div className="space-y-2">
                {toolItems.map((item) => (
                  <button
                    key={item.id}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors"
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {!sidebarCollapsed && (
                      <>
                        <span className="flex-1 text-left">{item.label}</span>
                        {item.badge && (
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full font-medium">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Breadcrumb */}
          <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-gray-500">Crystal Copilot</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span className="text-gray-900 font-semibold">
                {navigationItems.find(item => item.id === activeView)?.label || 'My Reports'}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto bg-gray-50">
            <div className="h-full">
              {children}
            </div>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-gray-50 border-t border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Ready for analysis</span>
            </div>
            <span className="text-gray-400">•</span>
            <span>12 reports loaded</span>
          </div>
          <div className="flex items-center space-x-6">
            <span>API: Connected</span>
            <span className="text-gray-400">•</span>
            <span>Crystal Copilot v1.0.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}