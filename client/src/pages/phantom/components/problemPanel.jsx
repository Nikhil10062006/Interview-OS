import { Send } from "lucide-react";
import Button from "../../../components/button.jsx";
import Badge from "../../../components/badge.jsx";
import { useMockRoom } from "../../../hooks/useMock.jsx";

export default function ProblemPanel({ onNextProblem, currentProblemIdx }) {
  const { session, loading } = useMockRoom();

  if (!session?.problem?.length || !session.problem[currentProblemIdx]) {
    return (
      <div className="flex items-center justify-center flex-1 text-gray-500 font-mono text-sm p-4">
        Loading problem...
      </div>
    );
  }

  const currentProblem = session.problem[currentProblemIdx];
  const isLastProblem = currentProblemIdx === session.problem.length - 1;
  const totalProblems = session.problem.length;

  let q = { title: "", statement: "", examples: "", constraints: "" };
  try {
    q = JSON.parse(currentProblem.question);
  } catch {
    q.statement = currentProblem.question;
  }

  const difficultyColor = {
    Easy: "text-green-400",
    Medium: "text-yellow-400",
    Hard: "text-red-400",
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Panel header — fixed */}
      <div className="shrink-0 px-4 py-3 border-b border-gray-800 bg-gray-900">
        <div className="flex items-center justify-between">
          <span className="text-xs text-indigo-400 font-mono uppercase tracking-widest">
            Problem {currentProblemIdx + 1} / {totalProblems}
          </span>
          <span
            className={`text-xs font-mono font-semibold ${difficultyColor[currentProblem.difficulty] ?? "text-gray-400"}`}
          >
            {currentProblem.difficulty}
          </span>
        </div>
        {currentProblem.topic?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {currentProblem.topic.map((t) => (
              <Badge key={t}>{t}</Badge>
            ))}
          </div>
        )}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-5">
        <div className="flex flex-col gap-3">
          <p className="text-white font-semibold text-sm leading-snug">
            {q.title}
          </p>
          <p className="text-gray-300 text-sm leading-relaxed">{q.statement}</p>
        </div>

        {q.examples && (
          <div className="flex flex-col gap-2">
            <p className="text-xs text-indigo-400 uppercase tracking-widest">
              Examples
            </p>
            <pre className="text-gray-300 text-xs whitespace-pre-wrap bg-gray-900 rounded-lg p-3 leading-relaxed">
              {q.examples}
            </pre>
          </div>
        )}

        {q.constraints && (
          <div className="flex flex-col gap-2">
            <p className="text-xs text-indigo-400 uppercase tracking-widest">
              Constraints
            </p>
            <pre className="text-gray-300 text-xs whitespace-pre-wrap bg-gray-900 rounded-lg p-3 leading-relaxed">
              {q.constraints}
            </pre>
          </div>
        )}
      </div>

      {/* Footer — fixed, only shows if not last problem */}
      {!isLastProblem && (
        <div className="shrink-0 px-4 py-3 border-t border-gray-800 bg-gray-900">
          <Button
            onClick={onNextProblem}
            loading={loading}
            disabled={loading}
            className="w-full justify-center"
          >
            <Send className="w-3.5 h-3.5 mr-2" />
            Next Problem
          </Button>
        </div>
      )}
    </div>
  );
}
