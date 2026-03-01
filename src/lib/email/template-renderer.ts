import { connectToDatabase } from "@/lib/db/connection";
import { EmailTemplateModel } from "@/lib/db/models/EmailTemplate";
import { seedEmailTemplates } from "./seed-email-templates";
import * as fallbackTemplates from "./templates";

let seeded = false;

/**
 * Replaces {{variable}} and handles {{#if variable}}...{{/if}} blocks.
 */
function interpolate(template: string, variables: Record<string, string>): string {
  // Handle {{#if variable}}...{{/if}} blocks
  let result = template.replace(
    /\{\{#if (\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g,
    (_match, varName, content) => {
      return variables[varName] ? content : "";
    }
  );

  // Replace {{variable}} placeholders
  result = result.replace(/\{\{(\w+)\}\}/g, (_match, varName) => {
    return variables[varName] ?? "";
  });

  return result;
}

/**
 * Renders an email template by key, fetching from DB with fallback to hardcoded templates.
 */
export async function renderEmailTemplate(
  key: string,
  variables: Record<string, string>
): Promise<{ subject: string; html: string; text: string }> {
  try {
    await connectToDatabase();

    // Lazy seed on first miss
    let template = await EmailTemplateModel.findOne({ key }).lean();
    if (!template && !seeded) {
      await seedEmailTemplates();
      seeded = true;
      template = await EmailTemplateModel.findOne({ key }).lean();
    }

    if (template) {
      return {
        subject: interpolate(template.subject, variables),
        html: interpolate(template.htmlBody, variables),
        text: interpolate(template.textBody, variables),
      };
    }
  } catch (error) {
    console.error(`Email template renderer: DB lookup failed for "${key}":`, error);
  }

  // Fallback to hardcoded templates
  return renderFallback(key, variables);
}

/**
 * Falls back to hardcoded template functions when DB is unavailable.
 */
function renderFallback(
  key: string,
  vars: Record<string, string>
): { subject: string; html: string; text: string } {
  switch (key) {
    case "magic_link":
      return fallbackTemplates.magicLinkEmail(vars.userName || "there", vars.url || "");
    case "two_factor_code":
      return fallbackTemplates.twoFactorCodeEmail(vars.userName || "there", vars.code || "");
    case "email_verification":
      return fallbackTemplates.emailVerificationEmail(vars.userName || "there", vars.verificationUrl || "");
    case "feedback_request":
      return fallbackTemplates.feedbackRequestEmail(vars.recipientName || "there", vars.eventName || "", vars.formUrl || "");
    case "notification":
      return fallbackTemplates.notificationEmail(vars.userName || "there", vars.title || "", vars.message || "", vars.actionUrl);
    case "registration_confirmation":
      return fallbackTemplates.registrationConfirmationEmail(
        vars.userName || "there",
        vars.eventName || "",
        vars.eventDate || "",
        vars.eventLocation || "",
        vars.dashboardUrl || ""
      );
    case "partner_invite":
      return fallbackTemplates.partnerInviteEmail(vars.userName || "there", vars.companyName || "", vars.url || "");
    case "partner_access_approved":
      return fallbackTemplates.partnerAccessApprovedEmail(vars.userName || "there", vars.companyName || "", vars.portalUrl || "");
    case "partner_access_denied":
      return fallbackTemplates.partnerAccessDeniedEmail(vars.userName || "there", vars.notes);
    default:
      console.error(`Email template renderer: Unknown template key "${key}"`);
      return {
        subject: "Notification",
        html: `<p>${vars.message || "You have a new notification."}</p>`,
        text: vars.message || "You have a new notification.",
      };
  }
}
