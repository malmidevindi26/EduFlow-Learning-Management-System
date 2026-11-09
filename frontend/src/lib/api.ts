import axios from "axios";
import { config } from "process";
import { InputValidationError, validatePayload } from "./sanitize";
import { error } from "console";

export const TOKEN_KEY = 'eduflow_token'

export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
})

// automatically attach jwt to every req
api.interceptors.request.use((config) => {

  const isForm = typeof FormData !== 'undefined' && config.data instanceof FormData
  if(config.data && !isForm) validatePayload(config.data)

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
 (res) => res,
 (error) => {
    if(axios.isAxiosError(error) && error.response?.status === 401 && typeof window !== 'undefined'){
      const url = error.config?.url ?? ''
      const isAuthCall = url.includes('/auth/')
      if(isAuthCall && localStorage.getItem(TOKEN_KEY)){
        localStorage.removeItem(TOKEN_KEY)
        window.location.href = '/login?expired=1'
      }
    }
    return Promise.reject(error)
 }
)

export function getErrorMessage(error: unknown): string{
    if(error instanceof InputValidationError) return error.message

    if(axios.isAxiosError<{ message?: string | string[] }>(error)){
        if(!error.response) return 'Connot reach the server'
        const message = error.response.data?.message
        if(Array.isArray(message)) return message.join(', ')
        if(typeof message === 'string') return message
    }
    return 'Something went wrong'
}