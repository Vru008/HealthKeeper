const nodemailer = require("nodemailer");

// Sends an appointment confirmation email IF SMTP is configured.
// No-ops quietly otherwise, so the app works without email set up.
async function sendAppointmentEmail(to, appt) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !to) return false;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

  const when = new Date(appt.datetime).toLocaleString();
  await transporter.sendMail({
    from: `HealthKeeper <${process.env.EMAIL_USER}>`,
    to,
    subject: "Your HealthKeeper appointment is confirmed",
    html: `
      <h2>Appointment confirmed ✅</h2>
      <p>Hi ${appt.patientName},</p>
      <p>Your appointment has been booked:</p>
      <ul>
        ${appt.provider ? `<li><strong>With:</strong> ${appt.provider}</li>` : ""}
        ${appt.speciality ? `<li><strong>Speciality:</strong> ${appt.speciality}</li>` : ""}
        ${appt.city ? `<li><strong>City:</strong> ${appt.city}</li>` : ""}
        <li><strong>When:</strong> ${when}</li>
      </ul>
      <p>We've also added a calendar reminder for you. See you soon!</p>
      <p>— The HealthKeeper team</p>
    `,
  });
  return true;
}

// Sends a password-reset link IF SMTP is configured. Returns false otherwise
// (the caller then falls back to an on-screen link for the demo).
async function sendResetEmail(to, resetUrl) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !to) return false;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

  await transporter.sendMail({
    from: `HealthKeeper <${process.env.EMAIL_USER}>`,
    to,
    subject: "Reset your HealthKeeper password",
    html: `
      <h2>Reset your password</h2>
      <p>We received a request to reset your HealthKeeper password.</p>
      <p><a href="${resetUrl}" style="background:#2a487f;color:#fff;padding:11px 20px;border-radius:8px;text-decoration:none;display:inline-block">Choose a new password</a></p>
      <p>Or paste this link into your browser:<br><a href="${resetUrl}">${resetUrl}</a></p>
      <p>This link expires in 1 hour. If you didn't request it, you can ignore this email.</p>
      <p>— The HealthKeeper team</p>
    `,
  });
  return true;
}

module.exports = { sendAppointmentEmail, sendResetEmail };
