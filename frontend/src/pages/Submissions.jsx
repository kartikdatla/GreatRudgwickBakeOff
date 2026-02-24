import React, { useState, useEffect } from 'react';
import api, { getUploadUrl } from '../services/api';

const Submissions = () => {
  const [activeTheme, setActiveTheme] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const themeResponse = await api.get('/themes/active');
      const theme = themeResponse.data.theme;
      setActiveTheme(theme);

      if (theme) {
        const submissionsResponse = await api.get(`/submissions/theme/${theme.id}`);
        setSubmissions(submissionsResponse.data.submissions);
      }
    } catch (error) {
      setError('Failed to load submissions');
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="loading-spinner mx-auto mb-4"></div>
        <p className="text-neutral-500">Loading submissions...</p>
      </div>
    );
  }

  if (!activeTheme) {
    return (
      <div className="card text-center animate-fade-in">
        <div className="text-5xl mb-4">🧁</div>
        <p className="text-neutral-600">No active theme for this month yet.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Submissions</h1>
        <p className="text-neutral-500">
          Theme: <span className="font-semibold text-primary-700">{activeTheme.mainTheme?.name || activeTheme.name}</span>
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 animate-scale-in">
          {error}
        </div>
      )}

      {submissions.length === 0 ? (
        <div className="card text-center animate-slide-up">
          <div className="text-5xl mb-4">📭</div>
          <p className="text-neutral-600">No submissions yet for this theme.</p>
          <p className="text-sm text-neutral-400 mt-1">Be the first to submit!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {submissions.map((submission, index) => (
            <div
              key={submission.id}
              className="card-interactive stagger-item img-hover-zoom"
              style={{ animationDelay: `${(index + 1) * 0.1}s` }}
            >
              <div className="overflow-hidden rounded-lg mb-4 -mx-8 -mt-8">
                <img
                  src={getUploadUrl(submission.image_path)}
                  alt={submission.title}
                  className="w-full h-64 object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-neutral-900">{submission.title}</h3>
              <p className="text-sm text-neutral-600 mb-3 line-clamp-2">{submission.description}</p>
              <div className="border-t border-neutral-100 pt-3 -mb-2">
                <p className="text-sm text-neutral-500">
                  By: <span className="font-medium text-neutral-700">{submission.baker_name}</span>
                </p>
                <p className="text-xs text-neutral-400 mt-1">
                  {new Date(submission.submitted_at).toLocaleDateString('en-GB', {
                    day: 'numeric', month: 'short', year: 'numeric'
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Submissions;
