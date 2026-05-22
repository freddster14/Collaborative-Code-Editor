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
        console.log(folderId)
        await bodyRequest("/folder", { name, folderId }, "POST");
      }
      setName('');
      revalidator.revalidate();
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
    <div>
      <form onSubmit={handleSubmit}>
        <button type="button" onClick={handleClose}>Close</button>
        <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value) } />
        <p>{error?.main}</p>
        <button type="submit" disabled={isSubmitting} >{isSubmitting ? "Creating..." : "Create"}</button>
      </form>
    </div>
  )
}