import { apiClient } from "@/shared/api/client";

export interface DashboardStats {
    totalUsers: number;
    newOrders: number;
    upcomingWebinars: number;
    completedAssessments: number;
    trends: {
        users: string;
        orders: string;
        webinars: string;
        assessments: string;
    }
}

export const statsApi = {
    getDashboardStats: async (): Promise<DashboardStats> => {
        const response = await apiClient.get('/stats/dashboard');
        return response.data.data;
    }
};
