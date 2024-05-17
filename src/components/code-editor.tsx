import React, { useEffect, useRef } from "react";
import { EditorView, basicSetup } from "codemirror";
import { EditorState } from "@codemirror/state";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python"; // Import other languages as needed
import { keymap } from "@codemirror/view";
import { defaultKeymap } from "@codemirror/commands";

const languageExtensions = {
  javascript,
  python,
} as const;

export type SupportedLanguage = keyof typeof languageExtensions;

export const supportedLanguages = Object.keys(
  languageExtensions,
) as SupportedLanguage[];

export function CodeEditor({
  code,
  language,
  onChange,
  onExecute,
  errors,
}: {
  code: string;
  language: SupportedLanguage;
  onChange: (newCode: string) => void;
  onExecute: () => void;
  errors: string[];
}) {
  const editorRef = useRef(null);
  const viewRef = useRef<EditorView | null>(null);

  useEffect(() => {
    if (editorRef.current) {
      const languageExtension = languageExtensions[language] || javascript;

      const state = EditorState.create({
        doc: code,
        extensions: [
          basicSetup,
          languageExtension(),
          keymap.of([
            ...defaultKeymap,
            {
              key: "Shift-Enter",
              run: () => {
                onExecute();
                return true;
              },
            },
          ]),
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
  }, [language]); // Recreate the editor when the language changes

  // Update editor content if `code` prop changes
  useEffect(() => {
    if (viewRef.current) {
      const currentDoc = viewRef.current.state.doc.toString();
      if (currentDoc !== code) {
        const transaction = viewRef.current.state.update({
          changes: { from: 0, to: currentDoc.length, insert: code },
        });
        viewRef.current.dispatch(transaction);
      }
    }
  }, [code]);

  return (
    <>
      <div ref={editorRef} />
    </>
  );
}

export default CodeEditor;
