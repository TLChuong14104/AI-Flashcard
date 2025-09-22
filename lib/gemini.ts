import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_API_KEY } from "./config";
import { jsonrepair } from "jsonrepair"; 

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export interface GeminiFlashcard {
  question: string;
  answer: string;
}

// Hàm helper để clean JSON response từ Gemini
function cleanGeminiJsonResponse(text: string): string {
  const cleaned = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "");
  const startIndex = cleaned.indexOf("[");
  const endIndex = cleaned.lastIndexOf("]");
  if (startIndex === -1) throw new Error("Không tìm thấy JSON array");
  if (endIndex === -1) return cleaned.slice(startIndex).trim() + "]";
  return cleaned.slice(startIndex, endIndex + 1).trim();
}

// ----------- HÀM GỌI GEMINI ĐỂ TRẢ VỀ VĂN BẢN ----------------
export async function getGeminiCompletion(prompt: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Bạn là một trợ lý giáo dục chuyên nghiệp, trả lời bằng TIẾNG VIỆT, ngắn gọn, rõ ràng.\n\n${prompt}`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2000,
      },
    });

    if (!result.response) throw new Error("Không nhận được phản hồi từ Gemini");

    return result.response.text().trim();
  } catch (error) {
    console.error("Lỗi gọi Gemini API:", error);
    throw new Error("Gọi AI interface thất bại");
  }
}

// ----------- HÀM GỌI GEMINI ĐỂ NHẬN FLASHCARD JSON ----------------
export async function getGeminiFlashcards(
  prompt: string,
  systemPrompt: string
): Promise<GeminiFlashcard[]> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const optimizedPrompt = `${systemPrompt}

CỰC KỲ QUAN TRỌNG - TUÂN THỦ NGHIÊM NGẶT:
1. Chỉ trả về JSON array thuần túy, bắt đầu bằng [ và kết thúc bằng ]
2. Không thêm bất kỳ text giải thích nào trước hoặc sau JSON
3. Không sử dụng markdown code blocks (ví dụ: \`\`\`json)
4. Chỉ dùng dấu ngoặc kép chuẩn " (không dùng dấu khác)
5. Không có ký tự xuống dòng \\n trong answers
6. Không dùng markdown (** hoặc *)
7. Câu trả lời ngắn gọn (≤ 200 ký tự)

Định dạng mẫu:
[
  {"question": "Câu hỏi ngắn gọn?", "answer": "Câu trả lời ngắn gọn"}
]

Yêu cầu của người dùng: ${prompt}

Bắt đầu ngay bằng [`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: optimizedPrompt }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 2000,
      },
    });

    if (!result.response) throw new Error("Không nhận được phản hồi từ Gemini");

    const content = result.response.text().trim();
    console.log("===== GEMINI RAW RESPONSE =====\n", content);

    const cleaned = cleanGeminiJsonResponse(content);
    console.log("===== CLEANED JSON =====\n", cleaned);

    let parsed: GeminiFlashcard[];
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = JSON.parse(jsonrepair(cleaned));
    }

    if (!Array.isArray(parsed)) throw new Error("Dữ liệu không phải array");

    return parsed.map((card, i) => ({
      question: String(card.question || `Câu hỏi ${i + 1}`)
        .replace(/\*/g, "")
        .trim(),
      answer: String(card.answer || "Chưa có đáp án")
        .replace(/\*/g, "")
        .replace(/\\n/g, " ")
        .trim(),
    }));
  } catch (error) {
    console.error("Lỗi gọi Gemini Flashcards API:", error);
    return [
      {
        question: "Không thể tạo flashcard từ yêu cầu này",
        answer:
          "Gemini trả về dữ liệu bị cắt cụt hoặc sai định dạng. Vui lòng thử lại với prompt ngắn gọn, rõ ràng hơn.",
      },
    ];
  }
}