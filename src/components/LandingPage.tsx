import React, { useState } from 'react';
import { 
  Dumbbell, 
  Bot, 
  Salad, 
  Timer, 
  Moon, 
  Camera, 
  Trophy, 
  Mail, 
  Target, 
  Star, 
  Check, 
  ArrowLeft, 
  Sparkles,
  Send,
  Zap
} from 'lucide-react';

interface LandingPageProps {
  onEnterApp: () => void;
  onToast: (msg: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp, onToast }) => {
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMessage) {
      onToast('⚠️ الرجاء ملء الحقول المطلوبة');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onToast('✅ تم استلام رسالتك بنجاح! سنرد عليك قريباً');
      setContactName('');
      setContactEmail('');
      setContactSubject('');
      setContactMessage('');
    }, 600);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 min-h-screen">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 md:px-8 py-3.5 flex justify-between items-center transition-colors">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-teal-400 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
            <Zap className="w-5 h-5 fill-white" />
          </div>
          <span className="text-xl md:text-2xl font-black bg-gradient-to-r from-sky-500 to-teal-400 bg-clip-text text-transparent">
            لياقة+
          </span>
        </div>

        <div className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600 dark:text-slate-300">
          <button onClick={() => scrollToSection('features')} className="hover:text-sky-500 transition-colors">المميزات</button>
          <button onClick={() => scrollToSection('pricing')} className="hover:text-sky-500 transition-colors">الأسعار</button>
          <button onClick={() => scrollToSection('testimonials')} className="hover:text-sky-500 transition-colors">آراء العملاء</button>
          <button onClick={() => scrollToSection('contact')} className="hover:text-sky-500 transition-colors">تواصل معنا</button>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={onEnterApp}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-teal-400 text-white font-bold text-sm shadow-md shadow-sky-500/25 hover:shadow-lg hover:shadow-sky-500/35 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2"
          >
            <span>دخول التطبيق</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-sky-600 via-sky-500 to-teal-500 text-white py-20 md:py-28 px-4 text-center">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,white_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="relative z-10 max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-xs md:text-sm font-bold border border-white/30 text-white shadow-sm">
            <Sparkles className="w-4 h-4" />
            <span>النسخة الشاملة 2026 مع مدرب الذكاء الاصطناعي</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black leading-tight tracking-tight">
            ⚡ تطبيق اللياقة الذكي الأول عربياً
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-sky-50 max-w-2xl mx-auto leading-relaxed font-normal">
            تمارين مخصصة لمستواك + تغذية وحاسبة سعرات + مدرب AI لتحليل الوجبات + مؤقت صيام ذكي. كل ما تحتاجه لبناء جسم مثالي في منصة واحدة!
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <button 
              onClick={onEnterApp}
              className="px-8 py-4 rounded-xl bg-white text-sky-600 font-extrabold text-base md:text-lg shadow-xl shadow-sky-900/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              <span>🚀 ابدأ رحلتك مجاناً</span>
            </button>
            <button 
              onClick={() => scrollToSection('features')}
              className="px-8 py-4 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-base md:text-lg border border-white/30 backdrop-blur-md transition-all"
            >
              ✨ اكتشف المميزات
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto pt-10 border-t border-white/20">
            <div>
              <b className="text-2xl sm:text-4xl font-black block">50K+</b>
              <span className="text-xs sm:text-sm text-sky-100">مستخدم نشط</span>
            </div>
            <div>
              <b className="text-2xl sm:text-4xl font-black block">4.9⭐</b>
              <span className="text-xs sm:text-sm text-sky-100">تقييم المتدربين</span>
            </div>
            <div>
              <b className="text-2xl sm:text-4xl font-black block">1M+</b>
              <span className="text-xs sm:text-sm text-sky-100">تمرين مكتمل</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white mb-3">
            ✨ مميزات صُممت لنجاحك
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
            كل الأدوات التي تحتاجها للوصول إلى لياقتك وأهدافك بدون تعقيد
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: <Bot className="w-7 h-7 text-sky-500" />,
              title: "مدرب AI ذكي",
              desc: "اسأل مدربك الذكي عن أي تمرين أو برنامج غذائي، وصوّر وجبتك ليحلل سعراتها والماكروز فوراً!"
            },
            {
              icon: <Dumbbell className="w-7 h-7 text-sky-500" />,
              title: "خطط تدريبية من 3 مراحل",
              desc: "تأسيس، متوسط، ومتقدم مع بدائل لكل تمرين حسب ظروفك، ومؤقتات استراحة ذكية مع تنبيه صوتي."
            },
            {
              icon: <Salad className="w-7 h-7 text-sky-500" />,
              title: "تتبع التغذية والوجبات",
              desc: "5 وجبات يومية صحية مع خيارات تبديل متعددة، ديتوكس ومشروبات طاقة، ووصفات سريعة التحضير."
            },
            {
              icon: <Timer className="w-7 h-7 text-sky-500" />,
              title: "مؤقت الصيام المتقطع",
              desc: "4 أوضاع مرنة (16:8, 18:6, 20:4, OMAD) مع عداد دائري تفاعلي وتتبع مستمر لساعات الصيام."
            },
            {
              icon: <Moon className="w-7 h-7 text-sky-500" />,
              title: "تتبع النوم والاستشفاء",
              desc: "سجل مواعيد نومك واستيقاظك وجودة راحتك الليلية مع رسم بياني لآخر 7 أيام."
            },
            {
              icon: <Camera className="w-7 h-7 text-sky-500" />,
              title: "معرض صور التقدم والفرق",
              desc: "التقط صور قبل وبعد وقارن تقدمك جنباً إلى جنب مع حساب تلقائي لفرق الوزن بالكيلوغرام."
            },
            {
              icon: <Trophy className="w-7 h-7 text-sky-500" />,
              title: "نظام المستويات والأوسمة",
              desc: "اكسب XP مع كل تمرين وشرب ماء وصيام، وارتقِ بين 6 مستويات من مبتدئ إلى أسطورة خالدة."
            },
            {
              icon: <Mail className="w-7 h-7 text-sky-500" />,
              title: "تقارير أسبوعية وتصدير PDF",
              desc: "احصل على ملخص أسبوعي، وحمّل تقرير PDF أنيق أو نسخة احتياطية من بياناتك بضغطة زر."
            },
            {
              icon: <Target className="w-7 h-7 text-sky-500" />,
              title: "مهام يومية وتحديات",
              desc: "5 مهام يومية محفزة لرفع التزامك، مع شريك تحفيزي (الأسد، النمر، الصقر) يشجعك طوال اليوم."
            },
          ].map((f, i) => (
            <div 
              key={i} 
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all"
            >
              <div className="w-14 h-14 rounded-2xl bg-sky-50 dark:bg-sky-950/50 flex items-center justify-center mb-5 border border-sky-100 dark:border-sky-900/50">
                {f.icon}
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{f.title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 md:px-8 bg-slate-50 dark:bg-slate-900/40 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white mb-3">
              💎 خطط واضحة بدون تعقيد
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
              اختر الخطة التي تناسب رحلتك وابدأ اليوم
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {/* Free Plan */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 flex flex-col shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">المجاني</h3>
              <p className="text-xs text-slate-500 mb-6">للبداية وتأسيس العادات الصحية</p>
              <div className="text-4xl font-black text-sky-500 mb-6">
                0 <span className="text-sm font-normal text-slate-500">ر.س / شهر</span>
              </div>
              <ul className="space-y-3 mb-8 text-sm text-slate-600 dark:text-slate-300 flex-1">
                {["كل التمارين الأساسية (3 مراحل)", "تتبع الوجبات والماء والترطيب", "حتى 5 صور تقدم في المعرض", "مدرب AI (أسئلة واستشارات يومية)", "المهام اليومية وتحديات الأسبوع"].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <button 
                onClick={onEnterApp}
                className="w-full py-3 rounded-xl border-2 border-sky-500 text-sky-600 dark:text-sky-400 font-bold text-sm hover:bg-sky-50 dark:hover:bg-sky-950/40 transition-colors"
              >
                ابدأ مجاناً
              </button>
            </div>

            {/* Premium Plan */}
            <div className="bg-white dark:bg-slate-900 border-2 border-sky-500 rounded-2xl p-8 flex flex-col shadow-xl shadow-sky-500/10 relative scale-100 md:-translate-y-2">
              <div className="absolute -top-3.5 right-1/2 translate-x-1/2 bg-gradient-to-r from-sky-500 to-teal-400 text-white text-xs font-black px-4 py-1 rounded-full shadow-md">
                الأكثر اختياراً 🔥
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">المميز (Plus)</h3>
              <p className="text-xs text-slate-500 mb-6">للأبطال الباحثين عن نتائج قياسية</p>
              <div className="text-4xl font-black text-sky-500 mb-6">
                29 <span className="text-sm font-normal text-slate-500">ر.س / شهر</span>
              </div>
              <ul className="space-y-3 mb-8 text-sm text-slate-600 dark:text-slate-300 flex-1">
                {[
                  "كل مميزات الخطة المجانية",
                  "تحليل صور الوجبات بالذكاء الاصطناعي",
                  "معرض صور غير محدود مع مقارنة الأوزان",
                  "مدرب AI شخصي متوفر دائماً بلا حدود",
                  "تصدير تقارير PDF مفصلة أسبوعية",
                  "أوسمة حصرية ومستويات متقدمة",
                  "دعم فني أولوي ومستمر",
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 font-bold" />
                    <span className="font-medium">{item}</span>
                  </li>
                ))}
              </ul>
              <button 
                onClick={onEnterApp}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-teal-400 text-white font-bold text-sm shadow-md shadow-sky-500/25 hover:opacity-95 transition-opacity"
              >
                اشترك الآن
              </button>
            </div>

            {/* Corporate Plan */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 flex flex-col shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">الشركات والفرق</h3>
              <p className="text-xs text-slate-500 mb-6">لتحفيز صحة وإنتاجية الموظفين</p>
              <div className="text-4xl font-black text-sky-500 mb-6">
                99 <span className="text-sm font-normal text-slate-500">ر.س / شهر</span>
              </div>
              <ul className="space-y-3 mb-8 text-sm text-slate-600 dark:text-slate-300 flex-1">
                {[
                  "كل مميزات الخطة المميزة",
                  "حتى 50 موظف في الفريق",
                  "لوحة تحكم إدارية ومتابعة الالتزام",
                  "تحديات جماعية بين الأقسام",
                  "تقارير صحية دورية مجمعة",
                  "جلسات توجيه وإرشادات متخصصة",
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => scrollToSection('contact')}
                className="w-full py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                تواصل معنا
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white mb-3">
            💬 تجارب وقصص نجاح حقيقية
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
            ماذا يقول مستخدمو لياقة+ عن رحلتهم في التطبيق
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: "أحمد محمد",
              role: "خسر 12 كجم في 3 شهور",
              comment: "أفضل تطبيق لياقة جربته بدون مبالغة! المدرب الذكي ساعدني في تنظيم وجباتي، والتمارين متدرجة وسهلة التطبيق في المنزل.",
              avatar: "أ"
            },
            {
              name: "سارة العلي",
              role: "ملتزمة منذ 6 شهور",
              comment: "ميزة تصوير وجبتي ومعرفة السعرات وفرت علي ساعات من البحث. مؤقت الصيام المتقطع غيّر أسلوب حياتي للأفضل تماماً!",
              avatar: "س"
            },
            {
              name: "خالد السعيد",
              role: "+15 كجم كتلة عضلية نقية",
              comment: "التقارير الأسبوعية وتتبع الأوزان ونظام المستويات خلق بداخلي حافزاً لا ينتهي. التطبيق مصمم بعناية فائقة للمستخدم العربي.",
              avatar: "خ"
            },
          ].map((t, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <div className="flex gap-1 text-amber-400 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6 italic">
                "{t.comment}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-sky-500 to-teal-400 text-white font-bold flex items-center justify-center text-base shadow-sm">
                  {t.avatar}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">{t.name}</h4>
                  <span className="text-xs text-sky-600 dark:text-sky-400 font-semibold">{t.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4 md:px-8 bg-slate-50 dark:bg-slate-900/40 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-2">
              📧 تواصل معنا
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              لديك سؤال أو استفسار؟ فريق لياقة+ جاهز لمساعدتك على مدار الساعة
            </p>
          </div>

          <form onSubmit={handleContactSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-sm space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">الاسم الكامل</label>
              <input 
                type="text" 
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="مثال: محمد عبدالله" 
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">البريد الإلكتروني</label>
              <input 
                type="email" 
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="name@example.com" 
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">الموضوع</label>
              <input 
                type="text" 
                value={contactSubject}
                onChange={(e) => setContactSubject(e.target.value)}
                placeholder="مثال: استفسار حول خطة التمارين" 
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">رسالتك</label>
              <textarea 
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                rows={4}
                placeholder="اكتب استفسارك بالتفصيل..." 
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
              />
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-teal-400 text-white font-bold text-sm shadow-md shadow-sky-500/20 hover:opacity-95 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'جاري الإرسال...' : 'إرسال الرسالة'}</span>
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-4 md:px-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-right">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 to-teal-400 flex items-center justify-center text-white">
              <Zap className="w-4 h-4 fill-white" />
            </div>
            <span className="text-xl font-black bg-gradient-to-r from-sky-400 to-teal-300 bg-clip-text text-transparent">
              لياقة+
            </span>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-xs text-slate-400 font-medium">
            <button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors">المميزات</button>
            <button onClick={() => scrollToSection('pricing')} className="hover:text-white transition-colors">الأسعار</button>
            <button onClick={() => scrollToSection('testimonials')} className="hover:text-white transition-colors">آراء العملاء</button>
            <button onClick={() => scrollToSection('contact')} className="hover:text-white transition-colors">تواصل</button>
            <button onClick={onEnterApp} className="text-sky-400 hover:text-sky-300 transition-colors font-bold">دخول التطبيق</button>
          </div>

          <p className="text-xs text-slate-500">
            © 2026 تطبيق لياقة+. جميع الحقوق محفوظة.
          </p>
        </div>
      </footer>

      {/* Floating Action Button to Enter App */}
      <button 
        onClick={onEnterApp}
        title="فتح التطبيق الرياضي"
        className="fixed bottom-6 left-6 z-40 bg-gradient-to-r from-sky-500 to-teal-400 text-white p-3.5 rounded-full shadow-xl shadow-sky-500/30 hover:scale-110 active:scale-95 transition-all flex items-center gap-2"
      >
        <Zap className="w-6 h-6 fill-white" />
        <span className="text-xs font-bold hidden sm:inline">فتح التطبيق</span>
      </button>
    </div>
  );
};
