import { EditorWrapper } from "@/components/editor-wrapper";

import { getCurrentUser } from "@/lib/session";
import { createCode } from "@/lib/actions";

export default async function Home() {
  const user = await getCurrentUser();
  return (
    <>
      <EditorWrapper
        user={user}
        saveCode={createCode}
        initialCode=""
        initialLanguage="javascript"
        syncToLocalStorage={true}
      />
    </>
  );
}
