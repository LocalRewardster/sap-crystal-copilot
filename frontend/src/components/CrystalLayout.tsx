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
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center space-x-4">
            {/* Logo and Title */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-semibold text-gray-900">Crystal Copilot</h1>
                <p className="text-xs text-gray-500">AI Report Editor</p>
              </div>
            </div>

            {/* Main Menu */}
            <nav className="hidden md:flex items-center space-x-1">
              <button className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded">
                File
              </button>
              <button className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded">
                Edit
              </button>
              <button className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded">
                View
              </button>
              <button className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded">
                Insert
              </button>
              <button className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded">
                Tools
              </button>
              <button className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded">
                Help
              </button>
            </nav>
          </div>

          <div className="flex items-center space-x-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search reports..."
                className="pl-10 pr-4 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-2">
              <button className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded">
                <Settings className="w-4 h-4" />
              </button>
              <button className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded">
                <HelpCircle className="w-4 h-4" />
              </button>
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="border-t border-gray-200 bg-gray-50 px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <button className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                <FileText className="w-4 h-4" />
                <span>New Report</span>
              </button>
              <button className="flex items-center space-x-2 px-3 py-1.5 text-sm border border-gray-300 bg-white text-gray-700 rounded hover:bg-gray-50">
                <Folder className="w-4 h-4" />
                <span>Open</span>
              </button>
              <button className="flex items-center space-x-2 px-3 py-1.5 text-sm border border-gray-300 bg-white text-gray-700 rounded hover:bg-gray-50">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>

            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>Ready</span>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Crystal Reports Explorer Style */}
        <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${
          sidebarCollapsed ? 'w-12' : 'w-64'
        }`}>
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-200">
            {!sidebarCollapsed && (
              <h2 className="text-sm font-semibold text-gray-900">Explorer</h2>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Items */}
          <div className="p-2 space-y-1">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 text-sm rounded-md transition-colors ${
                  activeView === item.id
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {!sidebarCollapsed && (
                  <>
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <span className="px-2 py-0.5 text-xs bg-gray-200 text-gray-700 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </button>
            ))}
          </div>

          {/* Tools Section */}
          <div className="border-t border-gray-200 mt-4">
            <div className="p-3">
              {!sidebarCollapsed && (
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Tools
                </h3>
              )}
              <div className="space-y-1">
                {toolItems.map((item) => (
                  <button
                    key={item.id}
                    className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    {!sidebarCollapsed && (
                      <>
                        <span className="flex-1 text-left">{item.label}</span>
                        {item.badge && (
                          <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">
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
          <div className="bg-white border-b border-gray-200 px-6 py-3">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>Crystal Copilot</span>
              <ChevronRight className="w-4 h-4" />
              <span className="text-gray-900 font-medium">
                {navigationItems.find(item => item.id === activeView)?.label || 'My Reports'}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto bg-gray-50">
            {children}
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center space-x-4">
            <span>12 reports loaded</span>
            <span>•</span>
            <span>Ready for analysis</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>API: Connected</span>
            <span>•</span>
            <span>Version 1.0.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}