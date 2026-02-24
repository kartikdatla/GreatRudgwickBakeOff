import React, { useState, useEffect } from 'react';
import api from '../services/api';

const ThemeManagement = () => {
  const [activeTheme, setActiveTheme] = useState(null);
  const [themePool, setThemePool] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingTheme, setEditingTheme] = useState(null);
  const [editingPoolTheme, setEditingPoolTheme] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [themeResponse, poolResponse] = await Promise.all([
        api.get('/themes/active').catch(() => ({ data: { theme: null } })),
        api.get('/themes/pool/all')
      ]);

      setActiveTheme(themeResponse.data.theme);
      setThemePool(poolResponse.data.themes);
    } catch (error) {
      setError('Failed to load themes');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateActiveTheme = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await api.patch(`/themes/${editingTheme.id}`, {
        name: editingTheme.name,
        description: editingTheme.description
      });

      setSuccess('Active theme updated successfully!');
      setEditingTheme(null);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update theme');
    }
  };

  const handleUpdatePoolTheme = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await api.patch(`/themes/pool/${editingPoolTheme.id}`, {
        name: editingPoolTheme.name,
        description: editingPoolTheme.description
      });

      setSuccess('Theme updated successfully!');
      setEditingPoolTheme(null);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update theme');
    }
  };

  const handleAddTheme = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await api.post('/themes/pool', formData);
      setSuccess('Theme added successfully!');
      setFormData({ name: '', description: '' });
      setShowAddForm(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add theme');
    }
  };

  const handleDeleteTheme = async (themeId) => {
    if (!window.confirm('Are you sure you want to delete this theme?')) return;

    setError('');
    setSuccess('');

    try {
      await api.delete(`/themes/pool/${themeId}`);
      setSuccess('Theme deleted successfully!');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete theme');
    }
  };

  const handleResetPool = async () => {
    if (!window.confirm('Reset theme pool? All themes will be marked as available again.')) return;

    setError('');
    setSuccess('');

    try {
      await api.post('/themes/pool/reset');
      setSuccess('Theme pool reset successfully!');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset theme pool');
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

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-neutral-900">Theme Management</h1>
        <button
          onClick={handleResetPool}
          className="btn btn-secondary text-sm"
        >
          Reset Theme Pool
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg animate-scale-in">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg animate-scale-in flex items-center gap-2">
          <span className="text-lg">✓</span> {success}
        </div>
      )}

      {/* Active Theme Section */}
      <div className="card stagger-item" style={{ animationDelay: '0.1s' }}>
        <h2 className="text-xl font-semibold mb-4">Current Active Theme</h2>
        {activeTheme ? (
          editingTheme ? (
            <form onSubmit={handleUpdateActiveTheme} className="space-y-4 animate-fade-in">
              <div>
                <label className="label">Theme Name *</label>
                <input
                  type="text"
                  value={editingTheme.name}
                  onChange={(e) => setEditingTheme({ ...editingTheme, name: e.target.value })}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea
                  value={editingTheme.description || ''}
                  onChange={(e) => setEditingTheme({ ...editingTheme, description: e.target.value })}
                  className="input"
                  rows="3"
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="btn btn-primary btn-luxury">Save Changes</button>
                <button
                  type="button"
                  onClick={() => setEditingTheme(null)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-gradient-to-r from-primary-50 to-primary-100/50 border border-primary-200 rounded-xl p-5">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-primary-900">{activeTheme.name}</h3>
                  <p className="text-primary-700 mt-1">{activeTheme.description}</p>
                  <p className="text-sm text-primary-500 mt-2">
                    {activeTheme.month}/{activeTheme.year}
                    {activeTheme.locked_at && ' - Locked'}
                  </p>
                </div>
                {!activeTheme.locked_at && (
                  <button
                    onClick={() => setEditingTheme({ ...activeTheme })}
                    className="btn btn-secondary text-sm"
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>
          )
        ) : (
          <p className="text-neutral-500">No active theme. Draw one to get started!</p>
        )}
      </div>

      {/* Theme Pool Section */}
      <div className="card stagger-item" style={{ animationDelay: '0.2s' }}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Theme Pool</h2>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn btn-primary btn-luxury text-sm"
          >
            {showAddForm ? 'Cancel' : '+ Add Theme'}
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleAddTheme} className="bg-neutral-50 border border-neutral-200 rounded-xl p-5 mb-4 space-y-4 animate-slide-down">
            <div>
              <label className="label">Theme Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input"
                rows="2"
              />
            </div>
            <button type="submit" className="btn btn-primary btn-luxury">Add to Pool</button>
          </form>
        )}

        <div className="space-y-3">
          {themePool.map((theme, index) => (
            <div
              key={theme.id}
              className={`border rounded-xl p-4 transition-all duration-200 hover:shadow-sm stagger-item ${
                theme.is_used
                  ? 'bg-neutral-50 border-neutral-300 opacity-60'
                  : 'bg-white border-neutral-200 hover:border-primary-200'
              }`}
              style={{ animationDelay: `${0.2 + (index + 1) * 0.05}s` }}
            >
              {editingPoolTheme?.id === theme.id ? (
                <form onSubmit={handleUpdatePoolTheme} className="space-y-3 animate-fade-in">
                  <div>
                    <input
                      type="text"
                      value={editingPoolTheme.name}
                      onChange={(e) => setEditingPoolTheme({ ...editingPoolTheme, name: e.target.value })}
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <textarea
                      value={editingPoolTheme.description || ''}
                      onChange={(e) => setEditingPoolTheme({ ...editingPoolTheme, description: e.target.value })}
                      className="input"
                      rows="2"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="btn btn-primary btn-luxury text-sm">Save</button>
                    <button
                      type="button"
                      onClick={() => setEditingPoolTheme(null)}
                      className="btn btn-secondary text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-neutral-900">
                      {theme.name}
                      {theme.is_used && (
                        <span className="ml-2 badge border bg-neutral-100 text-neutral-500 border-neutral-300">Used</span>
                      )}
                    </h3>
                    {theme.description && (
                      <p className="text-sm text-neutral-600 mt-1">{theme.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => setEditingPoolTheme({ ...theme })}
                      className="text-primary-600 hover:text-primary-800 text-sm font-medium transition-colors"
                    >
                      Edit
                    </button>
                    {!theme.is_used && (
                      <button
                        onClick={() => handleDeleteTheme(theme.id)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {themePool.length === 0 && (
          <p className="text-center text-neutral-400 py-8">No themes in pool. Add some to get started!</p>
        )}
      </div>
    </div>
  );
};

export default ThemeManagement;
