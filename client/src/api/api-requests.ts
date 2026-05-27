import { ApiError } from "@cce/shared-types";

const API_URL = import.meta.env.MODE === "production" ? '/api' : import.meta.env.PORT !== undefined ? `http://localhost:${import.meta.env.PORT}` : 'http://localhost:3000';

export const getRequest = async (url: string) => {
  try {
    const res = await fetch(`${API_URL}${url}`, {
      method: "GET",
      credentials: 'include',
      headers: {
        "Content-Type": "application/json",
      },
    });
    const resData = await res.json();
    if(!res.ok) throw new ApiError("Get request Error", res.status, resData)
    return resData;
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
    if(res.status === 204) return res;

    const resData = await res.json();
    if(!res.ok) throw new ApiError(`${method} request Error`, res.status, resData)
    return resData;
  } catch (error) {
    throw(error)
  }
};

export const getUser = async (url:string) => {
  try {
    return await getRequest(url)
  } catch (error) {
    return null
  }
}
