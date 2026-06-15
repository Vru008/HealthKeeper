// Appointment reminders — the way booking/flight apps do it:
// a downloadable .ics calendar event that carries a device alarm, plus an
// "Add to Google Calendar" link and an instant browser notification.

const pad = (n) => String(n).padStart(2, "0");

// Format a date as an ICS UTC timestamp: YYYYMMDDTHHMMSSZ
const toICSDate = (d) => {
  const dt = new Date(d);
  return (
    dt.getUTCFullYear() +
    pad(dt.getUTCMonth() + 1) +
    pad(dt.getUTCDate()) +
    "T" +
    pad(dt.getUTCHours()) +
    pad(dt.getUTCMinutes()) +
    pad(dt.getUTCSeconds()) +
    "Z"
  );
};

const summaryFor = (appt) =>
  `HealthKeeper: ${appt.speciality || "Doctor"} appointment` +
  (appt.provider ? ` — ${appt.provider}` : "");

const detailsFor = (appt) =>
  [
    appt.provider ? `With: ${appt.provider}` : "",
    appt.speciality ? `Speciality: ${appt.speciality}` : "",
    appt.city ? `City: ${appt.city}` : "",
    appt.patientName ? `Patient: ${appt.patientName}` : "",
  ]
    .filter(Boolean)
    .join("\\n");

// Builds an .ics file with a 1-hour-before VALARM reminder.
export function buildICS(appt) {
  const start = new Date(appt.datetime);
  const end = new Date(start.getTime() + 30 * 60 * 1000); // 30-min slot
  const uid = `${Date.now()}@healthkeeper`;

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//HealthKeeper//Appointments//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${toICSDate(new Date())}`,
    `DTSTART:${toICSDate(start)}`,
    `DTEND:${toICSDate(end)}`,
    `SUMMARY:${summaryFor(appt)}`,
    `DESCRIPTION:${detailsFor(appt)}`,
    appt.city ? `LOCATION:${appt.city}` : "",
    "BEGIN:VALARM",
    "TRIGGER:-PT1H",
    "ACTION:DISPLAY",
    "DESCRIPTION:HealthKeeper appointment reminder",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");
}

// Triggers a download of the .ics so the user can add it to any calendar app.
export function downloadICS(appt) {
  const blob = new Blob([buildICS(appt)], { type: "text/calendar" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "healthkeeper-appointment.ics";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// "Add to Google Calendar" link (opens a pre-filled event with a reminder).
export function googleCalendarUrl(appt) {
  const start = new Date(appt.datetime);
  const end = new Date(start.getTime() + 30 * 60 * 1000);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: summaryFor(appt),
    dates: `${toICSDate(start)}/${toICSDate(end)}`,
    details: detailsFor(appt).replace(/\\n/g, "\n"),
    location: appt.city || "",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

// Asks for notification permission and shows an instant confirmation.
export async function notifyBooking(appt) {
  if (!("Notification" in window)) return;
  try {
    let perm = Notification.permission;
    if (perm === "default") perm = await Notification.requestPermission();
    if (perm !== "granted") return;

    new Notification("Appointment booked ✅", {
      body: `${summaryFor(appt)} on ${new Date(
        appt.datetime
      ).toLocaleString()}`,
    });
  } catch {
    /* notifications are best-effort */
  }
}
