const nodemailer = require('nodemailer');
const { User } = require('../models/User');

const SITE_URL = 'https://bakeoff.kartik.uk';

// Dev guard: export no-ops if SMTP not configured
if (!process.env.SMTP_HOST) {
  module.exports = {
    notifyThemeDrawn: async () => {},
    notifyBakerScored: async () => {},
    notifyScoresRevealed: async () => {},
    sendBroadcastEmail: async () => ({ sent: 0, failed: 0 }),
  };
  return;
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendEmail(to, subject, html) {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error(`Email send failed to ${to}:`, err.message);
  }
}

async function notifyThemeDrawn(mainThemeName, month, year) {
  const users = await User.getAllActiveEmails();
  const monthName = new Date(year, month - 1).toLocaleString('en-GB', { month: 'long' });

  for (const user of users) {
    await sendEmail(
      user.email,
      `New Bake Off Theme for ${monthName} ${year}!`,
      `<div style="font-family: sans-serif; max-width: 500px;">
        <h2 style="color: #b45309;">A New Theme Has Been Drawn!</h2>
        <p>Hi ${user.name},</p>
        <p>The baking theme for <strong>${monthName} ${year}</strong> is:</p>
        <div style="background: #fef3c7; border: 2px solid #f59e0b; border-radius: 8px; padding: 16px; text-align: center; margin: 16px 0;">
          <h1 style="margin: 0; color: #92400e;">${mainThemeName}</h1>
        </div>
        <p>Head to the site to find out more and start planning your bake!</p>
        <a href="${SITE_URL}" style="display: inline-block; background: #f59e0b; color: white; padding: 10px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">Visit Bake Off</a>
        <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">Great Rudgwick Bake Off</p>
      </div>`
    );
  }
}

async function notifyBakerScored(bakerEmail, bakerName, submissionTitle) {
  await sendEmail(
    bakerEmail,
    'Your Bake Off Entry Has Been Scored!',
    `<div style="font-family: sans-serif; max-width: 500px;">
      <h2 style="color: #b45309;">You've Received a Score!</h2>
      <p>Hi ${bakerName},</p>
      <p>A judge has scored your submission <strong>"${submissionTitle}"</strong>.</p>
      <p>You'll be able to see your scores once the admin reveals them.</p>
      <a href="${SITE_URL}" style="display: inline-block; background: #f59e0b; color: white; padding: 10px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">Visit Bake Off</a>
      <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">Great Rudgwick Bake Off</p>
    </div>`
  );
}

async function notifyScoresRevealed() {
  const users = await User.getAllActiveEmails();

  for (const user of users) {
    await sendEmail(
      user.email,
      'Bake Off Scores Are Now Revealed!',
      `<div style="font-family: sans-serif; max-width: 500px;">
        <h2 style="color: #b45309;">Scores Are In!</h2>
        <p>Hi ${user.name},</p>
        <p>The scores for this month's bake off have been revealed! Check the leaderboard to see the results.</p>
        <a href="${SITE_URL}/leaderboard" style="display: inline-block; background: #f59e0b; color: white; padding: 10px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">View Leaderboard</a>
        <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">Great Rudgwick Bake Off</p>
      </div>`
    );
  }
}

async function sendBroadcastEmail(subject, message, recipientFilter) {
  const allUsers = await User.getAllActiveEmails();
  const recipients = recipientFilter === 'all'
    ? allUsers
    : allUsers; // future: filter by role if needed

  let sent = 0;
  let failed = 0;

  for (const user of recipients) {
    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: user.email,
        subject,
        html: `<div style="font-family: sans-serif; max-width: 500px;">
          <h2 style="color: #b45309;">${subject}</h2>
          <p>Hi ${user.name},</p>
          <div style="margin: 16px 0; line-height: 1.6;">${message.replace(/\n/g, '<br>')}</div>
          <a href="${SITE_URL}" style="display: inline-block; background: #f59e0b; color: white; padding: 10px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">Visit Bake Off</a>
          <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">Great Rudgwick Bake Off</p>
        </div>`,
      });
      sent++;
    } catch (err) {
      console.error(`Broadcast email failed to ${user.email}:`, err.message);
      failed++;
    }
  }

  return { sent, failed };
}

module.exports = { notifyThemeDrawn, notifyBakerScored, notifyScoresRevealed, sendBroadcastEmail };
