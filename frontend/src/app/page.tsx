'use client';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      {/* MASSIVE OBVIOUS HEADER */}
      <div className="bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 text-white text-center py-8">
        <h1 className="text-6xl font-bold animate-bounce">
          🚨 PROFESSIONAL UI IS WORKING! 🚨
        </h1>
        <p className="text-2xl mt-4">If you see this colorful header, the UI is fixed!</p>
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
            <div className="bg-green-500 text-white px-6 py-3 rounded-full font-bold text-lg animate-pulse">
              ✅ SYSTEM READY
            </div>
            <div className="bg-blue-500 text-white px-6 py-3 rounded-full font-bold text-lg">
              🚀 ENTERPRISE EDITION
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
                  <button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold text-lg">
                    📊 My Reports (12)
                  </button>
                  <button className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold text-lg">
                    📤 Upload New Report
                  </button>
                  <button className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold text-lg">
                    🤖 AI Assistant
                  </button>
                  <button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold text-lg">
                    📈 Analytics
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
                    <div className="text-4xl mb-4">⚡</div>
                    <h3 className="text-xl font-bold text-blue-900 mb-2">Lightning Fast</h3>
                    <p className="text-blue-700">Analyze reports in under 15 seconds</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
                    <div className="text-4xl mb-4">🛡️</div>
                    <h3 className="text-xl font-bold text-green-900 mb-2">Enterprise Security</h3>
                    <p className="text-green-700">SAP-grade security and compliance</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
                    <div className="text-4xl mb-4">🤖</div>
                    <h3 className="text-xl font-bold text-purple-900 mb-2">AI-Powered</h3>
                    <p className="text-purple-700">Natural language report editing</p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200">
                    <div className="text-4xl mb-4">📈</div>
                    <h3 className="text-xl font-bold text-orange-900 mb-2">Advanced Analytics</h3>
                    <p className="text-orange-700">Deep insights into your data</p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-6 rounded-xl border border-slate-200">
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">🎯 Ready for Your Demo</h3>
                  <p className="text-slate-700 text-lg mb-4">
                    This professional interface is now ready to impress your prospective customer!
                  </p>
                  <div className="flex space-x-4">
                    <button className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all">
                      Start Demo
                    </button>
                    <button className="bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all">
                      Upload Report
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