import { useAuth } from "../../hooks/useAuth.jsx";
import PageWrapper from "../../components/pageWrapper.jsx";
import FeatureCard from "./components/featureCard.jsx";
import StatsStrip from "./components/statsStrip.jsx";
import RecentSessions from "./components/recentSessions.jsx";
import Toast from "../../components/toast.jsx";
import { useToast } from "../../hooks/useToast.jsx";

const FEATURE_CARDS = [
  {
    title: "Phantom AI",
    description:
      "Start a solo mock interview with live AI feedback. Practice DSA problems and get scored on your approach.",
    actionLabel: "Start Session",
    route: "/phantom",
    emoji: "👻",
  },
  {
    title: "War Room",
    description:
      "Challenge a developer in a real-time 1v1 coding room. Write code, review solutions, and get an AI performance report.",
    actionLabel: "Enter Lobby",
    route: "/warroom",
    emoji: "⚔️",
  },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const { toast, showToast } = useToast();

  return (
    <PageWrapper>
      <div className="min-h-screen bg-gray-950 text-white px-6 py-10 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white">
            Welcome back, {user?.username} 👋
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            Here's your InterviewOS overview.
          </p>
        </div>

        {/* Stats */}
        <StatsStrip />

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-10">
          {FEATURE_CARDS.map((card) => (
            <FeatureCard
              key={card.route}
              title={card.title}
              description={card.description}
              actionLabel={card.actionLabel}
              route={card.route}
              emoji={card.emoji}
            />
          ))}
        </div>

        {/* Recent Activity */}
        <div className="mt-10">
          <h2 className="text-lg font-semibold text-white mb-4">
            Recent Activity
          </h2>
          <RecentSessions />
        </div>
      </div>

      {toast.show && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
          <Toast
            message={toast.message}
            success={toast.success}
            error={!toast.success}
          />
        </div>
      )}
    </PageWrapper>
  );
}
