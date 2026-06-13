export default function Badge({ label }) {
  const styles = {
    Easy: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    Medium: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    Hard: "bg-red-500/10 text-red-400 border-red-500/30",
  };

  const style = styles[label] || "bg-zinc-800 text-zinc-400 border-zinc-700";

  return (
    <span
      className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${style}`}
    >
      {label}
    </span>
  );
}
