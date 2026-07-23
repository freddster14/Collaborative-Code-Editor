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
      ? <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4 py-2">
        { data.length > 0
        ? data.map(f => (
          <div key={f.id} className="card relative">
            <div className="label-green text-[11px] tracking-[.06em] font-bold uppercase mb-2.5">Project</div>
            <div className="flex items-center justify-between">
              <p className="text-text-strong text-[15px] cursor-pointer" onClick={() => navigate(`folder/${f.id}`)}>{f.name}</p>
              <div className="relative">
                <button className="text-lg px-1 text-text-subtle hover:text-text-h" onClick={() => setOptions(`${f.id}-f`)}>⋮</button>
                { options === `${f.id}-f` && <Options data={f} dataType={"folder"} role={"OWNER"} setOptions={setOptions}/> }
              </div>
            </div>
          </div>
          ))
        : <div className="text-text-subtle text-sm">No projects start a new one</div>
        }
        </div>
      : !Array.isArray(data) && <div>
        <h2 className="text-center !text-[20px] my-5">{data.name}</h2>
        {data.folders.length === 0 && data.documents.length === 0
        ?
          <div className="text-text-subtle text-sm text-center py-6">Start creating folders or documents</div>
        : <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4 py-2">
            {data.folders.map(e => (
            <div key={e.id} className="card relative">
              <div className="label-green text-[11px] tracking-[.06em] font-bold uppercase mb-2.5">Folder</div>
              <div className="flex items-center justify-between">
                <p className="text-text-strong text-[15px] cursor-pointer" onClick={() => navigate(`/dashboard/folder/${e.id}`)}>{e.name}</p>
                <div className="relative">
                  <button className="text-lg px-1 text-text-subtle hover:text-text-h" onClick={() => setOptions(`${e.id}-f`)}>⋮</button>
                  { options === `${e.id}-f` && <Options data={e} dataType={"folder"} role={"OWNER"} setOptions={setOptions}/> }
                </div>
              </div>
            </div>
            ))}
            {data.documents.map(e => (
            <div key={e.id} className="card relative">
              <div className="label-blue text-[11px] tracking-[.06em] font-bold uppercase mb-2.5">Document</div>
              <div className="flex items-center justify-between">
                <p className="text-text-strong text-[15px] cursor-pointer" onClick={() => navigate(`/dashboard/edit/${e.id}`)}>{e.name}</p>
                { PRIVILED_ROLES.includes(e.users[0]?.role) &&
                  <div className="relative">
                    <button className="text-lg px-1 text-text-subtle hover:text-text-h" onClick={() => setOptions(`${e.id}-d`)}>⋮</button>
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