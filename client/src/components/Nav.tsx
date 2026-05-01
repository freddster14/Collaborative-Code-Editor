import { useUser } from "../context/user"

export default function Nav() {
  const { user } = useUser()
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome to your dashboard</p>
      <p>Username: {user?.username}</p>
    </div>
  )
}