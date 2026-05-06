import { Outlet } from "react-router-dom";
import { ProtectedRoutes } from "../routes/protected-routes";
import Nav from "../components/Nav";
import CreateForms from "../components/CreateForms";

export default function Dashboard() {
  return (
    <ProtectedRoutes>
      <Nav />
      <CreateForms />
      <Outlet />
    </ProtectedRoutes>
  );
}