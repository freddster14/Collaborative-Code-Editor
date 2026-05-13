import { useState } from "react";
import { useRevalidator } from "react-router-dom";
import { bodyRequest } from "../api/api-requests";

export default function EditForm({ id, value, type, viewEdit }: { id:number, value:string, type:string, viewEdit: (boolean) => void}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [input, setInput] = useState(value)
  const revalidator = useRevalidator();

  const handleEdit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await bodyRequest(`/${type}/${id}`, { name: input }, "PUT");
      revalidator.revalidate()
    } catch (error) {
      console.error(error)
    } finally {
      setIsSubmitting(false);
      viewEdit(false)
    }
  }
  return (
    <form onSubmit={handleEdit}>
      <p>Edit</p>
      <input type="text" placeholder="name" value={input} onChange={(e) => setInput(e.target.value)} />
      <button type="submit" disabled={isSubmitting}>{isSubmitting ? "Editing..." : "Edit"}</button>
    </form>
  )
}