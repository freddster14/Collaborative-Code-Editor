import { Link, useLocation, useNavigate, useRevalidator, useRouteLoaderData } from "react-router-dom"
import { bodyRequest } from "../api/api-requests";

export default function Nav() {
  const location = useLocation();
  const user = useRouteLoaderData('user');
  const revalidator = useRevalidator();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    try {
      await bodyRequest('/logout', {}, "POST");
      revalidator.revalidate();
    } catch (error) {
      console.error(error)
    }
  }

  return ( 
    <div>
      {location.pathname.includes('dashboard') ? 
      <div className="nav">
        <h1 onClick={() => navigate('/dashboard')}>Dashboard</h1>
        <div className="flex gap-2 items-center">
          <p className="font-bold p-3">{user?.username}</p>
          <button className="button" onClick={handleLogout}>Log off</button>
        </div>
      </div>
      : user ?
      <div className="nav">
        <h1>CCE</h1>
        <p>Go to your dashboard</p>
        <button className="button"><Link to='/dashboard'>Dashboard</Link></button>
      </div>
       : <div className="nav">
        <h1>CCE</h1>
        <div className="flex gap-2">
          <button className="button"><Link to='/sign-in'>Sign In</Link></button>
          <button className="button"><Link to='/sign-up'>Sign Up</Link></button>
        </div>
        
       </div>
      }
      
    </div>
  )
}