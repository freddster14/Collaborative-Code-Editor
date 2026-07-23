import { NavLink, Outlet } from "react-router-dom";

export default function Documents() {
  return(
    <div>
      <nav className="flex justify-center gap-8 pt-1 pb-6">
        <NavLink
          className={({ isActive }) => `text-sm pb-1 border-b-2 ${isActive ? "text-text-h font-medium border-blue" : "text-text-subtle border-transparent hover:text-text-strong"}`}
          to="/dashboard/documents" end
        >
          My documents
        </NavLink>
        <NavLink
          className={({ isActive }) => `text-sm pb-1 border-b-2 ${isActive ? "text-text-h font-medium border-blue" : "text-text-subtle border-transparent hover:text-text-strong"}`}
          to="/dashboard/documents/recent"
        >
          Recent
        </NavLink>
        <NavLink
          className={({ isActive }) => `text-sm pb-1 border-b-2 ${isActive ? "text-text-h font-medium border-blue" : "text-text-subtle border-transparent hover:text-text-strong"}`}
          to="/dashboard/documents/shared"
        >
          Shared With Me
        </NavLink>
      </nav>
      <Outlet />
    </div>
  )
}