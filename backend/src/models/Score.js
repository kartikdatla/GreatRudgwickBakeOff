const db = require('../config/database');

class Score {
  static async create(submissionId, judgeId, scores) {
    const { taste, presentation, creativity, overall, comments } = scores;

    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO scores (submission_id, judge_id, taste_score, presentation_score, creativity_score, overall_score, comments)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [submissionId, judgeId, taste, presentation, creativity, overall, comments || ''],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        }
      );
    });
  }

  static async update(submissionId, judgeId, scores) {
    const { taste, presentation, creativity, overall, comments } = scores;

    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE scores
         SET taste_score = ?, presentation_score = ?, creativity_score = ?, overall_score = ?, comments = ?, scored_at = CURRENT_TIMESTAMP
         WHERE submission_id = ? AND judge_id = ?`,
        [taste, presentation, creativity, overall, comments || '', submissionId, judgeId],
        function(err) {
          if (err) reject(err);
          else resolve({ changes: this.changes });
        }
      );
    });
  }

  static async getBySubmission(submissionId, revealScores = false) {
    return new Promise((resolve, reject) => {
      const query = revealScores
        ? `SELECT s.*, u.name as judge_name FROM scores s JOIN users u ON s.judge_id = u.id WHERE s.submission_id = ?`
        : `SELECT taste_score, presentation_score, creativity_score, overall_score FROM scores WHERE submission_id = ?`;

      db.all(query, [submissionId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static async getJudgeScore(submissionId, judgeId) {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM scores WHERE submission_id = ? AND judge_id = ?',
        [submissionId, judgeId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  static async getLeaderboard(themeId, revealScores = false) {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT
           s.id,
           s.title,
           s.description,
           s.image_path,
           u.name as baker_name,
           AVG(sc.taste_score) as avg_taste,
           AVG(sc.presentation_score) as avg_presentation,
           AVG(sc.creativity_score) as avg_creativity,
           AVG(sc.overall_score) as avg_overall,
           COUNT(sc.id) as judge_count,
           (AVG(sc.taste_score) + AVG(sc.presentation_score) + AVG(sc.creativity_score) + AVG(sc.overall_score)) / 4 as total_average
         FROM submissions s
         JOIN users u ON s.user_id = u.id
         LEFT JOIN scores sc ON s.id = sc.submission_id
         WHERE s.theme_id = ?
         GROUP BY s.id
         ORDER BY total_average DESC`,
        [themeId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }
}

module.exports = Score;
