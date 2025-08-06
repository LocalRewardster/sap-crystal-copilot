'use client';

export default function TestUIPage() {
  return (
    <div className="min-h-screen">
      {/* MASSIVE RED BANNER */}
      <div className="bg-red-600 text-white text-center py-8 text-4xl font-bold animate-bounce">
        🚨 URGENT TEST - IF YOU SEE THIS, UI CHANGES WORK! 🚨
      </div>
      
      {/* Professional Header Test */}
      <div className="bg-gradient-to-r from-purple-900 via-blue-900 to-green-900 text-white p-8">
        <h1 className="text-6xl font-bold text-center">
          🎨 PROFESSIONAL HEADER TEST 🎨
        </h1>
        <p className="text-2xl text-center mt-4">
          This should be a colorful gradient header!
        </p>
      </div>
      
      {/* Modern Card Test */}
      <div className="p-8 bg-slate-100">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-8 border border-slate-200">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              💎 Modern Card Design Test
            </h2>
            <p className="text-slate-600 text-lg">
              If you can see this modern card with shadows and rounded corners, 
              then Tailwind CSS is working properly and we can build the professional UI.
            </p>
            
            <div className="grid grid-cols-3 gap-4 mt-8">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
                <h3 className="font-bold text-lg">Test 1</h3>
                <p>Blue gradient card</p>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
                <h3 className="font-bold text-lg">Test 2</h3>
                <p>Green gradient card</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
                <h3 className="font-bold text-lg">Test 3</h3>
                <p>Purple gradient card</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Status Test */}
      <div className="bg-slate-900 text-white p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">🔍 DIAGNOSTIC INFO</h2>
        <p className="text-lg">
          If you see this page with all the colors and modern styling, 
          then the issue is with our main page components, not with Next.js or Tailwind.
        </p>
        <div className="mt-4 text-yellow-300 font-bold text-xl">
          Current Time: {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}