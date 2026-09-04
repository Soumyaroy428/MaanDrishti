import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "@/lib/api-client";
import { Loader2 } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import GoogleIcon from "@/components/GoogleIcon";
import { safeReturnTo } from "@/lib/authReturnTo";
import "@/styles/auth.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const returnTo = safeReturnTo();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.auth.loginViaEmailPassword(email, password);
      // Force a page reload to ensure authentication state is properly set
      // Redirect to the main page which uses the Layout component
      window.location.href = "/";
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    api.auth.loginWithProvider("google", returnTo);
  };

  return (
    <AuthLayout
      title="Welcome to Maan Drishti"
      subtitle="Everything that makes your life easy"
      footer={
        <>
          Don't have an account?{" "}
          <Link
            to={
              "/register" +
              (returnTo !== "/"
                ? "?returnTo=" + encodeURIComponent(returnTo)
                : "")
            }
            className="auth-footer-link"
          >
            Sign up
          </Link>
        </>
      }
    >
      <button
        type="button"
        onClick={handleGoogle}
        className="google-button"
      >
        <GoogleIcon className="h-4 w-4" />
        Continue with Google
      </button>

      <div className="auth-divider">
        <span>or</span>
      </div>

      {error && (
        <div className="auth-error">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="email" className="form-label">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            autoFocus
            placeholder="name@work-email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-input"
            required
          />
        </div>
        <div className="form-group">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <Link
              to="/forgot-password"
              className="forgot-password-link"
            >
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-input"
            required
          />
        </div>
        <button
          type="submit"
          className="auth-submit-button"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 loading-spinner" />
              Continue with email...
            </>
          ) : (
            "Continue with email"
          )}
        </button>
      </form>
    </AuthLayout>
  );
}
