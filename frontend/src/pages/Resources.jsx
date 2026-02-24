import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Resources = () => {
  const { isAdmin, isJudge } = useAuth();
  const [resources, setResources] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    category: 'Boxes',
    description: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const response = await api.get('/resources');
      setResources(response.data.resources);
    } catch (error) {
      setError('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await api.post('/resources', formData);
      setFormData({ title: '', url: '', category: 'Boxes', description: '' });
      setShowAddForm(false);
      fetchResources();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add resource');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return;

    try {
      await api.delete(`/resources/${id}`);
      fetchResources();
    } catch (err) {
      setError('Failed to delete resource');
    }
  };

  const categoryIcons = {
    'Boxes': '📦',
    'Decorations': '🎀',
    'Ingredients': '🥚',
    'Tools': '🔧',
    'Other': '📎'
  };

  const categories = ['Boxes', 'Decorations', 'Ingredients', 'Tools', 'Other'];
  const groupedResources = categories.reduce((acc, category) => {
    acc[category] = resources.filter(r => r.category === category);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="loading-spinner mx-auto mb-4"></div>
        <p className="text-neutral-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Resources & Links</h1>
          <p className="text-neutral-500">Helpful links for baking supplies and decorations</p>
        </div>
        {(isAdmin() || isJudge()) && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn btn-primary btn-luxury"
          >
            {showAddForm ? 'Cancel' : '+ Add Resource'}
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 animate-scale-in">
          {error}
        </div>
      )}

      {showAddForm && (
        <form onSubmit={handleSubmit} className="card mb-6 space-y-4 animate-slide-down">
          <h3 className="text-xl font-semibold">Add New Resource</h3>

          <div>
            <label className="label">Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="input"
              required
            />
          </div>

          <div>
            <label className="label">URL *</label>
            <input
              type="url"
              name="url"
              value={formData.url}
              onChange={handleChange}
              className="input"
              placeholder="https://..."
              required
            />
          </div>

          <div>
            <label className="label">Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="input"
              required
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{categoryIcons[cat]} {cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="input"
              rows="3"
            />
          </div>

          <button type="submit" className="btn btn-primary btn-luxury">Add Resource</button>
        </form>
      )}

      <div className="space-y-10">
        {categories.map((category, catIndex) => {
          const categoryResources = groupedResources[category];
          if (categoryResources.length === 0) return null;

          return (
            <div key={category} className="stagger-item" style={{ animationDelay: `${(catIndex + 1) * 0.15}s` }}>
              <h2 className="text-2xl font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">{categoryIcons[category]}</span>
                {category}
                <span className="text-sm font-normal text-neutral-400">({categoryResources.length})</span>
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryResources.map((resource, resIndex) => (
                  <div
                    key={resource.id}
                    className="card-interactive stagger-item"
                    style={{ animationDelay: `${(catIndex * 0.15) + ((resIndex + 1) * 0.1)}s` }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-neutral-900">{resource.title}</h3>
                      {isAdmin() && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(resource.id); }}
                          className="text-red-500 hover:text-red-700 text-sm transition-colors"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                    {resource.description && (
                      <p className="text-sm text-neutral-600 mb-3 line-clamp-2">{resource.description}</p>
                    )}
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700 text-sm font-semibold inline-flex items-center gap-1 transition-colors group"
                    >
                      Visit Link
                      <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
                    </a>
                    {resource.creator_name && (
                      <p className="text-xs text-neutral-400 mt-2">Added by {resource.creator_name}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {resources.length === 0 && (
          <div className="card text-center animate-slide-up">
            <div className="text-5xl mb-4">🔗</div>
            <p className="text-neutral-600">No resources added yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Resources;
