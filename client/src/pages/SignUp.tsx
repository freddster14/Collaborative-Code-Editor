import { useState } from "react";
import { bodyRequest } from "../api/api-requests";
import { Link, Navigate, useNavigate, useRouteLoaderData } from "react-router-dom";
import type { User } from "../types/user";

export default function SignIn() {
  const user: User = useRouteLoaderData('user')
  if (user) return <Navigate to='/dashboard'/>

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true)
    try {
      await bodyRequest("/sign-up", { email, password, confirm, username }, "POST");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting( false)
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div>
        <h1>Sign Up</h1>
        <p>Enter your email, username and password to sign up</p>
        <p>Already have a account? <Link to="/sign-in">Sign In</Link></p>
      </div>
      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="username" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <input type="password" placeholder="Confirm Password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        <button type="submit" disabled={isSubmitting}>{isSubmitting ? "Creating Account..." : "Sign Up"}</button>
      </form>
    </div>
  );
}