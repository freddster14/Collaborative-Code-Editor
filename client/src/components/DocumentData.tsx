import { useState } from "react"
import { useLoaderData, useNavigate } from "react-router-dom";
import { PRIVILED_ROLES } from "../utils/contants";
import Options from "./Options";
import type { DocumentData } from "../types/document";

export default function DocumentData() {
  const data: DocumentData[] = useLoaderData();
  const navigate = useNavigate();
  const [options , setOptions] = useState<string>('');

  return(
    <div>
      {data.map(d => (
        <div key={d.id}>
          <p onClick={() => navigate(`/dashboard/edit/${d.document.id}`)}>Document: {d.document.name}</p>
          { PRIVILED_ROLES.includes(d.role) && 
          <div>
            <button onClick={() => setOptions(`${d.id}-d`)}>Options</button>
            { options === `${d.id}-d` && <Options data={d.document} dataType={"document"} role={d.role}/> }
          </div>
          }
        </div>
      ))}
    </div>
  )
}