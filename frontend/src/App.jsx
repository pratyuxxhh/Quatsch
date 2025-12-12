import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/dashboard/Dashboard';
import Analysis from './pages/analysis/Analysis';
import Compare from './pages/compare/Compare';
import About from './pages/about/About';
import Login from './pages/auth/Login';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="relative w-full min-h-screen overflow-hidden">
          {/* Navbar */}
          <Navbar />

          {/* Routes */}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/analysis" element={<ProtectedRoute><Analysis /></ProtectedRoute>} />
            <Route path="/compare" element={<ProtectedRoute><Compare /></ProtectedRoute>} />
            <Route path="/about" element={<About />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
