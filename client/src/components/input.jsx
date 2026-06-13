export default function Input({
  label,
  type = "text",
  placeholder,
  value,
  name,
  onChange,
  error,
  disabled,
}) {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label className="text-sm font-semibold text-zinc-300">{label}</label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        className="w-full px-4 py-2 text-sm font-medium bg-zinc-900 text-zinc-100 rounded-lg border border-zinc-700 outline-none focus:ring-2 focus:ring-sky-500 placeholder:text-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        disabled={disabled}
        value={value}
        name={name}
        onChange={onChange}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
