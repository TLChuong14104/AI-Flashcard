import { NextResponse } from 'next/server';
import { getGeminiFlashcards } from '@/lib/gemini';

export async function POST(request: Request) {
  try {
    const { topic, content, cardCount, difficulty, mode } = await request.json();

    if (mode === 'topic' && !topic) {
      return NextResponse.json(
        { error: 'Vui lòng cung cấp chủ đề học tập' },
        { status: 400 }
      );
    }

    if (mode === 'content' && !content) {
      return NextResponse.json(
        { error: 'Vui lòng cung cấp nội dung học tập' },
        { status: 400 }
      );
    }

    const systemPrompt = `Bạn là một trợ lý giáo dục chuyên nghiệp, thành thạo trong việc tạo thẻ học (flashcard) chất lượng cao.
Yêu cầu:
1. Dù nội dung đầu vào là ngôn ngữ nào, luôn tạo thẻ hỏi–đáp bằng **tiếng Việt**.
2. Nếu nội dung đầu vào là tiếng Anh hoặc ngôn ngữ khác, câu trả lời có thể giữ nguyên văn gốc, nhưng giải thích **bắt buộc bằng tiếng Việt**.
3. Đảm bảo câu hỏi ngắn gọn, rõ ràng, câu trả lời chính xác và đầy đủ.
4. Trả về **chính xác** định dạng JSON, không kèm bất kỳ văn bản nào khác.
5. Với thuật ngữ chuyên ngành, có thể giữ cả nguyên văn và bản dịch tiếng Việt.
6. Hỗ trợ định dạng Markdown cho câu hỏi và câu trả lời, bao gồm:
   - Khối mã (\`\`\`), có ghi ngôn ngữ
   - Bảng (|…|)
   - Danh sách (- hoặc 1.)
   - **In đậm** và *In nghiêng*
   - Liên kết [text](URL)
   - Trích dẫn (>)
7. Với ví dụ code, sử dụng khối mã và ghi rõ ngôn ngữ lập trình.
8. Khái niệm quan trọng nên được **in đậm**.
9. Giải thích thuật ngữ chuyên môn ưu tiên hiển thị dạng **bảng**.
10. Hướng dẫn từng bước nên trình bày dưới dạng **danh sách có thứ tự**.`;

    let prompt = '';
    if (mode === 'topic') {
      prompt = `Hãy tạo cho tôi ${cardCount} thẻ flashcard về chủ đề "${topic}", độ khó ${difficulty}.
Sử dụng định dạng Markdown và trả về **đúng chuẩn JSON hợp lệ** như sau:
[
  {
    "question": "Câu hỏi (Markdown)",
    "answer": "Câu trả lời (Markdown)"
  }
]`;
    } else {
      prompt = `Hãy phân tách nội dung sau thành ${cardCount} thẻ flashcard:

Nội dung: ${content}

Sử dụng định dạng Markdown và trả về **đúng chuẩn JSON hợp lệ** như sau:
[
  {
    "question": "Câu hỏi (Markdown)",
    "answer": "Câu trả lời (Markdown)"
  }
]`;
    }

    const flashcards = await getGeminiFlashcards(prompt, systemPrompt);
    return NextResponse.json({ flashcards });
  } catch (error: any) {
    console.error('Tạo flashcard thất bại:', error);
    return NextResponse.json(
      { error: error.message || 'Tạo flashcard thất bại' },
      { status: 500 }
    );
  }
}