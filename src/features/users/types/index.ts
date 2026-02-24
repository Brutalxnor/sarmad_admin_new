export type UserRole =
    | 'guest'
    | 'user'
    | 'specialist'
    | 'admin'
    | 'super_admin'
    | 'RegisteredUser' // Added based on user request

export interface User {
    id: string
    name: string
    mobile: string
    email?: string
    language?: string
    city?: string
    segment?: string
    flags?: any
    consent_version?: string
    consent_at?: string
    created_at: string
    updated_at: string
    user_profile?: {
        id?: string
        first_name?: string
        last_name?: string
        avatar_url?: string
    }

    // Keeping some legacy fields for compatibility if needed, but primary focus is the new schema
    role?: UserRole
}
