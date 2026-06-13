import { useNavigate } from "react-router-dom";
import Button from "../../../components/button.jsx";
import logo from "../../../assets/logo.svg";

export default function FeatureCard({
  title,
  description,
  emoji,
  actionLabel,
  route,
}) {
  const navigate = useNavigate();
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col gap-4 hover:border-indigo-500 transition-colors duration-200">
      <div className="flex items-center gap-3">
        {emoji ? (
          <span className="text-3xl">{emoji}</span>
        ) : (
          <img src={logo} alt="InterviewOS" className="h-8 w-8" />
        )}
        <h3 className="text-base font-semibold text-white">{title}</h3>
      </div>
      <p className="text-sm text-gray-400 flex-1">{description}</p>
      <Button
        onClick={() => navigate(route)}
        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors duration-150"
      >
        {actionLabel}
      </Button>
    </div>
  );
}
