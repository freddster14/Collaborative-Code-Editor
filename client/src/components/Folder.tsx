import { useLoaderData, useNavigate, useParams } from "react-router-dom";

export default function FolderData() {
  const data = useLoaderData();
  const folderId = Number(useParams().folderId);
  const navigate = useNavigate()

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
          </div>
        ))}
        {data.documents.map(e => (
          <div key={e.id}>
            <p onClick={() => navigate(`/dashboard/edit/${e.id}`)}>Document: {e.name}</p>
          </div>
        ))}
      </div>
      
      }
    </div>
  )
}