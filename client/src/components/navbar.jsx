import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { useAuth } from "../hooks/useAuth.jsx";
import Button from "./button.jsx";
import Avatar from "./avatar.jsx";
import logo from "../assets/logo.svg";

export default function Navbar() {
  const { user, handleLogout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-zinc-950 border-b border-zinc-800">
      <div className="flex items-center justify-between px-6 h-full">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <img src={logo} alt="Interview OS" className="h-7 w-7" />
          <span className="text-sm font-bold text-zinc-100 tracking-wide">
            Interview OS
          </span>
        </div>

        {user ? (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard")}
            >
              Dashboard
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/phantom")}
            >
              Phantom AI
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/warroom")}
            >
              War Room
            </Button>
            <div className="relative">
              <button
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-zinc-800 transition-colors duration-200"
              >
                <Avatar username={user.username} email={user.email} />
                <ChevronDown size={14} className="text-zinc-400" />
              </button>
              {dropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-44 bg-zinc-900 border border-zinc-700 rounded-xl shadow-xl flex flex-col overflow-hidden z-50">
                  <button
                    onClick={() => {
                      handleLogout();
                      setDropdownOpen(false);
                    }}
                    className="px-4 py-2.5 text-sm text-red-400 hover:bg-zinc-800 text-left transition-colors duration-200"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/login")}
            >
              Login
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate("/register")}
            >
              Register
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
