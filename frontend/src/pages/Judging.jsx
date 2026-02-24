import React, { useState, useEffect } from 'react';
import api, { getUploadUrl } from '../services/api';

const Judging = () => {
  const [activeTheme, setActiveTheme] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [scores, setScores] = useState({
    taste: 5,
    presentation: 5,
    creativity: 5,
    overall: 5,
    comments: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
    } finally {
      setLoading(false);
    }
  };

  const loadExistingScore = async (submissionId) => {
    try {
      const response = await api.get(`/scores/submission/${submissionId}/judge`);
      if (response.data.score) {
        setScores({
          taste: response.data.score.taste_score,
          presentation: response.data.score.presentation_score,
          creativity: response.data.score.creativity_score,
          overall: response.data.score.overall_score,
          comments: response.data.score.comments || ''
        });
      } else {
        setScores({ taste: 5, presentation: 5, creativity: 5, overall: 5, comments: '' });
      }
    } catch (error) {
      console.error('Error loading existing score:', error);
    }
  };

  const handleSubmissionSelect = async (submission) => {
    setSelectedSubmission(submission);
    setSuccess('');
    setError('');
    await loadExistingScore(submission.id);
  };

  const handleScoreChange = (field, value) => {
    setScores({ ...scores, [field]: parseInt(value) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await api.post(`/scores/submission/${selectedSubmission.id}`, scores);
      setSuccess('Score submitted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit score');
    } finally {
      setSubmitting(false);
    }
  };

  const getScoreColor = (value) => {
    if (value >= 8) return 'text-green-600';
    if (value >= 5) return 'text-primary-600';
    return 'text-red-500';
  };

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="loading-spinner mx-auto mb-4"></div>
        <p className="text-neutral-500">Loading...</p>
      </div>
    );
  }

  if (!activeTheme) {
    return (
      <div className="card text-center animate-fade-in">
        <div className="text-5xl mb-4">⭐</div>
        <p className="text-neutral-600">No active theme for this month yet.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Theme info banner */}
      {activeTheme.subTheme && (
        <div className="card bg-gradient-to-r from-purple-50 to-primary-50 border-purple-200 mb-6 animate-slide-down">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎨</span>
            <div>
              <p className="text-xs uppercase tracking-wider text-purple-600 font-semibold">Judging Focus</p>
              <p className="font-bold text-purple-900">{activeTheme.subTheme.name}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">Submissions to Judge</h2>
          <div className="space-y-3">
            {submissions.length === 0 ? (
              <div className="card text-center">
                <p className="text-neutral-500 text-sm">No submissions yet.</p>
              </div>
            ) : (
              submissions.map((submission, index) => (
                <div
                  key={submission.id}
                  onClick={() => handleSubmissionSelect(submission)}
                  className={`card cursor-pointer transition-all duration-300 stagger-item ${
                    selectedSubmission?.id === submission.id
                      ? 'ring-2 ring-primary-500 bg-primary-50 scale-[1.02]'
                      : 'hover:shadow-lg hover:-translate-y-0.5'
                  }`}
                  style={{ animationDelay: `${(index + 1) * 0.1}s` }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="img-hover-zoom rounded-lg flex-shrink-0">
                      <img
                        src={getUploadUrl(submission.image_path)}
                        alt={submission.title}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-neutral-900 truncate">{submission.title}</h3>
                      <p className="text-sm text-neutral-500">{submission.baker_name}</p>
                    </div>
                    {selectedSubmission?.id === submission.id && (
                      <div className="text-primary-500">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          {selectedSubmission ? (
            <div className="space-y-6 animate-fade-in" key={selectedSubmission.id}>
              <div className="card overflow-hidden">
                <div className="img-hover-zoom -mx-8 -mt-8 mb-4">
                  <img
                    src={getUploadUrl(selectedSubmission.image_path)}
                    alt={selectedSubmission.title}
                    className="w-full h-96 object-cover"
                  />
                </div>
                <h2 className="text-2xl font-bold mb-2 text-neutral-900">{selectedSubmission.title}</h2>
                <p className="text-neutral-600 mb-2">{selectedSubmission.description}</p>
                <p className="text-sm text-neutral-400">Baker: <span className="text-neutral-600 font-medium">{selectedSubmission.baker_name}</span></p>
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

              <form onSubmit={handleSubmit} className="card space-y-6">
                <h3 className="text-xl font-semibold text-neutral-900">Score This Entry</h3>

                {['taste', 'presentation', 'creativity', 'overall'].map((category, index) => (
                  <div key={category} className="stagger-item" style={{ animationDelay: `${(index + 1) * 0.1}s` }}>
                    <label className="block text-sm font-semibold text-neutral-700 mb-3 capitalize">
                      {category}
                    </label>
                    <div className="flex items-center space-x-4">
                      <span className="text-xs text-neutral-400 w-4">1</span>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={scores[category]}
                        onChange={(e) => handleScoreChange(category, e.target.value)}
                        className="flex-1"
                      />
                      <span className="text-xs text-neutral-400 w-4">10</span>
                      <span className={`text-2xl font-bold w-12 text-center ${getScoreColor(scores[category])}`}>
                        {scores[category]}
                      </span>
                    </div>
                  </div>
                ))}

                <div>
                  <label className="label">
                    Comments (Optional)
                  </label>
                  <textarea
                    value={scores.comments}
                    onChange={(e) => setScores({ ...scores, comments: e.target.value })}
                    className="input"
                    rows="4"
                    placeholder="Add your feedback..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full btn btn-primary btn-luxury"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="loading-spinner" style={{ width: 20, height: 20, borderWidth: 2 }}></span>
                      Submitting...
                    </span>
                  ) : 'Submit Score'}
                </button>
              </form>
            </div>
          ) : (
            <div className="card text-center animate-slide-up">
              <div className="text-5xl mb-4 float-gentle">⭐</div>
              <p className="text-neutral-500 text-lg">Select a submission to score</p>
              <p className="text-sm text-neutral-400 mt-1">Click on an entry from the left panel</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Judging;
