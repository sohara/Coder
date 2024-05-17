import {
  CodeSnippetWithOptionalIdAndUserId,
  EditorWrapper,
} from "@/components/editor-wrapper";

import { prisma } from "@/lib/prisma";
import { CodeSnippet } from "@prisma/client";
import { getCurrentUser } from "@/lib/session";

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

export default async function Home() {
  const user = await getCurrentUser();
  return (
    <>
      <EditorWrapper
        user={user}
        saveCode={createCode}
        initialCode=""
        initialLanguage="javascript"
      />
    </>
  );
}
