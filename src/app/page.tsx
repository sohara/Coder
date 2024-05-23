import {
  CodeSnippetWithOptionalIdAndUserId,
  EditorWrapper,
} from "@/components/editor-wrapper";

import { getCurrentUser } from "@/lib/session";
import { createCode } from "@/lib/actions";

export default async function Home() {
  const user = await getCurrentUser();
  const defaultSnippet: CodeSnippetWithOptionalIdAndUserId = {
    code: "",
    language: "javscript",
  };
  return (
    <>
      <EditorWrapper
        user={user}
        saveCode={createCode}
        snippet={defaultSnippet}
        syncToLocalStorage={true}
      />
    </>
  );
}
