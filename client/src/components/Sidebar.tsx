import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return(
    <nav className="flex justify-center gap-10 py-5">
      <NavLink
        className={({ isActive }) => `text-[15px] font-semibold pb-1.5 border-b-2 ${isActive ? "text-text-h border-blue" : "text-text-subtle border-transparent hover:text-text-strong"}`}
        to="/dashboard" end
      >
        Projects
      </NavLink>
      <NavLink
        className={({ isActive }) => `text-[15px] font-semibold pb-1.5 border-b-2 ${isActive ? "text-text-h border-blue" : "text-text-subtle border-transparent hover:text-text-strong"}`}
        to="/dashboard/documents"
      >
        Documents
      </NavLink>
    </nav>
  )
}