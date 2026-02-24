export interface KpiMetric {
    id: string
    label: string
    value: number | string
    change: string
    trend: 'up' | 'down' | 'neutral'
}

export interface FunnelData {
    step: string
    count: number
    conversionRate: number
}

// Operational Report Types
export interface OperationalReport {
    period: 'daily' | 'weekly' | 'monthly'
    totalBookings: number
    hstOrders: {
        requested: number
        shipped: number
        closed: number
    }
}
