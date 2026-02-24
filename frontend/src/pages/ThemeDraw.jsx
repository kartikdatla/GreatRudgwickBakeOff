import React, { useState, useEffect } from 'react';
import api from '../services/api';

const ThemeDraw = () => {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentTheme, setCurrentTheme] = useState(null);
  const [mainThemes, setMainThemes] = useState([]);
  const [subThemes, setSubThemes] = useState([]);
  const [showManualPick, setShowManualPick] = useState(false);
  const [selectedMain, setSelectedMain] = useState('');
  const [selectedSub, setSelectedSub] = useState('');
  const [justDrawn, setJustDrawn] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [themeRes, mainRes, subRes] = await Promise.all([
        api.get('/themes/active').catch(() => ({ data: { theme: null } })),
        api.get('/themes/main/all'),
        api.get('/themes/pool/all')
      ]);
      setCurrentTheme(themeRes.data.theme || null);
      setMainThemes(mainRes.data.mainThemes);
      setSubThemes(subRes.data.themes);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const handleDraw = async () => {
    clearMessages();
    setActionLoading(true);
    setJustDrawn(false);
    try {
      const response = await api.post('/themes/draw');
      setCurrentTheme(response.data.theme);
      setSuccess('Theme drawn successfully!');
      setJustDrawn(true);
      setShowManualPick(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to draw theme');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRedraw = async () => {
    clearMessages();
    if (!window.confirm('This will replace the current theme with a new random draw. Continue?')) return;
    setActionLoading(true);
    setJustDrawn(false);
    try {
      const response = await api.post('/themes/redraw');
      setCurrentTheme(response.data.theme);
      setSuccess('Theme redrawn successfully!');
      setJustDrawn(true);
      setShowManualPick(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to redraw theme');
    } finally {
      setActionLoading(false);
    }
  };

  const handleManualSet = async (e) => {
    e.preventDefault();
    clearMessages();
    if (!selectedMain || !selectedSub) {
      setError('Please select both an item to bake and a sub theme');
      return;
    }
    const action = currentTheme ? 'replace the current theme' : 'set the theme';
    if (!window.confirm(`This will ${action} with your selection. Continue?`)) return;
    setActionLoading(true);
    setJustDrawn(false);
    try {
      const response = await api.post('/themes/set', {
        mainThemeId: selectedMain,
        subThemeId: selectedSub
      });
      setCurrentTheme(response.data.theme);
      setSuccess('Theme set successfully!');
      setJustDrawn(true);
      setShowManualPick(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to set theme');
    } finally {
      setActionLoading(false);
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

  const now = new Date();
  const monthName = now.toLocaleString('default', { month: 'long' });
  const year = now.getFullYear();

  const ManualPickForm = () => (
    <div className={`animate-slide-down ${currentTheme ? 'card border-2 border-dashed border-neutral-300' : 'mt-6 text-left border-t pt-6'}`}>
      <h3 className="text-lg font-semibold mb-4">Choose Theme Manually</h3>
      <form onSubmit={handleManualSet} className="space-y-4">
        <div>
          <label className="label">Item to Bake</label>
          <select
            value={selectedMain}
            onChange={(e) => setSelectedMain(e.target.value)}
            className="input"
            required
          >
            <option value="">Select an item type...</option>
            {mainThemes.map(mt => (
              <option key={mt.id} value={mt.id}>
                {mt.name} - {mt.description}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Secret Sub Theme</label>
          <select
            value={selectedSub}
            onChange={(e) => setSelectedSub(e.target.value)}
            className="input"
            required
          >
            <option value="">Select a sub theme...</option>
            {subThemes.map(st => (
              <option key={st.id} value={st.id} disabled={st.is_used}>
                {st.name}{st.is_used ? ' (already used)' : ''} - {st.description}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={actionLoading}
          className="btn btn-primary btn-luxury"
        >
          {actionLoading ? (
            <span className="flex items-center gap-2">
              <span className="loading-spinner" style={{ width: 20, height: 20, borderWidth: 2 }}></span>
              Setting...
            </span>
          ) : 'Set This Theme'}
        </button>
      </form>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <h1 className="text-3xl font-bold text-neutral-900 mb-6">Draw Theme - {monthName} {year}</h1>

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

      {currentTheme ? (
        <div className="space-y-6">
          <div className={`card ${justDrawn ? 'animate-theme-reveal' : ''}`}>
            <h2 className="text-sm font-semibold text-neutral-400 mb-4 uppercase tracking-wider">Current Theme</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200 rounded-xl p-5 transition-all duration-300 hover:shadow-md">
                <p className="text-xs font-semibold text-blue-500 uppercase tracking-wider mb-2">Item to Bake</p>
                <p className="text-2xl font-bold text-blue-900">
                  {currentTheme.mainTheme?.name || currentTheme.name}
                </p>
                {currentTheme.mainTheme?.description && (
                  <p className="text-sm text-blue-700 mt-2 opacity-80">{currentTheme.mainTheme.description}</p>
                )}
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200 rounded-xl p-5 transition-all duration-300 hover:shadow-md">
                <p className="text-xs font-semibold text-purple-500 uppercase tracking-wider mb-2">Secret Sub Theme</p>
                {currentTheme.subTheme ? (
                  <>
                    <p className="text-2xl font-bold text-purple-900">{currentTheme.subTheme.name}</p>
                    {currentTheme.subTheme.description && (
                      <p className="text-sm text-purple-700 mt-2 opacity-80">{currentTheme.subTheme.description}</p>
                    )}
                  </>
                ) : (
                  <p className="text-purple-700 italic">Loading...</p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleRedraw}
                disabled={actionLoading}
                className="btn btn-primary btn-luxury"
              >
                {actionLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="loading-spinner" style={{ width: 20, height: 20, borderWidth: 2 }}></span>
                    Working...
                  </span>
                ) : 'Redraw Random'}
              </button>
              <button
                onClick={() => { setShowManualPick(!showManualPick); clearMessages(); }}
                className="btn btn-secondary"
              >
                {showManualPick ? 'Cancel' : 'Pick Manually'}
              </button>
            </div>
          </div>

          {showManualPick && <ManualPickForm />}
        </div>
      ) : (
        <div className="card text-center animate-slide-up">
          <div className="text-7xl mb-6 float-gentle inline-block">🎲</div>
          <h2 className="text-2xl font-semibold mb-4 text-neutral-900">No theme drawn for {monthName} {year}</h2>
          <p className="text-neutral-500 mb-6">
            Draw a random theme or pick one manually.
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={handleDraw}
              disabled={actionLoading}
              className="btn btn-primary btn-luxury text-lg px-8"
            >
              {actionLoading ? (
                <span className="flex items-center gap-2">
                  <span className="loading-spinner" style={{ width: 20, height: 20, borderWidth: 2 }}></span>
                  Drawing...
                </span>
              ) : 'Draw Random Theme'}
            </button>
            <button
              onClick={() => setShowManualPick(!showManualPick)}
              className="btn btn-secondary text-lg"
            >
              Pick Manually
            </button>
          </div>

          {showManualPick && <ManualPickForm />}
        </div>
      )}
    </div>
  );
};

export default ThemeDraw;
