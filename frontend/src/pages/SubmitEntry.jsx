import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const SubmitEntry = () => {
  const [activeTheme, setActiveTheme] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchActiveTheme();
  }, []);

  const fetchActiveTheme = async () => {
    try {
      const response = await api.get('/themes/active');
      setActiveTheme(response.data.theme);
    } catch (error) {
      setError('No active theme found. Please wait for the admin to draw this month\'s theme.');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!image) {
      setError('Please select an image');
      setLoading(false);
      return;
    }

    const submitData = new FormData();
    submitData.append('title', formData.title);
    submitData.append('description', formData.description);
    submitData.append('themeId', activeTheme.id);
    submitData.append('image', image);

    try {
      await api.post('/submissions', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccess(true);
      setTimeout(() => navigate('/submissions'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit entry');
    } finally {
      setLoading(false);
    }
  };

  if (!activeTheme) {
    return (
      <div className="max-w-2xl mx-auto animate-fade-in">
        <div className="card text-center">
          <div className="text-5xl mb-4">🧁</div>
          <p className="text-neutral-600">{error || 'Loading...'}</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto animate-scale-in">
        <div className="card text-center">
          <div className="text-6xl mb-4 float-gentle">✅</div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">Submission Successful!</h2>
          <p className="text-neutral-500">Your entry has been submitted. Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <h1 className="text-3xl font-bold text-neutral-900 mb-6">Submit Your Entry</h1>

      <div className="card bg-gradient-to-r from-primary-50 to-primary-100/50 border-primary-200 mb-6 animate-slide-down">
        <div className="flex items-center gap-3">
          <span className="text-3xl float-gentle">🧁</span>
          <div>
            <p className="text-xs uppercase tracking-wider text-primary-600 font-semibold mb-1">This Month's Bake</p>
            <h2 className="text-2xl font-bold text-primary-900">
              {activeTheme.mainTheme?.name || activeTheme.name}
            </h2>
            {(activeTheme.mainTheme?.description || activeTheme.description) && (
              <p className="text-primary-700 text-sm mt-1">
                {activeTheme.mainTheme?.description || activeTheme.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 animate-scale-in">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card space-y-6">
        <div className="stagger-item">
          <label className="label">Entry Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="input"
            placeholder="e.g., Triple Chocolate Cake"
            required
          />
        </div>

        <div className="stagger-item">
          <label className="label">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="input"
            rows="4"
            placeholder="Tell us about your creation..."
          />
        </div>

        <div className="stagger-item">
          <label className="label">Photo *</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="input file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 file:cursor-pointer file:transition-colors"
            required
          />
          <p className="text-xs text-neutral-400 mt-1">Max file size: 5MB. Formats: JPG, PNG, GIF, WebP</p>
        </div>

        {preview && (
          <div className="stagger-item animate-scale-in">
            <p className="label mb-2">Preview:</p>
            <div className="img-hover-zoom rounded-lg overflow-hidden inline-block">
              <img src={preview} alt="Preview" className="rounded-lg max-h-64 mx-auto" />
            </div>
          </div>
        )}

        <div className="flex gap-4 stagger-item">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 btn btn-primary btn-luxury"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="loading-spinner" style={{ width: 20, height: 20, borderWidth: 2 }}></span>
                Submitting...
              </span>
            ) : 'Submit Entry'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="btn btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default SubmitEntry;
