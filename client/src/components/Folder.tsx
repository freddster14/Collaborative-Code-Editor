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
        {data.projects.map(f => (
        <div key={f.id}>
          <p>Folder</p>
          <p onClick={() => navigate(`folder/${f.id}`)}>{f.name}</p>
        </div>
      ))}
      </div> 
  
      : <div>
        <h1>Folder: {data.folder.name}</h1>
        {data.childFolders.map(c => (
          <div key={c.id}>
          <p onClick={() => navigate(`folder/${c.id}`)}>Folder: {c.name}</p>
          </div>
        ))}
        {data.folder.documents.map(d => (
          <div key={d.id}>
            <p onClick={() => navigate(`/dashboard/edit/${d.id}`)}>Document: {d.name}</p>
          </div>
        ))}
      </div>
      
      }
    </div>
  )
}