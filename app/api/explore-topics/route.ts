import { NextRequest, NextResponse } from 'next/server';
import { getGeminiCompletion } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const { keyword } = await request.json();

    if (!keyword) {
      return NextResponse.json(
        { error: 'Thiếu từ khóa' },
        { status: 400 }
      );
    }

    const prompt = `Với vai trò là một chuyên gia kiến thức, hãy dựa trên từ khóa "${keyword}" để tạo ra 8-12 chủ đề học tập liên quan.
Các chủ đề này cần:
1. Liên quan chặt chẽ đến từ khóa gốc
2. Bao quát nhiều khía cạnh kiến thức khác nhau
3. Có giá trị học tập
4. Mức độ khó đa dạng, từ cơ bản đến nâng cao
5. Mỗi chủ đề thể hiện bằng một cụm ngắn (không quá 15 ký tự)

Vui lòng trả về trực tiếp danh sách chủ đề, mỗi dòng một chủ đề, không đánh số hay thêm chữ khác.`;

    // Gọi Gemini
    const response = await getGeminiCompletion(prompt);

    // Tách từng dòng
    const topics = response
      .split('\n')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    return NextResponse.json({ topics });
    } catch (error: unknown) {
    console.error('Khám phá chủ đề thất bại:', error);
    let message = 'Khám phá chủ đề thất bại';
    if (error instanceof Error) {
      message = error.message;
    }
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
