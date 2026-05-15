import { useState } from "react"
import { useLoaderData, useNavigate } from "react-router-dom";
import { PRIVILED_ROLES } from "../utils/contants";
import Options from "../components/Options";

export default function RecentDocuments() {
  const documents = useLoaderData();
  const navigate = useNavigate();
  const [options , setOptions] = useState<string>('');

  return(
    <div>
      {documents.map(d => (
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