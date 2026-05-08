import { useParams } from "react-router-dom";
import DocForm from "./DocForm";
import { useState } from "react";
import FolderForm from "./FolderForm";

export default function CreateForms() {
  const folderId = Number(useParams().folderId);
  const [viewDoc, setViewDoc] = useState(false);
  const [viewFolder, setViewFolder] = useState(false);
  const dashboardPage = Number.isNaN(folderId)

  return (
    <div>
      {!dashboardPage && 
      <div>
        { !viewDoc
          ? <button onClick={() => setViewDoc(true)}>Create Document</button>
          : <DocForm folderId={folderId} handleClose={() => setViewDoc(false)}/>
        }
      </div>  
      }
     
      <div>
        { !viewFolder
          ? <button onClick={() => setViewFolder(true)}>{dashboardPage ? "Create Project" :"Create Folder"}</button>
          : viewFolder && <FolderForm parentId={folderId} handleClose={() => setViewFolder(false)}/>
        }
      </div>  
      
    </div>
  )
}