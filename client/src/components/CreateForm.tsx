import React, { useState } from "react";
import { bodyRequest } from "../api/api-requests";
import { useRevalidator } from "react-router-dom";
import { ApiError, type ErrorType } from "@cce/shared-types";

export default function CreateForm({ folderId, handleClose, type }: { folderId: number, handleClose: () => void, type: string}) {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false)
  const revalidator = useRevalidator();
  const [error, setError] = useState<ErrorType | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (name === "") {
      return setError({ main: "Name required" })
    }

    setIsSubmitting(true)
    try {
      if (type === "document") {
        await bodyRequest(`/document/${folderId}`, { name }, "POST");
      } else if (type === "folder"){
        await bodyRequest("/folder", { name, folderId }, "POST");
      }
      setName('');
      revalidator.revalidate();
      handleClose()
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.errors)
      } else {
        setError({"main": "Unknown error try again"})
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30">
      <form onSubmit={handleSubmit} className="bg-bg px-5 py-7 pb-5  relative rounded-md flex gap-2">
        <button className="absolute right-1 -top-2 text-3xl hover:text-text-h" type="button" onClick={handleClose}>&times;</button>
        <input className="p-1 pl-1" type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value) } />
        <p>{error?.main}</p>
        <button className="button" type="submit" disabled={isSubmitting} >{isSubmitting ? "Creating..." : "Create"}</button>
      </form>
    </div>
  )
}