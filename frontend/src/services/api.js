import axios from "axios"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

// Create a configured axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
})

// Add a request interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network errors
    if (!error.response) {
      console.error("Network Error:", error.message)
      return Promise.reject(new Error("Network error. Please check your connection."))
    }

    // Handle API errors
    const { status, data } = error.response

    switch (status) {
      case 404:
        console.error("Resource not found:", data)
        return Promise.reject(new Error(data.error || "Resource not found"))
      case 429:
        console.error("Rate limit exceeded:", data)
        return Promise.reject(new Error("Too many requests. Please try again later."))
      case 500:
        console.error("Server error:", data)
        return Promise.reject(new Error("Server error. Please try again later."))
      default:
        console.error(`Error ${status}:`, data)
        return Promise.reject(error)
    }
  },
)

export default api
