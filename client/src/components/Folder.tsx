import { useLoaderData, useNavigate, useParams, useRevalidator } from "react-router-dom";
import { bodyRequest } from "../api/api-requests";
import { useState } from "react";

export default function FolderData() {
  const data = useLoaderData();
  const folderId = Number(useParams().folderId);
  const navigate = useNavigate();
  const [options , setOptions] = useState<string>('')
  const [input, setInput] = useState('');
  const [viewEdit, setViewEdit] = useState(false);
  const [type, setType] = useState<string | null>(null);
  const [id, setId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false)
  const revalidator = useRevalidator();

  const handleDelete = async (id:number, route:string) => {
    setIsDeleting(true)
    try {
      await bodyRequest(`/${route}/${id}`, {}, "DELETE");
      revalidator.revalidate();
    } catch (error) {
      console.error(error)
    } finally {
      setIsDeleting(false)
    }
  }
  const openEdit = (id:number, name:string, type:string) => {
    setId(id)
    setInput(name)
    setViewEdit(true)
    setType(type)
  }

  if (data === null) return <div>Loading...</div>
  return (
    <div>
      {Number.isNaN(folderId)
      ? <div>
        <h1>Projects</h1>
        {data.map(f => (
        <div key={f.id}>
          <p>Folder</p>
          <p onClick={() => navigate(`folder/${f.id}`)}>{f.name}</p>
        </div>
      ))}
      </div> 
      : <div>
        <h1>Folder: {data.name}</h1>
        {data.folders.map(e => (
          <div key={e.id}>
            <p onClick={() => navigate(`/dashboard/folder/${e.id}`)}>Folder: {e.name}</p>
            <button onClick={() => setOptions(`${e.id}-f`)}>Options</button>
            { options === `${e.id}-f` &&
            <div>
              <button onClick={() => openEdit(e.id, e.name, 'folder')}>Edit</button>
              <button onClick={() => handleDelete(e.id, 'folder')} disabled={isDeleting}>{isDeleting ? "Deleting...": "Delete"}</button>
            </div>
            }
          </div>
        ))}
        {data.documents.map(e => (
          <div key={e.id}>
            <p onClick={() => navigate(`/dashboard/edit/${e.id}`)}>Document: {e.name}</p>
            <button onClick={() => setOptions(`${e.id}-d`)}>Options</button>
            { options === `${e.id}-d` &&
              <div>
                <button onClick={() => openEdit(e.id, e.name, 'document')}>Edit</button>
                <button onClick={() => handleDelete(e.id, 'document')}disabled={isDeleting}>{isDeleting ? "Deleting...": "Delete"}</button>
              </div>
            }
          </div>
        ))}
      </div>
      
      }
      { viewEdit && <EditForm id={id} value={input} type={type} viewEdit={setViewEdit}/> }
    </div>
  )
}

function EditForm({ id, value, type, viewEdit }: { id:number, value:string, type:string, viewEdit: (boolean) => void}) {
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