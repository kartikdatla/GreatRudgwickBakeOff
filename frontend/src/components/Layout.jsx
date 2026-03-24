import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BackgroundAnimation from './BackgroundAnimation';

const Layout = () => {
  const { user, logout, isAdmin, isJudge, isBaker } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on navigation
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = (
    <>
      <Link
        to="/"
        className={`nav-link ${isActive('/') ? 'nav-link-active' : ''}`}
      >
        Dashboard
      </Link>

      {isAdmin() && (
        <>
          <Link
            to="/theme"
            className={`nav-link ${isActive('/theme') ? 'nav-link-active' : ''}`}
          >
            Draw Theme
          </Link>
          <Link
            to="/theme-management"
            className={`nav-link ${isActive('/theme-management') ? 'nav-link-active' : ''}`}
          >
            Manage Themes
          </Link>
        </>
      )}

      <Link
        to="/submissions"
        className={`nav-link ${isActive('/submissions') ? 'nav-link-active' : ''}`}
      >
        Submissions
      </Link>

      {isBaker() && (
        <Link
          to="/submit"
          className={`nav-link ${isActive('/submit') ? 'nav-link-active' : ''}`}
        >
          Submit Entry
        </Link>
      )}

      {isJudge() && (
        <Link
          to="/judging"
          className={`nav-link ${isActive('/judging') ? 'nav-link-active' : ''}`}
        >
          Judging
        </Link>
      )}

      <Link
        to="/leaderboard"
        className={`nav-link ${isActive('/leaderboard') ? 'nav-link-active' : ''}`}
      >
        Leaderboard
      </Link>

      <Link
        to="/resources"
        className={`nav-link ${isActive('/resources') ? 'nav-link-active' : ''}`}
      >
        Resources
      </Link>

      {isAdmin() && (
        <>
          <Link
            to="/users"
            className={`nav-link ${isActive('/users') ? 'nav-link-active' : ''}`}
          >
            Users
          </Link>
          <Link
            to="/admin"
            className={`nav-link ${isActive('/admin') ? 'nav-link-active' : ''}`}
          >
            Admin
          </Link>
        </>
      )}
    </>
  );

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <BackgroundAnimation />
      <nav className="glass border-b border-neutral-200/50 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-3 group">
                <span className="text-4xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">🎂</span>
                <div className="flex flex-col">
                  <span className="text-2xl font-display font-bold text-gradient-gold">
                    Great Rudgwick
                  </span>
                  <span className="text-sm font-accent text-neutral-600 -mt-1">Bake Off</span>
                </div>
              </Link>
            </div>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center space-x-1">
              {navLinks}

              <div className="flex items-center space-x-3 ml-6 pl-6 border-l border-neutral-300">
                <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg px-4 py-2 border border-primary-200">
                  <p className="font-semibold text-neutral-900 text-sm">{user?.name}</p>
                  <p className="text-xs text-primary-700 font-medium">{user?.role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="btn btn-secondary text-sm hover:scale-[1.02] active:scale-[0.98]"
                >
                  Logout
                </button>
              </div>
            </div>

            {/* Mobile hamburger button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
                aria-label="Toggle menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-neutral-200/50 bg-white/95 backdrop-blur-md">
            <div className="px-4 py-3 space-y-1 flex flex-col">
              {navLinks}
            </div>
            <div className="px-4 py-3 border-t border-neutral-200/50 flex items-center justify-between">
              <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg px-4 py-2 border border-primary-200">
                <p className="font-semibold text-neutral-900 text-sm">{user?.name}</p>
                <p className="text-xs text-primary-700 font-medium">{user?.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="btn btn-secondary text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
        <Outlet />
      </main>

      <footer className="mt-20 border-t border-neutral-200 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-neutral-500 text-sm">
            <p className="font-display font-semibold text-primary-600 mb-2">Great Rudgwick Bake Off</p>
            <p className="font-accent">Celebrating excellence in baking, one creation at a time.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
