import Image from "next/image";
import { Inter } from "next/font/google";
import { Button } from "@/components/ui/button";
import { CodeEditor } from "@/components/code-editor";
import { useEffect, useRef, useState } from "react";
import { CodeIcon } from "@/components/icons/code-icon";
import { PlayIcon } from "@/components/icons/play-icon";
import { DownloadIcon } from "@/components/icons/download-icon";
import { SaveIcon } from "@/components/icons/save-icon";
import { TerminalIcon } from "@/components/icons/terminal-icon";
import { CloudyIcon } from "@/components/icons/cloudy-icon";
import { ResizeIcon } from "@/components/icons/resize-icon";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [executing, setExecuting] = useState(false);
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [errors, setErrors] = useState([]);
  const codeRef = useRef(code);
  const [leftPaneWidth, setLeftPaneWidth] = useState(50); // Initialize to 50%
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    codeRef.current = code;
  }, [code]);

  useEffect(() => {
    function handleMouseMove(e) {
      if (isResizing) {
        const newWidth = (e.clientX / window.innerWidth) * 100;
        setLeftPaneWidth(newWidth);
      }
    }

    function handleMouseUp() {
      setIsResizing(false);
    }

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  function handleCodeChange(newCode) {
    setCode(newCode);
  }

  async function handleExecute() {
    console.log("RUNNING");
    try {
      setExecuting(true);
      setErrors([]);
      setOutput("");
      const response = await fetch("/api/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: codeRef.current }),
      });

      const result = await response.json();

      if (result.errors) {
        setErrors(result.errors);
      } else {
        setOutput(result.result);
      }
    } catch (error) {
      setErrors([error.message]);
    } finally {
      setExecuting(false);
    }
  }

  return (
    <main className={`flex-1 overflow-hidden ${inter.className}`}>
      <div
        className="grid h-full p-4"
        style={{
          gridTemplateColumns: `${leftPaneWidth}% 2em calc(100% - ${leftPaneWidth}% - 2em)`,
        }}
      >
        <div className="flex h-full flex-col rounded-lg border bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <div className="flex h-16 items-center justify-between border-b px-4 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <CodeIcon className="h-5 w-5" />
              <span className="text-sm font-medium">main.js</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="ghost"
                onClick={handleExecute}
                disabled={executing}
                title="Execute code (Shift+Enter)"
              >
                <PlayIcon className="h-5 w-5" />
                <span className="sr-only">Run code</span>
              </Button>
              <Button size="icon" variant="ghost">
                <SaveIcon className="h-5 w-5" />
                <span className="sr-only">Save</span>
              </Button>
              <Button size="icon" variant="ghost">
                <DownloadIcon className="h-5 w-5" />
                <span className="sr-only">Download</span>
              </Button>
            </div>
          </div>
          <div className="flex-1 overflow-auto">
            <CodeEditor
              onChange={handleCodeChange}
              onExecute={handleExecute}
              code={code}
              errors={errors}
            />
          </div>
        </div>
        <div
          className="z-10 w-8 hover:bg-gray-200 rounded-lg cursor-col-resize flex items-center justify-center"
          onMouseDown={() => setIsResizing(true)}
        >
          <ResizeIcon className="h-8 w-8 text-gray-600" />
        </div>
        <div className="flex h-full flex-col rounded-lg border bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <div className="flex h-16 items-center justify-between border-b px-4 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <TerminalIcon className="h-5 w-5" />
              <span className="text-sm font-medium">Output</span>
            </div>
            <Button size="icon" variant="ghost">
              <CloudyIcon className="h-5 w-5" />
              <span className="sr-only">Clear output</span>
            </Button>
          </div>
          <div className="relative flex-1 overflow-auto p-4">
            {executing && (
              <div
                className={`absolute inset-0 bg-black bg-opacity-25 flex items-center justify-center`}
              >
                <Spinner className="h-16 w-16" />
              </div>
            )}
            <pre className="font-mono text-sm text-gray-800 dark:text-gray-400">
              {output}
            </pre>
          </div>
        </div>
      </div>
    </main>
  );
}

function Spinner({ className = "" }) {
  return (
    <svg
      className={`animate-spin text-white ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );
}
