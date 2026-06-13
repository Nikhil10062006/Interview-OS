import { useState, useEffect } from "react";
import { Bot, Send, CheckCircle } from "lucide-react";
import Button from "../../../components/button.jsx";

export default function AIQuestionPanel({
  question,
  onAnswer,
  resetKey,
  answer,
  onAnswerChange,
}) {
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setSubmitted(false);
  }, [resetKey]);
  useEffect(() => {
    if (question) setSubmitted(false);
  }, [question]);

  function handleSubmit() {
    if (!answer.trim() || !question) return;
    onAnswer(answer.trim());
    setSubmitted(true);
  }

  return (
    <div className="flex flex-col h-full bg-gray-900 overflow-hidden">
      <div className="shrink-0 flex items-center gap-2 px-4 py-2 border-b border-gray-800">
        <Bot className="w-3.5 h-3.5 text-indigo-400" />
        <span className="text-xs text-indigo-400 uppercase tracking-widest">
          Phantom AI
        </span>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col justify-between px-4 py-3 gap-2">
        {!question && !submitted && (
          <p className="text-xs text-gray-500 font-mono leading-relaxed">
            Phantom AI is watching your code. A question will appear soon...
          </p>
        )}

        {submitted && (
          <div className="flex items-center gap-2">
            <CheckCircle className="w-3.5 h-3.5 text-green-400 shrink-0" />
            <p className="text-xs text-gray-500 font-mono">
              Answer recorded. Next question coming shortly...
            </p>
          </div>
        )}

        {question && !submitted && (
          <>
            <p className="text-xs text-gray-200 font-mono leading-relaxed overflow-y-auto flex-1">
              {question}
            </p>
            <div className="flex gap-2 items-end shrink-0">
              <textarea
                className="flex-1 bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-200 font-mono resize-none focus:outline-none focus:border-indigo-500 transition-colors"
                style={{ height: "56px" }}
                placeholder="Type your answer... (Enter to submit, Shift+Enter for newline)"
                value={answer}
                onChange={(e) => onAnswerChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
              />
              <Button
                onClick={handleSubmit}
                disabled={!answer.trim()}
                className="shrink-0 h-9"
              >
                <Send className="w-3.5 h-3.5" />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
