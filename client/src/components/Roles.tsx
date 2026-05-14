import React, { useEffect, useState } from "react";
import { bodyRequest, getRequest } from "../api/api-requests";
import { AVAILABLE_ROLES } from "../utils/contants";

export default function Roles({id, viewRoles, userRole}: {id:number, viewRoles: (boolean) => void, userRole:string}) {
  const [data, setData] = useState(null); // Change to Map object to scale on deletion
  const [addNew, setAddNew] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [input, setInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchedUsers, setSearchedUsers] = useState(null); 
  const [selectedUsers, setSelectedUsers] = useState(new Map())
  const [viewSelected, setViewSelected] = useState(false);
  const [isRemoving, setIsRemoving] = useState(null);
  const roles = AVAILABLE_ROLES.slice(AVAILABLE_ROLES.indexOf(userRole) + 1);

  useEffect(() => {
    async function getRoles() {
      try {
        const res = await getRequest(`/document/roles/${id}`)
        setData(res);
      } catch (error) {
        console.error(error)
      }
    }
    getRoles()
  }, [refresh])

  const handleSearch = async () => {
    setIsSubmitting(true);
    try {
      const res = await getRequest(`/user/search/${id}/?search=${input}`)
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

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await bodyRequest(`/document/permission/${id}`, { usersId: [...selectedUsers.keys()], roles: Array.from(selectedUsers.values(), user => user.role)}, "POST")
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

  const handleEdit = async () => {
    try {
      
    } catch (error) {
      console.error(error)
    }
  };

  const handleDelete = async (dataId:number) => {
    setIsRemoving(dataId)
    try {
      await bodyRequest(`/document/${id}/remove/${dataId}`, {}, "DELETE");
      setData(prev => {
        return prev.filter(p => p.id !== dataId)
      })
    } catch (error) {
      console.error(error)
    } finally {
      setIsRemoving(null)
    }
  }

  const handleChange = (e, id, u) => {
    setSelectedUsers(prev => {
      const newData = new Map(prev);
      newData.set(id, { username: u.username, role: e.target.value})
      return newData
    })
    console.log(e.target.value);
    console.log(id)
  }
  console.log(selectedUsers)
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
              <form onSubmit={handleSubmit}>
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
        : data.length > 0
        ? <div>
            <button onClick={() => viewRoles(false)}>Close</button>
            <button onClick={() => setAddNew(true)}>ADD USERS</button>
            <form onSubmit={handleEdit}>
              {data.map(d => (
                <div key={d.id}>
                  <p>{d.user.username}</p>
                  <p>{d.role}</p>
                  <button onClick={() => handleDelete(d.id)} disabled={isRemoving === d.id}>{isRemoving === d.id ? "Removing..." :"Remove"}</button>
                </div>
              ))}
            </form>
          </div> 
          : <div>No user has access <button onClick={() => setAddNew(true)}>ADD USERS</button>.</div>
      }
    </div>
  )
}
