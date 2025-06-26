// src/components/PrivateRoute.tsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/auth";

export default function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading auth...</div>;
  return user
    ? <>{children}</>
    : <Navigate to="/login" replace />;
}
