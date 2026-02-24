import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

const Dashboard = () => {
  const { user, isAdmin, isJudge, isBaker } = useAuth();
  const { applyThemeColors, resetThemeColors } = useTheme();
  const [activeTheme, setActiveTheme] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveTheme();
  }, []);

  const fetchActiveTheme = async () => {
    try {
      const response = await api.get('/themes/active');
      const theme = response.data.theme;
      setActiveTheme(theme);

      // Apply theme colors if available
      if (theme && theme.colors) {
        applyThemeColors(theme.colors);
      } else {
        resetThemeColors();
      }
    } catch (error) {
      console.error('Error fetching active theme:', error);
      resetThemeColors();
    } finally {
      setLoading(false);
    }
  };

  const handleRevealToJudges = async () => {
    try {
      await api.patch(`/themes/${activeTheme.id}/reveal`);
      fetchActiveTheme(); // Refresh to show updated state
    } catch (error) {
      console.error('Error revealing theme:', error);
      alert('Failed to reveal theme to judges');
    }
  };

  const handleHideFromJudges = async () => {
    try {
      await api.patch(`/themes/${activeTheme.id}/hide`);
      fetchActiveTheme(); // Refresh to show updated state
    } catch (error) {
      console.error('Error hiding theme:', error);
      alert('Failed to hide theme from judges');
    }
  };

  const getMonthName = (month) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month - 1];
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Welcome to the Great Rudgwick Bake Off! 🎂
        </h1>
        <p className="text-xl text-gray-600">Hello, {user?.name}!</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-pulse">
            <div className="w-64 h-32 bg-neutral-200 rounded-lg"></div>
          </div>
        </div>
      ) : activeTheme ? (
        <div className="theme-card-luxury" style={{
          background: `linear-gradient(135deg, var(--theme-gradient-start), var(--theme-primary), var(--theme-gradient-end))`,
          color: 'var(--theme-text)'
        }}>
          <div className="text-center relative z-10">
            <p className="text-sm uppercase tracking-wide opacity-90 mb-2">
              {getMonthName(activeTheme.month)} {activeTheme.year} Theme
            </p>

            {/* Baker View: Type of Item to Bake */}
            {(isBaker() || (!isJudge() && !isAdmin())) && (
              <>
                <div className="mb-3">
                  <p className="text-xs uppercase tracking-wider opacity-75 mb-1">This Month's Bake</p>
                  <h2 className="text-5xl font-bold mb-3 text-reveal">
                    {activeTheme.mainTheme?.name || activeTheme.name}
                  </h2>
                </div>
                <p className="text-lg opacity-90 max-w-2xl mx-auto">
                  {activeTheme.mainTheme?.description || 'Bake your best creation!'}
                </p>
                <div className="mt-4 inline-flex items-center gap-2 bg-white/20 rounded-lg px-4 py-2 backdrop-blur-sm">
                  <span className="text-2xl">🎨</span>
                  <p className="text-sm font-medium">Any flavor or style - surprise the judges!</p>
                </div>
              </>
            )}

            {/* Judge/Admin View: Both Main + Sub Theme */}
            {(isJudge() || isAdmin()) && (
              <>
                {/* Admin View: Clear Two-Tier Display */}
                {isAdmin() && (
                  <div className="space-y-4 mb-4">
                    {/* Item Type Box */}
                    <div className="bg-white/20 rounded-xl px-6 py-4 backdrop-blur-sm border border-white/30">
                      <p className="text-xs uppercase tracking-wider opacity-75 mb-1">Item to Bake (Visible to Bakers)</p>
                      <h2 className="text-3xl font-bold mb-1">
                        🧁 {activeTheme.mainTheme?.name || activeTheme.name}
                      </h2>
                      <p className="text-sm opacity-90">
                        {activeTheme.mainTheme?.description}
                      </p>
                    </div>

                    {/* Secret Flavor/Style Theme Box */}
                    {activeTheme.subTheme && (
                      <div className="bg-white/30 rounded-xl px-6 py-4 backdrop-blur-sm border-2 border-white/50">
                        <p className="text-xs uppercase tracking-wider opacity-75 mb-1">
                          Secret Flavor/Style Theme {!activeTheme.revealed_to_judges && '(Hidden from Judges)'}
                        </p>
                        <h3 className="text-2xl font-bold mb-1">
                          🎨 {activeTheme.subTheme.name}
                        </h3>
                        <p className="text-sm opacity-90">
                          {activeTheme.subTheme.description}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Judge View: Single Display */}
                {isJudge() && (
                  <>
                    <div className="mb-4">
                      <h2 className="text-4xl font-bold mb-2 text-reveal">
                        {activeTheme.mainTheme?.name || activeTheme.name}
                      </h2>
                      <p className="text-base opacity-80">
                        {activeTheme.mainTheme?.description}
                      </p>
                    </div>

                    {/* Judge sees sub-theme only if revealed */}
                    {activeTheme.subTheme && (
                      <div className="mt-6 bg-white/20 rounded-xl px-6 py-4 backdrop-blur-sm border border-white/30">
                        <p className="text-xs uppercase tracking-wider opacity-75 mb-1">Secret Flavor/Style Theme</p>
                        <h3 className="text-2xl font-bold mb-1">
                          🎨 {activeTheme.subTheme.name}
                        </h3>
                        <p className="text-sm opacity-90">
                          {activeTheme.subTheme.description}
                        </p>
                      </div>
                    )}
                  </>
                )}

                {/* Judge sees message if not yet revealed */}
                {isJudge() && !activeTheme.subTheme && (
                  <div className="mt-6 bg-white/20 rounded-xl px-6 py-4 backdrop-blur-sm border border-white/30">
                    <p className="text-xs uppercase tracking-wider opacity-75 mb-1">Secret Flavor/Style Theme</p>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🔒</span>
                      <p className="text-sm opacity-90">
                        The flavor/style theme will be revealed by the admin at the end of the week
                      </p>
                    </div>
                  </div>
                )}

                {/* Admin reveal/hide controls */}
                {isAdmin() && (
                  <div className="mt-4 flex gap-3 justify-center">
                    {!activeTheme.revealed_to_judges ? (
                      <button
                        onClick={handleRevealToJudges}
                        className="btn btn-secondary btn-luxury"
                      >
                        🔓 Reveal Sub-Theme to Judges
                      </button>
                    ) : (
                      <button
                        onClick={handleHideFromJudges}
                        className="btn btn-secondary btn-luxury"
                      >
                        🔒 Hide Sub-Theme from Judges
                      </button>
                    )}
                  </div>
                )}
              </>
            )}

            {activeTheme.locked_at && (
              <div className="mt-4 bg-white/20 rounded-lg px-4 py-2 inline-block backdrop-blur-sm">
                <p className="text-sm">🔒 Submissions and scoring locked</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="card text-center">
          <p className="text-gray-600 mb-4">No active theme for this month yet.</p>
          {isAdmin() && (
            <Link to="/theme" className="btn btn-primary">
              Draw This Month's Theme
            </Link>
          )}
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isBaker() && (
          <Link to="/submit" className="card-hover glow-effect">
            <div className="text-center">
              <div className="text-4xl mb-3 float-gentle">📸</div>
              <h3 className="text-xl font-semibold mb-2">Submit Your Entry</h3>
              <p className="text-gray-600">Upload your bake photo and description</p>
            </div>
          </Link>
        )}

        <Link to="/submissions" className="card-hover glow-effect">
          <div className="text-center">
            <div className="text-4xl mb-3 float-gentle" style={{ animationDelay: '0.2s' }}>🧁</div>
            <h3 className="text-xl font-semibold mb-2">View Submissions</h3>
            <p className="text-gray-600">See all entries for this month</p>
          </div>
        </Link>

        {isJudge() && (
          <Link to="/judging" className="card-hover glow-effect">
            <div className="text-center">
              <div className="text-4xl mb-3 float-gentle" style={{ animationDelay: '0.4s' }}>⭐</div>
              <h3 className="text-xl font-semibold mb-2">Judge Entries</h3>
              <p className="text-gray-600">Score submissions and add feedback</p>
            </div>
          </Link>
        )}

        <Link to="/leaderboard" className="card-hover glow-effect">
          <div className="text-center">
            <div className="text-4xl mb-3 float-gentle" style={{ animationDelay: '0.6s' }}>🏆</div>
            <h3 className="text-xl font-semibold mb-2">Leaderboard</h3>
            <p className="text-gray-600">See rankings and scores</p>
          </div>
        </Link>

        <Link to="/resources" className="card-hover glow-effect">
          <div className="text-center">
            <div className="text-4xl mb-3 float-gentle" style={{ animationDelay: '0.8s' }}>🔗</div>
            <h3 className="text-xl font-semibold mb-2">Resources</h3>
            <p className="text-gray-600">Boxes, decorations, and supplies</p>
          </div>
        </Link>

        {isAdmin() && (
          <Link to="/admin" className="card-hover glow-effect">
            <div className="text-center">
              <div className="text-4xl mb-3 float-gentle" style={{ animationDelay: '1s' }}>⚙️</div>
              <h3 className="text-xl font-semibold mb-2">Admin Panel</h3>
              <p className="text-gray-600">Manage competition settings</p>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
