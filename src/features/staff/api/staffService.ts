import { apiClient } from '../../../shared/api/client'

// Types
export type StaffRole = 'Coach' | 'AdminOperations' | 'AdminClinical' | 'SuperAdmin'

export interface StaffUser {
    id: string
    name?: string
    email: string
    role: StaffRole
    must_change_password: boolean
    created_at?: string
    // Profile Fields
    mobile?: string
    city?: string
    gender?: string
    age_range?: string
    profile_picture?: string
    specialization?: string
    bio?: string
}

export interface CreateStaffRequest {
    email: string
    password: string
    name?: string
    role: StaffRole
}

export interface UpdateStaffRequest {
    name?: string
    role?: StaffRole
    must_change_password?: boolean
}

export interface StaffAuthResponse {
    success: boolean
    message?: string
    data?: {
        user: StaffUser
        session?: {
            access_token: string
            refresh_token: string
        }
        must_change_password?: boolean
    }
}

export interface StaffListResponse {
    success: boolean
    data: StaffUser[]
}

const BASE_URL = '/staff-auth'

export const staffService = {
    // Auth & Profile
    login: async (credentials: { email: string; password: string }) => {
        const response = await apiClient.post<StaffAuthResponse>(`${BASE_URL}/login`, credentials)
        return response.data
    },

    changePassword: async (newPassword: string) => {
        const response = await apiClient.post(`${BASE_URL}/change-password`, { newPassword })
        return response.data
    },

    getCurrentUser: async () => {
        const response = await apiClient.get<StaffAuthResponse>(`${BASE_URL}/me`)
        return response.data
    },

    logout: async () => {
        const response = await apiClient.post(`${BASE_URL}/logout`)
        return response.data
    },

    // Admin Operations
    createStaff: async (data: CreateStaffRequest) => {
        const response = await apiClient.post<StaffAuthResponse>(`${BASE_URL}/create`, data)
        return response.data
    },

    listStaff: async () => {
        const response = await apiClient.get<StaffListResponse>(`${BASE_URL}/`)
        return response.data
    },

    getStaffById: async (id: string) => {
        const response = await apiClient.get<StaffAuthResponse>(`${BASE_URL}/${id}`)
        return response.data
    },

    updateStaff: async (id: string, data: UpdateStaffRequest) => {
        const response = await apiClient.put<StaffAuthResponse>(`${BASE_URL}/${id}`, data)
        return response.data
    },

    deleteStaff: async (id: string) => {
        const response = await apiClient.delete(`${BASE_URL}/${id}`)
        return response.data
    },

    // User Profile
    updateProfile: async (data: Partial<UserProfile>, file?: File) => {
        const formData = new FormData()

        // Allowed fields as per backend rules
        const allowedFields: (keyof UserProfile)[] = [
            'name',
            'mobile',
            'city',
            'age_range',
            'gender',
            'specialization',
            'bio'
        ]

        allowedFields.forEach((key) => {
            const value = data[key]
            if (value !== undefined && value !== null) {
                formData.append(key, typeof value === 'string' ? value : String(value))
            }
        })

        if (file) {
            // Backend specifically looks for 'profile_picture' key for the file
            formData.append('profile_picture', file)
        }

        // We don't set Content-Type header manually, axios/browser will handle it for FormData
        const response = await apiClient.put<StaffAuthResponse>(`${BASE_URL}/profile`, formData)
        return response.data
    },

    refreshToken: async (refreshToken: string) => {
        const response = await apiClient.post<StaffAuthResponse>(`${BASE_URL}/refresh-token`, { refreshToken })
        return response.data
    }
}

export interface UserProfile {
    name?: string
    mobile?: string
    email?: string
    city?: string
    gender?: string
    age_range?: string
    profile_picture?: string
    specialization?: string
    bio?: string
}
