import { EmailTemplateModel } from "@/lib/db/models/EmailTemplate";

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

const builtInTemplates = [
  {
    key: "magic_link",
    name: "Magic Link Sign-In",
    category: "auth" as const,
    description: "Sent when a user requests a passwordless magic link sign-in.",
    subject: "Sign in to MongoDB Hackathons",
    htmlBody: layout(`
      <h2 style="margin:0 0 16px;color:#333;font-size:22px;">Hi {{userName}},</h2>
      <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 24px;">
        Click the button below to sign in to your account. This link expires in 15 minutes.
      </p>
      <a href="{{url}}" style="display:inline-block;background:${brandColor};color:#fff;padding:12px 32px;border-radius:6px;text-decoration:none;font-weight:600;font-size:15px;">
        Sign In
      </a>
      <p style="color:#999;font-size:13px;margin:24px 0 0;">
        If you didn't request this, you can safely ignore this email.
      </p>
    `),
    textBody: `Hi {{userName}},\n\nSign in to MongoDB Hackathons: {{url}}\n\nThis link expires in 15 minutes.\n\nIf you didn't request this, you can safely ignore this email.`,
    variables: [
      { name: "userName", required: true, description: "Recipient's name", example: "John" },
      { name: "url", required: true, description: "Magic link URL", example: "https://example.com/verify?token=abc" },
    ],
  },
  {
    key: "two_factor_code",
    name: "Two-Factor Verification Code",
    category: "auth" as const,
    description: "Sent when a user with 2FA enabled signs in and needs to enter a verification code.",
    subject: "{{code}} — Your verification code",
    htmlBody: layout(`
      <h2 style="margin:0 0 16px;color:#333;font-size:22px;">Hi {{userName}},</h2>
      <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 24px;">
        Enter this verification code to complete your sign-in:
      </p>
      <div style="background:#f5f5f5;border-radius:8px;padding:20px;text-align:center;margin:0 0 24px;">
        <span style="font-size:32px;font-weight:700;letter-spacing:6px;color:#333;">{{code}}</span>
      </div>
      <p style="color:#999;font-size:13px;margin:0;">
        This code expires in 10 minutes. If you didn't try to sign in, please secure your account.
      </p>
    `),
    textBody: `Hi {{userName}},\n\nYour verification code: {{code}}\n\nThis code expires in 10 minutes.\n\nIf you didn't try to sign in, please secure your account.`,
    variables: [
      { name: "userName", required: true, description: "Recipient's name", example: "John" },
      { name: "code", required: true, description: "6-digit verification code", example: "123456" },
    ],
  },
  {
    key: "email_verification",
    name: "Email Verification",
    category: "auth" as const,
    description: "Sent after registration to verify the user's email address.",
    subject: "Verify your email - MongoDB Hackathons",
    htmlBody: layout(`
      <h2 style="margin:0 0 16px;color:#333;font-size:22px;">Hi {{userName}},</h2>
      <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 16px;">
        Thanks for registering for MongoDB Hackathons! Please verify your email address to unlock all features.
      </p>
      <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 24px;">
        Click the button below to verify your email. This link expires in 24 hours.
      </p>
      <a href="{{verificationUrl}}" style="display:inline-block;background:${brandColor};color:#fff;padding:12px 32px;border-radius:6px;text-decoration:none;font-weight:600;font-size:15px;">
        Verify Email Address
      </a>
      <p style="color:#555;font-size:14px;margin:24px 0 0;line-height:1.6;">
        <strong>Why verify?</strong><br>
        Verified accounts can submit projects, create teams, and provision MongoDB Atlas clusters.
      </p>
      <p style="color:#999;font-size:13px;margin:16px 0 0;">
        If you didn't create this account, you can safely ignore this email.
      </p>
    `),
    textBody: `Hi {{userName}},\n\nThanks for registering for MongoDB Hackathons! Please verify your email address to unlock all features.\n\nVerify your email: {{verificationUrl}}\n\nThis link expires in 24 hours.\n\nWhy verify? Verified accounts can submit projects, create teams, and provision MongoDB Atlas clusters.\n\nIf you didn't create this account, you can safely ignore this email.`,
    variables: [
      { name: "userName", required: true, description: "Recipient's name", example: "John" },
      { name: "verificationUrl", required: true, description: "Email verification URL", example: "https://example.com/verify?token=abc" },
    ],
  },
  {
    key: "feedback_request",
    name: "Feedback Request",
    category: "event" as const,
    description: "Sent to participants and partners after an event to collect feedback.",
    subject: "We'd love your feedback on {{eventName}}",
    htmlBody: layout(`
      <h2 style="margin:0 0 16px;color:#333;font-size:22px;">Hi {{recipientName}},</h2>
      <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 8px;">
        Thank you for participating in <strong>{{eventName}}</strong>! We'd love to hear about your experience.
      </p>
      <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 24px;">
        Your feedback helps us improve future events and deliver a better experience for everyone.
      </p>
      <a href="{{formUrl}}" style="display:inline-block;background:${brandColor};color:#fff;padding:12px 32px;border-radius:6px;text-decoration:none;font-weight:600;font-size:15px;">
        Share Your Feedback
      </a>
      <p style="color:#999;font-size:13px;margin:24px 0 0;">
        This survey should only take a few minutes to complete.
      </p>
    `),
    textBody: `Hi {{recipientName}},\n\nThank you for participating in {{eventName}}! We'd love to hear about your experience.\n\nShare your feedback: {{formUrl}}\n\nThis survey should only take a few minutes to complete.`,
    variables: [
      { name: "recipientName", required: true, description: "Recipient's name", example: "John" },
      { name: "eventName", required: true, description: "Name of the event", example: "MongoDB Hackathon 2026" },
      { name: "formUrl", required: true, description: "Feedback form URL", example: "https://example.com/feedback/123" },
    ],
  },
  {
    key: "notification",
    name: "General Notification",
    category: "notification" as const,
    description: "Generic notification email for various platform alerts.",
    subject: "{{title}}",
    htmlBody: layout(`
      <h2 style="margin:0 0 16px;color:#333;font-size:22px;">Hi {{userName}},</h2>
      <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 8px;">
        {{message}}
      </p>
      {{#if actionUrl}}<a href="{{actionUrl}}" style="display:inline-block;background:${brandColor};color:#fff;padding:10px 24px;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px;margin:16px 0 0;">
        View Details
      </a>{{/if}}
    `),
    textBody: `Hi {{userName}},\n\n{{message}}{{#if actionUrl}}\n\nView details: {{actionUrl}}{{/if}}`,
    variables: [
      { name: "userName", required: true, description: "Recipient's name", example: "John" },
      { name: "title", required: true, description: "Notification title (used as subject)", example: "New team invitation" },
      { name: "message", required: true, description: "Notification body text", example: "You've been invited to join Team Alpha." },
      { name: "actionUrl", required: false, description: "Optional link to view details", example: "https://example.com/teams/123" },
    ],
  },
  {
    key: "registration_confirmation",
    name: "Event Registration Confirmation",
    category: "event" as const,
    description: "Sent when a participant successfully registers for an event.",
    subject: "You're registered for {{eventName}}!",
    htmlBody: layout(`
      <h2 style="margin:0 0 16px;color:#333;font-size:22px;">Welcome, {{userName}}!</h2>
      <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 8px;">
        You're all set for <strong>{{eventName}}</strong>! We're excited to have you join us.
      </p>
      <div style="background:#f5f5f5;border-radius:8px;padding:20px;margin:24px 0;">
        <p style="color:#333;font-size:14px;margin:0 0 8px;font-weight:600;">Event Details:</p>
        <p style="color:#555;font-size:14px;margin:0 0 4px;"><strong>When:</strong> {{eventDate}}</p>
        <p style="color:#555;font-size:14px;margin:0;"><strong>Where:</strong> {{eventLocation}}</p>
      </div>
      <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 24px;">
        Access your event dashboard to join a team, explore challenges, and connect with other participants.
      </p>
      <a href="{{dashboardUrl}}" style="display:inline-block;background:${brandColor};color:#fff;padding:12px 32px;border-radius:6px;text-decoration:none;font-weight:600;font-size:15px;margin:0 0 24px;">
        Go to Event Dashboard
      </a>
      <div style="border-top:1px solid #eee;padding-top:20px;margin-top:20px;">
        <p style="color:#333;font-size:14px;margin:0 0 12px;font-weight:600;">What to bring:</p>
        <ul style="color:#555;font-size:14px;margin:0;padding-left:20px;">
          <li style="margin-bottom:6px;">Your laptop with dev environment set up</li>
          <li style="margin-bottom:6px;">Chargers and any hardware you'll need</li>
          <li style="margin-bottom:6px;">An open mind and team spirit!</li>
        </ul>
      </div>
    `),
    textBody: `Welcome, {{userName}}!\n\nYou're all set for {{eventName}}! We're excited to have you join us.\n\nEvent Details:\nWhen: {{eventDate}}\nWhere: {{eventLocation}}\n\nAccess your event dashboard: {{dashboardUrl}}\n\nWhat to bring:\n- Your laptop with dev environment set up\n- Chargers and any hardware you'll need\n- An open mind and team spirit!`,
    variables: [
      { name: "userName", required: true, description: "Participant's name", example: "John" },
      { name: "eventName", required: true, description: "Name of the event", example: "MongoDB Hackathon 2026" },
      { name: "eventDate", required: true, description: "Event date/time", example: "March 15-16, 2026" },
      { name: "eventLocation", required: true, description: "Event location", example: "San Francisco, CA" },
      { name: "dashboardUrl", required: true, description: "Event dashboard URL", example: "https://example.com/events/123" },
    ],
  },
  {
    key: "partner_invite",
    name: "Partner Invitation",
    category: "partner" as const,
    description: "Sent when an admin invites a partner contact to join the platform.",
    subject: "You've been invited as a partner representative for {{companyName}}",
    htmlBody: layout(`
      <h2 style="margin:0 0 16px;color:#333;font-size:22px;">Hi {{userName}},</h2>
      <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 8px;">
        You've been invited to join the <strong>MongoDB Hackathon Platform</strong> as a representative of <strong>{{companyName}}</strong>.
      </p>
      <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 24px;">
        As a partner, you'll be able to view your events, manage sponsored prizes, submit feedback, and access analytics. Click below to set up your account.
      </p>
      <a href="{{url}}" style="display:inline-block;background:${brandColor};color:#fff;padding:12px 32px;border-radius:6px;text-decoration:none;font-weight:600;font-size:15px;">
        Accept Invitation
      </a>
      <p style="color:#999;font-size:13px;margin:24px 0 0;">
        This link expires in 15 minutes. If you didn't expect this invitation, you can safely ignore this email.
      </p>
    `),
    textBody: `Hi {{userName}},\n\nYou've been invited to join the MongoDB Hackathon Platform as a representative of {{companyName}}.\n\nAccept your invitation: {{url}}\n\nThis link expires in 15 minutes. If you didn't expect this invitation, you can safely ignore this email.`,
    variables: [
      { name: "userName", required: true, description: "Contact person's name", example: "Jane" },
      { name: "companyName", required: true, description: "Partner company name", example: "Acme Corp" },
      { name: "url", required: true, description: "Magic link invitation URL", example: "https://example.com/verify?token=abc" },
    ],
  },
  {
    key: "partner_access_approved",
    name: "Partner Access Approved",
    category: "partner" as const,
    description: "Sent when an admin approves a partner's self-registration request.",
    subject: "Your partner access has been approved — {{companyName}}",
    htmlBody: layout(`
      <h2 style="margin:0 0 16px;color:#333;font-size:22px;">Hi {{userName}},</h2>
      <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 8px;">
        Great news! Your request to join the MongoDB Hackathon Platform as a partner representative for <strong>{{companyName}}</strong> has been approved.
      </p>
      <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 24px;">
        You can now access the Partner Portal to view your events, manage prizes, and more.
      </p>
      <a href="{{portalUrl}}" style="display:inline-block;background:${brandColor};color:#fff;padding:12px 32px;border-radius:6px;text-decoration:none;font-weight:600;font-size:15px;">
        Go to Partner Portal
      </a>
    `),
    textBody: `Hi {{userName}},\n\nYour request to join as a partner representative for {{companyName}} has been approved.\n\nAccess the Partner Portal: {{portalUrl}}`,
    variables: [
      { name: "userName", required: true, description: "Contact person's name", example: "Jane" },
      { name: "companyName", required: true, description: "Partner company name", example: "Acme Corp" },
      { name: "portalUrl", required: true, description: "Partner portal URL", example: "https://example.com/partner" },
    ],
  },
  {
    key: "partner_access_denied",
    name: "Partner Access Denied",
    category: "partner" as const,
    description: "Sent when an admin denies a partner's self-registration request.",
    subject: "Update on your partner access request",
    htmlBody: layout(`
      <h2 style="margin:0 0 16px;color:#333;font-size:22px;">Hi {{userName}},</h2>
      <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 8px;">
        Thank you for your interest in partnering with MongoDB Hackathons. Unfortunately, we're unable to approve your partner access request at this time.
      </p>
      {{#if notes}}<div style="background:#f5f5f5;border-radius:8px;padding:16px;margin:16px 0;">
        <p style="color:#555;font-size:14px;margin:0;"><strong>Reviewer notes:</strong> {{notes}}</p>
      </div>{{/if}}
      <p style="color:#555;font-size:15px;line-height:1.6;margin:16px 0 0;">
        If you have questions, please reach out to the hackathon organizers for more information.
      </p>
    `),
    textBody: `Hi {{userName}},\n\nThank you for your interest in partnering with MongoDB Hackathons. Unfortunately, we're unable to approve your partner access request at this time.{{#if notes}}\n\nReviewer notes: {{notes}}{{/if}}\n\nIf you have questions, please reach out to the hackathon organizers.`,
    variables: [
      { name: "userName", required: true, description: "Contact person's name", example: "Jane" },
      { name: "notes", required: false, description: "Optional reviewer notes", example: "We are not accepting new partners at this time." },
    ],
  },
];

/**
 * Seeds all built-in email templates into the database.
 * Uses upsert to avoid duplicates. Safe to call multiple times.
 */
export async function seedEmailTemplates(): Promise<void> {
  for (const template of builtInTemplates) {
    await EmailTemplateModel.findOneAndUpdate(
      { key: template.key },
      {
        $setOnInsert: {
          ...template,
          isBuiltIn: true,
        },
      },
      { upsert: true }
    );
  }
}
