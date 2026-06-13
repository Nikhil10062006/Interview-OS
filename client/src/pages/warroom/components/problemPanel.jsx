import { useState } from "react";
import { Send, Pencil } from "lucide-react";
import { useRoom } from "../../../hooks/useRoom.jsx";
import { useAuth } from "../../../hooks/useAuth.jsx";
import { useToast } from "../../../hooks/useToast.jsx";
import Button from "../../../components/button.jsx";
import Input from "../../../components/input.jsx";
import Toast from "../../../components/toast.jsx";
import Spinner from "../../../components/spinner.jsx";

export default function ProblemPanel({
  problem,
  onProblemUpdate,
  currentCode,
  onNextProblem,
  testCases = [],
  onTestCasesUpdate,
  currentProblemId,
  isInterviewer,
}) {
  const {
    room,
    handleAddProblem,
    handleEditProblem,
    handleUpdateProblem,
    loading: roomLoading,
  } = useRoom();

  const { user } = useAuth();
  const { toast, showToast } = useToast();
  const [form, setForm] = useState({
    title: "",
    description: "",
    constraints: "",
    examples: "",
  });
  const [problemSent, setProblemSent] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [tcForm, setTcForm] = useState({
    input: "",
    expectedOutput: "",
    label: "",
  });
  const [candidateTcForm, setCandidateTcForm] = useState({
    input: "",
    expectedOutput: "",
    label: "",
  });

  if (!room || !user) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner />
      </div>
    );
  }

  function handleFormChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleAddInterviewerTestCase() {
    if (!tcForm.input.trim()) return;
    const newCase = { ...tcForm, addedBy: "interviewer" };
    const updated = [...testCases, newCase];
    onTestCasesUpdate(currentProblemId, updated);
    setTcForm({ input: "", expectedOutput: "", label: "" });
  }

  function handleRemoveTestCase(index) {
    const updated = testCases.filter((_, i) => i !== index);
    onTestCasesUpdate(currentProblemId, updated);
  }

  function handleAddCandidateTestCase() {
    if (!candidateTcForm.input.trim()) return;
    const newCase = { ...candidateTcForm, addedBy: "candidate" };
    const updated = [...testCases, newCase];
    onTestCasesUpdate(currentProblemId, updated);
    setCandidateTcForm({ input: "", expectedOutput: "", label: "" });
  }

  async function handleSendProblem() {
    try {
      let targetProblem;
      if (currentProblemId) {
        targetProblem = await handleEditProblem(
          room.roomId,
          currentProblemId,
          form,
        );
      } else {
        const problemsArray = await handleAddProblem(room.roomId, form);
        targetProblem = problemsArray[problemsArray.length - 1];
      }
      onProblemUpdate(targetProblem); // ← pass the real backend object
      setProblemSent(true);
      setIsEditing(false);
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to save problem");
    }
  }

  async function handleNextProblem() {
    setForm({ title: "", description: "", constraints: "", examples: "" });
    setProblemSent(false);
    setIsEditing(false);
    onTestCasesUpdate(null, []);
    onNextProblem();
  }

  function handleEditClick() {
    setIsEditing(true);
    setProblemSent(false);
  }

  const showInterviewerForm = isInterviewer && (!problemSent || isEditing);
  const showInterviewerProblem = isInterviewer && problemSent && !isEditing;

  let headerLabel = "Problem";
  if (showInterviewerForm) {
    headerLabel = currentProblemId ? "Edit Problem" : "Add Problem";
  } else if (showInterviewerProblem) {
    headerLabel = "Current Problem";
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header — fixed */}
      <div className="shrink-0 px-4 py-2.5 border-b border-gray-800 bg-gray-900">
        <p className="text-xs text-indigo-400 font-mono uppercase tracking-widest">
          {headerLabel}
        </p>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
        {/* Interviewer: add / edit form */}
        {showInterviewerForm && (
          <div className="flex flex-col gap-3">
            {["title", "description", "examples", "constraints"].map(
              (field) => (
                <Input
                  key={field}
                  label={field.charAt(0).toUpperCase() + field.slice(1)}
                  name={field}
                  value={form[field]}
                  disabled={roomLoading}
                  onChange={handleFormChange}
                />
              ),
            )}
          </div>
        )}

        {/* Interviewer: current problem + test cases */}
        {showInterviewerProblem && (
          <div className="flex flex-col gap-5">
            <div className="bg-gray-900 rounded-lg p-3 flex flex-col gap-2 text-xs text-gray-200 font-mono">
              {["title", "description", "examples", "constraints"].map(
                (field) => (
                  <p key={field} className="leading-relaxed">
                    <span className="text-indigo-400">
                      {field.charAt(0).toUpperCase() + field.slice(1)}:{" "}
                    </span>
                    {form[field]}
                  </p>
                ),
              )}
            </div>

            <div className="flex flex-col gap-3">
              <p className="text-xs text-indigo-400 font-mono uppercase tracking-widest">
                Test Cases
              </p>

              {testCases.map((tc, i) => (
                <div
                  key={i}
                  className="bg-gray-900 rounded-lg p-3 text-xs font-mono flex flex-col gap-1 relative"
                >
                  <span
                    className={`text-[10px] ${tc.addedBy === "candidate" ? "text-yellow-500" : "text-indigo-400"}`}
                  >
                    {tc.label || `Case ${i + 1}`} · {tc.addedBy}
                  </span>
                  <span className="text-gray-400">
                    Input: <span className="text-gray-200">{tc.input}</span>
                  </span>
                  <span className="text-gray-400">
                    Expected:{" "}
                    <span className="text-gray-200">{tc.expectedOutput}</span>
                  </span>
                  {tc.addedBy === "interviewer" && (
                    <button
                      onClick={() => handleRemoveTestCase(i)}
                      className="absolute top-2 right-2 text-gray-600 hover:text-red-400 text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}

              <div className="flex flex-col gap-2">
                <Input
                  label="Label (e.g. Example 1)"
                  value={tcForm.label}
                  onChange={(e) =>
                    setTcForm((p) => ({ ...p, label: e.target.value }))
                  }
                />
                <Input
                  label="Input"
                  value={tcForm.input}
                  onChange={(e) =>
                    setTcForm((p) => ({ ...p, input: e.target.value }))
                  }
                />
                <Input
                  label="Expected Output"
                  value={tcForm.expectedOutput}
                  onChange={(e) =>
                    setTcForm((p) => ({ ...p, expectedOutput: e.target.value }))
                  }
                />
                <Button
                  onClick={handleAddInterviewerTestCase}
                  className="w-full justify-center"
                >
                  Add Test Case
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Candidate: problem + test cases */}
        {!isInterviewer && (
          <div className="flex flex-col gap-5">
            {problem ? (
              <div className="bg-gray-900 rounded-lg p-3 flex flex-col gap-2 text-xs text-gray-200 font-mono">
                {["title", "description", "examples", "constraints"].map(
                  (field) => (
                    <p key={field} className="leading-relaxed">
                      <span className="text-indigo-400">
                        {field.charAt(0).toUpperCase() + field.slice(1)}:{" "}
                      </span>
                      {problem[field]}
                    </p>
                  ),
                )}
              </div>
            ) : (
              <p className="text-xs text-gray-500 font-mono">
                Waiting for interviewer to send a problem...
              </p>
            )}

            {problem && (
              <div className="flex flex-col gap-3">
                <p className="text-xs text-indigo-400 font-mono uppercase tracking-widest">
                  Test Cases
                </p>
                {testCases.length === 0 && (
                  <p className="text-xs text-gray-500 font-mono">
                    No test cases yet.
                  </p>
                )}
                {testCases.map((tc, i) => (
                  <div
                    key={i}
                    className="bg-gray-900 rounded-lg p-3 text-xs font-mono flex flex-col gap-1"
                  >
                    <span
                      className={`text-[10px] ${tc.addedBy === "candidate" ? "text-yellow-500" : "text-indigo-400"}`}
                    >
                      {tc.label || `Case ${i + 1}`} · {tc.addedBy}
                    </span>
                    <span className="text-gray-400">
                      Input: <span className="text-gray-200">{tc.input}</span>
                    </span>
                    <span className="text-gray-400">
                      Expected:{" "}
                      <span className="text-gray-200">{tc.expectedOutput}</span>
                    </span>
                  </div>
                ))}

                {/* Candidate can add their own */}
                <p className="text-xs text-gray-500 font-mono uppercase tracking-widest mt-2">
                  Add Your Own
                </p>
                <div className="flex flex-col gap-2">
                  <Input
                    label="Label"
                    value={candidateTcForm.label}
                    onChange={(e) =>
                      setCandidateTcForm((p) => ({
                        ...p,
                        label: e.target.value,
                      }))
                    }
                  />
                  <Input
                    label="Input"
                    value={candidateTcForm.input}
                    onChange={(e) =>
                      setCandidateTcForm((p) => ({
                        ...p,
                        input: e.target.value,
                      }))
                    }
                  />
                  <Input
                    label="Expected Output"
                    value={candidateTcForm.expectedOutput}
                    onChange={(e) =>
                      setCandidateTcForm((p) => ({
                        ...p,
                        expectedOutput: e.target.value,
                      }))
                    }
                  />
                  <Button
                    onClick={handleAddCandidateTestCase}
                    className="w-full justify-center"
                  >
                    Add Test Case
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer — fixed */}
      {showInterviewerForm && (
        <div className="shrink-0 px-4 py-3 border-t border-gray-800 bg-gray-900">
          <Button
            loading={roomLoading}
            onClick={handleSendProblem}
            className="w-full justify-center"
          >
            {currentProblemId ? "Update Problem" : "Send Problem"}
            <Send className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}

      {showInterviewerProblem && (
        <div className="shrink-0 px-4 py-3 border-t border-gray-800 bg-gray-900 flex gap-2">
          <Button onClick={handleEditClick} className="flex-1 justify-center">
            <Pencil className="w-4 h-4 mr-2" />
            Edit Problem
          </Button>
          <Button
            onClick={handleNextProblem}
            loading={roomLoading}
            className="flex-1 justify-center"
          >
            <Send className="w-4 h-4 mr-2" />
            Next Problem
          </Button>
        </div>
      )}

      {toast.show && (
        <Toast
          success={toast.success}
          error={!toast.success}
          message={toast.message}
        />
      )}
    </div>
  );
}
