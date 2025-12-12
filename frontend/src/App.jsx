import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/dashboard/Dashboard';
import Analysis from './pages/analysis/Analysis';
import Compare from './pages/compare/Compare';
import About from './pages/about/About';
import './App.css';

function App() {
  return (
    <Router>
      <div className="relative w-full min-h-screen overflow-hidden">
        {/* Navbar */}
        <Navbar />

        {/* Routes */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/analysis" element={<Analysis />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
