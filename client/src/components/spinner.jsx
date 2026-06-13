// export default function Spinner({ size = 100 }) {
//   return (
//     <div className="flex justify-center items-center">
//       <svg
//         xmlns="http://www.w3.org/2000/svg"
//         viewBox="0 0 120 120"
//         width={size}
//         height={size}
//       >
//         <defs>
//           <linearGradient id="ios-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
//             <stop offset="0%" stopColor="#00f2fe" />
//             <stop offset="50%" stopColor="#4facfe" />
//             <stop offset="100%" stopColor="#8e2de2" />
//           </linearGradient>
//           <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
//             <feGaussianBlur stdDeviation="3" result="blur" />
//             <feComposite in="SourceGraphic" in2="blur" operator="over" />
//           </filter>
//         </defs>

//         <circle
//           cx="60" cy="60" r="48"
//           fill="none"
//           stroke="#ffffff"
//           strokeOpacity="0.05"
//           strokeWidth="4"
//         />
//         <circle
//           cx="60" cy="60" r="48"
//           fill="none"
//           stroke="url(#ios-gradient)"
//           strokeWidth="4"
//           strokeLinecap="round"
//           strokeDasharray="80 200"
//           filter="url(#neon-glow)"
//         >
//           <animateTransform
//             attributeName="transform"
//             type="rotate"
//             from="0 60 60"
//             to="360 60 60"
//             dur="1.2s"
//             repeatCount="indefinite"
//           />
//         </circle>
//         <circle
//           cx="60" cy="60" r="36"
//           fill="none"
//           stroke="#00f2fe"
//           strokeWidth="2"
//           strokeLinecap="round"
//           strokeDasharray="40 150"
//           strokeOpacity="0.6"
//         >
//           <animateTransform
//             attributeName="transform"
//             type="rotate"
//             from="360 60 60"
//             to="0 60 60"
//             dur="2.5s"
//             repeatCount="indefinite"
//           />
//         </circle>

//         <text
//           x="60" y="67"
//           fontFamily="'Fira Code', 'Courier New', monospace"
//           fontSize="24"
//           fontWeight="bold"
//           fill="#ffffff"
//           opacity="0.85"
//           textAnchor="middle"
//           letterSpacing="3"
//         >
//           {}
//         </text>

//         <circle cx="60" cy="60" r="3.5" fill="#00f2fe" filter="url(#neon-glow)">
//           <animate attributeName="opacity" values="0.2;1;0.2" dur="1.5s" repeatCount="indefinite" />
//           <animate attributeName="r" values="2;3.5;2" dur="1.5s" repeatCount="indefinite" />
//         </circle>
//       </svg>
//     </div>
//   );
// }
import { useEffect, useRef, useState } from "react";

const frames = [
  {
    html: '<span style="color:#1cb87e">❯ </span><span style="color:#c9d1e0">node solution.js</span>',
  },
  { html: '<span style="color:#3e4a65">// runtime: O(n log n)</span>' },
  {
    html: '<span style="color:#a259ff">function </span><span style="color:#4f8eff">mergeSort</span><span style="color:#c9d1e0">(arr) {</span>',
  },
  {
    html: '  <span style="color:#a259ff">if </span><span style="color:#c9d1e0">(arr.length ≤ </span><span style="color:#ff8c69">1</span><span style="color:#c9d1e0">) </span><span style="color:#a259ff">return </span><span style="color:#c9d1e0">arr;</span>',
  },
  {
    html: '  <span style="color:#a259ff">const </span><span style="color:#4f8eff">mid </span><span style="color:#c9d1e0">= Math.floor(arr.length / </span><span style="color:#ff8c69">2</span><span style="color:#c9d1e0">);</span>',
  },
  {
    html: '  <span style="color:#a259ff">return </span><span style="color:#4f8eff">merge</span><span style="color:#c9d1e0">(</span><span style="color:#4f8eff">mergeSort</span><span style="color:#c9d1e0">(arr.slice(</span><span style="color:#ff8c69">0</span><span style="color:#c9d1e0">, mid)),</span>',
  },
  {
    html: '    <span style="color:#4f8eff">mergeSort</span><span style="color:#c9d1e0">(arr.slice(mid)));</span>',
  },
  { html: '<span style="color:#c9d1e0">}</span>' },
];

const statuses = ["compiling", "running tests", "analyzing", "passed ✓"];
const DELAYS = [0, 600, 1100, 1600, 2100, 2600, 3000, 3400];

export default function Spinner() {
  const [lines, setLines] = useState([]);
  const [statusIdx, setStatusIdx] = useState(0);
  const cycleRef = useRef(null);

  function runCycle() {
    setLines([]);
    setStatusIdx(0);
    DELAYS.forEach((delay, i) => {
      cycleRef.current = setTimeout(() => {
        setLines((prev) => [...prev.slice(-6), frames[i].html]);
        setStatusIdx(Math.min(i, statuses.length - 1));
      }, delay);
    });
    cycleRef.current = setTimeout(runCycle, 4400);
  }

  useEffect(() => {
    runCycle();
    return () => clearTimeout(cycleRef.current);
  }, []);

  return (
    <div className="fixed inset-0 bg-[#0d0f14] flex flex-col items-center justify-center gap-7">
      <div className="w-80 bg-[#111520] rounded-xl overflow-hidden border border-[#1e2435]">
        <div className="bg-[#1a1f2e] px-4 py-2.5 flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#ff5f56]" />
          <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
          <span className="w-3 h-3 rounded-full bg-[#27c93f]" />
          <span className="ml-2 font-mono text-[11px] text-[#3e4a65] tracking-widest">
            interviewos ~ bash
          </span>
        </div>
        <div className="p-4 min-h-[140px] flex flex-col gap-1 font-mono text-xs leading-relaxed">
          {lines.map((html, i) => (
            <div key={i} dangerouslySetInnerHTML={{ __html: html }} />
          ))}
          <span className="inline-block w-1.5 h-3.5 bg-[#4f8eff] animate-pulse" />
        </div>
      </div>
      <div className="flex items-center gap-2.5">
        <span className="w-2 h-2 rounded-full bg-[#4f8eff] animate-ping" />
        <span className="font-mono text-[11px] text-[#3e4a65] tracking-widest">
          {statuses[statusIdx]}
        </span>
      </div>
    </div>
  );
}
