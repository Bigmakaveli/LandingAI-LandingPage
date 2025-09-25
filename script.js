// LandingAI Landing Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    
    // Mobile Navigation Toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    // Ensure CSS variable matches actual navbar height (wraps content)
    const updateNavHeight = () => {
        const nav = document.querySelector('.navbar');
        if (!nav) return;
        const h = nav.offsetHeight;
        document.documentElement.style.setProperty('--nav-height', h + 'px');
    };
    updateNavHeight();
    window.addEventListener('resize', debounce(updateNavHeight, 150));
    window.addEventListener('load', updateNavHeight);

    // Update gradient palette dynamically from the provided image
    // Cache once so colors remain consistent after the initial load
    (function applyImageGradient() {
        const PALETTE_KEY = 'landingai.palette.v1';

        const setRootPalette = (p) => {
            const root = document.documentElement;
            if (!p) return;
            if (p.g1) root.style.setProperty('--g1', p.g1);
            if (p.g1b) root.style.setProperty('--g1b', p.g1b);
            if (p.g2a) root.style.setProperty('--g2a', p.g2a);
            if (p.g2b) root.style.setProperty('--g2b', p.g2b);
            if (p.g3) root.style.setProperty('--g3', p.g3);
            if (p.primary) root.style.setProperty('--primary-color', p.primary);
            if (p.secondary) root.style.setProperty('--secondary-color', p.secondary);
            if (p.accent) root.style.setProperty('--accent-color', p.accent);
            if (p.primaryDark) root.style.setProperty('--primary-dark', p.primaryDark);
        };

        // If a palette is already stored, apply it and exit (keeps it stable across sessions)
        try {
            const cached = localStorage.getItem(PALETTE_KEY);
            if (cached) {
                const palette = JSON.parse(cached);
                setRootPalette(palette);
                return;
            }
        } catch (e) {
            // localStorage unavailable or JSON parse failed; fall through and compute once
        }

        const src = 'images/1758654702837_2iu7cxjctu9.png';
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = function() {
            try {
                const w = 120, h = 1;
                const canvas = document.createElement('canvas');
                canvas.width = w; canvas.height = h;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, w, h);
                const data = ctx.getImageData(0, 0, w, h).data;

                function sampleRange(x0, x1) {
                    let r = 0, g = 0, b = 0, count = 0;
                    for (let x = x0; x < x1; x++) {
                        const i = (x * 4);
                        r += data[i];
                        g += data[i + 1];
                        b += data[i + 2];
                        count++;
                    }
                    return [Math.round(r / count), Math.round(g / count), Math.round(b / count)];
                }

                // Sample five segments to capture two pinks, two yellows and a blue
                const q = Math.floor(w / 5);
                const sP1 = sampleRange(0, q);
                const sP2 = sampleRange(q, 2 * q);
                const sY1 = sampleRange(2 * q, 3 * q);
                const sY2 = sampleRange(3 * q, 4 * q);
                const sB  = sampleRange(4 * q, w);

                const toRgb = (arr) => `rgb(${arr[0]}, ${arr[1]}, ${arr[2]})`;

                // Slightly darker variant of primary for hover/scroll states
                function darken(arr, factor) {
                    const [r, g, b] = arr;
                    const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)));
                    return `rgb(${clamp(r * factor)}, ${clamp(g * factor)}, ${clamp(b * factor)})`;
                }

                const palette = {
                    g1: toRgb(sP1),
                    g1b: toRgb(sP2),
                    g2a: toRgb(sY1),
                    g2b: toRgb(sY2),
                    g3: toRgb(sB),
                    primary: toRgb(sY1),
                    secondary: toRgb(sP1),
                    accent: toRgb(sB),
                    primaryDark: darken(sY1, 0.75)
                };

                setRootPalette(palette);

                try {
                    localStorage.setItem(PALETTE_KEY, JSON.stringify(palette));
                } catch (_) {
                    // Ignore storage failures (e.g., private mode)
                }
            } catch (e) {
                console.warn('Palette extraction failed:', e);
            }
        };
        img.src = src;
    })();

    // I18N: Language switching (he default, also ar/en)
    const setDirAndTitle = (lang) => {
        const isPrivacy = location.pathname.endsWith('privacy-policy.html');
        document.documentElement.dir = (lang === 'en') ? 'ltr' : 'rtl';
        document.documentElement.lang = lang;
        const titles = {
            he: isPrivacy ? 'מדיניות פרטיות - LandingAI' : 'LandingAI - בונה אתרים מבוסס בינה מלאכותית',
            en: isPrivacy ? 'Privacy Policy - LandingAI' : 'LandingAI - AI Website Builder',
            ar: isPrivacy ? 'سياسة الخصوصية - LandingAI' : 'LandingAI - مُنشئ مواقع بالذكاء الاصطناعي'
        };
        if (titles[lang]) document.title = titles[lang];
    };

    const applyI18nMap = (lang) => {
        const isPrivacy = location.pathname.endsWith('privacy-policy.html');

        const mapIndex = {
            // Navbar (index)
            'a.nav-link[href="#features"]': { he: 'תכונות', en: 'Features', ar: 'الميزات' },
            'a.nav-link[href="#how-it-works"]': { he: 'איך זה עובד', en: 'How it works', ar: 'كيف يعمل' },
            'a.nav-link[href="#demo"]': { he: 'הדגמה', en: 'Demo', ar: 'العرض' },
            'a.nav-link[href="#pricing"]': { he: 'תמחור', en: 'Pricing', ar: 'التسعير' },
            'a.nav-link[href="#contact"]': { he: 'צור קשר', en: 'Contact', ar: 'تواصل' },

            // Hero
            '.hero-title': {
                he: 'עדכוני אתר עם AI <span class="gradient-text">בלחיצה אחת</span>',
                en: 'Update your site with AI <span class="gradient-text">in one click</span>',
                ar: 'تحديث موقعك بالذكاء الاصطناعي <span class="gradient-text">بنقرة واحدة</span>'
            },
            '.hero-description': {
                he: 'ערכו טקסטים, תמונות ודפים בשיחה עם ה‑AI — השינויים מתעדכנים מיד וללא תלות במתכנת.',
                en: 'Edit text, images and pages by chatting with AI — changes apply instantly, no developer needed.',
                ar: 'حرر النصوص والصور والصفحات بالدردشة مع الذكاء الاصطناعي — التغييرات فورية وبدون مطور.'
            },
            '.hero-cta .btn-primary .btn-label': { he: 'התחילו לבנות עכשיו', en: 'Start building', ar: 'ابدأ الآن' },
            '.hero-cta .btn-outline .btn-label': { he: 'צפו בהדגמה', en: 'Watch demo', ar: 'شاهد العرض' },

            // Stats
            '.hero-stats .stat:nth-child(1) .stat-label': { he: 'אתרים שנוצרו', en: 'Sites created', ar: 'مواقع مُنشأة' },
            '.hero-stats .stat:nth-child(2) .stat-label': { he: 'מודלים של בינה מלאכותית', en: 'AI models', ar: 'أدوات ذكاء اصطناعي' },
            '.hero-stats .stat:nth-child(3) .stat-label': { he: 'זמינות', en: 'Uptime', ar: 'جاهزية' },

            // Preview card
            '.preview-header .badge span': { he: 'AI Builder', en: 'AI Builder', ar: 'منشئ بالذكاء الاصطناعي' },
            '.preview-header h4': { he: 'תצוגת עיצוב', en: 'Design preview', ar: 'معاينة التصميم' },
            '.preview-header p': { he: 'פריסות יפות ורספונסיביות שנוצרו עבורכם', en: 'Beautiful, responsive layouts generated for you', ar: 'تصاميم جميلة ومتجاوبة تُنشأ لك' },
            '.checklist li:nth-child(1) span': { he: 'קטע הירו עם גרדיאנט', en: 'Gradient hero section', ar: 'قسم بطل بتدرج' },
            '.checklist li:nth-child(2) span': { he: 'אנימציות חלקות', en: 'Smooth animations', ar: 'حركات سلسة' },
            '.checklist li:nth-child(3) span': { he: 'עיצוב מותאם לנייד', en: 'Mobile‑friendly design', ar: 'تصميم ملائم للجوال' },

            // Features section header
            '#features .section-header h2': { he: 'ניהול אתר עם AI', en: 'Manage your site with AI', ar: 'إدارة موقعك بالذكاء الاصطناعي' },
            '#features .section-header p': {
                he: 'שינויי תוכן בלחיצה ושדרוגים מיידיים — אתם מבקשים, ה‑AI מבצע.',
                en: 'One‑click content edits and instant upgrades — you ask, the AI does.',
                ar: 'تعديلات محتوى بنقرة واحدة وترقيات فورية — أنت تطلب والذكاء الاصطناعي ينفذ.'
            },

            // Feature cards (1..6)
            '.features-grid .feature-card:nth-child(1) h3': { he: 'עריכה בשפה טבעית', en: 'Natural‑language editing', ar: 'تحرير باللغة الطبيعية' },
            '.features-grid .feature-card:nth-child(1) p': { he: 'כותבים מה רוצים לשנות — ה‑AI מבצע ומעדכן את האתר עבורכם.', en: 'Write what you want to change — AI applies it and updates your site.', ar: 'اكتب ما تريد تغييره — يقوم الذكاء الاصطناعي بالتنفيذ وتحديث موقعك.' },

            '.features-grid .feature-card:nth-child(2) h3': { he: 'קוד אוטומטי', en: 'Auto code', ar: 'كود تلقائي' },
            '.features-grid .feature-card:nth-child(2) p': { he: 'ה‑AI מייצר קוד נקי ומהיר ומחיל את השינויים בלחיצה — בלי לגעת בקוד.', en: 'AI generates clean, fast code and applies changes — no manual coding.', ar: 'يُنشئ الذكاء الاصطناعي كودًا نظيفًا وسريعًا ويطبق التغييرات — دون كتابة يدوية.' },

            '.features-grid .feature-card:nth-child(3) h3': { he: 'רספונסיבי אוטומטי', en: 'Auto responsive', ar: 'توافق تلقائي' },
            '.features-grid .feature-card:nth-child(3) p': { he: 'האתר נראה מצוין בכל מכשיר והעדכונים שלכם מתרעננים מיד.', en: 'Looks great on every device, updates refresh instantly.', ar: 'يبدو رائعًا على كل جهاز وتحديثاتك فورية.' },

            '.features-grid .feature-card:nth-child(4) h3': { he: 'בקרת גרסאות', en: 'Version control', ar: 'التحكم بالإصدارات' },
            '.features-grid .feature-card:nth-child(4) p': { he: 'היסטוריית שינויים מלאה עם ביטול/חזרה בלחיצה ופרסום מובנה.', en: 'Full change history with one‑click undo/redo and built‑in publishing.', ar: 'سجل تغييرات كامل مع تراجع/إعادة بنقرة واحدة ونشر مدمج.' },

            '.features-grid .feature-card:nth-child(5) h3': { he: 'מסד נתונים', en: 'Database', ar: 'قاعدة البيانات' },
            '.features-grid .feature-card:nth-child(5) p': { he: 'חיבור מהיר ל‑PostgreSQL וניטור נתונים בעזרת ה‑AI — בלי תצורה מורכבת.', en: 'Quick PostgreSQL hookup and AI‑assisted monitoring — no complex setup.', ar: 'ربط سريع بـ PostgreSQL ومراقبة بمساعدة الذكاء الاصطناعي — دون إعداد معقد.' },

            '.features-grid .feature-card:nth-child(6) h3': { he: 'פריסה בלחיצה', en: 'One‑click deploy', ar: 'نشر بنقرة واحدة' },
            '.features-grid .feature-card:nth-child(6) p': { he: 'פרסום מיידי עם תשתית אמינה ותמיכה ב‑Docker — מהרעיון לאוויר במהירות.', en: 'Instant publishing with reliable infra and Docker support — from idea to live fast.', ar: 'نشر فوري ببنية تحتية موثوقة ودعم Docker — من الفكرة إلى الإطلاق سريعًا.' },

            // How it works
            '#how-it-works .section-header h2': { he: 'איך זה עובד', en: 'How it works', ar: 'كيف يعمل' },
            '#how-it-works .section-header p': { he: 'בונים, משפרים ומפרסמים בעזרת ה‑AI.', en: 'Build, improve and publish with AI.', ar: 'ابنِ وحسّن وانشر بمساعدة الذكاء الاصطناعي.' },

            '#how-it-works .step:nth-child(1) h3': { he: 'תיאור קצר', en: 'Brief description', ar: 'وصف قصير' },
            '#how-it-works .step:nth-child(1) p': { he: 'ספרו בשפה טבעית מה רוצים לשנות — בלי מונחים טכניים.', en: 'Describe in natural language what to change — no tech terms.', ar: 'اشرح باللغة الطبيعية ما تريد تغييره — دون مصطلحات تقنية.' },

            '#how-it-works .step:nth-child(2) h3': { he: 'ה‑AI בונה', en: 'AI builds', ar: 'الذكاء الاصطناعي يبني' },
            '#how-it-works .step:nth-child(2) p': { he: 'ה‑AI מייצר קוד נקי ומעדכן את האתר — הבעלות נשארת אצלכם.', en: 'AI generates clean code and updates the site — you keep ownership.', ar: 'ينشئ الذكاء الاصطناعي كودًا نظيفًا ويحدّث الموقع — والملكية تبقى لك.' },

            '#how-it-works .step:nth-child(3) h3': { he: 'תצוגה ושיפור', en: 'Preview and refine', ar: 'معاينة وتحسين' },
            '#how-it-works .step:nth-child(3) p': { he: 'רואים את השינויים מיד ומדייקים בלחיצה.', en: 'See changes instantly and fine‑tune with a click.', ar: 'شاهد التغييرات فورًا ودقّقها بنقرة.' },

            '#how-it-works .step:nth-child(4) h3': { he: 'פרסום בלחיצה', en: 'One‑click publish', ar: 'نشر بنقرة واحدة' },
            '#how-it-works .step:nth-child(4) p': { he: 'מפרסמים ושומרים על עדכונים שוטפים ללא מאמץ.', en: 'Publish and keep updates flowing effortlessly.', ar: 'انشر واستمر بالتحديث بسهولة.' },

            // Demo
            '#demo .section-header h2': { he: 'הדגמה', en: 'Demo', ar: 'العرض' },
            '#demo .section-header p': { he: 'כך ה‑AI משנה טקסטים ותמונות באתר בזמן אמת, בלי מתכנת.', en: 'See AI update text and images live — no developer needed.', ar: 'شاهد الذكاء الاصطناعي يحدّث النصوص والصور مباشرة — دون مطور.' },
            '.video-placeholder p': { he: 'סרטון הדגמה אינטראקטיבי', en: 'Interactive demo video', ar: 'فيديو عرض تفاعلي' },
            '.demo-feature:nth-child(1) span': { he: 'יצירת קוד בזמן אמת', en: 'Real‑time code', ar: 'كود فوري' },
            '.demo-feature:nth-child(2) span': { he: 'עדכוני תצוגה חיים', en: 'Live previews', ar: 'معاينات مباشرة' },
            '.demo-feature:nth-child(3) span': { he: 'עריכה בשפה טבעית', en: 'Natural‑language editing', ar: 'تحرير باللغة الطبيعية' },
            '.demo-feature:nth-child(4) span': { he: 'פריסה מיידית', en: 'Instant deploy', ar: 'نشر فوري' },

            // Pricing
            '#pricing .section-header h2': { he: 'החבילות שלנו', en: 'Tailored pricing', ar: 'تسعير مخصص' },
            '#pricing .section-header p': { he: 'רוצים להיות חלק מהמהפכה תרשמו עכשיו', en: 'We tailor a plan to your needs — no public price tags.', ar: 'نُعدّ خطة تناسب احتياجاتك — دون أسعار معروضة.' },

            '.pricing-card:nth-child(1) .pricing-header h3': { he: 'בסיסי', en: 'Basic', ar: 'أساسي' },
            '.pricing-card:nth-child(1) .plan-note': { he: 'תמחור מותאם אישית', en: 'Custom pricing', ar: 'تسعير مخصص' },
            '.pricing-card:nth-child(1) .pricing-features li:nth-child(1)': { he: 'אתר אחד', en: '1 site', ar: 'موقع واحد' },
            '.pricing-card:nth-child(1) .pricing-features li:nth-child(2)': { he: 'מודלי AI בסיסיים', en: 'Basic AI models', ar: 'نماذج ذكاء اصطناعي أساسية' },
            '.pricing-card:nth-child(1) .pricing-features li:nth-child(3)': { he: 'תמיכה במייל', en: 'Email support', ar: 'دعم عبر البريد الإلكتروني' },
            '.pricing-card:nth-child(1) .pricing-features li:nth-child(4)': { he: 'אינטגרציה ל‑GitHub', en: 'GitHub integration', ar: 'تكامل مع GitHub' },

            '.pricing-card.featured .pricing-badge': { he: 'הכי פופולרי', en: 'Most Popular', ar: 'الأكثر شيوعًا' },
            '.pricing-card.featured .pricing-header h3': { he: 'בינוני', en: 'Medium', ar: 'متوسط' },
            '.pricing-card.featured .plan-note': { he: 'תמחור מותאם אישית', en: 'Custom pricing', ar: 'تسعير مخصص' },
            '.pricing-card.featured .pricing-features li:nth-child(1)': { he: 'עד 5 אתרים', en: 'Up to 5 sites', ar: 'حتى 5 مواقع' },
            '.pricing-card.featured .pricing-features li:nth-child(2)': { he: 'מודלי AI מתקדמים', en: 'Advanced AI models', ar: 'نماذج ذكاء اصطناعي متقدمة' },
            '.pricing-card.featured .pricing-features li:nth-child(3)': { he: 'תמיכה בצ׳אט ועדיפות', en: 'Priority chat support', ar: 'دعم دردشة وأولوية' },
            '.pricing-card.featured .pricing-features li:nth-child(4)': { he: 'אינטגרציה למסד נתונים', en: 'Database integration', ar: 'تكامل قاعدة بيانات' },
            '.pricing-card.featured .pricing-features li:nth-child(5)': { he: 'דומיין מותאם אישית', en: 'Custom domain', ar: 'نطاق مخصص' },

            '.pricing-card:nth-child(3) .pricing-header h3': { he: 'ארגוני', en: 'Enterprise', ar: 'مؤسسي' },
            '.pricing-card:nth-child(3) .plan-note': { he: 'תמחור מותאם אישית', en: 'Custom pricing', ar: 'تسعير مخصص' },
            '.pricing-card:nth-child(3) .pricing-features li:nth-child(1)': { he: 'הכול בחבילת המקצועי', en: 'Everything in Pro', ar: 'كل ما في الاحترافي' },
            '.pricing-card:nth-child(3) .pricing-features li:nth-child(2)': { he: 'פתרון White‑label', en: 'White‑label solution', ar: 'حل بعلامة بيضاء' },
            '.pricing-card:nth-child(3) .pricing-features li:nth-child(3)': { he: 'תמיכה ייעודית', en: 'Dedicated support', ar: 'دعم مخصص' },
            '.pricing-card:nth-child(3) .pricing-features li:nth-child(4)': { he: 'אינטגרציות מותאמות', en: 'Custom integrations', ar: 'تكاملات مخصصة' },
            '.pricing-card:nth-child(3) .pricing-features li:nth-child(5)': { he: 'התחייבות SLA', en: 'SLA commitment', ar: 'التزام SLA' },
            '.pricing-card:nth-child(3) .btn .btn-label': { he: 'צור קשר עם המכירות', en: 'Contact sales', ar: 'تواصل مع المبيعات' },

            // CTA
            '.cta h2': { he: 'שולטים באתר עם AI', en: 'Master your site with AI', ar: 'سيطر على موقعك بالذكاء الاصطناعي' },
            '.cta p': { he: 'מבקשים מה‑AI — והוא מעדכן תוכן, מבצעים ועיצוב מיד.', en: 'Ask the AI — it updates content, promos and design instantly.', ar: 'اطلب من الذكاء الاصطناعي — وسيحدّث المحتوى والعروض والتصميم فورًا.' },
            '.cta .btn-primary .btn-label': { he: 'התחילו עכשיו', en: 'Get started', ar: 'ابدأ الآن' },
            '.cta .btn-outline .btn-label': { he: 'תיאום הדגמה', en: 'Book a demo', ar: 'احجز عرضًا' },

            // Footer
            '.footer .footer-content .footer-section:nth-child(1) p': {
                he: 'אתר עסקי בשליטה מלאה — עדכונים בלחיצה אחת עם AI, בלי מתכנת ובלי קוד.',
                en: 'A business website in your control — one‑click updates with AI, no developer and no code.',
                ar: 'موقع أعمال تحت سيطرتك — تحديثات بنقرة واحدة بالذكاء الاصطناعي، دون مطور أو كود.'
            },
            '.footer .footer-content .footer-section:nth-child(2) h4': { he: 'מוצר', en: 'Product', ar: 'المنتج' },
            '.footer .footer-content .footer-section:nth-child(3) h4': { he: 'חברה', en: 'Company', ar: 'الشركة' },
            '.footer .footer-content .footer-section:nth-child(4) h4': { he: 'משאבים', en: 'Resources', ar: 'الموارد' },

            '.footer .footer-content .footer-section:nth-child(2) ul li:nth-child(1) a': { he: 'תכונות', en: 'Features', ar: 'الميزات' },
            '.footer .footer-content .footer-section:nth-child(2) ul li:nth-child(2) a': { he: 'תמחור', en: 'Pricing', ar: 'التسعير' },
            '.footer .footer-content .footer-section:nth-child(2) ul li:nth-child(3) a': { he: 'הדגמה', en: 'Demo', ar: 'العرض' },
            '.footer .footer-content .footer-section:nth-child(2) ul li:nth-child(4) a': { he: 'API', en: 'API', ar: 'واجهة برمجة' },

            '.footer .footer-content .footer-section:nth-child(3) ul li:nth-child(1) a': { he: 'אודות', en: 'About', ar: 'نبذة' },
            '.footer .footer-content .footer-section:nth-child(3) ul li:nth-child(2) a': { he: 'בלוג', en: 'Blog', ar: 'مدونة' },
            '.footer .footer-content .footer-section:nth-child(3) ul li:nth-child(3) a': { he: 'קריירה', en: 'Careers', ar: 'وظائف' },
            '.footer .footer-content .footer-section:nth-child(3) ul li:nth-child(4) a': { he: 'צור קשר', en: 'Contact', ar: 'تواصل' },

            '.footer .footer-content .footer-section:nth-child(4) ul li:nth-child(1) a': { he: 'תיעוד', en: 'Docs', ar: 'توثيق' },
            '.footer .footer-content .footer-section:nth-child(4) ul li:nth-child(2) a': { he: 'מרכז עזרה', en: 'Help center', ar: 'مركز المساعدة' },
            '.footer .footer-content .footer-section:nth-child(4) ul li:nth-child(3) a': { he: 'קהילה', en: 'Community', ar: 'المجتمع' },
            '.footer .footer-content .footer-section:nth-child(4) ul li:nth-child(4) a': { he: 'סטטוס', en: 'Status', ar: 'الحالة' },

            '.footer-bottom p': {
                he: '© 2024 LandingAI. כל הזכויות שמורות.',
                en: '© 2024 LandingAI. All rights reserved.',
                ar: '© 2024 LandingAI. جميع الحقوق محفوظة.'
            },
            '.footer-bottom .footer-links a:nth-child(1)': { he: 'מדיניות פרטיות', en: 'Privacy Policy', ar: 'سياسة الخصوصية' },
            '.footer-bottom .footer-links a:nth-child(2)': { he: 'תנאי שימוש', en: 'Terms of Use', ar: 'شروط الاستخدام' },
            '.footer-bottom .footer-links a:nth-child(3)': { he: 'מדיניות קוקיות', en: 'Cookie Policy', ar: 'سياسة ملفات الارتباط' }
        };

        const mapPrivacy = {
            // Navbar (privacy page)
            'nav .nav-menu a[href="index.html"]': { he: 'בית', en: 'Home', ar: 'الرئيسية' },
            'nav .nav-menu a[href="index.html#features"]': { he: 'תכונות', en: 'Features', ar: 'الميزات' },
            'nav .nav-menu a[href="index.html#pricing"]': { he: 'תמחור', en: 'Pricing', ar: 'التسعير' },
            'nav .nav-menu a[href="index.html#contact"]': { he: 'צור קשר', en: 'Contact', ar: 'تواصل' },

            // Back link
            '.back-link .link-label': { he: 'חזרה לדף הבית', en: 'Back to home', ar: 'الرجوع للصفحة الرئيسية' },

            // Header
            '.privacy-header h1': { he: 'מדיניות פרטיות', en: 'Privacy Policy', ar: 'سياسة الخصوصية' },
            '.privacy-header p': {
                he: 'הפרטיות שלכם חשובה לנו. מדיניות זו מסבירה כיצד אנו אוספים, משתמשים ומגנים על המידע שלכם.',
                en: 'Your privacy matters to us. This policy explains how we collect, use and protect your information.',
                ar: 'خصوصيتك تهمنا. توضح هذه السياسة كيفية جمع معلوماتك واستخدامها وحمايتها.'
            }
        };

        const chosen = {};
        const source = isPrivacy ? mapPrivacy : mapIndex;
        Object.assign(chosen, source);

        // Apply all selectors
        Object.entries(chosen).forEach(([selector, values]) => {
            const el = document.querySelector(selector);
            if (!el) return;
            const val = values[lang] ?? values['he'];
            if (val == null) return;
            if (val.includes && val.includes('<')) {
                el.innerHTML = val;
            } else {
                el.textContent = val;
            }
        });
    };

    const setLanguage = (lang) => {
        const allowed = ['he', 'en', 'ar'];
        if (!allowed.includes(lang)) lang = 'he';
        localStorage.setItem('lang', lang);
        setDirAndTitle(lang);
        applyI18nMap(lang);
        // Toggle active state
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === lang);
        });
        // Re-measure navbar height after language change
        setTimeout(updateNavHeight, 0);
    };

    // Bind language buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
    });

    // Initialize language (default Hebrew)
    setLanguage(localStorage.getItem('lang') || 'he');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            // Recalculate navbar height after menu toggle
            setTimeout(updateNavHeight, 0);
        });
    }
    
    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const navbarHeight = (document.querySelector('.navbar')?.offsetHeight) || 70;
                const topBannerHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--top-banner-height')) || 0;
                const offsetTop = targetSection.offsetTop - (navbarHeight + topBannerHeight); // Account for fixed navbar + top banner
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Navbar background change on scroll + Back-to-top button
    const navbar = document.querySelector('.navbar');

    // Create sticky back-to-top button (uses provided image)
    const backToTopBtn = document.createElement('button');
    backToTopBtn.className = 'back-to-top';
    backToTopBtn.setAttribute('aria-label', 'חזרה לראש העמוד');
    const img = document.createElement('img');
    img.src = 'https://i.ibb.co/KpsgB651/cdeb8429e526.png';
    img.alt = 'Back to top';
    img.onerror = () => {
        backToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    };
    backToTopBtn.appendChild(img);
    document.body.appendChild(backToTopBtn);

    // Scroll to top on click
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Toggle UI on scroll (navbar style + button visibility)
    const toggleUiOnScroll = () => {
        const y = window.scrollY || document.documentElement.scrollTop || 0;

        if (navbar) {
            if (y > 50) {
                navbar.style.background = 'rgba(255, 255, 255, 0.98)';
                navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
            } else {
                navbar.style.background = 'rgba(255, 255, 255, 0.95)';
                navbar.style.boxShadow = 'none';
            }
        }

        if (backToTopBtn) {
            if (y > 400) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
        }
    };

    // Throttle using rAF
    let ticking = false;
    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                toggleUiOnScroll();
                ticking = false;
            });
            ticking = true;
        }
    });

    // Apply initial state on load
    toggleUiOnScroll();
    
    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.feature-card, .step, .pricing-card, .demo-feature, .slide');
    animatedElements.forEach(el => {
        observer.observe(el);
    });

    // Gallery slideshow
    (function initGallerySlideshow() {
        const gallery = document.querySelector('#gallery .slideshow');
        if (!gallery) return;

        const slides = Array.from(gallery.querySelectorAll('.slide'));
        const dotsContainer = gallery.querySelector('.dots');
        const prevBtn = gallery.querySelector('.prev');
        const nextBtn = gallery.querySelector('.next');

        let current = 0;
        let timer = null;
        const INTERVAL = 5000;

        const goTo = (index) => {
            if (!slides.length) return;
            current = (index + slides.length) % slides.length;
            slides.forEach((s, i) => {
                s.classList.toggle('active', i === current);
                s.setAttribute('aria-hidden', i === current ? 'false' : 'true');
            });
            const dots = dotsContainer ? Array.from(dotsContainer.children) : [];
            dots.forEach((d, i) => d.classList.toggle('active', i === current));
        };

        const next = () => goTo(current + 1);
        const prev = () => goTo(current - 1);

        const start = () => {
            stop();
            timer = setInterval(next, INTERVAL);
        };
        const stop = () => {
            if (timer) clearInterval(timer);
            timer = null;
        };

        if (prevBtn) prevBtn.addEventListener('click', () => { prev(); start(); });
        if (nextBtn) nextBtn.addEventListener('click', () => { next(); start(); });

        if (dotsContainer && slides.length > 1) {
            dotsContainer.innerHTML = slides.map((_, i) => `<button class="dot" aria-label="שקופית ${i+1}"></button>`).join('');
            Array.from(dotsContainer.children).forEach((btn, i) => {
                btn.addEventListener('click', () => { goTo(i); start(); });
            });
        }

        // Keyboard navigation
        gallery.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight') { next(); start(); }
            if (e.key === 'ArrowLeft') { prev(); start(); }
        });
        gallery.setAttribute('tabindex', '0');

        // Pause on hover
        gallery.addEventListener('mouseenter', stop);
        gallery.addEventListener('mouseleave', start);

        // Swipe support
        let touchStartX = null;
        gallery.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].clientX;
        }, { passive: true });
        gallery.addEventListener('touchend', (e) => {
            if (touchStartX == null) return;
            const dx = e.changedTouches[0].clientX - touchStartX;
            if (Math.abs(dx) > 50) {
                if (dx < 0) next(); else prev();
                start();
            }
            touchStartX = null;
        });

        goTo(0);
        if (slides.length > 1) start();
    })();
    
    // Chat assistant removed
    // Pricing card hover effects
    const pricingCards = document.querySelectorAll('.pricing-card');
    pricingCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            if (!this.classList.contains('featured')) {
                this.style.transform = 'translateY(0) scale(1)';
            } else {
                this.style.transform = 'translateY(-5px) scale(1.05)';
            }
        });
    });
    
    // Feature cards hover effects
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px)';
            this.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)';
        });
    });
    
    // Button click animations
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Create ripple effect
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
    
    // Add ripple effect CSS
    const style = document.createElement('style');
    style.textContent = `
        .btn {
            position: relative;
            overflow: hidden;
        }
        
        .ripple {
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.3);
            transform: scale(0);
            animation: ripple-animation 0.6s linear;
            pointer-events: none;
        }
        
        @keyframes ripple-animation {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Parallax effect removed to keep margins/spacing consistent on scroll
    
    // Counter animation for stats
    const stats = document.querySelectorAll('.stat-number');
    const statsObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const finalValue = target.textContent;
                const isPercentage = finalValue.includes('%');
                const isPlus = finalValue.includes('+');
                const numericValue = parseInt(finalValue.replace(/[^\d]/g, ''));
                
                let current = 0;
                const increment = numericValue / 50;
                const timer = setInterval(() => {
                    current += increment;
                    if (current >= numericValue) {
                        current = numericValue;
                        clearInterval(timer);
                    }
                    
                    let displayValue = Math.floor(current);
                    if (isPercentage) displayValue += '%';
                    if (isPlus) displayValue += '+';
                    
                    target.textContent = displayValue;
                }, 30);
                
                statsObserver.unobserve(target);
            }
        });
    }, { threshold: 0.5 });
    
    stats.forEach(stat => {
        statsObserver.observe(stat);
    });
    
    // Demo video placeholder click handler
    const videoPlaceholder = document.querySelector('.video-placeholder');
    if (videoPlaceholder) {
        videoPlaceholder.addEventListener('click', function() {
            // Create modal for video demo
            const modal = document.createElement('div');
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.9);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                cursor: pointer;
            `;
            
            const videoContainer = document.createElement('div');
            videoContainer.style.cssText = `
                width: 80%;
                max-width: 800px;
                height: 60%;
                background: #000;
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 1.2rem;
                position: relative;
            `;
            
            const closeBtn = document.createElement('button');
            closeBtn.innerHTML = '&times;';
            closeBtn.style.cssText = `
                position: absolute;
                top: 10px;
                right: 15px;
                background: none;
                border: none;
                color: white;
                font-size: 2rem;
                cursor: pointer;
                z-index: 10001;
            `;
            
            videoContainer.innerHTML = `
                <div style="text-align: center;">
                    <i class="fas fa-play-circle" style="font-size: 4rem; margin-bottom: 1rem; color: var(--primary-color);"></i>
                    <p>סרטון הדגמה אינטראקטיבי</p>
                    <p style="font-size: 0.9rem; opacity: 0.7; margin-top: 0.5rem;">לחיצה בכל מקום תסגור</p>
                </div>
            `;
            
            videoContainer.appendChild(closeBtn);
            modal.appendChild(videoContainer);
            document.body.appendChild(modal);
            
            // Close modal handlers
            const closeModal = () => {
                document.body.removeChild(modal);
            };
            
            closeBtn.addEventListener('click', closeModal);
            modal.addEventListener('click', closeModal);
            videoContainer.addEventListener('click', (e) => e.stopPropagation());
        });
    }
    
    // Form validation and submission (for future contact forms)
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            // Add form submission logic here
            console.log('Form submitted');
        });
    });
    
    // Lazy loading for images (if any are added later)
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => {
        imageObserver.observe(img);
    });
    
    // Add loading animation
    window.addEventListener('load', function() {
        document.body.classList.add('loaded');
    });
    
    // Console welcome message
    console.log(`
    🚀 ברוכים הבאים ל-LandingAI!
    
    דף נחיתה זה מציג את בונה האתרים שלנו מבוסס הבינה המלאכותית.
    נבנה עם טכנולוגיות ווב מודרניות וסטנדרטים מובילים.
    
    תכונות:
    ✨ עיצוב רספונסיבי
    🎨 אנימציות מודרניות
    📱 גישה Mobile-first
    ⚡ ביצועים מיטביים
    
    מוכנים לבנות את אתר החלומות שלכם? בואו נתחיל!
    `);
});

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { debounce, throttle };
}
