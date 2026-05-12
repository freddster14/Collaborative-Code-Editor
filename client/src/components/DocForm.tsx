import React, { useState } from "react";
import { bodyRequest } from "../api/api-requests";
import { useNavigate, useRevalidator } from "react-router-dom";

export default function DocForm({ folderId, handleClose }: { folderId: number, handleClose: () => void}) {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false)
  const revalidator = useRevalidator();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true)
    try {
      await bodyRequest(`/document/${folderId}`, { name }, "POST");
      revalidator.revalidate()
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