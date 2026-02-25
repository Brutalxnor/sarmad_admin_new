import type { Webinar } from '../types'

interface WebinarCardProps {
    webinar: Webinar
    onViewAttendees: () => void
    onEdit: () => void
    onDelete: () => void
}

export function WebinarCard({ webinar, onViewAttendees, onEdit, onDelete }: WebinarCardProps) {
    // Format date
    const date = new Date(webinar.date_time).toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })

    const time = new Date(webinar.date_time).toLocaleTimeString('ar-EG', {
        hour: '2-digit',
        minute: '2-digit',
    })

    const registrationPercentage = Math.min(Math.round((webinar.registration_count / webinar.capacity) * 100), 100)

    return (
        <div className="glass-panel overflow-hidden card-hover flex flex-col h-full bg-white group">
            {/* Header/Banner Area */}
            <div className="relative aspect-video w-full overflow-hidden bg-slate-100 group">
                {webinar.thumbnail_image ? (
                    <img
                        src={typeof webinar.thumbnail_image === 'string' ? webinar.thumbnail_image : ''}
                        alt={webinar.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full bg-linear-to-r from-brand-600 to-brand-400 opacity-80" />
                )}

                {/* Overlay content */}
                <div className="absolute inset-x-0 top-0 p-4 flex justify-between items-start pointer-events-none">
                    <div className="flex flex-col gap-2 pointer-events-auto">
                        <div className="flex flex-wrap gap-1">
                            {Array.isArray(webinar.segment) ? (
                                webinar.segment.map((seg, index) => (
                                    <span key={index} className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider rounded-full border border-white/30">
                                        {seg}
                                    </span>
                                ))
                            ) : (
                                <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider rounded-full border border-white/30">
                                    {webinar.segment}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="px-3 py-1 bg-brand-600/90 backdrop-blur-md text-white text-[10px] font-black rounded-lg border border-brand-400/30 flex items-center gap-1 shadow-lg">
                                <span>{webinar.price && webinar.price > 0 ? `${webinar.price} EGP` : 'FREE'}</span>
                            </div>
                            <div className="px-2 py-1 bg-slate-900/60 backdrop-blur-md text-white text-[10px] font-black rounded-lg border border-white/20 shadow-lg capitalize">
                                {webinar.lang}
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2 pointer-events-auto">
                        {webinar.recording_url && (
                            <a
                                href={webinar.recording_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-xl text-white transition-all shadow-lg border border-white/30"
                                title="مشاهدة التسجيل"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </a>
                        )}
                        <button
                            onClick={onDelete}
                            className="p-2 bg-red-500/20 hover:bg-red-500/40 backdrop-blur-md rounded-xl text-red-500 transition-all shadow-lg border border-white/30"
                            title="حذف الندوة"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="p-5 flex-1 flex flex-col">
                <div className="mb-4">
                    <h4 className="text-lg font-black text-slate-800 line-clamp-1 leading-tight mb-1 group-hover:text-brand-600 transition-colors">
                        {webinar.title}
                    </h4>
                    {webinar.description && (
                        <div
                            className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-3 font-medium prose prose-sm prose-slate max-w-none"
                            dangerouslySetInnerHTML={{ __html: webinar.description }}
                        />
                    )}
                    <div className="flex items-center text-slate-500 text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 ml-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="font-bold">{webinar.speaker}</span>
                    </div>
                </div>

                <div className="space-y-4 mt-auto">
                    {/* Date & Time */}
                    <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl">
                        <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 ml-1.5 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="font-black">{date}</span>
                        </div>
                        <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 ml-1.5 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-black tabular-nums">{time}</span>
                        </div>
                    </div>

                    {/* Registration Stats */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold">
                            <span className="text-slate-400">التسجيلات</span>
                            <span className="text-brand-600">{webinar.registration_count} / {webinar.capacity}</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-linear-to-r from-brand-600 to-brand-400 rounded-full transition-all duration-1000"
                                style={{ width: `${registrationPercentage}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="p-5 pt-0 grid grid-cols-2 gap-3">
                <button
                    onClick={onViewAttendees}
                    className="py-3 text-xs font-black text-slate-600 hover:bg-slate-50 rounded-2xl transition-all border border-slate-100 shadow-xs flex items-center justify-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    الحضور
                </button>
                <button
                    onClick={onEdit}
                    className="py-3 text-xs font-black text-brand-600 hover:bg-brand-50 rounded-2xl transition-all border border-brand-100 shadow-xs flex items-center justify-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    تعديل
                </button>
            </div>
        </div>
    )
}
