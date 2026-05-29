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
    <div className="fixed inset-0 flex items-center justify-center bg-black/30">
      <form className="bg-bg px-5 pt-7 pb-6 relative rounded-md flex gap-2" onSubmit={handleEdit}>
        <button className="absolute right-1 -top-2 text-3xl hover:text-text-h" type="button" onClick={() => viewEdit(false)}>&times;</button>
        <input type="text" placeholder="name" value={name} onChange={(e) => setName(e.target.value)} />
        <p className="text-red-700">{error?.main}</p>
        <button className="button" type="submit" disabled={isSubmitting}>{isSubmitting ? "Editing..." : "Edit"}</button>
      </form>
    </div>
   
  )
}