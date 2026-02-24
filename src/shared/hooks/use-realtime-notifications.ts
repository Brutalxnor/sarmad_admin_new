import { useEffect } from 'react'
import { supabase } from '@/shared/api/supabaseClient'
import { toast } from 'react-hot-toast'
import { useLanguage } from '@/shared/context/LanguageContext'
import { useQueryClient } from '@tanstack/react-query'

export function useRealtimeNotifications() {
    const { direction } = useLanguage()
    const queryClient = useQueryClient()

    useEffect(() => {
        let channel: any;

        // Small delay to ensure Supabase client is ready and old connections are cleared
        const timeoutId = setTimeout(() => {
            channel = supabase
                .channel('admin-notifications-' + Math.random().toString(36).substring(7))
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'hst_orders',
                    },
                    (payload) => {
                        console.log('Realtime notification payload:', payload)

                        toast.success(
                            direction === 'rtl'
                                ? 'طلب جديد! تم استلام طلب جديد رقم ' + (payload.new.id?.slice(0, 8) || '')
                                : 'New Order! A new order #' + (payload.new.id?.slice(0, 8) || '') + ' has been received.',
                            {
                                duration: 8000,
                                position: direction === 'rtl' ? 'top-left' : 'top-right',
                                style: {
                                    background: '#fff',
                                    color: '#0f172a',
                                    fontWeight: 'bold',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: '16px',
                                    padding: '16px',
                                },
                            }
                        )

                        queryClient.invalidateQueries({ queryKey: ['orders'] })
                        queryClient.invalidateQueries({ queryKey: ['notifications'] })
                    }
                )
                .subscribe((status) => {
                    console.log('Supabase Realtime Status:', status)
                    if (status === 'SUBSCRIBED') {
                        console.log('Successfully connected to real-time events!')
                    }
                })
        }, 1000)

        return () => {
            clearTimeout(timeoutId)
            if (channel) {
                supabase.removeChannel(channel)
            }
        }
    }, [queryClient, direction])
}
