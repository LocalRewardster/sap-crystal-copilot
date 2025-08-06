'use client';

export default function TestPage() {
  return (
    <div className="min-h-screen bg-red-500 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-6xl font-bold text-green-500 mb-4">
          🚨 TEST PAGE - IF YOU SEE THIS, STYLES ARE WORKING! 🚨
        </h1>
        <p className="text-2xl text-blue-600">
          This is a test to see if Tailwind styles are being applied correctly.
        </p>
        <div className="mt-8 space-y-4">
          <button className="px-8 py-4 bg-purple-600 text-white text-xl rounded-lg hover:bg-purple-700 transition-colors">
            HUGE PURPLE BUTTON
          </button>
          <div className="w-32 h-32 bg-yellow-400 rounded-full mx-auto"></div>
        </div>
      </div>
    </div>
  );
}