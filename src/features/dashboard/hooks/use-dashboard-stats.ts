import { useQuery } from "@tanstack/react-query";
import { statsApi } from "../api";

export function useDashboardStats() {
    return useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: statsApi.getDashboardStats,
        refetchInterval: 30000, // Refetch every 30 seconds
    });
}
