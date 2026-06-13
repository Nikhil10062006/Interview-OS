import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  const features = [
    {
      tag: "WAR ROOM",
      headline: "1v1. Live. No mercy.",
      body: "Challenge a friend or stranger to a real-time coding duel. Same editor, same problem, same clock. One winner.",
      emoji: "⚔️",
    },
    {
      tag: "PHANTOM AI",
      headline: "An interviewer that never sleeps.",
      body: "It watches every pause, every backspace, every hesitation — then asks exactly the question you were hoping it wouldn't.",
      emoji: "👻",
    },
    {
      tag: "DSA TRACKER",
      headline: "Stop re-reading the same problem.",
      body: "Built-in spaced repetition. The algorithm schedules your reviews so you remember what you learned, not just what you crammed.",
      emoji: "🧠",
    },
  ];

  const testimonials = [
    {
      quote:
        "I failed Google twice. After two weeks on Interview OS, I stopped freezing on tree problems.",
      name: "Arjun S.",
      role: "SDE-2 at Flipkart",
    },
    {
      quote:
        "The AI asked me why I used a HashMap there. I had no answer. Best thing that ever happened to my prep.",
      name: "Priya K.",
      role: "Incoming SWE at Microsoft",
    },
    {
      quote:
        "War Room with my roommate every night. We both got offers the same week.",
      name: "Rahul M.",
      role: "Jane Street",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white font-mono">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 bg-gray-950/80 backdrop-blur-sm border-b border-gray-800">
        <span className="text-indigo-400 font-bold tracking-widest text-sm uppercase">
          Interview OS
        </span>
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/login")}
            className="text-sm text-gray-400 hover:text-white px-4 py-2 transition-colors duration-150"
          >
            Login
          </button>
          <button
            onClick={() => navigate("/register")}
            className="text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition-colors duration-150"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="min-h-screen flex flex-col items-center justify-center text-center px-6 pt-20 relative overflow-hidden">
        {/* Background grid */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(rgba(99,102,241,0.3) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(99,102,241,0.3) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />

        {/* Glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto">
          <span className="inline-block text-xs text-indigo-400 tracking-widest uppercase border border-indigo-800 bg-indigo-950/50 px-4 py-1.5 rounded-full mb-6">
            Real-time. AI-powered. Brutally honest.
          </span>

          <h1 className="text-4xl sm:text-6xl font-bold leading-tight text-white mb-6 tracking-tight">
            Your next interview is in{" "}
            <span className="text-indigo-400">3 days.</span>
            <br />
            Are you ready, or are you{" "}
            <span className="text-gray-500 italic">just hoping?</span>
          </h1>

          <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed mb-10">
            Interview OS watches you code, finds where you freeze, and pushes
            back — just like a real interviewer would.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/register")}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-3.5 rounded-xl transition-all duration-150 hover:shadow-lg hover:shadow-indigo-500/20 text-sm tracking-wide"
            >
              ⚔️ Enter the War Room
            </button>
            <button
              onClick={() => navigate("/register")}
              className="border border-gray-700 hover:border-indigo-500 text-gray-300 hover:text-white font-semibold px-8 py-3.5 rounded-xl transition-all duration-150 text-sm tracking-wide"
            >
              👻 Start Solo Practice
            </button>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-gray-600">
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <span className="text-lg animate-bounce">↓</span>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-24 max-w-6xl mx-auto">
        <p className="text-xs text-indigo-400 tracking-widest uppercase text-center mb-3">
          The Platform
        </p>
        <h2 className="text-3xl font-bold text-center text-white mb-16">
          Three weapons. One OS.
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.tag}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col gap-4 hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-200 group"
            >
              <span className="text-4xl">{f.emoji}</span>
              <span className="text-xs text-indigo-400 tracking-widest font-semibold">
                {f.tag}
              </span>
              <h3 className="text-base font-bold text-white leading-snug">
                {f.headline}
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Heatmap callout */}
      <section className="px-6 py-20 border-y border-gray-800 bg-gray-900/50">
        <div className="max-w-3xl mx-auto text-center flex flex-col gap-5">
          <span className="text-5xl">🔥</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white leading-snug">
            We track where you slow down.
            <br />
            <span className="text-indigo-400">
              Because that's where you lose the interview.
            </span>
          </h2>
          <p className="text-gray-400 text-base leading-relaxed">
            Your hesitation heatmap shows every moment of doubt — every pause,
            every deleted line — so you can eliminate them before the real
            thing.
          </p>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-6 py-24 max-w-6xl mx-auto">
        <p className="text-xs text-indigo-400 tracking-widest uppercase text-center mb-3">
          Results
        </p>
        <h2 className="text-3xl font-bold text-center text-white mb-16">
          They trained. They got in.
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col gap-4 hover:border-indigo-500 transition-all duration-200"
            >
              <span className="text-indigo-400 text-2xl">"</span>
              <p className="text-gray-300 text-sm leading-relaxed italic">
                {t.quote}
              </p>
              <div className="mt-auto pt-4 border-t border-gray-800">
                <p className="text-white text-sm font-semibold">{t.name}</p>
                <p className="text-gray-500 text-xs">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-24 text-center border-t border-gray-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-indigo-950/20 pointer-events-none" />
        <div className="relative z-10 max-w-2xl mx-auto flex flex-col gap-6 items-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
            The interview doesn't care if you're nervous.
            <br />
            <span className="text-indigo-400">Train like it.</span>
          </h2>
          <p className="text-gray-400">
            No tutorials. No fluff. Just deliberate, brutal, effective practice.
          </p>
          <button
            onClick={() => navigate("/register")}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-10 py-4 rounded-xl text-base tracking-wide transition-all duration-150 hover:shadow-xl hover:shadow-indigo-500/25"
          >
            Build Your OS →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 px-8 py-6 flex items-center justify-between text-gray-600 text-xs">
        <span className="text-indigo-400 font-bold tracking-widest uppercase">
          Interview OS
        </span>
        <span>Built for developers who ship.</span>
      </footer>
    </div>
  );
}
