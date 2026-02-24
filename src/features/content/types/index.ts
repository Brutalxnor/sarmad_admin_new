export type ContentStatus =
    | 'draft'
    | 'review'
    | 'approved'
    | 'published'
    | 'archived'

export type ContentType =
    | 'article'
    | 'video'
    | 'micro_lesson'
    | 'checklist'
    | 'success_story'

export interface ContentItem {
    id?: string
    type: ContentType
    title: string
    description: string
    language: 'ar' | 'en'
    topic_id?: string // Added to reference topic table
    topic: string | Topic
    segment: string[]
    tags: string[]
    status: ContentStatus | string
    version: number
    access_type: 'public' | 'members_only'
    thumbnail_image?: string | File
    media_url?: string
    duration?: string
    source_type?: string
    author?: string
    created_at?: string
    updated_at?: string
}

export interface Topic {
    id: string
    name_en: string
    name_ar: string
    description_en?: string
    description_ar?: string
    icon_url?: string
    is_active: boolean
    created_at: string
    updated_at: string
}

export interface Article extends ContentItem { }
