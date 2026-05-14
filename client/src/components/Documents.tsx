import { useEffect, useState } from "react"
import { getRequest } from "../api/api-requests";
import { Link } from "react-router-dom";

export default function Documents() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getDocuments() {
      try {
        const res = await getRequest('/document');
        setDocuments(res)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    getDocuments()
  }, [])
  if(loading) return <div>Loading...</div>
  return(
    <div>
      {documents.length > 0 
      ? documents.map(data => (
        <div key={data.document.id}>
          <Link to={`edit/${data.document.id}`}>{data.document.name}</Link>
        </div>
      ))
      : <div>create a doc</div>
      }
    </div>
  )
}