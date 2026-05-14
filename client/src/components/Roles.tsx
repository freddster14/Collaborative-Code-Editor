import React, { useEffect, useState } from "react";
import { bodyRequest, getRequest } from "../api/api-requests";
import { AVAILABLE_ROLES } from "../utils/contants";
import type { UserRole } from "../types/user";

export default function Roles({docId, viewRoles, userRole}: {docId:number, viewRoles: (boolean) => void, userRole:string}) {
  const [data, setData] = useState(null); // Change to Map object to scale on change and deletion
  const [addNew, setAddNew] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [input, setInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchedUsers, setSearchedUsers] = useState(null); 
  const [selectedUsers, setSelectedUsers] = useState(new Map());
  const [updatedUsers, setUpdatedUsers] = useState(new Map());
  const [viewSelected, setViewSelected] = useState(false);
  const [isRemoving, setIsRemoving] = useState(null);
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
        console.error(error)
      }
    }
    getRoles()
  }, [refresh])

  const handleSearch = async () => {
    setIsSubmitting(true);
    try {
      const res = await getRequest(`/user/search/${docId}/?search=${input}`)
      setSearchedUsers(res)
    } catch (error) {
      console.error(error)
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
      newData.set(id, { username: u.username, role: e.target.value})
      return newData
    })
  }

  // submits new users to add
  const handleSubmitNew = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const body = {
        usersId: [...selectedUsers.keys()],
        roles: Array.from(selectedUsers.values(), user => user.role)
      };
      await bodyRequest(`/document/permission/${docId}`, body, "POST")
      setAddNew(false);
      setViewSelected(false);
      setSearchedUsers(null);
      setSelectedUsers(new Map());
      setRefresh(prev => prev + 1);
    } catch (error) {
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }
  // edits current users' roles
  const handleEdit = (e:React.ChangeEvent<HTMLSelectElement>, id:number, u) => {
      setUpdatedUsers(prev => {
        const newData = new Map(prev);
        if (data.get(id).role === e.target.value) {
          newData.delete(u.userId)
        } else {
          newData.set(u.userId, { username: u.username, role: e.target.value})
        }
        return newData
      })
  };

  const handleSubmitUpdate = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const body = {
        usersId: [...updatedUsers.keys()],
        roles: Array.from(updatedUsers.values(), user => user.role)
      };
      await bodyRequest(`/document/roles/${docId}`, body , "PUT")
      setUpdatedUsers(new Map());
      setRefresh(prev => prev + 1);
    } catch (error) {
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (dataId:number) => {
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
      console.error(error)
    } finally {
      setIsRemoving(null)
    }
  }

  if(!data) return <div>Loading...</div>

  return(
    <div>
      {
        addNew
        ? !viewSelected
          ? <div>
              <div>
                <button onClick={() => viewRoles(false)}>Close</button>
                <button onClick={() => setAddNew(false)}>Back</button>
                <input type="text" placeholder="add new users" onChange={(e) => setInput(e.target.value)} value={input} />
                <button onClick={handleSearch} disabled={isSubmitting}>{isSubmitting ? "Searching..." : "Search"}</button>
              </div>
              <div>
                {!searchedUsers ? <div>Start searching</div>
                : searchedUsers.length > 0
                ? searchedUsers.map(n => (
                    <div key={n.id}>
                      <input type="checkbox" onChange={(e) => handleSelect(e, n)} checked={selectedUsers.has(n.id)}  />
                      <p>{n.username}</p>
                    </div>
                  ))
                : <div>No users, search again</div>
              }
              </div>
              <button onClick={() => setViewSelected(true)}>View Selected</button>
            </div>
          : <div>
              <button onClick={() => setViewSelected(false)}>Back</button>
              <form onSubmit={handleSubmitNew}>
              <ul>
                {Array.from(selectedUsers.entries()).map(([key, value]) => (
                  <li key={key}>
                    <p>{value.username}</p>
                    <select name="roles" id="roles" defaultValue={value.role} onChange={(e) => handleChange(e, key, value)}>
                      {roles.map(r=> (
                        <option value={r} key={r}>{r}</option>
                      ))}  
                    </select> 
                  </li>
                ))}
              </ul>
              <button type="submit" disabled={isSubmitting}>{isSubmitting ? "Granting..." : "Grant Access"}</button>
              </form>
              
            </div> 
        : data.size > 0
        ? <div>
            <button onClick={() => viewRoles(false)}>Close</button>
            <button onClick={() => setAddNew(true)}>ADD USERS</button>
            <form onSubmit={handleSubmitUpdate}>
              <ul>
              {Array.from(data.entries()).map(([key, value]) => (
                <li key={key}>
                  <p>{value.username}</p>
                  <p>{value.role}</p>
                  <select name="roles" id="roles" defaultValue={value.role} onChange={(e) => handleEdit(e, key, value)}>
                      {roles.map(r=> (
                        <option value={r} key={r}>{r}</option>
                      ))}  
                  </select> 
                  <button type="button" onClick={() => handleDelete(key)} disabled={isRemoving === key}>{isRemoving === key ? "Removing..." :"Remove"}</button>
                </li>
              ))}
              </ul>
              {updatedUsers.size > 0 && <button type="submit" disabled={isSubmitting}>{ isSubmitting ? "Updating..." : "Update"}</button>}
            </form>
          </div> 
        : <div>No user has access <button onClick={() => setAddNew(true)}>ADD USERS</button>.</div>
      }
    </div>
  )
}
