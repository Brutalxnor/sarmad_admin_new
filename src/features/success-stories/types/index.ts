export type SuccessStoryStatus = 'draft' | 'published' | 'archived';

export interface SuccessStory {
    id: string;
    patient_name: string;
    title: string;
    journey: string;
    media: string[]; // URLs of images/videos
    status: SuccessStoryStatus;
    created_at: string;
    updated_at: string;
}
