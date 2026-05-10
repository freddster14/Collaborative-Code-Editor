import { Outlet, useLocation } from "react-router-dom"
import Nav from "../components/Nav"

function Home() {
  const location = useLocation();
  const signInPage = location.pathname.includes('sign-in');
  const signUpPage = location.pathname.includes('sign-up');
  return (
    <>
      { !signInPage && !signUpPage && <Nav /> }
      <Outlet />
    </>
  )
}

export default Home
