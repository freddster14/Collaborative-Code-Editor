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
    <div className="w-full sticky top-0 z-50 bg-bg/90 backdrop-blur border-b border-border">
      {location.pathname.includes('dashboard') ?
      <div className="nav max-w-[1120px] mx-auto w-full px-6 py-5">
        <h1 className="!m-0 !text-[20px] cursor-pointer" onClick={() => navigate('/dashboard')}>Dashboard</h1>
        <div className="flex gap-4 items-center">
          <p className="text-text-strong text-sm font-semibold">{user?.username}</p>
          <button className="btn" onClick={handleLogout}>Log off</button>
        </div>
      </div>
      : user ?
      <div className="nav max-w-[1120px] mx-auto w-full px-6 py-5">
        <h1 className="!m-0 !text-[20px]">CCE</h1>
        <p className="text-text text-sm">Go to your dashboard</p>
        <button className="btn-primary"><Link to='/dashboard'>Dashboard</Link></button>
      </div>
       : <div className="nav max-w-[1120px] mx-auto w-full px-6 py-5">
        <h1 className="!m-0 !text-[20px]">CCE</h1>
        <div className="flex gap-2.5">
          <button className="btn"><Link to='/sign-in'>Sign In</Link></button>
          <button className="btn-primary"><Link to='/sign-up'>Sign Up</Link></button>
        </div>

       </div>
      }

    </div>
  )
}