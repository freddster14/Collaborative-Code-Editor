import { useLocation, useParams } from "react-router-dom";
import { useState } from "react";
import CreateForm from "./CreateForm";

export default function CreateForms() {
  const folderId = Number(useParams().folderId);
  const [viewDoc, setViewDoc] = useState(false);
  const [viewFolder, setViewFolder] = useState(false);
  const dashboardPage = Number.isNaN(folderId);
  const location = useLocation();
  const documentPage  = location.pathname.includes('document');
  
  const handleView = (type:string) => {
    if (type === "document") {
      setViewDoc(true)
      setViewFolder(false)
    } else {
      setViewDoc(false)
      setViewFolder(true)
    }
  }

  return (
    <div>
   
      {!dashboardPage && !documentPage &&
      <div>
        { !viewDoc
          ? <button onClick={() => handleView("document")}>Create Document</button>
          : <CreateForm folderId={folderId} handleClose={() => setViewDoc(false)} type="document"/>
        }
      </div>  
      }
     { !documentPage &&
      <div>
        { !viewFolder
          ? <button onClick={() => handleView("folder")}>{dashboardPage ? "Create Project" :"Create Folder"}</button>
          : viewFolder && <CreateForm folderId={folderId} handleClose={() => setViewFolder(false)} type="folder"/>
        }
      </div>
     }
    </div>
  )
}