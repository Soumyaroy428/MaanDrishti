import React, { useState, useEffect } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { api } from "@/lib/api-client";
import {
  LayoutDashboard,
  Scale,
  FileText,
  ClipboardCheck,
  Award,
  MapPin,
  BarChart3,
  Shield,
  Menu,
  X,
  LogOut,
  ScanLine,
  MessageSquareWarning,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ChatWidget from "@/components/chat/ChatWidget";

const ROLES = [
  { id: "business", label: "Business", icon: Scale },
  { id: "inspector", label: "Inspector", icon: ClipboardCheck },
  { id: "admin", label: "Govt. Admin", icon: Shield },
  { id: "citizen", label: "Citizen", icon: ScanLine },
];

const NAV = {
  business: [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/instruments", label: "My Instruments", icon: Scale },
    { to: "/applications", label: "Applications", icon: FileText },
    { to: "/certificates", label: "Certificates", icon: Award },
  ],
  inspector: [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/inspections", label: "Inspection Queue", icon: ClipboardCheck },
    { to: "/instruments", label: "Instruments", icon: Scale },
  ],
  admin: [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/applications", label: "Applications", icon: FileText },
    { to: "/inspections", label: "Inspections", icon: ClipboardCheck },
    { to: "/certificates", label: "Certificates", icon: Award },
    { to: "/complaints", label: "Complaints", icon: MessageSquareWarning },
    { to: "/analytics", label: "Analytics", icon: BarChart3 },
    { to: "/rules", label: "Tolerance Rules", icon: Settings },
  ],
  citizen: [
    { to: "/", label: "Verify", icon: ScanLine },
    { to: "/complaints", label: "Report Issue", icon: MessageSquareWarning },
  ],
};

export default function Layout() {
  const [role, setRole] = useState(
    () => localStorage.getItem("mv_role") || "business",
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    localStorage.setItem("mv_role", role);
    setSidebarOpen(false);
  }, [role]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    api.auth
      .me()
      .then((u) => {
        setUser(u);
        if (u?.app_role && !localStorage.getItem("mv_role_synced")) {
          localStorage.setItem("mv_role_synced", "1");
          setRole(u.app_role);
        }
      })
      .catch(() => setUser(null));
  }, []);

  const nav = NAV[role] || NAV.business;

  const handleLogout = async () => {
    localStorage.removeItem("mv_role_synced");
    localStorage.removeItem("mv_role");
    await api.auth.logout();
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile header */}
      <header className="lg:hidden sticky top-0 z-40 glass border-b border-border">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Scale className="h-4 w-4" />
            </div>
            <span className="font-bold text-foreground">MaanVerify</span>
          </div>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -mr-2 text-foreground"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </header>

      {/* Sidebar - desktop */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-40 w-64 flex-col border-r border-border bg-card">
        <SidebarContent
          role={role}
          setRole={setRole}
          nav={nav}
          user={user}
          onLogout={handleLogout}
        />
      </aside>

      {/* Sidebar - mobile drawer */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85%] bg-card shadow-xl flex flex-col animate-in slide-in-from-left">
            <div className="flex items-center justify-between px-4 h-14 border-b border-border">
              <span className="font-bold">Menu</span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 -mr-2"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <SidebarContent
              role={role}
              setRole={setRole}
              nav={nav}
              user={user}
              onLogout={handleLogout}
            />
          </aside>
        </div>
      )}

      {/* Main content */}
      <main className="lg:pl-64">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet context={{ role, setRole }} />
        </div>
      </main>
      <ChatWidget />
    </div>
  );
}

function SidebarContent({ role, setRole, nav, user, onLogout }) {
  const location = useLocation();
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="hidden lg:flex items-center gap-2.5 px-5 h-16 border-b border-border">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
          <Scale className="h-5 w-5" />
        </div>
        <div>
          <p className="font-bold text-foreground leading-tight">MaanVerify</p>
          <p className="text-[10px] text-muted-foreground leading-tight">
            Verification Platform
          </p>
        </div>
      </div>

      {/* Role switcher */}
      <div className="p-3 border-b border-border">
        <p className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          View as
        </p>
        <div className="grid grid-cols-2 gap-1.5">
          {ROLES.map((r) => {
            const Icon = r.icon;
            return (
              <button
                key={r.id}
                onClick={() => setRole(r.id)}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors",
                  role === r.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{r.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5 scrollbar-hide">
        {nav.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <Icon className="shrink-0" style={{ width: 18, height: 18 }} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="border-t border-border p-3">
        {user && (
          <div className="mb-2 px-2">
            <p className="text-sm font-medium text-foreground truncate">
              {user.full_name || user.email}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user.email}
            </p>
          </div>
        )}
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-rose-50 hover:text-rose-600 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  );
}
