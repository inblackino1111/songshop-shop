# 🛍️ ร้านค้าสองนึง (SongNueng Store) — Vercel Ready Package

เว็บแอพร้านค้าไอดีพรีเมียม สบายตาทันสมัย พร้อมแอนิเมชัน Liquid Gooey Navigation Bar #2, ระบบสแกนตรวจสลิป Slip2Go อัตโนมัติ, ระบบแลกของรางวัลแต้มสะสม FIFO, และระบบหลังบ้าน (Admin Backoffice) เชื่อมต่อ API แม่ข่าย (baimon24hr.online) อัตโนมัติแบบเรียลไทม์

---

## 📁 โครงสร้างไฟล์ในโฟลเดอร์นี้

```text
songnueng-store/
├── index.html            # หน้าบ้านร้านค้าหลัก (หน้าแรก, สินค้า, แลกของรางวัล, ออเดอร์)
├── shop.html             # หน้าหมวดหมู่สินค้า
├── rewards.html          # หน้าแลกของรางวัล
├── orders.html           # หน้าประวัติการสั่งซื้อ
├── admin.html            # หน้าจัดการหลังบ้าน (Admin Backoffice)
├── auth.html             # หน้าเข้าสู่ระบบและสมัครสมาชิก
├── core.css              # สไตล์หลักของระบบ
├── pages.css             # สไตล์หน้าร้านค้าและ Liquid Dock Navigation Bar #2
├── vercel.json           # การตั้งค่า Vercel (Clean URLs, CORS Headers, Caching)
├── package.json          # ข้อมูลโปรเจกต์
├── .gitignore            # ไฟล์ที่ไม่ต้องการให้อัปโหลดขึ้น Git
├── api/
│   └── proxy.js          # Vercel Serverless Function แก้อาการติด CORS ของ API แม่ข่ายและ Slip2Go
├── css/                  # โฟลเดอร์สำรอง CSS
└── js/                   # โฟลเดอร์โมดูล JavaScript
```

---

## 🚀 วิธีเอาขึ้น Vercel (2 วิธีง่ายๆ)

### วิธีที่ 1: ผ่าน GitHub (แนะนำ ง่ายที่สุดและได้ลิงก์อัตโนมัติ)

1. เข้าเว็บ [GitHub.com](https://github.com/) แล้วเข้าสู่ระบบ
2. กดปุ่ม **New Repository** (ตั้งชื่อ เช่น `songnueng-store`) แล้วกด **Create repository**
3. ที่หน้า Repository กด **uploading an existing file**
4. ลากไฟล์และโฟลเดอร์ทั้งหมดในโฟลเดอร์ `songnueng-store` นี้ไปวาง แล้วกด **Commit changes**
5. เข้าเว็บ [Vercel.com](https://vercel.com/) แล้วล็อกอิน
6. กดปุ่ม **"Add New..."** ขวาบน $\rightarrow$ เลือก **"Project"**
7. จะเห็น Repository `songnueng-store` กดปุ่ม **Import**
8. การตั้งค่าหน้าจอ Deploy:
   - **Framework Preset**: เลือก `Other`
   - **Root Directory**: `./` (ปล่อยตามเดิม)
   - ไม่ต้องกรอก Build Command ใดๆ
9. กดปุ่ม **"Deploy"**
   - รอเพียงประมาณ 15 - 30 วินาที จะได้ URL เว็บไซต์พร้อมใช้งานทันที (เช่น `https://songnueng-store.vercel.app`)

---

### วิธีที่ 2: ใช้ Vercel CLI ผ่าน Terminal / VS Code

1. เปิดโฟลเดอร์ `songnueng-store` ใน VS Code หรือเปิด Command Prompt ในโฟลเดอร์นี้
2. รันคำสั่ง:
   ```bash
   npx vercel
   ```
3. กด `Enter` ตามคำแนะนำบนหน้าจอเพื่อเข้าสู่ระบบและ Deploy
4. เมื่อต้องการขึ้น Production โดยตรง ให้รัน:
   ```bash
   npx vercel --prod
   ```

---

## 🌐 การเข้าใช้งานหลังจาก Deploy เสร็จสิ้น

- **หน้าบ้าน (Storefront สำหรับลูกค้า):**
  - `https://your-project.vercel.app/`
  - หรือ `https://your-project.vercel.app/shop`
  - หรือ `https://your-project.vercel.app/rewards`
  - หรือ `https://your-project.vercel.app/orders`
- **ระบบหลังบ้าน (Admin Backoffice):**
  - `https://your-project.vercel.app/admin` (หรือ `/admin.html`)
- **API Serverless Proxy:**
  - `https://your-project.vercel.app/api/proxy` (ทำงานเบื้องหลังโดยอัตโนมัติเพื่อแก้ปัญหา CORS ให้ทั้งระบบ)
