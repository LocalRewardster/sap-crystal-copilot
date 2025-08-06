import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SAP Crystal Copilot AI Report Editor',
  description: 'AI-powered Crystal Reports analysis and editing platform',
  keywords: ['SAP', 'Crystal Reports', 'AI', 'Report Editor', 'BusinessObjects'],
  authors: [{ name: 'SAP Product Management BI' }],
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full bg-gray-50`}>
        <Providers>
          <div className="min-h-full">
            <header className="bg-white shadow-sm border-b border-gray-200">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 bg-sap-blue rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-sm">SC</span>
                        </div>
                        <div>
                          <h1 className="text-lg font-semibold text-gray-900">
                            SAP Crystal Copilot
                          </h1>
                          <p className="text-xs text-gray-500">AI Report Editor</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">v1.0.0</span>
                  </div>
                </div>
              </div>
            </header>
            
            <main className="flex-1">
              {children}
            </main>
            
            <footer className="bg-white border-t border-gray-200 mt-auto">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    © 2024 SAP SE. All rights reserved.
                  </p>
                  <div className="flex items-center space-x-6">
                    <a 
                      href="/docs" 
                      className="text-sm text-gray-500 hover:text-gray-900"
                    >
                      Documentation
                    </a>
                    <a 
                      href="/api/docs" 
                      className="text-sm text-gray-500 hover:text-gray-900"
                    >
                      API Reference
                    </a>
                  </div>
                </div>
              </div>
            </footer>
          </div>
          
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#fff',
                color: '#374151',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}