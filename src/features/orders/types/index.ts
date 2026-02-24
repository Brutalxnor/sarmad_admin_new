import type { User } from '../../users/types'

export type OrderStatus =
    | 'Requested'
    | 'Confirmed'
    | 'Shipped'
    | 'Delivered'
    | 'In Use'
    | 'Returned'
    | 'Analysis'
    | 'Report Ready'
    | 'Closed'

export interface Order {
    id: string
    user_id: string
    address: string
    payment_status: string
    operational_status: OrderStatus | string
    tracking_ref?: string
    report_url?: string
    total_amount: number
    currency: string
    created_at: string
    updated_at: string

    // Relations
    users: User
}
