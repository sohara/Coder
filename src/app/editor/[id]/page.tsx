import { EditorWrapper } from "@/components/editor-wrapper";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { SupportedLanguage } from "@/components/code-editor";
import { saveCode } from "@/lib/actions";

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
        snippet={snippet}
        // initialCode={snippet.code}
        // initialLanguage={snippet.language as SupportedLanguage}
        // snippetId={params.id}
        syncToLocalStorage={false}
      />
    </>
  );
}
