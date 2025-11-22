# دليل اتجاه التطبيق من اليمين إلى اليسار (RTL)

## نظرة عامة
تم تحديث التطبيق بالكامل ليكون متوافقاً مع اللغة العربية مع اتجاه من اليمين إلى اليسار (RTL - Right to Left).

## التحديثات الرئيسية

### 1. ملف HTML الأساسي (`index.html`)
```html
<html lang="ar" dir="rtl">
```
- تم تعيين اللغة إلى العربية (`lang="ar"`)
- تم تعيين الاتجاه إلى RTL (`dir="rtl"`)

### 2. ملف CSS الرئيسي (`index.css`)
تم إضافة التحسينات التالية:

#### خصائص RTL الأساسية
```css
html {
  direction: rtl;
  scroll-behavior: smooth;
}

body {
  font-family: 'Cairo', sans-serif;
  direction: rtl;
  text-align: right;
}

input, textarea, select {
  text-align: right;
  direction: rtl;
}
```

#### قواعد RTL المخصصة
```css
[dir="rtl"] .ml-auto {
  margin-left: unset;
  margin-right: auto;
}

[dir="rtl"] .mr-auto {
  margin-right: unset;
  margin-left: auto;
}

[dir="rtl"] .text-left {
  text-align: right;
}

[dir="rtl"] .text-right {
  text-align: left;
}
```

### 3. مكونات React (`App.tsx`)
تم تحديث جميع الأيقونات لتستخدم `margin-right` بدلاً من `margin-left`:

#### قبل:
```tsx
<Icon className="ml-2" />
```

#### بعد:
```tsx
<Icon className="mr-2" />
```

### 4. التحسينات المطبقة

#### أ. الأيقونات والأزرار
- جميع الأيقونات في التبويبات تستخدم `mr-1` أو `mr-2`
- أيقونات الأزرار في الحوارات تستخدم `mr-1` أو `mr-2`
- Badge الإشعارات منقول من `-left-1` إلى `-right-1`

#### ب. النوافذ المنبثقة (Popovers)
- تم تغيير محاذاة PopoverContent من `align="end"` إلى `align="start"` للإشعارات

#### ج. حقول الإدخال
- جميع حقول النص (`input`, `textarea`, `select`) تبدأ من اليمين
- النص يُحاذى تلقائياً إلى اليمين

#### د. الرسوم المتحركة
- تم تحديث animation `slideInRight` لتصبح `slideInLeft`
- الإشعارات تنزلق من اليمين بدلاً من اليسار

## اختبار التوافق

### ما يجب اختباره:
1. ✅ جميع النصوص تبدأ من اليمين
2. ✅ الأيقونات على يمين النصوص
3. ✅ القوائم المنسدلة تفتح من اليمين
4. ✅ حقول الإدخال تبدأ الكتابة من اليمين
5. ✅ الإشعارات تظهر من الجانب الصحيح
6. ✅ التمرير والتنقل طبيعي

## التوافق مع المتصفحات
- ✅ Chrome/Edge
- ✅ Firefox
- ✅ Safari
- ✅ متصفحات الهواتف المحمولة

## الخط المستخدم
**Cairo** - خط عربي احترافي وواضح، مناسب للواجهات الحديثة

## ملاحظات مهمة

### الهوامش (Margins)
في RTL:
- `mr` (margin-right) يُستخدم للمسافة بين الأيقونة والنص
- `ml` (margin-left) لم يعد مناسباً في معظم الحالات

### المحاذاة (Alignment)
في RTL:
- `justify-start` يحاذي إلى اليمين
- `justify-end` يحاذي إلى اليسار
- `text-right` هو الافتراضي

### الأيقونات
- الأيقونات توضع على **يمين** النص في الأزرار
- الأيقونات في القوائم تكون على **يمين** العناصر

## الصيانة المستقبلية

عند إضافة مكونات جديدة:
1. تأكد من استخدام `mr-*` بدلاً من `ml-*` للأيقونات
2. استخدم `text-right` أو اترك المحاذاة افتراضية
3. تأكد من أن حقول الإدخال تبدأ من اليمين
4. اختبر التطبيق في وضع RTL

## أمثلة

### زر مع أيقونة
```tsx
<Button>
  <Plus className="mr-2" />
  إضافة جديد
</Button>
```

### حقل إدخال
```tsx
<Input 
  placeholder="أدخل النص هنا"
  className="text-right"
/>
```

### Badge مع موضع
```tsx
<span className="absolute -top-1 -right-1">
  {count}
</span>
```

## الدعم والمساعدة
للمزيد من المعلومات حول RTL في React وTailwind CSS، راجع:
- [Tailwind CSS RTL Support](https://tailwindcss.com/docs/hover-focus-and-other-states#rtl-support)
- [MDN - dir attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/dir)
