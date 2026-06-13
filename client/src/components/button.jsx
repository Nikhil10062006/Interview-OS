export default function Button({
  variant = "primary",
  size = "md",
  loading,
  onClick,
  children,
}) {
  const base =
    "font-semibold rounded-lg border transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-sky-500 text-white border-sky-500 hover:bg-sky-600",
    secondary: "bg-zinc-800 text-zinc-100 border-zinc-700 hover:bg-zinc-700",
    ghost: "bg-transparent text-zinc-300 border-zinc-700 hover:bg-zinc-800",
    danger: "bg-red-500 text-white border-red-500 hover:bg-red-600",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]}`}
      disabled={loading === true}
      onClick={onClick}
    >
      {loading ? "Loading..." : children}
    </button>
  );
}
