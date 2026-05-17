import { NavLink, Outlet } from "react-router-dom";

export default function Documents() {
  return(
    <div>
      <h1>Documents</h1>
      <nav>
        <NavLink to="/dashboard/documents">My documents</NavLink>
        <NavLink to="/dashboard/documents/recent">Recent</NavLink>
        <NavLink to="/dashboard/documents/shared">Shared With Me</NavLink>
      </nav>
      <Outlet />
    </div>
  )
}