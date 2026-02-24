import React, { useState, useEffect } from 'react';
import api, { getUploadUrl } from '../services/api';

const Leaderboard = () => {
  const [activeTheme, setActiveTheme] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [scoresRevealed, setScoresRevealed] = useState(false);
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
        const leaderboardResponse = await api.get(`/scores/leaderboard/${theme.id}`);
        setLeaderboard(leaderboardResponse.data.leaderboard);
        setScoresRevealed(leaderboardResponse.data.revealed);
      }
    } catch (error) {
      setError('Failed to load leaderboard');
    } finally {
      setLoading(false);
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

  if (!activeTheme) {
    return (
      <div className="card text-center animate-fade-in">
        <div className="text-5xl mb-4">🏆</div>
        <p className="text-neutral-600">No active theme for this month yet.</p>
      </div>
    );
  }

  const getPodiumClass = (index) => {
    if (index === 0) return 'podium-gold';
    if (index === 1) return 'podium-silver';
    if (index === 2) return 'podium-bronze';
    return '';
  };

  const getMedalEmoji = (position) => {
    if (position === 0) return '🥇';
    if (position === 1) return '🥈';
    if (position === 2) return '🥉';
    return '';
  };

  const getRankDisplay = (index) => {
    if (index < 3) return getMedalEmoji(index);
    return `#${index + 1}`;
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Leaderboard</h1>
        <p className="text-neutral-500">
          Theme: <span className="font-semibold text-primary-700">{activeTheme.mainTheme?.name || activeTheme.name}</span>
        </p>
        {!scoresRevealed && (
          <div className="mt-3 inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 animate-slide-down">
            <span>🔒</span>
            <p className="text-sm text-amber-700 font-medium">
              Scores are currently hidden. The admin will reveal them when ready.
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 animate-scale-in">
          {error}
        </div>
      )}

      {leaderboard.length === 0 ? (
        <div className="card text-center animate-slide-up">
          <div className="text-5xl mb-4">📊</div>
          <p className="text-neutral-600">No scored submissions yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {leaderboard.map((entry, index) => (
            <div
              key={entry.id}
              className={`card stagger-item ${getPodiumClass(index)}`}
              style={{ animationDelay: `${(index + 1) * 0.1}s` }}
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 relative">
                  <div className="img-hover-zoom rounded-lg">
                    <img
                      src={getUploadUrl(entry.image_path)}
                      alt={entry.title}
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                  </div>
                  {index < 3 && (
                    <div className="absolute -top-2 -left-2 text-2xl" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}>
                      {getMedalEmoji(index)}
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-xl font-semibold flex items-center gap-2 text-neutral-900">
                        {index >= 3 && (
                          <span className="text-sm font-bold text-neutral-400 bg-neutral-100 rounded-full w-8 h-8 flex items-center justify-center">
                            {index + 1}
                          </span>
                        )}
                        {entry.title}
                      </h3>
                      <p className="text-sm text-neutral-500">by {entry.baker_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="score-display">
                        {scoresRevealed && entry.total_average
                          ? entry.total_average.toFixed(1)
                          : '---'}
                      </p>
                      <p className="text-xs text-neutral-400 uppercase tracking-wide font-medium">Average</p>
                    </div>
                  </div>

                  {entry.description && (
                    <p className="text-neutral-600 text-sm mb-3 line-clamp-2">{entry.description}</p>
                  )}

                  {scoresRevealed && entry.judge_count > 0 && (
                    <div className="grid grid-cols-4 gap-3 bg-neutral-50 rounded-lg p-4 mt-2">
                      {[
                        { label: 'Taste', value: entry.avg_taste },
                        { label: 'Presentation', value: entry.avg_presentation },
                        { label: 'Creativity', value: entry.avg_creativity },
                        { label: 'Overall', value: entry.avg_overall }
                      ].map(({ label, value }) => (
                        <div key={label} className="text-center">
                          <p className="text-xs text-neutral-400 mb-1 uppercase tracking-wide">{label}</p>
                          <p className="text-lg font-bold text-neutral-800">{value?.toFixed(1)}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {!scoresRevealed && entry.judge_count > 0 && (
                    <p className="text-sm text-neutral-400 mt-2 flex items-center gap-1">
                      <span>⭐</span>
                      Scored by {entry.judge_count} judge{entry.judge_count !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
