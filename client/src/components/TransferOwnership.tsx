import { useEffect, useState } from "react"
import { bodyRequest, getRequest } from "../api/api-requests"
import { ApiError, type Admin, type ErrorType } from "@cce/shared-types";
import { useRevalidator } from "react-router-dom";

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
  if (!admins) return <div>Loading...</div>

  return(
    <div className="bg-bg px-5 pb-5 pt-3  relative rounded-md flex gap-2 flex-col">
      <p className="text-text-h text-lg">Tranfer Ownership to Admin</p>
    {admins.length > 0
      ? <ul className="flex flex-col gap-2 min-w-2xs">
        {admins.map(a => (
          <li key={a.id} className="flex justify-between items-center ">
            <p>{a.user.username}</p>
            <div className="flex gap-2">
              <p>{a.role}</p>
              <button onClick={() => transfer(a.id)} disabled={isTransferring}>{isTransferring ? "Tranferring..." : "Transfer"}</button>
            </div>
            
          </li>
        ))}
      </ul> 
      : <p>No Admins to transfer, <button onClick={() => viewTransfer(false)}>promote</button></p>
    }
    <p className="text-red-700">{errors?.main}</p>
    <button onClick={() => viewTransfer(false)}>Cancel</button>
    </div>
  )
}