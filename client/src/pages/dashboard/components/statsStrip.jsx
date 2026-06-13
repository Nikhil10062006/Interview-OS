import { useMockRoom } from "../../../hooks/useMock.jsx";
import { useRoom } from "../../../hooks/useRoom.jsx";

export default function StatsStrip() {
  const { sessions } = useMockRoom();
  const { rooms } = useRoom();

  const statItems = [
    { value: sessions?.length ?? 0, label: "Mock Sessions" },
    {
      value: sessions?.filter((s) => s.status === "ended")?.length ?? 0,
      label: "Sessions Completed",
    },
    { value: rooms?.length ?? 0, label: "War Rooms Joined" },
    {
      value: rooms?.filter((r) => r.status === "ended")?.length ?? 0,
      label: "Rooms Completed",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {statItems.map((stat) => (
        <div
          key={stat.label}
          className="bg-gray-900 border border-gray-800 rounded-xl px-5 py-4 flex flex-col gap-1 hover:border-indigo-500 transition-colors duration-200"
        >
          <span className="text-3xl font-bold text-indigo-400">
            {stat.value}
          </span>
          <span className="text-sm text-gray-400">{stat.label}</span>
        </div>
      ))}
    </div>
  );
}
