export interface Testimonial {
    id: string;
    name_en: string;
    name_ar: string;
    role_en?: string;
    role_ar?: string;
    content_en: string;
    content_ar: string;
    rating?: number;
    image_url?: string;
    category?: string;
    display_order?: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}
