import { NextRequest, NextResponse } from 'next/server';
import { dbService } from '@/lib/db';

export async function GET() {
  try {
    const markedCards = dbService.getMarkedCards();
    return NextResponse.json({ markedCards });
  } catch (error) {
    console.error('Lấy danh sách thẻ đã đánh dấu thất bại:', error);
    return NextResponse.json(
      { error: 'Lấy danh sách thẻ đã đánh dấu thất bại' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { topic, question, answer } = await req.json();
    dbService.markCard(topic, question, answer);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Đánh dấu thẻ thất bại:', error);
    return NextResponse.json(
      { error: 'Đánh dấu thẻ thất bại' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    dbService.unmarkCard(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Bỏ đánh dấu thẻ thất bại:', error);
    return NextResponse.json(
      { error: 'Bỏ đánh dấu thẻ thất bại' },
      { status: 500 }
    );
  }
}
