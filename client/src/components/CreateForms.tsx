import { useLocation, useParams } from "react-router-dom";
import { useState } from "react";
import CreateForm from "./CreateForm";

export default function CreateForms() {
  const folderId = Number(useParams().folderId);
  const [viewDoc, setViewDoc] = useState(false);
  const [viewFolder, setViewFolder] = useState(false);
  const dashboardPage = Number.isNaN(folderId);
  const location = useLocation();
  const documentPage  = location.pathname.includes('document') || location.pathname.includes('edit');
  
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
    <div className="absolute bottom-5 right-5 flex gap-3">
      {!dashboardPage && !documentPage &&
      <div>
        { !viewDoc
          ? <button className="btn-primary fab-blue" onClick={() => handleView("document")}>+ Document</button>
          : <CreateForm folderId={folderId} handleClose={() => setViewDoc(false)} type="document"/>
        }
      </div>
      }
     { !documentPage &&
      <div>
        { !viewFolder
          ? <button  className="btn-success fab-green" onClick={() => handleView("folder")}>+ {dashboardPage ? "Project" :"Folder"}</button>
          : viewFolder && <CreateForm folderId={folderId} handleClose={() => setViewFolder(false)} type="folder"/>
        }
      </div>
     }
    </div>
  )
}