"use client";

import { use } from "react";
import EmailTemplateEditor from "./EmailTemplateEditor";

interface Props {
  params: Promise<{ id: string }>;
}

export default function EditEmailTemplatePage({ params }: Props) {
  const { id } = use(params);
  return <EmailTemplateEditor templateId={id} />;
}
