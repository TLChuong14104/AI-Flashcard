import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { cards } = await request.json();

    // Kiểm tra dữ liệu cards hợp lệ
    if (!Array.isArray(cards) || cards.length === 0) {
      return NextResponse.json({ error: 'Dữ liệu thẻ (card) không hợp lệ' }, { status: 400 });
    }

    // Nhập (import) thẻ hàng loạt
    for (const card of cards) {
      if (!card.topic || !card.question || !card.answer) {
        continue; // Bỏ qua dữ liệu không hợp lệ
      }
      await dbService.markCard(card.topic, card.question, card.answer);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Nhập thẻ thất bại:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Nhập thẻ thất bại' },
      { status: 500 }
    );
  }
}
