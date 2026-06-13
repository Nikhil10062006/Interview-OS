import { useState } from "react";
import { useCodeExecution } from "../../../hooks/useCodeExecution.jsx";
import { Play, Terminal, ChevronDown, ChevronUp } from "lucide-react";
import Button from "../../../components/button.jsx";
import Spinner from "../../../components/spinner.jsx";

export default function OutputPanel({ code, language }) {
  const { loading, error, output, handleSubmit } = useCodeExecution();
  const [input, setInput] = useState("");
  const [inputOpen, setInputOpen] = useState(false);

  async function handleRun() {
    await handleSubmit(language, code, input);
  }

  return (
    <div className="flex flex-col h-full bg-gray-950 overflow-hidden">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-4 py-2 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-xs text-gray-400 uppercase tracking-widest">
            Output
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setInputOpen((prev) => !prev)}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            {inputOpen ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
            stdin
          </button>
          <Button onClick={handleRun} loading={loading} disabled={loading}>
            <Play className="w-3.5 h-3.5 mr-1.5" />
            Run
          </Button>
        </div>
      </div>

      {/* stdin — collapsible, overlays output area */}
      {inputOpen && (
        <div className="shrink-0 px-4 pt-2">
          <textarea
            className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-xs text-gray-200 font-mono resize-none focus:outline-none focus:border-indigo-500 transition-colors"
            style={{ height: "52px" }}
            placeholder="Custom stdin..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>
      )}

      {/* Result Container */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-3">
        <div
          className={`rounded-lg p-3 text-xs font-mono min-h-full border transition-colors ${
            !output
              ? "border-gray-800 bg-gray-900"
              : output.hasError || output.stderr // Safely catches all errors
                ? "border-red-800 bg-red-950/30"
                : "border-green-900 bg-green-950/30"
          }`}
        >
          {loading && (
            <div className="flex items-center gap-2 text-gray-400">
              <Spinner />
              <span>Running...</span>
            </div>
          )}
          {!loading && !output && !error && (
            <span className="text-gray-600">
              Run your code to see output here...
            </span>
          )}
          {!loading && error && (
            <p className="text-red-400 break-words">{error}</p>
          )}
          {!loading && output && (
            <div className="flex flex-col gap-1.5">
              {output.stdout && (
                <pre className="whitespace-pre-wrap break-words text-green-400 leading-relaxed">
                  {output.stdout}
                </pre>
              )}
              {output.stderr && (
                <pre className="whitespace-pre-wrap break-words text-red-400 leading-relaxed">
                  {output.stderr}
                </pre>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
