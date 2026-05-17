import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return(
    <nav>
      <NavLink to="/dashboard">Projects</NavLink>
      <NavLink to="/dashboard/documents">Documents</NavLink>
    </nav>
  )
}