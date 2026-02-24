export interface ConsultationBooking {
    id: string;
    user_id: string;
    specialist_id: string;
    type_id: string;
    scheduled_at: string;
    status: 'confirmed' | 'cancelled' | 'completed' | 'pending';
    notes?: string;
    created_at: string;
    updated_at: string;
    type?: {
        id: string;
        name_en: string;
        name_ar: string;
        duration: number;
        price: number;
    };
    specialist?: {
        id: string;
        name: string;
        avatar_url?: string;
    };
    user?: {
        id: string;
        name: string;
        mobile?: string;
    };
    users?: {
        id: string;
        name: string;
        mobile?: string;
    };
}

export interface ConsultationType {
    id: string;
    name_en: string;
    name_ar: string;
    description_en?: string;
    description_ar?: string;
    duration: number;
    price: number;
    is_active: boolean;
}
