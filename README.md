# AI-Flashcard

# 📚 AI-Flashcard

Ứng dụng Flashcard thông minh giúp **tạo thẻ học tự động** bằng AI (Google Gemini hoặc DeepSeek). 
Chỉ cần nhập **chủ đề** hoặc **nội dung**, hệ thống sẽ sinh flashcard để bạn ôn tập dễ dàng.

---

## 🌟 Tính năng chính

- ✨ **Tạo flashcard tự động** từ chủ đề hoặc nội dung văn bản.
- 🔎 **Khám phá chủ đề liên quan** dựa trên từ khóa.
- 📌 **Đánh dấu flashcard** để ôn lại sau.
- 🎨 Giao diện tiếng Việt, responsive với **Tailwind CSS**.
- 💾 Lưu trữ cục bộ bằng **SQLite (better-sqlite3)**.

---

## 🛠️ Công nghệ

| Công nghệ | Mục đích |
|---------------------------|----------------------------------|
| **Next.js (App Router)** | Frontend + Backend API |
| **React** | Xây dựng UI |
| **Tailwind CSS** | Thiết kế giao diện nhanh |
| **Google Gemini / DeepSeek API** | Sinh nội dung flashcard |
| **SQLite (better-sqlite3)** | Lưu trữ dữ liệu offline |
| **TypeScript** | Kiểm tra kiểu an toàn |

---

## 🔽 Cách tải mã nguồn

Bạn có thể **clone** bằng Git hoặc **tải file ZIP**.

### 1️⃣ Clone bằng Git (khuyến nghị)

```sh
# Cài Git trước (https://git-scm.com/downloads)
git clone https://github.com/TLChuong14104/AI-Flashcard.git
cd AI-Flashcard
```

### 2️⃣ Tải file ZIP

- Truy cập: [https://github.com/TLChuong14104/AI-Flashcard](https://github.com/TLChuong14104/AI-Flashcard)
- Nhấn nút **Code** → **Download ZIP**
- Giải nén file, sau đó mở thư mục vừa giải nén bằng VS Code.

---

## ⚙️ Thiết lập môi trường

### 1. Cài đặt Node.js & npm

Tải **Node.js LTS** (khuyến nghị 18.x hoặc 20.x): [https://nodejs.org](https://nodejs.org)

Kiểm tra phiên bản:
```sh
node -v
npm -v
```

### 2. Cài đặt gói phụ thuộc

Trong thư mục dự án:
```sh
npm install
```

hoặc

```sh
yarn install
```

### 3. Cài đặt các gói bổ sung
Cài đặt các gói cần thiết
```sh
npm install jsonrepair
```
```sh
npm install @google/generative-ai
```
```sh
npm install -D tailwindcss postcss autoprefixer
```
```sh
yarn add -D @types/better-sqlite3
```

### 4. Tạo file môi trường `.env.local`

Tại thư mục gốc, tạo file `.env.local`:
```env
# API key của Google Gemini
GEMINI_API_KEY=YOUR_GOOGLE_GEMINI_KEY
```

**Lấy API key tại:** [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)

---

## 🚀 Chạy ứng dụng

### Chế độ phát triển (hot reload)
```sh
npm run dev
```

Truy cập: [http://localhost:3000](http://localhost:3000)

### Build bản production
```sh
npm run build
npm start
```

---

## 📝 Hướng dẫn sử dụng

1. **Mở ứng dụng** tại `http://localhost:3000`
2. **Nhập chủ đề** bạn muốn học (ví dụ: "Lịch sử Việt Nam", "React Hooks")
3. **Chọn số lượng thẻ** muốn tạo (5-100 thẻ)
4. **Nhấn "Bắt đầu Học"** để AI tạo flashcard
5. **Ôn tập** bằng cách flip thẻ và đánh dấu những thẻ khó

---

## 🤝 Đóng góp

Mọi đóng góp đều được hoan nghênh! Hãy:

1. **Fork** repository này
2. **Tạo branch** mới (`git checkout -b feature/AmazingFeature`)
3. **Commit** thay đổi (`git commit -m 'Add some AmazingFeature'`)
4. **Push** lên branch (`git push origin feature/AmazingFeature`)
5. **Tạo Pull Request**

---

## 📄 Giấy phép

Dự án này được phát hành dưới giấy phép **MIT License**.

---

## 👨‍💻 Tác giả

**TLChuong14104** - [GitHub Profile](https://github.com/TLChuong14104)

---

## 🆘 Hỗ trợ

Nếu gặp vấn đề, hãy:
- Tạo **Issue** trên GitHub
- Kiểm tra **API key** đã được cấu hình đúng chưa
- Đảm bảo **Node.js version** >= 18.x
