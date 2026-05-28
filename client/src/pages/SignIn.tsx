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
    <div className="flex flex-col items-center justify-center h-screen">
      <div>
      <h1>Sign In</h1>
      <p>Enter your email or username and password to sign in</p>
      <p>Don't have a account? <Link to="/sign-up">Create Account</Link></p>
      </div>
      <form onSubmit={handleSubmit}>
        <input type="identifier" placeholder="Email or Username" value={identifier} onChange={(e) => setIdentifier(e.target.value)} />
        <p>{errors?.identifier}</p>
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <p>{errors?.password}</p>
        <p>{errors?.main}</p>
        <button type="submit"  disabled={isSubmitting}>{isSubmitting? "Signing in..." : "Sign In"}</button>
      </form>
    </div>
  );
}