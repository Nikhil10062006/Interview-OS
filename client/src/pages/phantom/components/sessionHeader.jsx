// pages/phantom/components/sessionHeader.jsx
import { Ghost, LogOut } from "lucide-react";
import Button from "../../../components/button.jsx";

export default function SessionHeader({ onEndSession, isEnding }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-800">
      <div className="flex items-center gap-2">
        <Ghost className="w-5 h-5 text-indigo-400" />
        <span className="text-sm font-semibold text-white tracking-wide">
          Phantom AI Session
        </span>
        <span className="flex items-center gap-1.5 ml-3">
          <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-green-400 uppercase tracking-widest">
            Live
          </span>
        </span>
      </div>

      <Button onClick={onEndSession} loading={isEnding} disabled={isEnding}>
        <LogOut className="w-4 h-4 mr-2" />
        {isEnding ? "Ending..." : "End Session"}
      </Button>
    </div>
  );
}
