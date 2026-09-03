import React, { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import {
  UserPlus,
  Mail,
  Lock,
  Loader2,
  Building2,
  ClipboardCheck,
  ScanLine,
} from "lucide-react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import AuthLayout from "@/components/AuthLayout";
import GoogleIcon from "@/components/GoogleIcon";
import { toast } from "@/components/ui/use-toast";
import { safeReturnTo } from "@/lib/authReturnTo";
import "@/styles/auth.css";

const ROLE_OPTIONS = [
  { id: "business", label: "Business", icon: Building2 },
  { id: "inspector", label: "Inspector", icon: ClipboardCheck },
  { id: "citizen", label: "Citizen", icon: ScanLine },
];

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [appRole, setAppRole] = useState("business");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await api.auth.register({ email, password });
      setShowOtp(true);
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await api.auth.verifyOtp({ email, otpCode });
      if (result?.access_token) {
        api.auth.setToken(result.access_token);
        try {
          await api.auth.updateMe({ app_role: appRole });
        } catch (roleErr) {
          // role preference not saved — continue to dashboard
        }
      }
      window.location.href = safeReturnTo();
    } catch (err) {
      setError(err.message || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    try {
      await api.auth.resendOtp(email);
      toast({
        title: "Code sent",
        description: "Check your email for the new code.",
      });
    } catch (err) {
      setError(err.message || "Failed to resend code");
    }
  };

  const handleGoogle = () => {
    api.auth.loginWithProvider("google", safeReturnTo());
  };

  if (showOtp) {
    return (
      <AuthLayout
        icon={Mail}
        title="Verify your email"
        subtitle={`We sent a code to ${email}`}
      >
        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}
        <div className="flex justify-center mb-6">
          <InputOTP
            maxLength={6}
            value={otpCode}
            onChange={setOtpCode}
            autoFocus
            autoComplete="one-time-code"
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>
        <Button
          className="auth-submit-button"
          onClick={handleVerify}
          disabled={loading || otpCode.length < 6}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 loading-spinner" />
              Verifying...
            </>
          ) : (
            "Verify"
          )}
        </Button>
        <p className="auth-footer">
          Didn't receive the code?{" "}
          <button
            onClick={handleResend}
            className="auth-footer-link"
          >
            Resend
          </button>
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      icon={UserPlus}
      title="Create your account"
      subtitle="Sign up to get started"
      footer={
        <>
          Already have an account?{" "}
          <Link
            to={
              "/login" +
              (safeReturnTo() !== "/"
                ? "?returnTo=" + encodeURIComponent(safeReturnTo())
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
        <GoogleIcon className="h-5 w-5" />
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
          <label className="form-label">I am registering as</label>
          <div className="role-selector">
            {ROLE_OPTIONS.map((r) => {
              const Icon = r.icon;
              const active = appRole === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setAppRole(r.id)}
                  className={`role-option ${active ? 'role-option-active' : ''}`}
                >
                  <Icon className="role-option-icon" />
                  <span className="role-option-label">{r.label}</span>
                </button>
              );
            })}
          </div>
          <p className="role-description">
            Your dashboard will be tailored to this role
          </p>
        </div>
        <div className="form-group">
          <label htmlFor="email" className="form-label">Email</label>
          <div className="form-input-wrapper">
            <Mail className="h-4 w-4" aria-hidden="true" />
            <input
              id="email"
              type="email"
              autoComplete="email"
              autoFocus
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              required
            />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="password" className="form-label">Password</label>
          <div className="form-input-wrapper">
            <Lock className="h-4 w-4" aria-hidden="true" />
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              required
            />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="confirm" className="form-label">Confirm Password</label>
          <div className="form-input-wrapper">
            <Lock className="h-4 w-4" aria-hidden="true" />
            <input
              id="confirm"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="form-input"
              required
            />
          </div>
        </div>
        <Button
          type="submit"
          className="auth-submit-button"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 loading-spinner" />
              Creating account...
            </>
          ) : (
            "Create account"
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}
