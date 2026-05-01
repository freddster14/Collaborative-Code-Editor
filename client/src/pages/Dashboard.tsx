import { Outlet } from "react-router-dom";
import { ProtectedRoutes } from "../routes/protected-routes";
import Nav from "../components/Nav";

export default function Dashboard() {
  return (
    <ProtectedRoutes>
      <Nav />
      <Outlet />
    </ProtectedRoutes>
  );
}