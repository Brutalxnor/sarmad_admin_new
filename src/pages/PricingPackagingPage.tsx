import { useLanguage } from '../shared/context/LanguageContext'

export default function PricingPackagingPage() {
    const { t, direction } = useLanguage()

    const plans = [
        {
            name: direction === 'rtl' ? 'الباقة الأساسية' : 'Basic Plan',
            price: '299',
            period: direction === 'rtl' ? '/شهرياً' : '/month',
            features: [
                direction === 'rtl' ? 'وصول كامل للمحتوى' : 'Full Content Access',
                direction === 'rtl' ? 'اختبار النوم الأساسي' : 'Basic Sleep Test',
                direction === 'rtl' ? 'دعم فني عبر البريد' : 'Email Support',
            ],
            color: 'from-blue-500 to-blue-600',
            popular: false
        },
        {
            name: direction === 'rtl' ? 'الباقة المتقدمة' : 'Pro Plan',
            price: '599',
            period: direction === 'rtl' ? '/شهرياً' : '/month',
            features: [
                direction === 'rtl' ? 'كل مميزات الباقة الأساسية' : 'All Basic Features',
                direction === 'rtl' ? 'استشارتين شهرياً' : '2 Consultations/month',
                direction === 'rtl' ? 'تقارير تحليلية متقدمة' : 'Advanced Analytics Reports',
                direction === 'rtl' ? 'دعم فني ذو أولوية' : 'Priority Support',
            ],
            color: 'from-brand-600 to-brand-500',
            popular: true
        },
        {
            name: direction === 'rtl' ? 'باقة النخبة' : 'Elite Plan',
            price: '999',
            period: direction === 'rtl' ? '/شهرياً' : '/month',
            features: [
                direction === 'rtl' ? 'كل مميزات الباقة المتقدمة' : 'All Pro Features',
                direction === 'rtl' ? 'استشارات غير محدودة' : 'Unlimited Consultations',
                direction === 'rtl' ? 'مدرب نوم مخصص' : 'Personal Sleep Coach',
                direction === 'rtl' ? 'دخول مجاني للويبنارات' : 'Free Webinar Access',
            ],
            color: 'from-purple-600 to-purple-500',
            popular: false
        }
    ]

    const addOns = [
        { title: direction === 'rtl' ? 'فحص النوم المنزلي' : 'Home Sleep Test', price: '150', icon: '🏠' },
        { title: direction === 'rtl' ? 'جلسة استشارية إضافية' : 'Extra Consultation', price: '200', icon: '📞' },
        { title: direction === 'rtl' ? 'تقرير طبي مفصل' : 'Detailed Medical Report', price: '75', icon: '📄' },
        { title: direction === 'rtl' ? 'باقة العائلة' : 'Family Add-on', price: '120', icon: '👨‍👩‍👧‍👦' },
    ]

    return (
        <div className="space-y-10 animate-fade-in pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-slate-800 to-brand-600 mb-2">
                        {t('pricing.numbered_title')}
                    </h1>
                    <p className="text-slate-500 font-medium text-lg max-w-2xl">
                        {direction === 'rtl'
                            ? 'قم بتكوين وإدارة خطط التسعير والباقات المتاحة للمستخدمين في المنصة.'
                            : 'Configure and manage pricing plans and packages available to users on the platform.'}
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors shadow-sm">
                        {direction === 'rtl' ? 'تصدير الأسعار' : 'Export Pricing'}
                    </button>
                    <button className="btn-primary">
                        {direction === 'rtl' ? '+ باقة جديدة' : '+ New Package'}
                    </button>
                </div>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {plans.map((plan, idx) => (
                    <div
                        key={idx}
                        className={`glass-panel p-8 card-hover relative overflow-hidden group flex flex-col ${plan.popular ? 'ring-2 ring-brand-500 ring-offset-4 ring-offset-surface-50 scale-105 z-10' : ''}`}
                    >
                        {plan.popular && (
                            <div className="absolute top-0 right-0 left-0 bg-brand-500 text-white text-center py-1 text-xs font-black uppercase tracking-widest">
                                {direction === 'rtl' ? 'الأكثر طلباً' : 'Most Popular'}
                            </div>
                        )}

                        <div className="mb-8">
                            <h3 className="text-xl font-bold text-slate-800 mb-4">{plan.name}</h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-black text-slate-900">{plan.price}</span>
                                <span className="text-slate-500 font-bold">{t('common.currency')}</span>
                                <span className="text-slate-400 text-sm font-medium">{plan.period}</span>
                            </div>
                        </div>

                        <ul className="space-y-4 mb-10 flex-1">
                            {plan.features.map((feature, fIdx) => (
                                <li key={fIdx} className="flex items-center gap-3 text-slate-600 font-medium">
                                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px] font-bold">✓</span>
                                    {feature}
                                </li>
                            ))}
                        </ul>

                        <button className={`w-full py-3.5 rounded-xl font-bold transition-all duration-300 ${plan.popular
                            ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/30 hover:bg-brand-700'
                            : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'}`}
                        >
                            {direction === 'rtl' ? 'تعديل الباقة' : 'Edit Plan'}
                        </button>
                    </div>
                ))}
            </div>

            {/* Add-ons Section */}
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold text-slate-800">
                        {direction === 'rtl' ? 'الخدمات الإضافية' : 'Add-on Services'}
                    </h2>
                    <div className="h-px flex-1 bg-slate-200" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {addOns.map((addon, idx) => (
                        <div key={idx} className="glass-panel p-6 flex flex-col gap-4 group cursor-pointer hover:border-brand-300 transition-colors">
                            <div className="flex justify-between items-start">
                                <div className="text-3xl">{addon.icon}</div>
                                <div className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-xs font-bold border border-emerald-100">
                                    {addon.price} {t('common.currency')}
                                </div>
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800 group-hover:text-brand-600 transition-colors">{addon.title}</h4>
                                <p className="text-xs text-slate-400 mt-1">
                                    {direction === 'rtl' ? 'إجمالي الخدمات المباعة: 0' : 'Total sold: 0'}
                                </p>
                            </div>
                        </div>
                    ))}

                    <button className="border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 hover:border-brand-400 hover:bg-brand-50/30 transition-all group">
                        <span className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-xl group-hover:bg-brand-100 group-hover:text-brand-600 transition-colors">+</span>
                        <span className="text-sm font-bold text-slate-400 group-hover:text-brand-600">
                            {direction === 'rtl' ? 'إضافة خدمة' : 'Add Service'}
                        </span>
                    </button>
                </div>
            </div>

            {/* Settings Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Currency & Tax Settings */}
                <div className="glass-panel p-6">
                    <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <span>⚙️</span>
                        {direction === 'rtl' ? 'إعدادات عامة' : 'General Settings'}
                    </h3>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                                {direction === 'rtl' ? 'العملة الافتراضية' : 'Default Currency'}
                            </label>
                            <select className="input-modern">
                                <option>SAR - ريال سعودي</option>
                                <option>USD - Dollar</option>
                                <option>AED - درهم إماراتي</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                                {direction === 'rtl' ? 'ضريبة القيمة المضافة (%)' : 'VAT Percentage (%)'}
                            </label>
                            <input type="number" defaultValue="15" className="input-modern" />
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-brand-50 rounded-xl border border-brand-100">
                            <div className="w-10 h-10 bg-brand-500 text-white rounded-full flex items-center justify-center text-xl">ℹ️</div>
                            <p className="text-xs text-brand-700 leading-relaxed font-medium">
                                {direction === 'rtl'
                                    ? 'تأكد من مراجعة القوانين المحلية قبل تغيير نسبة الضريبة. سيتم تطبيق التغييرات على جميع الطلبات الجديدة.'
                                    : 'Make sure to review local laws before changing the tax percentage. Changes will apply to all new orders.'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Promo Codes Placeholder */}
                <div className="glass-panel p-6 relative overflow-hidden group">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <span>🎟️</span>
                            {direction === 'rtl' ? 'أكواد الخصم' : 'Promo Codes'}
                        </h3>
                        <button className="text-brand-600 font-bold text-sm hover:underline">
                            {direction === 'rtl' ? 'عرض الكل' : 'View All'}
                        </button>
                    </div>

                    <div className="space-y-4">
                        {[
                            { code: 'WELCOME20', discount: '20%', usage: '150/500' },
                            { code: 'SLEEPHAPPY', discount: '50 SAR', usage: '45/100' },
                        ].map((promo, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100 group-hover:bg-white group-hover:shadow-md transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="px-3 py-1 bg-brand-100 text-brand-700 font-black rounded-lg text-sm tracking-widest border border-brand-200">
                                        {promo.code}
                                    </div>
                                    <span className="text-slate-500 font-bold">{promo.discount}</span>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">{direction === 'rtl' ? 'الاستخدام' : 'Usage'}</p>
                                    <p className="text-sm font-bold text-slate-700">{promo.usage}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="w-full mt-6 py-3 border-2 border-brand-100 text-brand-600 font-bold rounded-xl hover:bg-brand-50 transition-colors">
                        {direction === 'rtl' ? 'إنشاء كود خصم جديد' : 'Create New Promo Code'}
                    </button>
                </div>
            </div>
        </div>
    )
}
