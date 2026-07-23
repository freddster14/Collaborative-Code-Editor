import { useState } from "react";
import { bodyRequest } from "../api/api-requests";
import { Link, Navigate, useRevalidator, useRouteLoaderData } from "react-router-dom";
import { ApiError, type ErrorType, type User } from "@cce/shared-types";

export default function SignIn() {
  const user: User | undefined = useRouteLoaderData('user')
  if (user) return <Navigate to='/dashboard'/>

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<null | ErrorType>(null)
  const revalidator = useRevalidator();

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors(null)

    const err:ErrorType = {}
    if (identifier === "") {
      err.identifier = "Email or Username required";
    }
    if (password === "") {
      err.password = "Password required";
    }
    if(Object.keys(err).length > 0) {
      setErrors(err)
      return;
    }

    setIsSubmitting(true)
    try {
      await bodyRequest("/sign-in", { identifier, password }, "POST");
      revalidator.revalidate()
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors(err.errors)
      } else {
        setErrors({"main": "Unknown error try again"})
      }
    } finally {
      setIsSubmitting(false)
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-16 animate-fade-up">
      <Link to="/" className="!m-0 !text-[22px] font-bold text-text-h mb-7">CCE</Link>
      <div className="w-[380px] bg-panel border border-border rounded-2xl px-8 py-9">
        <h1 className="!m-0 !mb-2 !text-[26px]">Sign In</h1>
        <p className="text-text-subtle text-sm mb-6">Enter your email or username and password to sign in</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-1">
          <label className="input-label">Email or Username</label>
          <input className="input mb-3.5" type="text" placeholder="you@example.com or username" value={identifier} onChange={(e) => setIdentifier(e.target.value)} />
          <p className="text-red-500 text-xs">{errors?.identifier}</p>
          <label className="input-label">Password</label>
          <input className="input mb-3.5" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
          <p className="text-red-500 text-xs">{errors?.password}</p>
          <p className="text-red-500 text-xs">{errors?.main}</p>
          <button className="btn-primary w-full mt-1.5" type="submit" disabled={isSubmitting}>{isSubmitting ? "Signing in..." : "Sign In"}</button>
        </form>
        <p className="text-center text-text-subtle text-[13px] mt-4.5">Don't have an account? <Link className="link" to="/sign-up">Create Account</Link></p>
      </div>
    </div>
  );
}