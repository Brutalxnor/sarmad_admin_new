import { apiClient } from "@/shared/api/client";
import type { ProgramEnrollment } from "../types";

export const enrollmentsApi = {
    getAll: async (): Promise<ProgramEnrollment[]> => {
        const response = await apiClient.get('/enrollments');
        // The backend returns { status: "success", data: [...] }
        return response.data.data;
    },

    getById: async (id: string): Promise<ProgramEnrollment> => {
        const response = await apiClient.get(`/enrollments/${id}`);
        return response.data;
    }
};
