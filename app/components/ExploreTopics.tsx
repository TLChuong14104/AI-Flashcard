import { useState, useEffect } from 'react';

interface ExploreTopicsProps {
  apiKey: string;
  onTopicSelect: (topic: string) => void;
  savedKeyword?: string;
  savedTopics?: string[];
  onExplore?: (keyword: string, topics: string[]) => void;
  onClear?: () => void;
}

export default function ExploreTopics({ 
  apiKey, 
  onTopicSelect,
  savedKeyword = '',
  savedTopics = [],
  onExplore,
  onClear
}: ExploreTopicsProps) {
  const [keyword, setKeyword] = useState(savedKeyword);
  const [topics, setTopics] = useState<string[]>(savedTopics);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');


  useEffect(() => {
    setKeyword(savedKeyword);
    setTopics(savedTopics);
  }, [savedKeyword, savedTopics]);

  const handleExplore = async () => {
    if (!keyword.trim()) {
      setError('Vui lòng nhập từ khóa');
      return;
    }

    if (!apiKey) {
      setError('Hãy cấu hình API Key trong phần cài đặt trước');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/explore-topics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keyword, apiKey }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Khám phá chủ đề thất bại');
      }

      setTopics(data.topics);
      onExplore?.(keyword, data.topics);
    } catch (error) {
      console.error('Khám phá chủ đề thất bại:', error);
      setError(error instanceof Error ? error.message : 'Khám phá chủ đề thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setTopics([]);
    setKeyword('');
    setError('');
    onClear?.();
  };

  const handleTopicClick = (topic: string) => {
    onTopicSelect(topic);
  };

  return (
    <div className="space-y-6">
      <div className="flex space-x-4">
        <input
          type="text"
          placeholder="Nhập từ khóa để khám phá chủ đề liên quan"
          className="flex-1 p-2 border rounded"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !isLoading) {
              handleExplore();
            }
          }}
        />
        <button
          onClick={handleExplore}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {isLoading ? 'Đang khám phá...' : 'Khám phá'}
        </button>
        {topics.length > 0 && (
          <button
            onClick={handleClear}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Xóa
          </button>
        )}
      </div>

      {error && (
        <div className="text-red-500 text-center">
          {error}
        </div>
      )}

      {topics.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {topics.map((topic, index) => (
            <button
              key={index}
              onClick={() => handleTopicClick(topic)}
              className="p-3 text-left border rounded hover:bg-gray-50 transition-colors"
            >
              {topic}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
