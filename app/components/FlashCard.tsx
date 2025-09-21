import { useState, useEffect, useCallback } from 'react';
import MarkdownContent from './MarkdownContent';

interface FlashCardProps {
  question: string;
  answer: string;
  cardIndex?: number;
}

export default function FlashCard({ question, answer, cardIndex = 0 }: FlashCardProps) {
  const [showAnswer, setShowAnswer] = useState(false);

  const toggleAnswer = useCallback(() => {
    setShowAnswer(prev => !prev);
  }, []);

  // Khi chỉ số thẻ thay đổi, đặt lại trạng thái hiển thị
  useEffect(() => {
    setShowAnswer(false);
  }, [cardIndex]);

  // Thêm sự kiện lắng nghe phím Space
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === ' ' && !event.repeat) {
        event.preventDefault();
        toggleAnswer();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [toggleAnswer]);

  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div className="space-y-4 p-6">
        <div className="question p-4 bg-green-50 rounded-lg text-gray-900">
          <MarkdownContent content={question} />
        </div>

        <div className="flex justify-center">
          <button
            onClick={toggleAnswer}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            {showAnswer ? 'Ẩn đáp án' : 'Hiện đáp án'}
          </button>
        </div>

        {showAnswer && (
          <div className="answer mt-4 p-4 bg-blue-50 rounded-lg text-gray-900">
            <MarkdownContent content={answer} />
          </div>
        )}
      </div>
    </div>
  );
}
