import Image from "next/image";
import { Inter } from "next/font/google";
import { Button } from "@/components/ui/button";
import { CodeEditor } from "@/components/code-editor";
import { useEffect, useRef, useState } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [executing, setExecuting] = useState(false);
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [errors, setErrors] = useState([]);
  const codeRef = useRef(code);

  useEffect(() => {
    codeRef.current = code;
  }, [code]);

  function handleCodeChange(newCode: string) {
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
      <div className="grid h-full grid-cols-2 gap-4 p-4">
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
          <div className="flex-1 overflow-auto ">
            <CodeEditor
              onChange={handleCodeChange}
              onExecute={handleExecute}
              code={code}
              errors={errors}
            />
          </div>
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
                className={`absolute inset-0 bg-black bg-opacity-25 flex items-center justify-center `}
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
function CodeIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

function SaveIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
      <path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7" />
      <path d="M7 3v4a1 1 0 0 0 1 1h7" />
    </svg>
  );
}

function DownloadIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" x2="12" y1="15" y2="3" />
    </svg>
  );
}
function TerminalIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" x2="20" y1="19" y2="19" />
    </svg>
  );
}

function CloudyIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.5 21H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
      <path d="M22 10a3 3 0 0 0-3-3h-2.207a5.502 5.502 0 0 0-10.702.5" />
    </svg>
  );
}

function PlayIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="6 3 20 12 6 21 6 3" />
    </svg>
  );
}
