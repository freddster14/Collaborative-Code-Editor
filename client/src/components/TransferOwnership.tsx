import { useEffect, useState } from "react"
import { bodyRequest, getRequest } from "../api/api-requests"
import type { Admin } from "@cce/shared-types";

export default function TransferOwernship({docId, viewTransfer}: {docId:number, viewTransfer: (arg0:boolean) => void}) {
  const [admins, setAdmins] = useState<null | Admin[]>(null);
  const [isTransferring, setIsTransferring] = useState(0)

  useEffect(() => {
    async function getAdmins() {
      try {
        const res = await getRequest(`/document/admins/${docId}`);
        setAdmins(res);
      } catch (error) {
        console.error(error)
      }
    }
    getAdmins()
  }, [])

  const transfer = async (id:number) => {
    setIsTransferring(id)
    try {
      await bodyRequest(`/document/transfer/${docId}`, { id }, "PUT")
    } catch (error) {
      console.error(error)
    } finally {
      setIsTransferring(0)
    }
  }
  if (!admins) return <div>Loading...</div>

  return(
    <div>
    {admins.map(a => (
      <div key={a.id}>
        <p>{a.user.username}</p>
        <p>{a.role}</p>
        <button onClick={() => transfer(a.id)} disabled={isTransferring !== null}>{isTransferring === a.id ? "Tranferring..." : "Transfer"}</button>
      </div>
    ))}
    <button onClick={() => viewTransfer(false)}>Cancel</button>
    </div>
  )
}