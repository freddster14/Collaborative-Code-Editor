import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return(
    <nav className="flex justify-evenly text-2xl text-text-h">
      <NavLink className={({ isActive }) => isActive ? "underline" : "" } to="/dashboard" end>
        Projects
      </NavLink>
      <NavLink className={({ isActive }) => isActive ? "underline" : "" } to="/dashboard/documents">
        Documents
      </NavLink>
    </nav>
  )
}