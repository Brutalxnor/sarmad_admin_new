export interface FAQ {
    id: string;
    question_en: string;
    question_ar: string;
    answer_en: string;
    answer_ar: string;
    category?: string;
    display_order?: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}
