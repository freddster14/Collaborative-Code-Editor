import { useEffect, useRef, useState } from "react";
import { bodyRequest } from "../api/api-requests";
import { useRevalidator } from "react-router-dom";
import Roles from "./Roles";
import EditForm from "./EditForm";
import { ApiError, Role, type ErrorType, type FolderLoad, type ProjectData } from "@cce/shared-types";
import type { Document } from "@cce/shared-types";

export default function Options({ data, dataType, role, setOptions }: {data:FolderLoad | ProjectData | Document, dataType:string, role:string, setOptions: (arg0:string) => void}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [input, setInput] = useState('');
  const [viewEdit, setViewEdit] = useState(false);
  const [viewRoles, setViewRoles] = useState(false);
  const [type, setType] = useState<string>(dataType);
  const [id, setId] = useState<number | null>(null);
  const [errors, setErrors] = useState<ErrorType | null>(null)
  const optionsRef = useRef<HTMLDivElement>(null)
  const revalidator = useRevalidator()

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      // If the ref exists and the clicked element is NOT inside the ref
      if (optionsRef.current && !optionsRef.current.contains(event.target as Node)) {
        setOptions("");
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [optionsRef]);

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
    {!viewRoles && !viewEdit &&
       <div className="menu-panel absolute right-0 top-7 z-10 min-w-[130px]" ref={optionsRef}>
       <button className="menu-item" onClick={() => openEdit(data.id, data.name, type)}>Edit</button>
       { type !== 'folder' && <button className="menu-item" onClick={() => openRoles(data.id)}>Roles</button> }
       { role === Role.OWNER && <button className="menu-item !text-red-500" onClick={() => handleDelete(data.id, type)}disabled={isDeleting}>{isDeleting ? "Deleting...": "Delete"}</button> }
     </div>
    }
      { viewRoles && id && <Roles key={id} docId={id} viewRoles={setViewRoles} userRole={role}/>}
      { viewEdit && id && <EditForm key={id} docId={id} value={input} type={type} viewEdit={setViewEdit}/> }
      <p className="text-red-500 text-xs">{errors?.main}</p>
    </>
  )
}