import { useState, useEffect } from 'react'
import { MarkedCard } from '@/lib/db'
import FlashCard from './FlashCard'

interface ReviewCardsProps {
  onCardRemoved?: () => void
}

export default function ReviewCards({ onCardRemoved }: ReviewCardsProps) {
  const [markedCards, setMarkedCards] = useState<MarkedCard[]>([])
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchMarkedCards = async () => {
    try {
      const response = await fetch('/api/marked-cards')
      const data = await response.json()
      setMarkedCards(data.markedCards)
      setCurrentCardIndex(0)
    } catch (err) {
      console.error('Lỗi lấy danh sách thẻ:', err)
      setError('Không thể tải danh sách thẻ đã đánh dấu')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMarkedCards()

    const handleKeyPress = (event: KeyboardEvent) => {
      if (markedCards.length === 0) return
      if (event.key === 'ArrowLeft') handlePrevious()
      else if (event.key === 'ArrowRight') handleNext()
      // TODO: Phím Space để lật thẻ (toggleAnswer) – cần truyền ref/toggle từ FlashCard
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [markedCards.length])

  const handlePrevious = () =>
    setCurrentCardIndex((prev) => (prev > 0 ? prev - 1 : prev))

  const handleNext = () =>
    setCurrentCardIndex((prev) =>
      prev < markedCards.length - 1 ? prev + 1 : prev
    )

  const handleLearnedCard = async () => {
    if (!markedCards.length) return
    const currentCard = markedCards[currentCardIndex]
    try {
      await fetch('/api/marked-cards', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: currentCard.id }),
      })
      const newCards = markedCards.filter((c) => c.id !== currentCard.id)
      setMarkedCards(newCards)
      if (currentCardIndex >= newCards.length) {
        setCurrentCardIndex(Math.max(0, newCards.length - 1))
      }
      onCardRemoved?.()
    } catch (err) {
      console.error('Lỗi xoá thẻ:', err)
      setError('Không thể xoá thẻ')
    }
  }

  if (loading) return <div className="text-center py-4">Đang tải...</div>
  if (!markedCards.length)
    return (
      <div className="text-center text-gray-500 py-8">
        Chưa có thẻ nào được đánh dấu
      </div>
    )

  const currentCard = markedCards[currentCardIndex]

  return (
    <div className="space-y-6">
      <div className="relative">
        {/* Nút lùi */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -ml-16">
          <button
            onClick={handlePrevious}
            disabled={currentCardIndex === 0}
            className="p-4 bg-blue-500 text-white rounded-full disabled:bg-gray-400 hover:bg-blue-600 shadow-lg"
          >
            ←
          </button>
        </div>

        {/* Nút tiến */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 -mr-16">
          <button
            onClick={handleNext}
            disabled={currentCardIndex === markedCards.length - 1}
            className="p-4 bg-blue-500 text-white rounded-full disabled:bg-gray-400 hover:bg-blue-600 shadow-lg"
          >
            →
          </button>
        </div>

        <div className="mb-4 text-sm text-gray-500">
          <strong>Chủ đề:</strong> {currentCard.topic}
        </div>

        <FlashCard
          question={currentCard.question}
          answer={currentCard.answer}
          cardIndex={currentCardIndex}
        />
      </div>

      <div className="mt-4 text-center text-gray-500">
        Tiến độ: {currentCardIndex + 1}/{markedCards.length}
      </div>

      <div className="flex justify-center space-x-4">
        <button
          onClick={handleLearnedCard}
          className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center"
        >
          ✔ Đã học
        </button>
      </div>

      {error && <div className="text-red-500 text-center mt-2">{error}</div>}
    </div>
  )
}
