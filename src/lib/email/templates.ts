const brandColor = "#00684A";
const bgColor = "#f5f5f5";

function layout(content: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:${bgColor};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${bgColor};padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:8px;overflow:hidden;">
        <tr><td style="background:${brandColor};padding:24px 32px;">
          <span style="color:#fff;font-size:20px;font-weight:700;">MongoDB Hackathons</span>
        </td></tr>
        <tr><td style="padding:32px;">
          ${content}
        </td></tr>
        <tr><td style="padding:16px 32px;background:#fafafa;border-top:1px solid #eee;">
          <span style="color:#999;font-size:12px;">This is an automated message from the MongoDB Hackathon Platform.</span>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function magicLinkEmail(
  name: string,
  url: string
): { subject: string; html: string; text: string } {
  return {
    subject: "Sign in to MongoDB Hackathons",
    html: layout(`
      <h2 style="margin:0 0 16px;color:#333;font-size:22px;">Hi ${name || "there"},</h2>
      <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 24px;">
        Click the button below to sign in to your account. This link expires in 15 minutes.
      </p>
      <a href="${url}" style="display:inline-block;background:${brandColor};color:#fff;padding:12px 32px;border-radius:6px;text-decoration:none;font-weight:600;font-size:15px;">
        Sign In
      </a>
      <p style="color:#999;font-size:13px;margin:24px 0 0;">
        If you didn't request this, you can safely ignore this email.
      </p>
    `),
    text: `Hi ${name || "there"},\n\nSign in to MongoDB Hackathons: ${url}\n\nThis link expires in 15 minutes.\n\nIf you didn't request this, you can safely ignore this email.`,
  };
}

export function twoFactorCodeEmail(
  name: string,
  code: string
): { subject: string; html: string; text: string } {
  return {
    subject: `${code} — Your verification code`,
    html: layout(`
      <h2 style="margin:0 0 16px;color:#333;font-size:22px;">Hi ${name || "there"},</h2>
      <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 24px;">
        Enter this verification code to complete your sign-in:
      </p>
      <div style="background:#f5f5f5;border-radius:8px;padding:20px;text-align:center;margin:0 0 24px;">
        <span style="font-size:32px;font-weight:700;letter-spacing:6px;color:#333;">${code}</span>
      </div>
      <p style="color:#999;font-size:13px;margin:0;">
        This code expires in 10 minutes. If you didn't try to sign in, please secure your account.
      </p>
    `),
    text: `Hi ${name || "there"},\n\nYour verification code: ${code}\n\nThis code expires in 10 minutes.\n\nIf you didn't try to sign in, please secure your account.`,
  };
}

export function notificationEmail(
  name: string,
  title: string,
  message: string,
  actionUrl?: string
): { subject: string; html: string; text: string } {
  const actionButton = actionUrl
    ? `<a href="${actionUrl}" style="display:inline-block;background:${brandColor};color:#fff;padding:10px 24px;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px;margin:16px 0 0;">
        View Details
      </a>`
    : "";

  return {
    subject: title,
    html: layout(`
      <h2 style="margin:0 0 16px;color:#333;font-size:22px;">Hi ${name || "there"},</h2>
      <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 8px;">
        ${message}
      </p>
      ${actionButton}
    `),
    text: `Hi ${name || "there"},\n\n${message}${actionUrl ? `\n\nView details: ${actionUrl}` : ""}`,
  };
}
