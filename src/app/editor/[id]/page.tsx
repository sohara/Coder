import {
  CodeSnippetWithOptionalIdAndUserId,
  EditorWrapper,
} from "@/components/editor-wrapper";

import { prisma } from "@/lib/prisma";
import { CodeSnippet } from "@prisma/client";
import { getCurrentUser } from "@/lib/session";
import { SupportedLanguage } from "@/components/code-editor";

export async function saveCode(
  snippet: CodeSnippetWithOptionalIdAndUserId,
): Promise<CodeSnippet | undefined> {
  "use server";
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

export default async function EditorPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();
  const snippet = await prisma.codeSnippet.findFirst({
    where: {
      id: params.id,
    },
  });
  if (!snippet) {
    return <h1>Code not found</h1>;
  }
  return (
    <>
      <EditorWrapper
        user={user}
        saveCode={saveCode}
        initialCode={snippet.code}
        initialLanguage={snippet.language as SupportedLanguage}
        snippetId={params.id}
        syncToLocalStorage={false}
      />
    </>
  );
}
