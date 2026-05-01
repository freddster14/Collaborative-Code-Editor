import { useUser } from "../context/user";
import { ProtectedRoutes } from "../routes/protected-routes";

export default function Dashboard() {
  const { user } = useUser();
  return (
    <ProtectedRoutes>
    <div>
        <h1>Dashboard</h1>
        <p>Welcome to your dashboard</p>
        <p>Username: {user?.username}</p>
      </div>
    </ProtectedRoutes>
  );
}