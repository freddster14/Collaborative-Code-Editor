import { NavLink, Outlet } from "react-router-dom";

export default function Documents() {
  return(
    <div>
      <nav className="flex justify-evenly pt-3 text-lg">
        <NavLink className={({ isActive }) => isActive ? "underline" : "" } to="/dashboard/documents" end>
          My documents
        </NavLink>
        <NavLink className={({ isActive }) => isActive ? "underline" : "" } to="/dashboard/documents/recent">
          Recent
        </NavLink>
        <NavLink className={({ isActive }) => isActive ? "underline" : "" } to="/dashboard/documents/shared">
          Shared With Me
        </NavLink>
      </nav>
      <Outlet />
    </div>
  )
}