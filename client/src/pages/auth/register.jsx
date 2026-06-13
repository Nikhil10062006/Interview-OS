import { useAuth } from "../../hooks/useAuth.jsx";
import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Input from "../../components/input.jsx";
import Button from "../../components/button.jsx";
import Spinner from "../../components/spinner.jsx";
import Toast from "../../components/toast.jsx";
import { useToast } from "../../hooks/useToast.jsx";

export default function Register() {
  const [formFields, setFormFields] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [fieldError, setFieldError] = useState({
    username: null,
    email: null,
    password: null,
    confirmPassword: null,
  });
  const [loading, setLoading] = useState(false);
  const { toast, showToast } = useToast();
  const { handleRegister, user } = useAuth();
  const navigate = useNavigate();

  if (user) return <Navigate to="/dashboard" replace />;

  function handleFieldChange(e) {
    const { name, value } = e.target;
    setFormFields((prev) => ({ ...prev, [name]: value }));

    if (name === "username") {
      setFieldError((prev) => ({
        ...prev,
        username: !value ? "Username cannot be empty" : null,
      }));
    }
    if (name === "email") {
      if (!value) {
        setFieldError((prev) => ({ ...prev, email: "Email cannot be empty" }));
      } else {
        const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        setFieldError((prev) => ({
          ...prev,
          email: regex.test(value)
            ? null
            : "Please enter a valid email address",
        }));
      }
    }
    if (name === "password") {
      if (!value) {
        setFieldError((prev) => ({
          ...prev,
          password: "Password cannot be empty",
        }));
      } else {
        const passwordRegex =
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        setFieldError((prev) => ({
          ...prev,
          password: passwordRegex.test(value)
            ? null
            : "Min 8 chars with uppercase, lowercase, digit, and special character",
        }));
      }
    }
    if (name === "confirmPassword") {
      if (!value) {
        setFieldError((prev) => ({
          ...prev,
          confirmPassword: "Confirm password cannot be empty",
        }));
      } else {
        setFieldError((prev) => ({
          ...prev,
          confirmPassword:
            formFields.password !== value ? "Passwords do not match" : null,
        }));
      }
    }
  }

  function handleReset() {
    setFormFields({
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
    setFieldError({
      username: null,
      email: null,
      password: null,
      confirmPassword: null,
    });
  }

  async function handleSubmit() {
    if (
      !formFields.username ||
      !formFields.email ||
      !formFields.password ||
      !formFields.confirmPassword
    ) {
      showToast("All fields are required.", false);
      return;
    }
    if (
      fieldError.username ||
      fieldError.email ||
      fieldError.password ||
      fieldError.confirmPassword
    ) {
      showToast("Please fix the errors.", false);
      return;
    }
    try {
      setLoading(true);
      const result = await handleRegister(
        formFields.username,
        formFields.email,
        formFields.password,
      );
      if (result?.success) {
        showToast("Account created! Redirecting...", true);
        setTimeout(() => navigate("/dashboard"), 1500);
      } else {
        showToast(
          result?.message || "Registration failed. Please try again.",
          false,
        );
      }
    } catch {
      showToast("Something went wrong.", false);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex font-mono">
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gray-900 border-r border-gray-800 p-12 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(rgba(99,102,241,0.4) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(99,102,241,0.4) 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl" />

        <span
          className="relative text-indigo-400 font-bold tracking-widest text-sm uppercase cursor-pointer"
          onClick={() => navigate("/")}
        >
          ← Interview OS
        </span>

        <div className="relative flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <span className="text-xs text-indigo-400 tracking-widest uppercase">
              What you're getting
            </span>
            {[
              { emoji: "⚔️", label: "Real-time 1v1 War Rooms" },
              { emoji: "👻", label: "Phantom AI mock interviews" },
              { emoji: "🧠", label: "SM-2 spaced repetition tracker" },
              { emoji: "🔥", label: "Hesitation heatmaps" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-3 py-2 border-b border-gray-800"
              >
                <span className="text-xl">{item.emoji}</span>
                <span className="text-gray-300 text-sm">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-gray-700 text-xs">© 2026 Interview OS</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md flex flex-col gap-7">
          <span
            className="lg:hidden text-indigo-400 font-bold tracking-widest text-sm uppercase cursor-pointer"
            onClick={() => navigate("/")}
          >
            ← Interview OS
          </span>

          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-white">
              Create your account.
            </h1>
            <p className="text-gray-500 text-sm">
              Start training. Stop hoping.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <Input
              label="Username"
              placeholder="yourhandle"
              value={formFields.username}
              name="username"
              onChange={handleFieldChange}
              error={fieldError.username}
              disabled={loading}
            />
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={formFields.email}
              name="email"
              onChange={handleFieldChange}
              error={fieldError.email}
              disabled={loading}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={formFields.password}
              name="password"
              onChange={handleFieldChange}
              error={fieldError.password}
              disabled={loading}
            />
            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              value={formFields.confirmPassword}
              name="confirmPassword"
              onChange={handleFieldChange}
              error={fieldError.confirmPassword}
              disabled={loading}
            />
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition-colors duration-150"
            >
              {loading ? "Creating account..." : "Create Account →"}
            </Button>
            <Button
              onClick={handleReset}
              disabled={loading}
              className="w-full border border-gray-700 hover:border-gray-500 text-gray-400 hover:text-white font-medium py-3 rounded-xl transition-colors duration-150"
            >
              Reset
            </Button>
          </div>

          <p className="text-center text-sm text-gray-500">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors duration-150"
            >
              Log in
            </button>
          </p>
        </div>
      </div>

      {toast.show && (
        <div className="fixed top-4 right-4 z-50">
          <Toast message={toast.message} success={toast.success} />
        </div>
      )}
    </div>
  );
}
