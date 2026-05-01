import { useState } from "react";
import { postRequest } from "../api/api-requests";
import { useUser } from "../context/user";
import { Link, useNavigate } from "react-router-dom";

export default function SignIn() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const { setUser } = useUser();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const res = await postRequest("/api/sign-in", { identifier, password });
      setUser(res);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
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
        <button type="submit">Sign In</button>
      </form>
    </div>
  );
}