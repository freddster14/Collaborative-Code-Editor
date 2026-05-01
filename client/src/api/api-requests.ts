const API_URL = import.meta.env.MODE === "production" ? '/api' : 'http://localhost:3000';


export const getRequest = async (url: string) => {
  try {
    const res = await fetch(`${API_URL}${url}`, {
      method: "GET",
      credentials: 'include',
      headers: {
        "Content-Type": "application/json",
      },
    });
    if(!res.ok) throw new Error("Get request Error")
      return await res.json()
  } catch (error) {
    throw(error)
  }
 
}; 

export const postRequest = async (url: string, data: any) => {
  try {
    const res = await fetch(`${API_URL}${url}`, {
      method: "POST",
      body: JSON.stringify(data),
      credentials: 'include',
      headers: {
        "Content-Type": "application/json",
      },
    });
    if(!res.ok) throw new Error("Post request Error")
    return await res.json()
  } catch (error) {
    throw(error)
  }
};