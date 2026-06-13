export default function Toast({ message, success, error }) {
  const bg = success
    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
    : error
      ? "bg-red-500/10 border-red-500/30 text-red-400"
      : "bg-zinc-800 border-zinc-700 text-zinc-300";

  return (
    <div className={`w-80 px-4 py-3 rounded-lg border shadow-lg ${bg}`}>
      <p className="text-sm font-semibold">{message}</p>
    </div>
  );
}
