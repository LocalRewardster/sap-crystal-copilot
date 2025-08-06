'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, MessageCircle, Eye, Download, Zap, Shield, Globe } from 'lucide-react';
import FileUpload from '@/components/FileUpload';
import ReportList from '@/components/ReportList';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'upload' | 'reports'>('upload');

  const features = [
    {
      icon: Upload,
      title: 'Smart Upload',
      description: 'Drag & drop Crystal Reports (.rpt) files up to 25MB',
    },
    {
      icon: MessageCircle,
      title: 'AI Chat',
      description: 'Ask questions about your reports in natural language',
    },
    {
      icon: Eye,
      title: 'Live Preview',
      description: 'See changes before applying them with visual diffs',
    },
    {
      icon: Download,
      title: 'Audit Trail',
      description: 'Complete change history with CSV export',
    },
    {
      icon: Zap,
      title: 'Fast Analysis',
      description: 'Locate field lineage in under 15 seconds',
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'SAP-grade security with metadata-only processing',
    },
  ];

  const stats = [
    { label: 'Avg. Time to Locate Field', value: '< 15s', trend: 'target' },
    { label: 'Avg. Time to Apply Edit', value: '< 60s', trend: 'target' },
    { label: 'Supported File Types', value: '.rpt', trend: 'info' },
    { label: 'Max File Size', value: '25MB', trend: 'info' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-sap-blue to-sap-blue-dark">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
              Crystal Reports
              <span className="block text-sap-gold">Made Simple</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-blue-100">
              AI-powered Crystal Reports analysis and editing. Locate, understand, 
              and modify any report element in under 60 seconds using natural language.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <button
                onClick={() => setActiveTab('upload')}
                className="rounded-md bg-sap-gold px-6 py-3 text-sm font-semibold text-gray-900 shadow-sm hover:bg-sap-gold-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sap-gold transition-colors"
              >
                Get Started
              </button>
              <a
                href="#features"
                className="text-sm font-semibold leading-6 text-white hover:text-sap-gold transition-colors"
              >
                Learn more <span aria-hidden="true">→</span>
              </a>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-2xl font-bold text-sap-blue">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Tab Navigation */}
          <div className="mb-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('upload')}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'upload'
                      ? 'border-sap-blue text-sap-blue'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Upload className="w-5 h-5 inline-block mr-2" />
                  Upload Report
                </button>
                <button
                  onClick={() => setActiveTab('reports')}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'reports'
                      ? 'border-sap-blue text-sap-blue'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Globe className="w-5 h-5 inline-block mr-2" />
                  My Reports
                </button>
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'upload' && <FileUpload />}
            {activeTab === 'reports' && <ReportList />}
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Powerful Features
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Everything you need to analyze and edit Crystal Reports efficiently
            </p>
          </div>
          
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card hover:shadow-lg transition-shadow"
              >
                <div className="card-body">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <feature.icon className="h-8 w-8 text-sap-blue" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        {feature.title}
                      </h3>
                    </div>
                  </div>
                  <p className="mt-4 text-gray-600">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-sap-blue">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white">
              Ready to transform your Crystal Reports workflow?
            </h2>
            <p className="mt-4 text-lg text-blue-100">
              Join the beta program and experience the future of report editing
            </p>
            <div className="mt-8">
              <button
                onClick={() => setActiveTab('upload')}
                className="rounded-md bg-sap-gold px-8 py-3 text-base font-semibold text-gray-900 shadow-sm hover:bg-sap-gold-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sap-gold transition-colors"
              >
                Start Free Trial
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}