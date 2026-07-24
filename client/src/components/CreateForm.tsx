import React, { useState } from "react";
import { createPortal } from "react-dom";
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

  return createPortal(
    <div className="modal-overlay">
      <form onSubmit={handleSubmit} className="modal-panel w-[340px] flex flex-col gap-3">
        <button className="modal-close" type="button" onClick={handleClose}>&times;</button>
        <input className="input" type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value) } />
        <p className="text-red-500 text-xs">{error?.main}</p>
        <button className="btn-primary w-full" type="submit" disabled={isSubmitting} >{isSubmitting ? "Creating..." : "Create"}</button>
      </form>
    </div>,
    document.body
  )
}