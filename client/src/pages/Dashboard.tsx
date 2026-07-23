import { Navigate, Outlet, useRouteLoaderData } from "react-router-dom";
import CreateForms from "../components/CreateForms";
import Sidebar from "../components/Sidebar";

export default function Dashboard() {
  const user = useRouteLoaderData('user');
  if (!user) return <Navigate to='/'/>
  return (
    <div className="max-w-[1120px] w-full mx-auto px-6 box-border relative animate-fade-up">
      <Sidebar />
      <CreateForms />
      <Outlet />
    </div>
  );
}