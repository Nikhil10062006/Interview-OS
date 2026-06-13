const LANGUAGES = [
  { label: "JavaScript", value: "javascript" },
  { label: "Python", value: "python3" },
  { label: "Java", value: "java" },
  { label: "C++", value: "cpp" },
];

export default function LanguageSelector({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-3 py-2 text-sm font-medium bg-zinc-900 text-zinc-100 border border-zinc-700 rounded-lg outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer transition-all duration-200"
    >
      {LANGUAGES.map((lang) => (
        <option key={lang.value} value={lang.value}>
          {lang.label}
        </option>
      ))}
    </select>
  );
}
