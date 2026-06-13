export default function Card({ children }) {
  return (
    <div className="w-full p-6 rounded-xl border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-900 transition-colors duration-200 z-10">
      {children}
    </div>
  );
}
