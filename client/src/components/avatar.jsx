function getInitials(username) {
  if (!username) return "?";
  return username.slice(0, 2).toUpperCase();
}

export default function Avatar({ username, email }) {
  return (
    <div className="flex flex-row items-center gap-3">
      <div className="w-9 h-9 rounded-full bg-sky-500 flex items-center justify-center shrink-0">
        <span className="text-xs font-bold text-white">
          {getInitials(username)}
        </span>
      </div>
      <div className="flex flex-col">
        <p className="text-sm font-semibold text-zinc-100">{username}</p>
        <p className="text-xs text-zinc-400">{email}</p>
      </div>
    </div>
  );
}
