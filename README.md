# الوحيس - تطبيق مشاركة الرحلات في العراق

تطبيق ويب لمشاركة الرحلات في العراق، يربط بين السائقين والركاب بطريقة سهلة وآمنة.

## المميزات

- واجهة مستخدم باللغة العربية
- تسجيل كسائق أو راكب
- طلب رحلة بسهولة
- تتبع حالة الرحلة
- نظام تقييم للسائقين والركاب

## المتطلبات التقنية

- Node.js (v14 أو أحدث)
- Python (v3.8 أو أحدث)
- pip (مدير حزم Python)
- npm (مدير حزم Node.js)

## تثبيت وتشغيل المشروع

### تثبيت الواجهة الأمامية (Frontend)

```bash
cd frontend
npm install
npm start
```

### تثبيت الخادم الخلفي (Backend)

```bash
cd backend
python -m venv venv
source venv/bin/activate  # على Linux/Mac
# أو
venv\Scripts\activate  # على Windows
pip install -r requirements.txt
python app.py
```

## المساهمة

نرحب بمساهماتكم! يرجى إنشاء fork للمشروع وتقديم pull request مع تغييراتكم.

## الترخيص

هذا المشروع مرخص تحت رخصة MIT.
