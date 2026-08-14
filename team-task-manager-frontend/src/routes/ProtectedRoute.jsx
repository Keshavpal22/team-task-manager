import { Navigate } from "react-router-dom";
import { CheckSquare } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          {/* Animated Logo */}
          <div className="relative mx-auto w-16 h-16">
            <div className="absolute inset-0 rounded-2xl bg-blue-200 animate-ping opacity-40" />

            <div className="relative w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
              <CheckSquare className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Brand */}
          <h2 className="mt-5 text-xl font-bold text-slate-900">
            Task Manager
          </h2>

          {/* Loading Text */}
          <p className="mt-2 text-sm text-slate-500">
            Preparing your workspace
          </p>

          {/* Animated Dots */}
          <div className="flex justify-center gap-1.5 mt-4">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" />

            <span
              className="w-2 h-2 rounded-full bg-blue-600 animate-bounce"
              style={{ animationDelay: "150ms" }}
            />

            <span
              className="w-2 h-2 rounded-full bg-blue-600 animate-bounce"
              style={{ animationDelay: "300ms" }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
