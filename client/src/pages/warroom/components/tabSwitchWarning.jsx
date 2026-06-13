export default function TabSwitchWarning({ onDismiss }) {
  return (
    <div className="flex items-center justify-between px-6 py-2 bg-yellow-500/10 border-b border-yellow-500/30 font-mono">
      <p className="text-yellow-400 text-xs tracking-wide">
        ⚠ Tab switch detected — stay on this page during the interview.
      </p>
      <button
        onClick={onDismiss}
        className="text-yellow-500 hover:text-yellow-300 text-xs ml-4 transition-colors"
      >
        Dismiss
      </button>
    </div>
  );
}