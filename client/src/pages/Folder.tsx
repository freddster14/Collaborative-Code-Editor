import { useLoaderData, useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { PRIVILED_ROLES } from "../utils/contants";
import Options from "../components/Options";
import type { FolderLoad, ProjectData } from "@cce/shared-types";

export default function FolderData() {
  const data: FolderLoad | ProjectData[] = useLoaderData();
  const folderId = Number(useParams().folderId);
  const navigate = useNavigate();
  const [options, setOptions] = useState<string>('')

  return (
    <div>
      { Number.isNaN(folderId) && Array.isArray(data)
      ? <div>
        <h1>Projects</h1>
        { data.length > 0
        ? data.map(f => (
          <div key={f.id}>
            <p>Project</p>
            <p onClick={() => navigate(`folder/${f.id}`)}>{f.name}</p>
            <button onClick={() => setOptions(`${f.id}-f`)}>Options</button>
            { options === `${f.id}-f` && <Options data={f} dataType={"folder"} role={"OWNER"}/> }
          </div>
          ))
        : <div>No projects start a new one</div>
        }
        </div> 
      : !Array.isArray(data) && <div>
        <h1>Folder: {data.name}</h1>
        {data.folders.length === 0 && data.documents.length === 0
        ?
          <div>Start creating folders or documents</div>
        : <div>
            {data.folders.map(e => (
            <div key={e.id}>
              <p onClick={() => navigate(`/dashboard/folder/${e.id}`)}>Folder: {e.name}</p>
              <button onClick={() => setOptions(`${e.id}-f`)}>Options</button>
              { options === `${e.id}-f` && <Options data={e} dataType={"folder"} role={"OWNER"}/> }
            </div>
            ))}
            {data.documents.map(e => (
            <div key={e.id}>
              <p onClick={() => navigate(`/dashboard/edit/${e.id}`)}>Document: {e.name}</p>
              { PRIVILED_ROLES.includes(e.users[0]?.role) && 
                <div>
                  <button onClick={() => setOptions(`${e.id}-d`)}>Options</button>
                  { options === `${e.id}-d` && <Options data={e} dataType={"document"} role={e.users[0].role}/> }
                </div>
              }
            </div>
            ))}
          </div>
        }
        </div>
      }
    </div>
  )
}