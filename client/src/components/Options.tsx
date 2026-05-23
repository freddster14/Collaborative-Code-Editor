import { useState } from "react";
import { bodyRequest } from "../api/api-requests";
import { useRevalidator } from "react-router-dom";
import Roles from "./Roles";
import EditForm from "./EditForm";
import { ApiError, Role, type ErrorType, type FolderLoad, type ProjectData } from "@cce/shared-types";
import type { Document } from "@cce/shared-types";

export default function Options({ data, dataType, role }: {data:FolderLoad | ProjectData | Document, dataType:string, role:string}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [input, setInput] = useState('');
  const [viewEdit, setViewEdit] = useState(false);
  const [viewRoles, setViewRoles] = useState(false);
  const [type, setType] = useState<string>(dataType);
  const [id, setId] = useState<number | null>(null);
  const [errors, setErrors] = useState<ErrorType | null>(null)
  const revalidator = useRevalidator()

  const handleDelete = async (id:number, route:string) => {
    setErrors(null)
    setIsDeleting(true)
    try {
      await bodyRequest(`/${route}/${id}`, {}, "DELETE");
      revalidator.revalidate();
    } catch (error) {
      if (error instanceof ApiError) {
        setErrors(error.errors)
      } else {
        setErrors({"main": "Unknown error try again"})
      }
    } finally {
      setIsDeleting(false)
    }
  }
  const openEdit = (id:number, name:string, type:string) => {
    setViewRoles(false);
    setErrors(null)
    setId(id)
    setInput(name)
    setViewEdit(true)
    setType(type)
  }

  const openRoles = (id:number) => {
    setErrors(null)
    setViewEdit(false)
    setId(id)
    setViewRoles(true);
  }

// remove delete if user is not owner
  return (
    <>
      <div>
        <button onClick={() => openEdit(data.id, data.name, type)}>Edit</button>
        { type !== 'folder' && <button onClick={() => openRoles(data.id)}>Roles</button> }
        { role === Role.OWNER && <button onClick={() => handleDelete(data.id, type)}disabled={isDeleting}>{isDeleting ? "Deleting...": "Delete"}</button> }
      </div>
      { viewRoles && id && <Roles key={id} docId={id} viewRoles={setViewRoles} userRole={role}/>}
      { viewEdit && id && <EditForm key={id} docId={id} value={input} type={type} viewEdit={setViewEdit}/> }
      <p>{errors?.main}</p>
    </>
  )
}