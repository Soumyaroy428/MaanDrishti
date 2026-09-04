import React, { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api-client";
import { Loader2 } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import GoogleIcon from "@/components/GoogleIcon";
import { safeReturnTo } from "@/lib/authReturnTo";
import "@/styles/auth.css";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const returnTo = safeReturnTo();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await api.auth.register({ email, password, name });
      if (result?.access_token) {
        api.auth.setToken(result.access_token);
        // Force a page reload to ensure authentication state is properly set
        // Redirect to the main page which uses the Layout component
        window.location.href = "/";
      }
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    api.auth.loginWithProvider("google", returnTo);
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Sign up to get started"
      footer={
        <>
          Already have an account?{" "}
          <Link
            to={
              "/login" +
              (returnTo !== "/"
                ? "?returnTo=" + encodeURIComponent(returnTo)
                : "")
            }
            className="auth-footer-link"
          >
            Log in
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
          <label htmlFor="name" className="form-label">
            Name
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="form-input"
            required
          />
        </div>
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
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-input"
            required
            minLength={8}
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
              Creating account...
            </>
          ) : (
            "Create account"
          )}
        </button>
      </form>
    </AuthLayout>
  );
}
