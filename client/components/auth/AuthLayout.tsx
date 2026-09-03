import React from "react";
import "@/styles/auth.css";

export default function AuthLayout({
  title,
  subtitle,
  footer,
  children,
}) {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">
            {title}
          </h1>
          {subtitle && (
            <p className="auth-subtitle">
              {subtitle}
            </p>
          )}
        </div>

        <div className="mt-4">{children}</div>

        {footer && (
          <p className="auth-footer">
            {footer}
          </p>
        )}
      </div>
    </div>
  );
}
