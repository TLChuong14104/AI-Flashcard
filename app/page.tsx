'use client';

import { useState, useEffect, useCallback } from "react";
import FlashCard from "./components/FlashCard";
import SettingsDialog from "./components/SettingsDialog";
import ReviewCards from "./components/ReviewCards";
import ManageMarkedCards from "./components/ManageMarkedCards";
import ExploreTopics from "./components/ExploreTopics";

interface Flashcard {
  question: string;
  answer: string;
}

type TabType = 'topic' | 'content' | 'manage' | 'explore';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('topic');
  const [topic, setTopic] = useState("");
  const [content, setContent] = useState("");
  const [cardCount, setCardCount] = useState("5");
  const [difficulty, setDifficulty] = useState("Khó");
  const [apiKey, setApiKey] = useState("");
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isReviewing, setIsReviewing] = useState(false);
  const [markedCards, setMarkedCards] = useState<Set<string>>(new Set());
  const [exploredKeyword, setExploredKeyword] = useState("");
  const [exploredTopics, setExploredTopics] = useState<string[]>([]);

  // Lấy các thẻ đã đánh dấu
  const fetchMarkedCards = async () => {
    try {
      const response = await fetch('/api/marked-cards');
      const data = await response.json();
      type MarkedCard = { question: string; answer: string; topic?: string };
      const marked = new Set<string>(
        (data.markedCards as MarkedCard[]).map(card => String(card.question))
      );
      setMarkedCards(marked);
    } catch (error) {
      console.error('Lấy thẻ đã đánh dấu thất bại:', error);
    }
  };

  // Navigation functions dùng useCallback
  const handlePrevious = useCallback(() => {
    setCurrentCardIndex((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  const handleNext = useCallback(() => {
    setCurrentCardIndex((prev) =>
      prev < flashcards.length - 1 ? prev + 1 : prev
    );
  }, [flashcards.length]);

  // Chỉ một useEffect cho navigation
  useEffect(() => {
    fetchMarkedCards();
    const handleKeyPress = (event: KeyboardEvent) => {
      if (flashcards.length === 0) return;
      if (event.key === 'ArrowLeft') handlePrevious();
      else if (event.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [flashcards.length, handleNext, handlePrevious]);

  const handleSubmit = async () => {
    if (!apiKey) {
      setError("Vui lòng cấu hình API Key trong phần Cài đặt trước");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const response = await fetch('/api/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          content,
          cardCount: parseInt(cardCount),
          difficulty,
          apiKey,
          mode: activeTab,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Tạo thẻ thất bại');
      }

      setFlashcards(data.flashcards);
      setCurrentCardIndex(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkCard = async () => {
    const currentCard = flashcards[currentCardIndex];
    const isMarked = markedCards.has(currentCard.question);

    try {
      if (!isMarked) {
        await fetch('/api/marked-cards', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic: activeTab === 'topic' ? topic : 'Nội dung tùy chỉnh',
            question: currentCard.question,
            answer: currentCard.answer,
          }),
        });
        setMarkedCards(prev => new Set(prev).add(currentCard.question));
      }
    } catch (error) {
      console.error('Đánh dấu thẻ thất bại:', error);
    }
  };
  
  const resetState = () => {
    setFlashcards([]);
    setCurrentCardIndex(0);
    setTopic("");
    setContent("");
    setCardCount("5");
    setDifficulty("Khó");
    setIsReviewing(false);
  };

  const isCurrentCardMarked = flashcards.length > 0 &&
    markedCards.has(flashcards[currentCardIndex].question);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">AI Flashcard Thông Minh</h1>
          <div className="flex items-center space-x-4">
            {!isReviewing && flashcards.length === 0 && (
              <button
                onClick={() => setIsReviewing(true)}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
                </svg>
                Ôn tập thẻ đã đánh dấu
              </button>
            )}
            <SettingsDialog onApiKeyChange={setApiKey} />
          </div>
        </div>

        {isReviewing ? (
          <div>
            <ReviewCards onCardRemoved={fetchMarkedCards} />
            <div className="mt-4 flex justify-center">
              <button
                onClick={resetState}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Quay về Trang chủ
              </button>
            </div>
          </div>
        ) : flashcards.length === 0 ? (
          <div className="space-y-4">
            <div className="flex border-b">
              <button
                className={`px-4 py-2 ${
                  activeTab === 'topic'
                    ? 'border-b-2 border-blue-500 text-blue-500'
                    : 'text-gray-500'
                }`}
                onClick={() => setActiveTab('topic')}
              >
                Tạo theo Chủ đề
              </button>
              <button
                className={`px-4 py-2 ${
                  activeTab === 'content'
                    ? 'border-b-2 border-blue-500 text-blue-500'
                    : 'text-gray-500'
                }`}
                onClick={() => setActiveTab('content')}
              >
                Nội dung Tùy chỉnh
              </button>
              <button
                className={`px-4 py-2 ${
                  activeTab === 'explore'
                    ? 'border-b-2 border-blue-500 text-blue-500'
                    : 'text-gray-500'
                }`}
                onClick={() => setActiveTab('explore')}
              >
                Khám phá Chủ đề
              </button>
              <button
                className={`px-4 py-2 ${
                  activeTab === 'manage'
                    ? 'border-b-2 border-blue-500 text-blue-500'
                    : 'text-gray-500'
                }`}
                onClick={() => setActiveTab('manage')}
              >
                Quản lý Thẻ Đánh dấu
              </button>
            </div>

            {activeTab === 'manage' ? (
              <ManageMarkedCards onCardsUpdated={fetchMarkedCards} />
            ) : activeTab === 'explore' ? (
              <ExploreTopics
                apiKey={apiKey}
                onTopicSelect={(topic) => {
                  setTopic(topic);
                  setActiveTab('topic');
                }}
                savedKeyword={exploredKeyword}
                savedTopics={exploredTopics}
                onExplore={(keyword, topics) => {
                  setExploredKeyword(keyword);
                  setExploredTopics(topics);
                }}
                onClear={() => {
                  setExploredKeyword('');
                  setExploredTopics([]);
                }}
              />
            ) : (
              <>
                {activeTab === 'topic' ? (
                  <div>
                    <input
                      type="text"
                      placeholder="Nhập chủ đề bạn muốn học"
                      className="w-full p-2 border rounded"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                    />
                  </div>
                ) : (
                  <div>
                    <textarea
                      placeholder="Nhập nội dung bạn muốn học"
                      className="w-full p-2 border rounded min-h-[200px]"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm text-gray-600">Số lượng thẻ: {cardCount}</label>
                    <span className="text-sm text-gray-500">1-100 thẻ</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={cardCount}
                    onChange={(e) => setCardCount(e.target.value)}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>

                {activeTab === 'topic' && (
                  <div>
                    <select
                      className="w-full p-2 border rounded"
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                    >
                      <option value="Dễ">Dễ</option>
                      <option value="Trung bình">Trung bình</option>
                      <option value="Khó">Khó</option>
                    </select>
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={isLoading || (activeTab === 'topic' ? !topic : !content)}
                  className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
                >
                  {isLoading ? 'Đang tạo...' : 'Bắt đầu Học'}
                </button>

                {error && (
                  <div className="text-red-500 text-center mt-2">
                    {error}
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -ml-16">
              <button
                onClick={handlePrevious}
                disabled={currentCardIndex === 0}
                className="p-4 bg-blue-500 text-white rounded-full disabled:bg-gray-400 hover:bg-blue-600 shadow-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m15 18-6-6 6-6"/>
                </svg>
              </button>
            </div>

            <div className="absolute right-0 top-1/2 -translate-y-1/2 -mr-16">
              <button
                onClick={handleNext}
                disabled={currentCardIndex === flashcards.length - 1}
                className="p-4 bg-blue-500 text-white rounded-full disabled:bg-gray-400 hover:bg-blue-600 shadow-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </button>
            </div>

            <FlashCard
              question={flashcards[currentCardIndex].question}
              answer={flashcards[currentCardIndex].answer}
              cardIndex={currentCardIndex}
            />

            <div className="mt-4 text-center text-gray-500">
              Tiến độ: {currentCardIndex + 1}/{flashcards.length}
            </div>

            <div className="mt-4 flex justify-center space-x-4">
              <button
                onClick={handleMarkCard}
                className={`px-4 py-2 text-white rounded ${
                  isCurrentCardMarked
                    ? 'bg-yellow-600 hover:bg-yellow-700'
                    : 'bg-yellow-500 hover:bg-yellow-600'
                }`}
              >
                {isCurrentCardMarked ? 'Đã đánh dấu' : 'Đánh dấu thẻ này'}
              </button>
              <button
                onClick={resetState}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Quay về Trang chủ
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
