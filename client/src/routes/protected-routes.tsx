import { Navigate } from "react-router-dom";
import { useUser } from "../context/user";
import type React from "react";

export const ProtectedRoutes = ({ children }: { children: React.ReactNode}) => {
  const { user, loading } = useUser();
  if(loading) return <div>Loading...</div>
  if (!user) {
    return <Navigate to="/sign-in" replace={true} />;
  }

  return (children);
};