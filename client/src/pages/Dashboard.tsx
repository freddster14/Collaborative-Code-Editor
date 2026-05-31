import { Navigate, Outlet, useRouteLoaderData } from "react-router-dom";
import CreateForms from "../components/CreateForms";
import Sidebar from "../components/Sidebar";

export default function Dashboard() {
  const user = useRouteLoaderData('user');
  if (!user) return <Navigate to='/'/>
  return (
    <>
      <Sidebar />
      <CreateForms />
      <Outlet />
    </>
  );
}