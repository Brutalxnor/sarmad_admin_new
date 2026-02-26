import axios from 'axios'

//export const API_BASE_URL = 'http://localhost:4000/api/v1'
export const API_BASE_URL = "https://sarmad-be.vercel.app/api/v1";



// Axios automatically detects the content type:
// - If data is an object, it sends as application/json
// - If data is FormData, it sends as multipart/form-data correctly
export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
})

// Request interceptor (add auth token later)
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('admin_token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

interface FailedRequest {
    resolve: (token: string | null) => void
    reject: (error: any) => void
}

let isRefreshing = false
let failedQueue: FailedRequest[] = []

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error)
        } else {
            prom.resolve(token)
        }
    })
    failedQueue = []
}

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config
        const isAuthRequest = originalRequest.url?.includes('/login') || originalRequest.url?.includes('/refresh-token')

        if (error.response?.status === 401 && !isAuthRequest && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject })
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`
                        return apiClient(originalRequest)
                    })
                    .catch((err) => Promise.reject(err))
            }

            originalRequest._retry = true
            isRefreshing = true

            const refreshToken = localStorage.getItem('admin_refresh_token')
            if (refreshToken) {
                try {
                    const response = await axios.post(`${API_BASE_URL}/staff-auth/refresh-token`, { refreshToken })

                    if (response.data.success && response.data.data?.session?.access_token) {
                        const newToken = response.data.data.session.access_token
                        const newRefreshToken = response.data.data.session.refresh_token

                        localStorage.setItem('admin_token', newToken)
                        if (newRefreshToken) {
                            localStorage.setItem('admin_refresh_token', newRefreshToken)
                        }

                        apiClient.defaults.headers.common.Authorization = `Bearer ${newToken}`
                        originalRequest.headers.Authorization = `Bearer ${newToken}`

                        processQueue(null, newToken)
                        return apiClient(originalRequest)
                    }
                } catch (refreshError) {
                    processQueue(refreshError, null)
                    localStorage.removeItem('admin_token')
                    localStorage.removeItem('admin_refresh_token')
                } finally {
                    isRefreshing = false
                }
            } else {
                localStorage.removeItem('admin_token')
            }
        }

        const errorMessage = error.response?.data?.message || error.message
        return Promise.reject(new Error(errorMessage))
    }
)
