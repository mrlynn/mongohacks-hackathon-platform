import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db/connection";
import { EmailTemplateModel } from "@/lib/db/models/EmailTemplate";
import { apiLogger } from "@/lib/logger";

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
    const role = (session?.user as { role?: string })?.role;
    if (!role || (role !== "admin" && role !== "super_admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const variables: Record<string, string> = body.variables || {};

    await connectToDatabase();

    const template = await EmailTemplateModel.findById(id).lean();
    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    // Use example values for any variables not provided
    const mergedVars: Record<string, string> = {};
    for (const v of template.variables) {
      mergedVars[v.name] = variables[v.name] || v.example || `[${v.name}]`;
    }

    return NextResponse.json({
      subject: interpolate(template.subject, mergedVars),
      html: interpolate(template.htmlBody, mergedVars),
      text: interpolate(template.textBody, mergedVars),
    });
  } catch (error) {
    apiLogger.error({ err: error }, "Email template preview error");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
