export interface Webinar {
    id: string
    title: string
    segment: string[]
    speaker: string
    date_time: string
    capacity: number
    registration_count: number
    recording_url?: string
    thumbnail_image?: string | File
    video_url?: string | File
    description?: string
    price?: number
    lang: 'ar' | 'en'
}

export interface WebinarRegistration {
    id: string
    webinar_id: string
    user_id: string
    registered_at: string
    attended: boolean
}

export interface WebinarAttendee extends WebinarRegistration {
    user: {
        name: string
        mobile: string
        email?: string
    }
}
