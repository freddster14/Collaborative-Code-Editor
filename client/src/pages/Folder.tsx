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
    <>
      { Number.isNaN(folderId) && Array.isArray(data)
      ? <div className="flex gap-5 p-4">
        { data.length > 0
        ? data.map(f => (
          <div key={f.id} className="flex bg-border border-1 p-5 rounded-md flex-col hover:bg-bg transition-all duration-300">
            <p>Project</p>
            <div className="flex items-center justify-center">
              <p className="cursor-pointer" onClick={() => navigate(`folder/${f.id}`)}>{f.name}</p>
              <div className="relative">
                <button className="text-lg px-2" onClick={() => setOptions(`${f.id}-f`)}>⋮</button>
                { options === `${f.id}-f` && <Options data={f} dataType={"folder"} role={"OWNER"} setOptions={setOptions}/> }
              </div>
            </div>
          </div>
          ))
        : <div>No projects start a new one</div>
        }
        </div> 
      : !Array.isArray(data) && <div>
        <h1>{data.name}</h1>
        {data.folders.length === 0 && data.documents.length === 0
        ?
          <div>Start creating folders or documents</div>
        : <div className="flex gap-5 p-4">
            {data.folders.map(e => (
            <div key={e.id} className="flex bg-border border-1 p-5 rounded-md flex-col hover:bg-bg transition-all duration-300">
              <p>Folder</p>
              <div className="flex items-center justify-center">
                <p className="cursor-pointer" onClick={() => navigate(`/dashboard/folder/${e.id}`)}>{e.name}</p>
                <div className="relative">
                  <button className="text-lg px-2" onClick={() => setOptions(`${e.id}-f`)}>⋮</button>
                  { options === `${e.id}-f` && <Options data={e} dataType={"folder"} role={"OWNER"} setOptions={setOptions}/> }
                </div>
              </div>
            </div>
            ))}
            {data.documents.map(e => (
            <div key={e.id} className="flex bg-border border-1 p-5 rounded-md flex-col hover:bg-bg transition-all duration-300">
              <p>Document</p>
              <div className="flex items-center justify-center">
                <p className="cursor-pointer" onClick={() => navigate(`/dashboard/edit/${e.id}`)}>{e.name}</p>
                { PRIVILED_ROLES.includes(e.users[0]?.role) && 
                  <div className="relative">
                    <button className="text-lg px-2" onClick={() => setOptions(`${e.id}-d`)}>⋮</button>
                    { options === `${e.id}-d` && <Options data={e} dataType={"document"} role={e.users[0].role} setOptions={setOptions}/> }
                  </div>
                }
              </div>
            </div>
            ))}
          </div>
        }
        </div>
      }
    </>
  )
}