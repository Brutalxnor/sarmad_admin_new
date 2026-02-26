import { apiClient } from "@/shared/api/client";

export interface DashboardStats {
    users: number;
    orders: number;
    assessments: number;
    webinars: number;
}

export const statsApi = {
    getDashboardStats: async (): Promise<DashboardStats> => {
        const response = await apiClient.get('/stats/');
        return response.data.data;
    }
};
