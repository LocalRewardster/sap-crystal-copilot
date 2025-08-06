'use client';

import { useState } from 'react';
import CrystalLayout from '@/components/CrystalLayout';
import ReportExplorer from '@/components/ReportExplorer';
import FileUpload from '@/components/FileUpload';

export default function HomePage() {
  const [activeView, setActiveView] = useState<string>('reports');

  const renderContent = () => {
    switch (activeView) {
      case 'reports':
      case 'browse':
      case 'recent':
      case 'templates':
        return <ReportExplorer onViewChange={setActiveView} />;
      
      case 'upload':
        return (
          <div className="p-6">
            <div className="max-w-4xl mx-auto">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Upload Crystal Report</h2>
                <p className="text-gray-600">
                  Upload your Crystal Reports (.rpt) files to start AI-powered analysis and editing.
                </p>
              </div>
              <FileUpload />
            </div>
          </div>
        );
      
      case 'chat':
        return (
          <div className="p-6">
            <div className="max-w-4xl mx-auto">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">AI Assistant</h2>
                <p className="text-gray-600">
                  Chat with our AI to get help with your Crystal Reports.
                </p>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <p className="text-gray-500">AI Assistant coming soon...</p>
              </div>
            </div>
          </div>
        );
      
      case 'database':
        return (
          <div className="p-6">
            <div className="max-w-4xl mx-auto">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Data Sources</h2>
                <p className="text-gray-600">
                  Manage your database connections and data sources.
                </p>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <p className="text-gray-500">Data Sources management coming soon...</p>
              </div>
            </div>
          </div>
        );
      
      case 'analytics':
        return (
          <div className="p-6">
            <div className="max-w-4xl mx-auto">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Report Analytics</h2>
                <p className="text-gray-600">
                  View analytics and performance metrics for your reports.
                </p>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <p className="text-gray-500">Report Analytics coming soon...</p>
              </div>
            </div>
          </div>
        );
      
      default:
        return <ReportExplorer />;
    }
  };

  return (
    <div>
      {/* 🚨 URGENT TEST - If you see this RED banner, changes ARE working! */}
      <div className="bg-red-600 text-white text-center py-4 font-bold text-2xl animate-pulse">
        🚨 CHANGES ARE WORKING! This red banner proves it! 🚨
      </div>
      
      <CrystalLayout activeView={activeView} onViewChange={setActiveView}>
        {renderContent()}
      </CrystalLayout>
    </div>
  );
}