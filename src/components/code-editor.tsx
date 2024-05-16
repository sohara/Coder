import React, { useEffect, useRef } from "react";
import { EditorView, basicSetup } from "codemirror";
import { EditorState } from "@codemirror/state";
import { javascript } from "@codemirror/lang-javascript";
import { keymap } from "@codemirror/view";
import { defaultKeymap } from "@codemirror/commands";

export function CodeEditor({
  code,
  onChange,
  errors,
}: {
  code: string;
  onChange: (newCode: string) => void;
  errors: string[];
}) {
  const editorRef = useRef(null);
  const viewRef = useRef<EditorView | null>(null);

  useEffect(() => {
    if (editorRef.current) {
      const state = EditorState.create({
        doc: code,
        extensions: [
          basicSetup,
          javascript(),
          keymap.of(defaultKeymap),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              const newCode = update.state.doc.toString();
              onChange(newCode);
            }
          }),
        ],
      });

      viewRef.current = new EditorView({
        state,
        parent: editorRef.current,
      });

      return () => {
        viewRef.current?.destroy();
        viewRef.current = null;
      };
    }
  }, []);

  return (
    <>
      <div ref={editorRef} />
    </>
  );
}

export default CodeEditor;
