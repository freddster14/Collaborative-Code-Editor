import { useState } from "react";
import { useRevalidator } from "react-router-dom";
import { bodyRequest } from "../api/api-requests";

export default function EditForm({ docId, value, type, viewEdit }: { docId:number, value:string, type:string, viewEdit: (boolean) => void}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [input, setInput] = useState(value)
  const revalidator = useRevalidator();

  const handleEdit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await bodyRequest(`/${type}/${docId}`, { name: input }, "PUT");
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