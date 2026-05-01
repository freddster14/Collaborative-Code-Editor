import { useState } from "react";
import { postRequest } from "../api/api-requests";
import { useNavigate } from "react-router-dom";

export default function DocForm({ folderId }: { folderId: number }) {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const res = await postRequest("/doc", { name, folderId });
      navigate(`/dashboard/edit/${res.id}`)
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false)
    }
  };
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value) } />
        <button type="submit" disabled={isSubmitting} onClick={() => setIsSubmitting(prev => !prev)}>{isSubmitting ? "Creating..." : "Create"}</button>
      </form>
    </div>
  )
}