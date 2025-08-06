'use client';

export default function TestPage() {
  return (
    <div className="min-h-screen bg-red-500 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl">
        <h1 className="text-6xl font-bold text-green-500 mb-4 text-center">
          🚨 TEST PAGE WORKING! 🚨
        </h1>
        <p className="text-2xl text-blue-600 mb-6 text-center">
          If you can see this, Tailwind CSS is working correctly!
        </p>
        <div className="mt-8 space-y-4">
          <button className="w-full px-8 py-4 bg-purple-600 text-white text-xl rounded-lg hover:bg-purple-700 transition-colors">
            HUGE PURPLE BUTTON
          </button>
          <div className="w-32 h-32 bg-yellow-400 rounded-full mx-auto"></div>
          <p className="text-center text-gray-700 text-lg">
            Now try going back to <strong>http://localhost:3000</strong> - the main page should have the improved UI!
          </p>
        </div>
      </div>
    </div>
  );
}