'use client';

import { useState } from 'react';
import CrystalLayout from '@/components/CrystalLayout';
import ReportExplorer from '@/components/ReportExplorer';
import FileUpload from '@/components/FileUpload';

export default function HomePage() {
  const [activeView, setActiveView] = useState<'reports' | 'upload'>('reports');

  return (
    <CrystalLayout>
      {activeView === 'reports' && <ReportExplorer />}
      {activeView === 'upload' && (
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
      )}
    </CrystalLayout>
  );
}