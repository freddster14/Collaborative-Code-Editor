import { useState } from "react";
import { bodyRequest } from "../api/api-requests";
import { Link, Navigate, useNavigate, useRouteLoaderData } from "react-router-dom";
import type { User } from "@cce/shared-types";

export default function SignIn() {
  const user: User | undefined = useRouteLoaderData('user')
  if (user) return <Navigate to='/dashboard'/>

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true)
    try {
      await bodyRequest("/sign-in", { identifier, password }, "POST");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false)
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div>
      <h1>Sign In</h1>
      <p>Enter your email or username and password to sign in</p>
      <p>Don't have a account? <Link to="/sign-up">Create Account</Link></p>
      </div>
      <form onSubmit={handleSubmit}>
        <input type="identifier" placeholder="Email or Username" value={identifier} onChange={(e) => setIdentifier(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit"  disabled={isSubmitting}>{isSubmitting? "Signing in..." : "Sign In"}</button>
      </form>
    </div>
  );
}