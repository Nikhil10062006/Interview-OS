
import { useMockRoom } from "../../hooks/useMock.jsx";
import { useNavigate } from "react-router-dom";
import { useRef } from "react";
import { useAuth } from "../../hooks/useAuth.jsx";
import { useToast } from "../../hooks/useToast.jsx";
import { Shield, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import Input from "../../components/input.jsx";
import Button from "../../components/button.jsx";
import Spinner from "../../components/spinner.jsx";
import Badge from "../../components/badge.jsx";
import Toast from "../../components/toast.jsx";
import PageWrapper from "../../components/pageWrapper.jsx";

function statusDot(status) {
  if (status === "active") return "bg-green-400 animate-pulse";
  if (status === "waiting") return "bg-yellow-400";
  return "bg-gray-600";
}

function statusBadgeVariant(status) {
  if (status === "active") return "success";
  if (status === "waiting") return "warning";
  return "default";
}

export default function LobbyAI() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    loading: mockLoading,
    session,
    sessions,
    error: mockError,
    handleStartSession,
    handleGetAllSessions,
  } = useMockRoom();

  const { toast, showToast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [starting, setStarting] = useState(false);

  const [formDetails, setFormDetails] = useState({
    difficulty: "",
    topic: "",
    companyName: "",
    noOfProblems: "",
    experienceLevel: "",
  });
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    handleGetAllSessions().catch(() => {});
  }, []);
  useEffect(() => {
    if (starting && session?.sessionId && session.status === "active") {
      navigate(`/phantom/${session.sessionId}`);
      setStarting(false);
    }
  }, [session, starting]);

  useEffect(() => {
    if (mockError) {
      showToast(mockError, false);
      setStarting(false);
    }
  }, [mockError]);

  function handleFormDetails(e) {
    const { name, value } = e.target;
    setFormDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (formError) setFormError(null);
  }

  function startSession() {
    const { difficulty, noOfProblems, experienceLevel, topic, companyName } =
      formDetails;
    if (
      !difficulty ||
      !noOfProblems ||
      !experienceLevel ||
      !topic ||
      !companyName
    ) {
      setFormError("All details are required");
      return;
    }

    setStarting(true);
    handleStartSession(formDetails);
  }

  const recentSessions = (sessions || []).slice(0, 4);

  if (mockLoading && starting) {
    return (
      <div className="min-h-screen bg-gray-950 text-white font-mono flex flex-col items-center justify-center gap-4">
        <Spinner />
        <p className="text-sm text-gray-400">
          Please hang on, our AI is preparing your questions...
        </p>
      </div>
    );
  }

  return (
    <PageWrapper>
      <div className="min-h-screen bg-gray-950 text-white font-mono">
        <div className="max-w-5xl mx-auto px-6 py-14 space-y-16">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-green-400 tracking-widest uppercase">
                Live
              </span>
            </div>
            <h1 className="text-5xl font-bold tracking-tight">Phantom AI</h1>
            <p className="text-gray-400 max-w-lg text-sm leading-relaxed">
              Solo mock interview sessions where AI watches you code, asks
              probing questions mid-session, and grades you at the end. A
              session takes ten seconds to spin up.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-800 hover:border-indigo-600 transition-colors rounded-xl p-6 bg-gray-900 space-y-5">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h2 className="text-xl font-semibold text-white">
                    Create a Session
                  </h2>
                </div>
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5 text-indigo-400" />
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Create a personal session with AI to start your mock interview.
              </p>
              <Button
                loading={mockLoading && !starting}
                onClick={() => setShowForm((prev) => !prev)}
                className="w-full justify-center"
              >
                Create Session <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>

          {showForm && (
            <div className="border border-gray-800 rounded-xl p-6 bg-gray-900 space-y-4 -mt-10">
              <Input
                label={"Company Name"}
                name={"companyName"}
                value={formDetails.companyName}
                onChange={handleFormDetails}
                placeholder={"FAANG, MAANG, MANGOS"}
                disabled={starting}
                error={formError}
              />
              <Input
                label={"Topic"}
                name={"topic"}
                value={formDetails.topic}
                onChange={handleFormDetails}
                placeholder={"Arrays, Stack, Graphs, DP"}
                disabled={starting}
                error={formError}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label={"No of Problems"}
                  name={"noOfProblems"}
                  value={formDetails.noOfProblems}
                  onChange={handleFormDetails}
                  placeholder={"e.g., 2"}
                  disabled={starting}
                  error={formError}
                />
                <Input
                  label={"Experience Level"}
                  name={"experienceLevel"}
                  value={formDetails.experienceLevel}
                  onChange={handleFormDetails}
                  placeholder={"Beginner, 1+, 3+"}
                  disabled={starting}
                  error={formError}
                />
              </div>
              <Input
                label={"Difficulty"}
                name={"difficulty"}
                value={formDetails.difficulty}
                onChange={handleFormDetails}
                placeholder={"Easy, Medium, Hard"}
                disabled={starting}
                error={formError}
              />
              <Button
                loading={starting}
                onClick={startSession}
                className="w-full justify-center"
              >
                Start the Session
              </Button>
            </div>
          )}

          {recentSessions.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500 uppercase tracking-widest">
                  Recent Sessions
                </p>
                <button
                  onClick={() => navigate("/phantom/all-sessions")}
                  className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
                >
                  View all <ArrowRight className="w-3 h-3" />
                </button>
              </div>
              <div className="space-y-2">
                {recentSessions.map((s) => (
                  <div
                    key={s._id}
                    onClick={() => {
                      if (s.status === "ended") {
                        navigate(`/phantom/${s.sessionId}/summary`);
                      } else {
                        navigate(`/phantom/${s.sessionId}`);
                      }
                    }}
                    className="flex items-center justify-between border border-gray-800 hover:border-gray-700 rounded-lg px-4 py-3 bg-gray-900/50 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`h-2 w-2 rounded-full shrink-0 ${statusDot(s.status)}`}
                      />
                      <div>
                        <p className="text-sm text-white tracking-widest">
                          {s.sessionId}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={statusBadgeVariant(s.status)}>
                        {s.status}
                      </Badge>
                      <ArrowRight className="w-4 h-4 text-gray-700 group-hover:text-gray-400 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {toast?.show && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999]">
            <Toast
              success={toast.success}
              error={!toast.success}
              message={toast.message}
            />
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
