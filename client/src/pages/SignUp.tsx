import { useState } from "react";
import { bodyRequest } from "../api/api-requests";
import { Link, Navigate, useRevalidator, useRouteLoaderData } from "react-router-dom";
import { ApiError, type ErrorType, type User } from "@cce/shared-types";

export default function SignUp() {
  const user: User | undefined = useRouteLoaderData('user')
  if (user) return <Navigate to='/dashboard'/>

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<null | ErrorType>(null)
  const revalidator = useRevalidator();

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors(null);

    if(validateSignIn(email, username, password, confirm, setErrors)) return;

    setIsSubmitting(true);
    try {
      await bodyRequest("/sign-up", { email, password, confirm, username }, "POST");
      revalidator.revalidate()
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors(err.errors)
      } else {
        setErrors({"main": "Unknown error try again"})
      }
    } finally {
      setIsSubmitting( false)
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-16 animate-fade-up">
      <Link to="/" className="!text-[40px] font-bold text-text-h tracking-tight mb-9">CCE</Link>
      <div className="w-[380px] bg-panel border border-border rounded-2xl px-8 py-9">
        <h1 className="!m-0 !mb-2 !text-[26px]">Sign Up</h1>
        <p className="text-text-subtle text-sm mb-6">Enter your email, username and password to sign up</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-1">
          <label className="input-label">Email</label>
          <input className="input mb-3.5" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          <p className="text-red-500 text-xs">{errors?.email}</p>
          <label className="input-label">Username</label>
          <input className="input mb-3.5" type="text" placeholder="bowie_knife99" value={username} onChange={(e) => setUsername(e.target.value)} />
          <p className="text-red-500 text-xs">{errors?.username}</p>
          <label className="input-label">Password</label>
          <input className="input mb-3.5" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
          <p className="text-red-500 text-xs">{errors?.password}</p>
          <label className="input-label">Confirm Password</label>
          <input className="input mb-5" type="password" placeholder="••••••••" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          <p className="text-red-500 text-xs">{errors?.confirm}</p>
          <p className="text-red-500 text-xs">{errors?.main}</p>
          <button className="btn-primary w-full mt-1.5" type="submit" disabled={isSubmitting}>{isSubmitting ? "Creating Account..." : "Sign Up"}</button>
        </form>
        <p className="text-center text-text-subtle text-[13px] mt-4.5">Already have an account? <Link className="link" to="/sign-in">Sign In</Link></p>
      </div>
    </div>
  );
}

function validateSignIn(email:string, username:string, password:string, confirm:string, setErrors: (arg0:ErrorType) => void) {
  const errors: ErrorType = {}
  const trimmedEmail = email.trim()
  const trimmedUsername = username.trim()
  const trimmedPassword = password.trim()
  const trimmedConfirm = confirm.trim()
  
  if (trimmedEmail === "") {
    errors.email = "Email required"
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    errors.email = "Invalid email"
  }

  if (trimmedUsername === "") {
    errors.username = "Username required"
  } else if (trimmedUsername.length < 4) {
    errors.username = "Username too short"
  } else if (trimmedUsername.includes('@')) {
    errors.username = "Can not contain '@'"
  }

  if (trimmedPassword === "") {
    errors.password = "Password required"
  } else if (trimmedPassword.length < 6) {
    errors.password = "Minimum 6 characters"
  } else if (!/[A-Z]/.test(trimmedPassword)) {
    errors.password = "Uppercase character is needed"
  } else if (!/[\W]/.test(trimmedPassword)) {
    errors.password = "Missing a special character"
  }

  if (trimmedConfirm === "") {
    errors.confirm = "Confirm password"
  } else if (trimmedPassword !== trimmedConfirm) {
    errors.confirm = "Password do not match"
  }

  if (Object.keys(errors).length > 0) {
    setErrors(errors)
    return true
  }

  return false
}