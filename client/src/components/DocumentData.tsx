import { useState } from "react"
import { useLoaderData, useNavigate } from "react-router-dom";
import { PRIVILED_ROLES, ROLE_COLORS } from "../utils/contants";
import Options from "./Options";
import type { DocumentData } from "@cce/shared-types";

export default function DocumentData() {
  const data: DocumentData[] = useLoaderData();
  const navigate = useNavigate();
  const [options , setOptions] = useState<string>('');

  return(
    <div className="max-w-[640px] mx-auto flex flex-col gap-2.5 py-2">
      {data.map(d => (
        <div key={d.id} className="card !p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-block w-2 h-2 rounded-full shrink-0" style={{ background: ROLE_COLORS[d.role] }}></span>
            <p className="text-text-strong text-[14.5px] cursor-pointer" onClick={() => navigate(`/dashboard/edit/${d.document.id}`)}>{d.document.name}</p>
          </div>
          <div className="flex items-center gap-3.5 relative">
            <span className="pill">{d.role}</span>
            { PRIVILED_ROLES.includes(d.role) &&
            <>
              <button className="btn !text-xs !py-1.5 !px-3" onClick={() => setOptions(`${d.id}-d`)}>Options</button>
              { options === `${d.id}-d` && <Options data={d.document} dataType={"document"} role={d.role} setOptions={setOptions}/> }
            </>
            }
          </div>
        </div>
      ))}
    </div>
  )
}