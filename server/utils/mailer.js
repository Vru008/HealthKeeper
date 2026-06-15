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

module.exports = { sendAppointmentEmail };
