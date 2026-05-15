import { useLoaderData, useNavigate, useParams, useRevalidator } from "react-router-dom";
import { bodyRequest } from "../api/api-requests";
import { useState } from "react";
import Roles from "./Roles";
import EditForm from "./EditForm";
import { PRIVILED_ROLES } from "../utils/contants";

export default function FolderData() {
  const data = useLoaderData();
  const folderId = Number(useParams().folderId);
  const navigate = useNavigate();
  const [options , setOptions] = useState<string>('')
  const [input, setInput] = useState('');
  const [viewEdit, setViewEdit] = useState(false);
  const [viewRoles, setViewRoles] = useState(false);
  const [type, setType] = useState<string | null>(null);
  const [id, setId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
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
    setViewRoles(false)
    setId(id)
    setInput(name)
    setViewEdit(true)
    setType(type)
  }

  const openRoles = (id:number) => {
    setViewEdit(false)
    setId(id)
    setViewRoles(true);
  }

  if (!data) return <div>Loading...</div>
  return (
    <div>
      {Number.isNaN(folderId)
      ? <div>
        <h1>Projects</h1>
        {data.length > 0 ? data.map(f => (
        <div key={f.id}>
          <p>Project</p>
          <p onClick={() => navigate(`folder/${f.id}`)}>{f.name}</p>
          <button onClick={() => setOptions(`${f.id}-f`)}>Options</button>
          { options === `${f.id}-f` &&
            <div>
              <button onClick={() => openEdit(f.id, f.name, 'folder')}>Edit</button>
              <button onClick={() => handleDelete(f.id, 'folder')} disabled={isDeleting}>{isDeleting ? "Deleting...": "Delete"}</button>
            </div>
            }
        </div>
      ))
      : <div>No projects start a new one</div>
      }
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
            { PRIVILED_ROLES.includes(e.users[0]?.role) && 
            <div>
              <button onClick={() => setOptions(`${e.id}-d`)}>Options</button>
              { options === `${e.id}-d` &&
                <div>
                  <button onClick={() => openEdit(e.id, e.name, 'document')}>Edit</button>
                  <button onClick={() => openRoles(e.id)}>Roles</button>
                  <button onClick={() => handleDelete(e.id, 'document')}disabled={isDeleting}>{isDeleting ? "Deleting...": "Delete"}</button>
                </div>
              }
            </div>
            }
          </div>
        ))}
        </div>
      }
      { viewRoles && <Roles key={id} docId={id} viewRoles={setViewRoles} userRole={"OWNER"}/>}
      { viewEdit && <EditForm key={id} docId={id} value={input} type={type} viewEdit={setViewEdit}/> }
    </div>
  )
}