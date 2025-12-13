import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { authenticated, user, logout } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 w-full bg-transparent backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Logo/Title */}
          <div className="flex-shrink-0">
            <Link to="/">
              <h1 className="text-2xl font-display font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent cursor-pointer">
                Lumen
              </h1>
            </Link>
          </div>

          {/* Right side - Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link
                to="/dashboard"
                className={`px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                  isActive('/dashboard') ? 'text-white' : 'text-gray-300 hover:text-white'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/analysis"
                className={`px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                  isActive('/analysis') ? 'text-white' : 'text-gray-300 hover:text-white'
                }`}
              >
                Analysis
              </Link>
              <Link
                to="/compare"
                className={`px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                  isActive('/compare') ? 'text-white' : 'text-gray-300 hover:text-white'
                }`}
              >
                Compare
              </Link>
              <Link
                to="/about"
                className={`px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                  isActive('/about') ? 'text-white' : 'text-gray-300 hover:text-white'
                }`}
              >
                About
              </Link>
              {authenticated ? (
                <>
                  <span className="px-3 py-2 text-sm text-cyan-400">
                    {user?.email}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors duration-200"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className={`px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                    isActive('/login') ? 'text-white' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  Login
                </Link>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-cyan-400"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {!isMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-900 bg-opacity-95 backdrop-blur-sm">
            <Link
              to="/"
              className={`block px-3 py-2 text-base font-medium transition-colors duration-200 ${
                isActive('/') ? 'text-white' : 'text-gray-300 hover:text-white'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/dashboard"
              className={`block px-3 py-2 text-base font-medium transition-colors duration-200 ${
                isActive('/dashboard') ? 'text-white' : 'text-gray-300 hover:text-white'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              to="/analysis"
              className={`block px-3 py-2 text-base font-medium transition-colors duration-200 ${
                isActive('/analysis') ? 'text-white' : 'text-gray-300 hover:text-white'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Analysis
            </Link>
            <Link
              to="/compare"
              className={`block px-3 py-2 text-base font-medium transition-colors duration-200 ${
                isActive('/compare') ? 'text-white' : 'text-gray-300 hover:text-white'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Compare
            </Link>
            <Link
              to="/about"
              className={`block px-3 py-2 text-base font-medium transition-colors duration-200 ${
                isActive('/about') ? 'text-white' : 'text-gray-300 hover:text-white'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            {authenticated ? (
              <>
                <div className="px-3 py-2 text-base font-medium text-cyan-400">
                  {user?.email}
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                  }}
                  className="block w-full text-left px-3 py-2 text-base font-medium text-gray-300 hover:text-white transition-colors duration-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className={`block px-3 py-2 text-base font-medium transition-colors duration-200 ${
                  isActive('/login') ? 'text-white' : 'text-gray-300 hover:text-white'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

