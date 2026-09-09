# إذاعة القرآن الكريم — قالب بث مباشر (Blogger + ويب)

![License: MIT](https://img.shields.io/badge/license-MIT-2ea377) ![Live](https://img.shields.io/badge/live-Blogger-0f6b52) ![CI](https://github.com/melied/quran-radio/actions/workflows/ci.yml/badge.svg)

<div dir="rtl">

صفحة ويب عربية واحدة (RTL) لتشغيل بث مباشر لإذاعات القرآن الكريم، موزعة بصيغتين متكاملتين:

| الصيغة | الملف | الاستخدام |
|---|---|---|
| قالب Blogger | `public/holy-quran-radio-blogger-template.xml` | تثبيتها كقالب مدونة على منصة Blogger |
| صفحة ويب ثابتة | `public/preview.html` | نسخة معاينة مستقلة تعمل في أي استضافة ثابتة |

**النسخة الحية (Blogger):** <https://holy-quran-radio1.blogspot.com>

<div align="center">
  <img src="docs/quran-radio-screenshot.png" alt="لقطة من واجهة إذاعة القرآن الكريم — بث مباشر" width="760" />
  <img src="docs/quran-radio-demo.gif" alt="عرض توضيحي متحرك لواجهة الإذاعة — يعمل تلقائيًا" width="700" />
  <p>🎬 <a href="docs/quran-radio.mp4">فيديو العرض التوضيحي بجودة كاملة (اضغط للمشاهدة)</a></p>
</div>

---

## المزايا

- بث مباشر لست إذاعات قرآنية: السعودية، الجزائر، مصر، التراتيل، العفاسي وعبدالباسط (تبديل فوري)
- تحكم كامل من شاشة القفل عبر MediaSession API (تشغيل/إيقاف/المحطة التالية)
- مؤقّت نوم: إيقاف تلقائي للبث بعد 5/10/15/30/45/60 دقيقة مع خفوت تدريجي للصوت
- مزامنة التبويبات: تشغيل الإذاعة في تبويب واحد فقط
- حفظ التفضيلات تلقائيًا: المحطة، مستوى الصوت، الخلفية
- خلفية قابلة للتخصيص: تدرج افتراضي، صورة أو فيديو (بالرفع من الجهاز أو برابط) — الملفات المرفوعة تُحفظ في متصفح جهازك (IndexedDB) وتُستعاد عند العودة
- إعادة اتصال تلقائية تصاعدية عند انقطاع البث (حتى 6 محاولات)
- أزرار مشاركة: نظام التشغيل، فيسبوك، ماسنجر، تيليجرام، واتساب، X، ونسخ الرابط
- دعم PWA كامل: قابل للتثبيت كتطبيق (manifest + أيقونات) مع وضع عدم اتصال عبر Service Worker وزر تثبيت مخصص
- مولّد قوالب: صفحة تولّد نسخة مخصصة من القالب بألوانك وعنوانك وإذاعاتك دون تعديل كود (generator.html)
- وصولية جيدة: وسوم aria، دعم قارئ الشاشة، إبراز التركيز، دعم تقليل الحركة
- ملف واحد قائم بذاته: كل CSS وJS مضمّنان، لا يحتاج أي build

## التثبيت على Blogger

1. من لوحة تحكم مدونتك على Blogger: **المظهر (Theme) ← السهم بجانب "تخصيص" ← استعادة/Restore** أو **تعديل HTML**.
2. ارفع ملف `public/holy-quran-radio-blogger-template.xml` (أو الصق محتواه في "تعديل HTML" واحفظ).
3. افتح مدونتك — ستعمل صفحة الراديو مباشرة، وستقرأ الصفحة عنوانها ورابطها تلقائيًا من بيانات المدونة (`data:blog`).

> **ملاحظة:** القالب يستخدم قسمًا مخفيًا واحدًا (`b:section`) لأن Blogger يفرض وجود قسم واحد على الأقل؛ لا تضف أدوات (Widgets) إليه.

بعد التثبيت يصبح رابط مدونتك هو الرابط الرسمي للبث: وسم `og:url` وروابط المشاركة يأخذان رابط مدونتك تلقائيًا عبر `data:blog.canonicalUrl`. التعديلات في هذا المستودع لا تصل لمدونتك تلقائيًا — عند تحديث القالب أعد رفع ملف XML (استعادة/Restore).

## التضمين داخل مدونتك (الإذاعة + تدويناتك معًا)

إن كنت تريد الإذاعة **بجانب تدويناتك** لا بدلًا منها، أضف ودجت **HTML/JavaScript** في بلوجر (المظهر ← تخطيط ← إضافة أداة) بالمحتوى التالي:

```html
<iframe src="https://quran-radio-ten.vercel.app/preview.html?embed=1" width="100%" height="430" style="border:0;border-radius:14px" loading="lazy" title="إذاعة القرآن الكريم - بث مباشر"></iframe>
```

- وضع `?embed=1` يعرض مشغلًا مصغّرًا (اختيار الإذاعة + المشغل + مؤقّت النوم) دون العنوان أو المشاركة.
- لتثبيت محطة معينة عند الفتح أضف `&station=N` حسب ترتيب القائمة (0=السعودية، 1=الجزائر، 2=مصر، 3=التراتيل، 4=العفاسي، 5=عبدالباسط).
- يعمل الكود في أي منصة تقبل HTML: ووردبريس، أي موقع، أو مدونات غير بلوجر.
- مولّد قوالب مخصص (ألوانك وعنوانك وإذاعاتك): [generator.html](https://quran-radio-ten.vercel.app/generator.html)

## التثبيت كصفحة ويب ثابتة

انسخ `public/` إلى أي استضافة ثابتة (Vercel، Netlify، GitHub Pages، استضافة cPanel عادية…) وافتح `preview.html`. لا حاجة لأي خطوة بناء.

### عبر المستودع (Next.js على Vercel)

```bash
pnpm install
pnpm dev        # http://localhost:3000 — يحوّل تلقائيًا إلى /preview.html
pnpm build      # بناء الإنتاج
```

الصفحة الرئيسية `/` تقوم بإعادة توجيه واحدة إلى `/preview.html` (ملف `app/page.tsx`).

## تخصيص المحطات

افتح الملف المستخدم (`preview.html` أو القالب) وابحث عن مصفوفة `radios` داخل السكربت:

```js
var radios = [
  { name:'إذاعة القرآن الكريم - السعودية', subtitle:'من المملكة العربية السعودية', url:'https://stream.radiojar.com/0tpy1h0kxtzuv' },
  { name:'إذاعة القرآن الكريم - الجزائر',  subtitle:'من الجمهورية الجزائرية',      url:'https://radiocoran.ice.infomaniak.ch/coran.mp3' },
  { name:'إذاعة القرآن الكريم - مصر',      subtitle:'من جمهورية مصر العربية',      url:'https://stream.radiojar.com/8s5u5tpdtwzuv' },
  { name:'إذاعة التراتيل',                 subtitle:'من شبكة mp3quran',            url:'https://qurango.net/radio/tarateel' },
  { name:'إذاعة القارئ مشاري العفاسي',     subtitle:'تلاوات مختارة على مدار الساعة', url:'https://backup.qurango.net/radio/mishary_alafasi' },
  { name:'إذاعة القارئ عبدالباسط عبدالصمد', subtitle:'تلاوات مختارة على مدار الساعة', url:'https://backup.qurango.net/radio/abdulbasit_abdulsamad' }
];
```

- `name`: اسم المحطة كما يظهر في القائمة وشاشة القفل
- `subtitle`: الوصف تحت الاسم (البلد)
- `url`: رابط البث المباشر (MP3 / Icecast / HLS الصوتي)

أضف أو احذف عناصر بحرية — قائمة الاختيار (select) والوسوم الأخرى تتحدث تلقائيًا. عدّل كذلك عناصر `<option>` داخل `<select id='radioSelect'>` لتطابق أسماء مصفوفة `radios`.

> روابط البث مملوكة لأصحابها (Radiojar، Infomaniak) وقد تتغير أو تتوقف دون سابق إنذار.

## تخصيص الألوان والهوية

عدّل متغيرات CSS في بداية `:root` داخل الملف:

```css
:root{
  --bg:#0b1f1a;        /* الخلفية الداكنة */
  --primary:#0f6b52;   /* الأخضر الأساسي */
  --gold:#c9a24a;      /* الذهبي (للتمييز) */
  --radius:20px;       /* استدارة الحواف */
}
```

## بنية المستودع

```
├── app/                  # قشرة Next.js: إعادة توجيه واحدة فقط
│   ├── layout.tsx
│   └── page.tsx          # redirect('/preview.html')
├── components/ui/        # زر shadcn (غير مستخدم في المنتج النهائي)
├── lib/utils.ts          # cn() (غير مستخدمة)
├── public/
│   ├── preview.html      # ★ المنتج الفعلي (صفحة كاملة قائمة بذاتها)
│   ├── holy-quran-radio-blogger-template.xml   # ★ قالب Blogger
│   ├── manifest.webmanifest   # بيانات PWA
│   ├── icon.svg / icon-192.png / icon-512.png  # أيقونات
│   ├── icon-maskable-512.png / apple-icon.png
└── package.json
```

## الرخصة

[MIT](LICENSE) — يمكنك استخدام القالب وتعديله وتوزيعه بحرية.

</div>
