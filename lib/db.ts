import sqlite3 from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Đảm bảo thư mục cơ sở dữ liệu tồn tại
const DB_DIR = path.join(process.cwd(), '.local');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Kết nối đến cơ sở dữ liệu SQLite (tạo file flashcards.db trong thư mục .local)
const db = sqlite3(path.join(DB_DIR, 'flashcards.db'));

// Khởi tạo bảng trong cơ sở dữ liệu (nếu chưa tồn tại)
db.exec(`
  CREATE TABLE IF NOT EXISTS marked_cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,        -- Khóa chính, tự tăng
    topic TEXT NOT NULL,                         -- Chủ đề
    question TEXT NOT NULL,                       -- Câu hỏi
    answer TEXT NOT NULL,                         -- Câu trả lời
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP  -- Thời điểm tạo, mặc định là thời gian hiện tại
  );
`);

export interface MarkedCard {
  id: number;         // ID của thẻ
  topic: string;      // Chủ đề
  question: string;   // Câu hỏi
  answer: string;     // Câu trả lời
  created_at: string; // Thời gian tạo
}

export const dbService = {
  // Thêm một thẻ vào danh sách đã đánh dấu
  markCard: (topic: string, question: string, answer: string) => {
    const stmt = db.prepare('INSERT INTO marked_cards (topic, question, answer) VALUES (?, ?, ?)');
    return stmt.run(topic, question, answer);
  },

  // Bỏ đánh dấu (xóa) một thẻ dựa trên ID
  unmarkCard: (id: number) => {
    const stmt = db.prepare('DELETE FROM marked_cards WHERE id = ?');
    return stmt.run(id);
  },

  // Lấy danh sách tất cả các thẻ đã đánh dấu, sắp xếp theo thời gian mới nhất
  getMarkedCards: (): MarkedCard[] => {
    const stmt = db.prepare('SELECT * FROM marked_cards ORDER BY created_at DESC');
    return stmt.all() as MarkedCard[];
  },
};
