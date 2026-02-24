import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const AdminPanel = () => {
  const [activeTheme, setActiveTheme] = useState(null);
  const [scoresRevealed, setScoresRevealed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const themeResponse = await api.get('/themes/active');
      setActiveTheme(themeResponse.data.theme);

      const leaderboardResponse = await api.get(`/scores/leaderboard/${themeResponse.data.theme.id}`);
      setScoresRevealed(leaderboardResponse.data.revealed);
    } catch (error) {
      setError('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleLockTheme = async () => {
    if (!window.confirm('Lock this theme? This will prevent new submissions and scoring.')) return;

    try {
      await api.patch(`/themes/${activeTheme.id}/lock`);
      setSuccess('Theme locked successfully');
      fetchData();
    } catch (err) {
      setError('Failed to lock theme');
    }
  };

  const handleRevealScores = async (reveal) => {
    const message = reveal
      ? 'Reveal all scores to users?'
      : 'Hide scores from users?';

    if (!window.confirm(message)) return;

    try {
      await api.post('/scores/reveal', { reveal });
      setSuccess(`Scores ${reveal ? 'revealed' : 'hidden'} successfully`);
      setScoresRevealed(reveal);
    } catch (err) {
      setError('Failed to update score visibility');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="loading-spinner mx-auto mb-4"></div>
        <p className="text-neutral-500">Loading...</p>
      </div>
    );
  }

  const quickLinks = [
    { to: '/users', icon: '👥', label: 'Manage users & invite codes' },
    { to: '/theme', icon: '🎲', label: 'Draw a new monthly theme' },
    { to: '/theme-management', icon: '🎨', label: 'Manage and edit themes' },
    { to: '/submissions', icon: '📸', label: 'View all submissions' },
    { to: '/leaderboard', icon: '🏆', label: 'Check leaderboard' },
    { to: '/resources', icon: '🔗', label: 'Manage resources' }
  ];

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <h1 className="text-3xl font-bold text-neutral-900 mb-6">Admin Panel</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 animate-scale-in">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 animate-scale-in flex items-center gap-2">
          <span className="text-lg">✓</span> {success}
        </div>
      )}

      <div className="space-y-6">
        <div className="card stagger-item" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-xl font-semibold mb-4">Current Theme</h2>
          {activeTheme ? (
            <div>
              <div className="bg-gradient-to-r from-primary-50 to-primary-100/50 border border-primary-200 rounded-xl p-5 mb-4">
                <h3 className="text-lg font-bold text-primary-900">{activeTheme.mainTheme?.name || activeTheme.name}</h3>
                {activeTheme.subTheme && (
                  <p className="text-primary-700 mt-1">Sub-theme: {activeTheme.subTheme.name}</p>
                )}
                <p className="text-sm text-primary-500 mt-2">
                  {activeTheme.month}/{activeTheme.year}
                </p>
              </div>

              {activeTheme.locked_at ? (
                <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4">
                  <p className="text-neutral-700">
                    🔒 This theme is locked. No new submissions or scores can be added.
                  </p>
                  <p className="text-sm text-neutral-500 mt-1">
                    Locked on {new Date(activeTheme.locked_at).toLocaleString()}
                  </p>
                </div>
              ) : (
                <button
                  onClick={handleLockTheme}
                  className="btn btn-danger btn-luxury"
                >
                  🔒 Lock Theme (No more submissions/scoring)
                </button>
              )}
            </div>
          ) : (
            <p className="text-neutral-500">No active theme</p>
          )}
        </div>

        <div className="card stagger-item" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-xl font-semibold mb-4">Score Visibility</h2>
          <p className="text-neutral-500 mb-4">
            Control whether users can see detailed scores and judge names.
          </p>

          <div className="flex items-center gap-4">
            <div className={`px-4 py-2.5 rounded-lg font-medium transition-all duration-300 ${
              scoresRevealed ? 'bg-green-100 text-green-800' : 'bg-neutral-100 text-neutral-600'
            }`}>
              {scoresRevealed ? 'Scores Revealed' : 'Scores Hidden'}
            </div>

            {scoresRevealed ? (
              <button
                onClick={() => handleRevealScores(false)}
                className="btn btn-secondary"
              >
                Hide Scores
              </button>
            ) : (
              <button
                onClick={() => handleRevealScores(true)}
                className="btn btn-primary btn-luxury"
              >
                Reveal Scores
              </button>
            )}
          </div>
        </div>

        <div className="card stagger-item" style={{ animationDelay: '0.3s' }}>
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {quickLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-neutral-50 hover:bg-primary-50 border border-neutral-200 hover:border-primary-200 transition-all duration-200 hover:-translate-y-0.5 group"
              >
                <span className="text-xl transition-transform duration-200 group-hover:scale-110">{link.icon}</span>
                <span className="text-neutral-700 group-hover:text-primary-700 font-medium transition-colors">{link.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
