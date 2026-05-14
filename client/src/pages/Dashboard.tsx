import { Navigate, Outlet, useRouteLoaderData } from "react-router-dom";
import CreateForms from "../components/CreateForms";

export default function Dashboard() {
  const user = useRouteLoaderData('user');
  if (!user) return <Navigate to='/'/>
  return (
    <>
      <CreateForms />
      <Outlet />
    </>
  );
}