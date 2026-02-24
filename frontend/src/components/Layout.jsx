import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BackgroundAnimation from './BackgroundAnimation';

const Layout = () => {
  const { user, logout, isAdmin, isJudge, isBaker } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen relative">
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

            <div className="flex items-center space-x-1">
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
          </div>
        </div>
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
