import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db/connection";
import { EmailTemplateModel } from "@/lib/db/models/EmailTemplate";
import { sendEmail } from "@/lib/email/email-service";

interface Props {
  params: Promise<{ id: string }>;
}

function interpolate(template: string, variables: Record<string, string>): string {
  let result = template.replace(
    /\{\{#if (\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g,
    (_match, varName, content) => {
      return variables[varName] ? content : "";
    }
  );

  result = result.replace(/\{\{(\w+)\}\}/g, (_match, varName) => {
    return variables[varName] ?? "";
  });

  return result;
}

export async function POST(request: NextRequest, { params }: Props) {
  try {
    const { id } = await params;
    const session = await auth();
    const user = session?.user as { role?: string; email?: string };
    if (!user?.role || (user.role !== "admin" && user.role !== "super_admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { toEmail, variables } = body;

    const recipientEmail = toEmail || user.email;
    if (!recipientEmail) {
      return NextResponse.json({ error: "No recipient email provided" }, { status: 400 });
    }

    await connectToDatabase();

    const template = await EmailTemplateModel.findById(id).lean();
    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    // Use example values for any variables not provided
    const mergedVars: Record<string, string> = {};
    for (const v of template.variables) {
      mergedVars[v.name] = variables?.[v.name] || v.example || `[${v.name}]`;
    }

    const subject = `[TEST] ${interpolate(template.subject, mergedVars)}`;
    const html = interpolate(template.htmlBody, mergedVars);
    const text = interpolate(template.textBody, mergedVars);

    const sent = await sendEmail({
      to: recipientEmail,
      subject,
      html,
      text,
    });

    if (!sent) {
      return NextResponse.json(
        { error: "Failed to send test email. Check SMTP configuration." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, sentTo: recipientEmail });
  } catch (error) {
    console.error("Email template test-send error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
