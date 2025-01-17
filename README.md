# الوحيس - منصة مشاركة الرحلات في العراق

[![Netlify Status](https://api.netlify.com/api/v1/badges/alwahis/alwahis/deploy-status)](https://app.netlify.com/sites/alwahis/deploys)

تطبيق ويب حديث لمشاركة الرحلات في العراق، يربط بين السائقين والركاب بطريقة سهلة وآمنة.

## التقنيات المستخدمة

- **الواجهة الأمامية**: React.js مع Material-UI
- **الخادم والقاعدة البيانات**: Supabase (Backend-as-a-Service)
- **الاستضافة**: Netlify
- **التحديثات المباشرة**: Supabase Realtime
- **المصادقة**: Supabase Auth

## المميزات

- واجهة مستخدم عربية حديثة وسهلة الاستخدام
- نظام مصادقة آمن
- البحث عن الرحلات ومشاركتها
- تحديثات مباشرة للطلبات والرسائل
- إدارة الملف الشخصي مع دعم الصور
- تصميم متجاوب يعمل على جميع الأجهزة

## المتطلبات

- Node.js (v18 أو أحدث)
- npm (مدير حزم Node.js)
- حساب Supabase
- حساب Netlify

## الإعداد والتشغيل

1. **إعداد المشروع**
```bash
# استنساخ المشروع
git clone https://github.com/yourusername/alwahis.git
cd alwahis

# تثبيت التبعيات
cd frontend
npm install
```

2. **إعداد المتغيرات البيئية**
انسخ ملف `.env.template` إلى `.env` وأضف بيانات الاعتماد الخاصة بك:
```env
REACT_APP_SUPABASE_URL=your-project-url
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

3. **تشغيل المشروع محلياً**
```bash
npm start
```

4. **إعداد قاعدة البيانات**
قم بتشغيل الأوامر التالية في لوحة تحكم Supabase SQL:
```sql
-- إنشاء جدول الملفات الشخصية
create table profiles (
  id uuid references auth.users primary key,
  full_name text,
  avatar_url text,
  phone text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- إنشاء جدول الرحلات
create table rides (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  from_location text not null,
  to_location text not null,
  departure_date timestamp with time zone not null,
  seats_available integer not null,
  price decimal not null,
  status text default 'draft',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- إنشاء جدول طلبات الرحلات
create table ride_requests (
  id uuid default uuid_generate_v4() primary key,
  ride_id uuid references rides not null,
  user_id uuid references auth.users not null,
  status text default 'pending',
  seats_requested integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);
```

## النشر

1. **إنشاء مستودع على GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/alwahis.git
git push -u origin main
```

2. **النشر على Netlify**
- اربط مشروعك على Netlify بمستودع GitHub
- أضف متغيرات البيئة في إعدادات Netlify
- سيتم النشر تلقائياً عند كل دفع للمستودع

## المساهمة

نرحب بمساهماتكم! يرجى إنشاء fork للمشروع وتقديم pull request مع تغييراتكم.

## الترخيص

هذا المشروع مرخص تحت رخصة MIT.
