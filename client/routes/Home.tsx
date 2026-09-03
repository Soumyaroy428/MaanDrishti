import React from "react";
import { useOutletContext } from "react-router-dom";
import BusinessDashboard from "@/components/dashboards/BusinessDashboard";
import InspectorDashboard from "@/components/dashboards/InspectorDashboard";
import AdminDashboard from "@/components/dashboards/AdminDashboard";
import CitizenDashboard from "@/components/dashboards/CitizenDashboard";

export default function Home() {
  const { role } = useOutletContext();
  if (role === "inspector") return <InspectorDashboard />;
  if (role === "admin") return <AdminDashboard />;
  if (role === "citizen") return <CitizenDashboard />;
  return <BusinessDashboard />;
}
