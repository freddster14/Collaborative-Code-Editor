import { useEffect, useState } from "react"
import { bodyRequest, getRequest } from "../api/api-requests"
import { ApiError, type Admin, type ErrorType } from "@cce/shared-types";
import { useRevalidator } from "react-router-dom";
import { generateColorFromString } from "../utils/generateColor";

export default function TransferOwernship({docId, viewTransfer}: {docId:number, viewTransfer: (arg0:boolean) => void}) {
  const [admins, setAdmins] = useState<null | Admin[]>(null);
  const [isTransferring, setIsTransferring] = useState(false)
  const [errors, setErrors] = useState<ErrorType | null>(null);
  const revalidator = useRevalidator()

  useEffect(() => {
    async function getAdmins() {
      try {
        const res = await getRequest(`/document/admins/${docId}`);
        setAdmins(res);
      } catch (error) {
        if (error instanceof ApiError) {
          setErrors(error.errors)
        } else {
          setErrors({"main": "Unknown error try again"})
        }
      }
    }
    getAdmins()
  }, [])

  const transfer = async (id:number) => {
    setErrors(null)
    setIsTransferring(true)
    try {
      await bodyRequest(`/document/transfer/${docId}`, { id }, "PUT")
      revalidator.revalidate()
    } catch (error) {
      if (error instanceof ApiError) {
        setErrors(error.errors)
      } else {
        setErrors({"main": "Unknown error try again"})
      }
    } finally {
      setIsTransferring(false)
    }
  }
  if (!admins) return <div className="modal-panel w-[400px] text-text-subtle text-sm">Loading...</div>

  return(
    <div className="modal-panel w-[400px] flex flex-col gap-3">
      <p className="text-text-h text-[15px] font-bold">Tranfer Ownership to Admin</p>
    {admins.length > 0
      ? <ul className="flex flex-col gap-2 min-w-2xs">
        {admins.map(a => (
          <li key={a.id} className="flex justify-between items-center bg-input border border-border rounded-[9px] px-3 py-2">
            <div className="flex items-center gap-2.5">
              <div className="avatar-sm" style={{ background: generateColorFromString(a.user.username) }}>{a.user.username[0]?.toUpperCase()}</div>
              <p className="text-text-strong text-sm">{a.user.username}</p>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="pill">{a.role}</span>
              <button className="btn !text-xs !py-1.5 !px-3" onClick={() => transfer(a.id)} disabled={isTransferring}>{isTransferring ? "Tranferring..." : "Transfer"}</button>
            </div>

          </li>
        ))}
      </ul>
      : <p className="text-text-subtle text-sm">No Admins to transfer, <button className="link" onClick={() => viewTransfer(false)}>promote</button></p>
    }
    <p className="text-red-500 text-xs">{errors?.main}</p>
    <button className="btn" onClick={() => viewTransfer(false)}>Cancel</button>
    </div>
  )
}