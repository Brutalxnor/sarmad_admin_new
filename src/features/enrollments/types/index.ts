export interface AdherenceMetrics {
    streak: number;
    habits_completed: number;
    sleep_window_adherence: number;
}

export interface OutcomeMetrics {
    energy_score: number;
    sleep_quality: number;
}

export interface ProgramEnrollment {
    id: string;
    user_id: string;
    program_template: string;
    start_date: string;
    day_index: number;
    adherence_metrics?: AdherenceMetrics | string;
    outcome_metrics?: OutcomeMetrics | string;
    created_at?: string;
    updated_at?: string;

    // Virtual field for joined data (Supabase returns 'users' for the join)
    users?: {
        name: string;
        mobile: string;
    }
}
