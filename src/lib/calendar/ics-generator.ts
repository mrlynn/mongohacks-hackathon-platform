/**
 * Generate .ics calendar file content for event registration
 */
export interface CalendarEventData {
  eventName: string;
  startDate: Date;
  endDate: Date;
  location: string;
  description: string;
  url?: string;
}

function formatICSDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  const seconds = String(date.getUTCSeconds()).padStart(2, "0");

  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

function escapeICSText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

export function generateICS(data: CalendarEventData): string {
  const now = new Date();
  const uid = `${now.getTime()}@devhacks.dev`;
  const dtstamp = formatICSDate(now);
  const dtstart = formatICSDate(data.startDate);
  const dtend = formatICSDate(data.endDate);

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//DevHacks//Hackathon Platform//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${dtstart}`,
    `DTEND:${dtend}`,
    `SUMMARY:${escapeICSText(data.eventName)}`,
    `DESCRIPTION:${escapeICSText(data.description)}`,
    `LOCATION:${escapeICSText(data.location)}`,
  ];

  if (data.url) {
    lines.push(`URL:${data.url}`);
  }

  lines.push(
    "STATUS:CONFIRMED",
    "SEQUENCE:0",
    "END:VEVENT",
    "END:VCALENDAR"
  );

  return lines.join("\r\n");
}

/**
 * Generate Google Calendar add link
 */
export function generateGoogleCalendarLink(data: CalendarEventData): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: data.eventName,
    dates: `${formatICSDate(data.startDate).replace(/[-:]/g, "")}/${formatICSDate(data.endDate).replace(/[-:]/g, "")}`,
    details: data.description,
    location: data.location,
  });

  if (data.url) {
    params.append("url", data.url);
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generate Outlook calendar add link
 */
export function generateOutlookLink(data: CalendarEventData): string {
  const params = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: data.eventName,
    startdt: data.startDate.toISOString(),
    enddt: data.endDate.toISOString(),
    body: data.description,
    location: data.location,
  });

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}
