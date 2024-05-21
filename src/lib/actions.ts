"use server";

import { prisma } from "@/lib/prisma";
import { CodeSnippetWithOptionalIdAndUserId } from "@/components/editor-wrapper";
import { CodeSnippet } from "@prisma/client";
import { getCurrentUser } from "./session";

export async function createCode(
  snippet: CodeSnippetWithOptionalIdAndUserId,
): Promise<CodeSnippet | undefined> {
  "use server";
  const user = await getCurrentUser();
  if (!user || !user.id) return;
  const codeSnippet = await prisma.codeSnippet.create({
    data: { code: snippet.code, language: snippet.language, userId: user.id },
  });
  return codeSnippet;
}

export async function saveCode(
  snippet: CodeSnippetWithOptionalIdAndUserId,
): Promise<CodeSnippet | undefined> {
  const user = await getCurrentUser();
  if (!user || !user.id || !snippet.id) {
    return;
  }

  const serverSnippet = await prisma.codeSnippet.findFirst({
    where: {
      id: snippet.id,
    },
  });
  if (serverSnippet?.userId !== user.id) {
    return;
  }

  await prisma.codeSnippet.update({
    data: {
      code: snippet.code,
      language: snippet.language,
    },
    where: {
      id: snippet.id,
    },
  });
}
