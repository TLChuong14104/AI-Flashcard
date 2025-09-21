import { useState, useRef, useEffect } from 'react';
import { MarkedCard } from '@/lib/db';
import Papa from 'papaparse';

interface ManageMarkedCardsProps {
  onCardsUpdated?: () => void;
}

export default function ManageMarkedCards({ onCardsUpdated }: ManageMarkedCardsProps) {
  const [markedCards, setMarkedCards] = useState<MarkedCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Lấy các thẻ đã đánh dấu
  const fetchMarkedCards = async () => {
    try {
      const response = await fetch('/api/marked-cards');
      const data = await response.json();
      setMarkedCards(data.markedCards);
    } catch (error) {
      setError('Lấy thẻ đã đánh dấu thất bại');
      console.error('Lấy thẻ đã đánh dấu thất bại:', error);
    } finally {
      setLoading(false);
    }
  };

  // Tải ban đầu
  useEffect(() => {
    fetchMarkedCards();
  }, []);

  // Xóa thẻ
  const handleDelete = async (id: number) => {
    try {
      await fetch('/api/marked-cards', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });
      await fetchMarkedCards();
      onCardsUpdated?.();
    } catch (error) {
      setError('Xóa thẻ thất bại');
      console.error('Xóa thẻ thất bại:', error);
    }
  };

  // Xử lý import file CSV
  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError('');
    setLoading(true);

    Papa.parse(file, {
      encoding: 'UTF-8',
      complete: async (results) => {
        try {
          console.log('Kết quả phân tích CSV:', results);
          
          if (!results.data || results.data.length <= 1) {
            throw new Error('File CSV trống hoặc định dạng không hợp lệ');
          }

          // Lấy dữ liệu bỏ qua dòng tiêu đề
          const dataRows = results.data.slice(1) as string[][];
          
          // Lọc bỏ dòng trống
          const validRows = dataRows.filter(row => 
            row.length >= 3 && 
            row[0]?.trim() && 
            row[1]?.trim() && 
            row[2]?.trim()
          );

          if (validRows.length === 0) {
            throw new Error('Không tìm thấy dòng dữ liệu hợp lệ');
          }

          const cards = validRows.map(row => ({
            topic: row[0].trim(),
            question: row[1].trim(),
            answer: row[2].trim(),
          }));

          console.log('Thẻ chuẩn bị import:', cards);

          const response = await fetch('/api/marked-cards/import', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ cards }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Import thất bại');
          }

          await fetchMarkedCards();
          onCardsUpdated?.();
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          setError('Import thành công!');
        } catch (error) {
          console.error('Import thất bại:', error);
          setError(error instanceof Error ? error.message : 'Import thất bại');
        } finally {
          setLoading(false);
        }
      },
      error: (error) => {
        console.error('Phân tích file CSV thất bại:', error);
        setError('Phân tích file CSV thất bại: ' + error.message);
        setLoading(false);
      },
      delimiter: ',', // Xác định rõ dấu phân cách
      skipEmptyLines: true, // Bỏ qua dòng trống
    });
  };

  if (loading) {
    return <div className="text-center py-4">Đang tải...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Quản lý thẻ đã đánh dấu</h2>
        <div className="flex items-center space-x-2">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileImport}
            ref={fileInputRef}
            className="hidden"
            id="csv-upload"
          />
          <label
            htmlFor="csv-upload"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer"
          >
            Import CSV
          </label>
          <a
            href="/templates/flashcards_template.csv"
            download
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Tải mẫu
          </a>
        </div>
      </div>

      {error && (
        <div className={`text-center p-2 rounded ${
          error === 'Import thành công!' ? 'text-green-500 bg-green-50' : 'text-red-500 bg-red-50'
        }`}>
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">Chủ đề</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[30%]">Câu hỏi</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[35%]">Đáp án</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">Thời gian tạo</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[5%]">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {markedCards.map((card) => (
              <tr key={card.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-900">{card.topic}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{card.question}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{card.answer}</td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {new Date(card.created_at).toLocaleString('vi-VN')}
                </td>
                <td className="px-4 py-3 text-sm text-center">
                  <button
                    onClick={() => handleDelete(card.id)}
                    className="text-red-600 hover:text-red-900 hover:bg-red-50 px-3 py-1 rounded"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {markedCards.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          Chưa có thẻ nào được đánh dấu
        </div>
      )}
    </div>
  );
}
