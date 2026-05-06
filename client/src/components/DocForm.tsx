import React, { useState } from "react";
import { postRequest } from "../api/api-requests";
import { useNavigate } from "react-router-dom";

export default function DocForm({ folderId, handleClose }: { folderId: number, handleClose: () => void}) {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true)
    try {
      console.log("ran")
      const res = await postRequest(`/document/${folderId}`, { name });
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
        <button type="button" onClick={handleClose}>Close</button>
        <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value) } />
        <button type="submit" disabled={isSubmitting} >{isSubmitting ? "Creating..." : "Create"}</button>
      </form>
    </div>
  )
}