import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { bodyRequest, getRequest } from "../api/api-requests";
import { AVAILABLE_ROLES } from "../utils/contants";
import { ApiError, Role, type ErrorType, type RoleType, type UserRole } from "@cce/shared-types";
import TransferOwernship from "./TransferOwnership";
import { generateColorFromString } from "../utils/generateColor";

export default function Roles({docId, viewRoles, userRole}: {docId:number, viewRoles: (arg0:boolean) => void, userRole:string}) {
  const [data, setData] = useState<null | Map<number, UserRole>>(null); // Change to Map object to scale on change and deletion
  const [addNew, setAddNew] = useState(false);
  const [transfer, setTransfer] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [input, setInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchedUsers, setSearchedUsers] = useState<{ id: number, username: string}[] | null>(null); 
  const [selectedUsers, setSelectedUsers] = useState<Map<number, Omit<UserRole, "userId">>>(new Map());
  const [updatedUsers, setUpdatedUsers] = useState<Map<number, Omit<UserRole, "userId">>>(new Map());
  const [viewSelected, setViewSelected] = useState(false);
  const [isRemoving, setIsRemoving] = useState(0);
  const [errors, setErrors] = useState<ErrorType | null>(null)
  const roles = AVAILABLE_ROLES.slice(AVAILABLE_ROLES.indexOf(userRole) + 1);

  // grab document roles
  useEffect(() => {
    async function getRoles() {
      try {
        const res = await getRequest(`/document/roles/${docId}`)
        const map: Map<number, UserRole> = new Map()
        for(const r of res) {
          map.set(r.id, { userId: r.userId, username: r.user.username, role: r.role})
        }
        setData(map);
      } catch (error) {
        if (error instanceof ApiError) {
          setErrors(error.errors)
        } else {
          setErrors({ main: "Unknown error occured" })
        }
      }
    }
    getRoles()
  }, [refresh])

  const handleSearch = async () => {
    setErrors(null)
    if (input === "") {
      return setErrors({ main: "Enter a username" })
    }
    setIsSubmitting(true);

    try {
      const res = await getRequest(`/user/search/${docId}?search=${input}`)
      setSearchedUsers(res)
    } catch (error) {
      if (error instanceof ApiError) {
        setErrors(error.errors)
      } else {
        setErrors({ main: "Unknown error occured" })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSelect = (e:React.ChangeEvent<HTMLInputElement>, n:{username:string, id:number}) => {
    setSelectedUsers(prev => {
      const newUsers = new Map(prev);
      if (e.target.checked) {
        newUsers.set(n.id, {username: n.username, role: "VIEW"})
      } else {
        newUsers.delete(n.id)
      }
      return newUsers
    })
  }

  // changes selected users' roles
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>, id:number, u:{username:string}) => {
    setSelectedUsers(prev => {
      const newData = new Map(prev);
      newData.set(id, { username: u.username, role: e.target.value as RoleType})
      return newData
    })
  }

  // submits new users to add
  const handleSubmitNew = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setErrors(null)
    const body = {
      usersId: [...selectedUsers.keys()],
      roles: Array.from(selectedUsers.values(), user => user.role)
    };

    if (body.usersId.length !== body.roles.length) {
      return setErrors({ main: "Error occured, refresh and try again" })
    }
    setIsSubmitting(true)
    try {
      await bodyRequest(`/document/permission/${docId}`, body, "POST")
      setAddNew(false);
      setViewSelected(false);
      setSearchedUsers(null);
      setSelectedUsers(new Map());
      setRefresh(prev => prev + 1);
    } catch (error) {
      if (error instanceof ApiError) {
        setErrors(error.errors)
      } else {
        setErrors({ main: "Unknown error occured try again"})
      }
    } finally {
      setIsSubmitting(false)
    }
  }
  // edits current users' roles
  const handleEdit = (e:React.ChangeEvent<HTMLSelectElement>, id:number, u: UserRole) => {
      setUpdatedUsers(prev => {
        const newData = new Map(prev);
        if (data && data.get(id)?.role === e.target.value) {
          newData.delete(u.userId)
        } else {
          newData.set(u.userId, { username: u.username, role: e.target.value as RoleType})
        }
        return newData
      })
  };

  const handleSubmitUpdate = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    setErrors(null)
    const body = {
      usersId: [...updatedUsers.keys()],
      roles: Array.from(updatedUsers.values(), user => user.role)
    };
    if (body.usersId.length !== body.roles.length) {
      return setErrors({ main: "Error occured, refresh and try again" })
    }

    setIsSubmitting(true)
    try {
      await bodyRequest(`/document/roles/${docId}`, body , "PUT")
      setUpdatedUsers(new Map());
      setRefresh(prev => prev + 1);
    } catch (error) {
      if (error instanceof ApiError) {
        setErrors(error.errors)
      } else {
        setErrors({ main: "Unknown error occured try again"})
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (dataId:number) => {
    setErrors(null)
    setIsRemoving(dataId)
    const prev = data;
    setData(prev => {
      const newData = new Map(prev);
      newData.delete(dataId);
      return newData;
    })
    try {
      await bodyRequest(`/document/${docId}/remove/${dataId}`, {}, "DELETE");
    } catch (error) {
      setData(prev)
      if (error instanceof ApiError) {
        setErrors(error.errors)
      } else {
        setErrors({ main: "Unknown error occured try again"})
      }
    } finally {
      setIsRemoving(0)
    }
  }

  if(!data) return createPortal(<div className="modal-overlay"></div>, document.body);
  return createPortal(
    <div className="modal-overlay">
      { addNew
        ? !viewSelected
          ? <div className="modal-panel w-[400px] flex flex-col gap-3">
              <div>
                <button className="modal-close" onClick={() => viewRoles(false)}>&times;</button>
                <button className="flex items-center gap-1 text-text-subtle hover:text-text-h text-sm mb-3" onClick={() => setAddNew(false)}>˂ <span>Back</span></button>
                <div className="flex gap-2">
                  <input className="input" type="text" placeholder="bowie_knife99" onChange={(e) => setInput(e.target.value)} value={input} />
                  <button className="btn shrink-0" onClick={handleSearch} disabled={isSubmitting}>{isSubmitting ? "Searching..." : "Search"}</button>
                </div>
                <p className="text-red-500 text-xs mt-1">{errors?.main}</p>
              </div>
              <div className="flex flex-col">
                {!searchedUsers ? <div className="text-text-subtle text-sm text-center py-4">Start searching</div>
                : searchedUsers.length > 0
                ? <ul className="flex flex-col gap-2">
                    {searchedUsers.map(n => (
                      <li key={n.id} className="flex items-center gap-3 bg-input border border-border rounded-[9px] px-3 py-2" >
                        <input type="checkbox" onChange={(e) => handleSelect(e, n)} checked={selectedUsers.has(n.id)}  />
                        <div className="avatar-sm" style={{ background: generateColorFromString(n.username) }}>{n.username[0]?.toUpperCase()}</div>
                        <p className="text-text-strong text-sm">{n.username}</p>
                      </li>
                    ))}
                </ul>
                : <div className="text-text-subtle text-sm text-center py-4">No users, search again</div>
              }
              </div>
              { selectedUsers.size > 0 && <button className="btn-primary" onClick={() => setViewSelected(true)}>View Selected</button> }
            </div>
          : <div className="modal-panel w-[400px] flex flex-col gap-3">
              <button className="flex items-center gap-1 text-text-subtle hover:text-text-h text-sm mb-1" onClick={() => setViewSelected(false)}>˂ <span>Back</span></button>
              <form onSubmit={handleSubmitNew} className="flex flex-col gap-3">
              <ul className="flex flex-col gap-2 min-w-2xs">
                {Array.from(selectedUsers.entries()).map(([key, value]) => (
                  <li key={key} className="flex justify-between items-center gap-2 bg-input border border-border rounded-[9px] px-3 py-2">
                    <div className="flex items-center gap-3">
                      <div className="avatar-sm" style={{ background: generateColorFromString(value.username) }}>{value.username[0]?.toUpperCase()}</div>
                      <p className="text-text-strong text-sm">{value.username}</p>
                    </div>
                    <select className="input-select" name="roles" id="roles" defaultValue={value.role} onChange={(e) => handleChange(e, key, value)}>
                      {roles.map(r=> (
                        <option value={r} key={r}>{r}</option>
                      ))}
                    </select>
                  </li>
                ))}
              </ul>
              <p className="text-red-500 text-xs">{errors?.main}</p>
              <button className="btn-primary" type="submit" disabled={isSubmitting}>{isSubmitting ? "Granting..." : "Grant Access"}</button>
              </form>
            </div>
        : transfer
        ? <TransferOwernship docId={docId} viewTransfer={setTransfer}/>
        : data.size > 0
          ? <div className="modal-panel w-[400px] flex flex-col gap-4">
            <div className="flex items-center gap-4 border-b border-border pb-3">
              <button className="modal-close" onClick={() => viewRoles(false)}>&times;</button>
              <button className="text-[15px] font-bold text-text-h" onClick={() => setAddNew(true)}>Add Users</button>
              { userRole === Role.OWNER && <button className="text-[15px] text-text-subtle hover:text-text-h" onClick={() => setTransfer(true)}>Transfer Ownership</button>}
            </div>
            <form onSubmit={handleSubmitUpdate} className="flex flex-col gap-3">
              <ul className="flex flex-col gap-2.5">
              {Array.from(data.entries()).map(([key, value]) => (
                <li key={key} className="flex justify-between items-center bg-input border border-border rounded-[9px] px-3 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="avatar-sm" style={{ background: generateColorFromString(value.username) }}>{value.username[0]?.toUpperCase()}</div>
                    <p className="text-text-strong text-sm">{value.username}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select className="input-select" name="roles" id="roles" defaultValue={value.role} onChange={(e) => handleEdit(e, key, value)}>
                      {roles.map(r=> (
                        <option value={r} key={r}>{r}</option>
                      ))}
                    </select>
                    <button type="button" className="avatar-remove" onClick={() => handleDelete(key)} disabled={isRemoving === key}>&times;</button>
                  </div>
                </li>
              ))}
              </ul>
              <p className="text-red-500 text-xs">{errors?.main}</p>
              {updatedUsers.size > 0 && <button className="btn-primary" type="submit" disabled={isSubmitting}>{ isSubmitting ? "Updating..." : "Update"}</button>}
            </form>
          </div>
        : <div className="modal-panel w-[400px] flex items-center gap-2 text-text-subtle text-sm">{userRole === "OWNER" ? "No one has access." : "Nothing to view."} <button className="link" onClick={() => setAddNew(true)}>ADD USERS</button>.</div>
      }
    </div>,
    document.body
  )
}
