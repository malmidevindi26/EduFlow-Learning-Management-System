import axios from "axios";
import { config } from "process";

export const TOKEN_KEY = 'eduflow_token'

export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
})

// automatically attach jwt to every req
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function getErrorMessage(error: unknown): string{
    if(axios.isAxiosError<{ message?: string | string[] }>(error)){
        if(!error.response) return 'Connot reach the server'
        const message = error.response.data?.message
        if(Array.isArray(message)) return message.join(', ')
        if(typeof message === 'string') return message
    }
    return 'Something went wrong'
}