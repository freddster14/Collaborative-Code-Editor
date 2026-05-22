import React, { useState } from "react";
import { useRevalidator } from "react-router-dom";
import { bodyRequest } from "../api/api-requests";
import { ApiError, type ErrorType } from "@cce/shared-types";

export default function EditForm({ docId, value, type, viewEdit }: { docId:number, value:string, type:string, viewEdit: (arg0:boolean) => void}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState(value)
  const [error, setError] = useState<ErrorType | null>(null)
  const revalidator = useRevalidator();

  const handleEdit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setError(null)
    if (name === "") {
      return setError({ main: "name required" }) 
    }
    setIsSubmitting(true);
    try {
      await bodyRequest(`/${type}/${docId}`, { name }, "PUT");
      revalidator.revalidate();
      viewEdit(false)
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.errors)
      } else {
        setError({"main": "Unknown error try again"})
      }
    } finally {
      setIsSubmitting(false);
    }
  }
  return (
    <form onSubmit={handleEdit}>
      <button type="button" onClick={() => viewEdit(false)}>Close</button>
      <p>Edit</p>
      <input type="text" placeholder="name" value={name} onChange={(e) => setName(e.target.value)} />
      <p>{error?.main}</p>
      <button type="submit" disabled={isSubmitting}>{isSubmitting ? "Editing..." : "Edit"}</button>
    </form>
  )
}