export interface Lesson {
    id?: string;
    section_id: string;
    title: string;
    type: 'video' | 'article' | 'pdf';
    media_url?: string;
    description?: string;
    is_preview: boolean;
    duration?: number;
    order_index: number;
    created_at?: string;
}

export interface Section {
    id?: string;
    course_id: string;
    title: string;
    order_index: number;
    lessons?: Lesson[];
    created_at?: string;
}

import type { Topic } from "../../content/types";

export interface Course {
    id?: string;
    title: string;
    description: string;
    thumbnail_url?: string;
    category?: string;
    topic_id?: string;
    topic?: string | Topic;
    price?: number;
    access_type: 'public' | 'members_only';
    sections?: Section[];
    created_at?: string;
    updated_at?: string;
}
