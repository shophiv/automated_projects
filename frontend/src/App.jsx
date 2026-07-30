import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <h1 className="text-3xl font-bold text-indigo-600 mb-4">AI Expense Tracker</h1>
        <p className="text-gray-600 mb-6">
          Foundation setup complete. MERN stack architecture is ready.
        </p>
        <div className="inline-block bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium">
          Phase 1 Active
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;