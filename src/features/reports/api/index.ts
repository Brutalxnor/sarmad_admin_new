import type { OperationalReport } from '../types'

export const reportsApi = {
    getOverview: async () => {
        // Return mock for now, matching the interface
        return {
            period: 'monthly',
            totalBookings: 0,
            hstOrders: {
                requested: 0,
                shipped: 0,
                closed: 0
            }
        } as OperationalReport
    }
}
