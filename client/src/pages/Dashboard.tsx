import { Outlet } from "react-router-dom";
import CreateForms from "../components/CreateForms";

export default function Dashboard() {
  return (
    <>
      <CreateForms />
      <Outlet />
    </>
  );
}