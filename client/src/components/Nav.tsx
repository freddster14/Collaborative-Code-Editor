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
      <div>
        <h1 onClick={() => navigate('/dashboard')}>Dashboard</h1>
        <p>Welcome to your dashboard</p>
        <p>Username: {user?.username}</p>
        <button onClick={handleLogout}>Log off</button>
      </div>
      : user ?
      <div className="flex">
        <h1>CCE</h1>
        <p>Go to your dashboard</p>
        <button><Link to='/dashboard'>Dashboard</Link></button>
      </div>
       : <div>
        <h1>CCE</h1>
        <button><Link to='/sign-in'>Sign In</Link></button>
        <button><Link to='/sign-up'>Sign Up</Link></button>
       </div>
      }
      
    </div>
  )
}