import React, { useEffect, useState } from "react";
import { bodyRequest, getRequest } from "../api/api-requests";
import { AVAILABLE_ROLES } from "../utils/contants";
import { ApiError, Role, type ErrorType, type RoleType, type UserRole } from "@cce/shared-types";
import TransferOwernship from "./TransferOwnership";

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

  if(!data) return <div className="fixed inset-0 bg-black/30"></div>;
  return(
    <div className="fixed inset-0 flex items-center justify-center bg-black/30">
      { addNew
        ? !viewSelected
          ? <div className="bg-bg px-5 py-7 pb-5  relative rounded-md flex flex-col gap-2">
              <div>
                <button className="absolute right-1 -top-2 text-3xl hover:text-text-h" onClick={() => viewRoles(false)}>&times;</button>
                <button className=" flex items-center gap-1 absolute left-2 top-0 text-xl hover:text-text-h" onClick={() => setAddNew(false)}>˂ <span className="text-sm">Back</span></button>
                <div className="py-1 flex gap-1">
                  <input className="p-1 pl-1" type="text" placeholder="bowie_knife99" onChange={(e) => setInput(e.target.value)} value={input} />
                  <button onClick={handleSearch} disabled={isSubmitting}>{isSubmitting ? "Searching..." : "Search"}</button>
                </div>
                <p className="text-red-700">{errors?.main}</p>
              </div>
              <div className="flex flex-col">
                {!searchedUsers ? <div>Start searching</div>
                : searchedUsers.length > 0
                ? <ul className="flex flex-col gap-2">
                    {searchedUsers.map(n => (
                      <li key={n.id} className="flex justify-between items-center gap-2" >
                        <input type="checkbox" onChange={(e) => handleSelect(e, n)} checked={selectedUsers.has(n.id)}  />
                        <p>{n.username}</p>
                      </li>
                    ))}
                </ul>
                : <div>No users, search again</div>
              }
              </div>
              { selectedUsers.size > 0 && <button onClick={() => setViewSelected(true)}>View Selected</button> }
            </div>
          : <div className="bg-bg px-5 py-7 pb-5  relative rounded-md flex gap-2">
              <button className=" flex items-center gap-1 absolute left-2 top-0 text-xl hover:text-text-h" onClick={() => setViewSelected(false)}>˂ <span className="text-sm">Back</span></button>
              <form onSubmit={handleSubmitNew}>
              <ul className="flex flex-col min-w-2xs">
                {Array.from(selectedUsers.entries()).map(([key, value]) => (
                  <li key={key} className="flex justify-between items-center gap-2">
                    <p>{value.username}</p>
                    <select name="roles" id="roles" defaultValue={value.role} onChange={(e) => handleChange(e, key, value)}>
                      {roles.map(r=> (
                        <option value={r} key={r}>{r}</option>
                      ))}  
                    </select> 
                  </li>
                ))}
              </ul>
              <p className="text-red-700">{errors?.main}</p>
              <button type="submit" disabled={isSubmitting}>{isSubmitting ? "Granting..." : "Grant Access"}</button>
              </form>
            </div> 
        : transfer
        ? <TransferOwernship docId={docId} viewTransfer={setTransfer}/>
        : data.size > 0
          ? <div className="bg-bg px-5 py-6 pb-5  relative rounded-md flex gap-2 flex-col">
            <div className="flex gap-3 border-b-1">
              <button className="absolute right-1 -top-2 text-3xl hover:text-text-h" onClick={() => viewRoles(false)}>&times;</button>
              <button className="text-lg text-text-h hover:text-text" onClick={() => setAddNew(true)}>Add Users</button>
              { userRole === Role.OWNER && <button className=" text-lg text-text-h hover:text-text" onClick={() => setTransfer(true)}>Transfer Ownership</button>}
            </div>
            <form onSubmit={handleSubmitUpdate} >
              <ul className="flex flex-col gap-2">
              {Array.from(data.entries()).map(([key, value]) => (
                <li key={key} className="flex justify-between items-center">
                  <p>{value.username}</p>
                  <div className="flex items-center gap-3">
                    <select name="roles" id="roles" defaultValue={value.role} onChange={(e) => handleEdit(e, key, value)}>
                      {roles.map(r=> (
                        <option value={r} key={r}>{r}</option>
                      ))}  
                    </select> 
                    <button type="button" className="text-[32px] text-text-h bg-red-600 border rounded-full p-1 pt-0 hover:bg-transparent " onClick={() => handleDelete(key)} disabled={isRemoving === key}>&times;</button>
                  </div>  
                </li>
              ))}
              </ul>
              <p className="text-red-700">{errors?.main}</p>
              {updatedUsers.size > 0 && <button type="submit" disabled={isSubmitting}>{ isSubmitting ? "Updating..." : "Update"}</button>}
            </form>
          </div> 
        : <div className="bg-bg px-5 py-7 pb-5  relative rounded-md flex gap-2">{userRole === "OWNER" ? "No one has access." : "Nothing to view."} <button onClick={() => setAddNew(true)}>ADD USERS</button>.</div>
      }
    </div>
  )
}
