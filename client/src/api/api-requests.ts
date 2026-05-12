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

export const bodyRequest = async (url: string, data: any, method: string) => {
  try {
    const res = await fetch(`${API_URL}${url}`, {
      method,
      body: JSON.stringify(data),
      credentials: 'include',
      headers: {
        "Content-Type": "application/json",
      },
    });
    if(!res.ok) throw new Error("Post request Error")
    if(res.status === 204) return res;
    return await res.json();
  } catch (error) {
    throw(error)
  }
};
