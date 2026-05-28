import { useState, useEffect, useRef, useCallback, memo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, BookOpen, ChevronRight } from "lucide-react";
import { searchLessons, type SearchEntry } from "@/data/searchIndex";

interface SearchDialogProps {
  open: boolean;
  onClose: () => void;
}

export const SearchDialog = memo(function SearchDialog({ open, onClose }: SearchDialogProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchEntry[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      // Reset state when opening
      setQuery("");
      setResults([]);
      setSelectedIndex(0);
      // Focus input after dialog mounts
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 1) {
      setResults([]);
      return;
    }
    const matched = searchLessons(query);
    setResults(matched);
    setSelectedIndex(0);
  }, [query]);

  const handleSelect = useCallback(
    (entry: SearchEntry) => {
      onClose();
      navigate(`/lesson/${entry.id}`);
    },
    [onClose, navigate]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter" && results[selectedIndex]) {
        e.preventDefault();
        handleSelect(results[selectedIndex]);
      } else if (e.key === "Escape") {
        onClose();
      }
    },
    [results, selectedIndex, handleSelect, onClose]
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
          <Search className="w-5 h-5 text-gray-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="搜索课程标题或关键词..."
            className="flex-1 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 outline-none text-sm"
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 rounded">
            ESC
          </kbd>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {query.trim().length > 0 && results.length === 0 && (
            <div className="p-8 text-center text-sm text-gray-400">
              未找到匹配"{query}"的课程
            </div>
          )}

          {results.length > 0 && (
            <div className="p-2">
              <div className="px-2 py-1 text-xs text-gray-400 dark:text-gray-500">
                找到 {results.length} 个结果
              </div>
              {results.map((entry, i) => (
                <button
                  key={entry.id}
                  onClick={() => handleSelect(entry)}
                  onMouseEnter={() => setSelectedIndex(i)}
                  className={`w-full text-left p-3 rounded-lg flex items-start gap-3 transition-colors ${
                    i === selectedIndex
                      ? "bg-blue-50 dark:bg-blue-900/30"
                      : "hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  <BookOpen className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {entry.title}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                      <span className="text-blue-500">{entry.phase}</span>
                      {" · "}
                      {entry.chapterTitle}
                      {" · "}
                      {entry.description}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600 mt-1 shrink-0" />
                </button>
              ))}
            </div>
          )}

          {query.trim().length === 0 && (
            <div className="p-6 text-center text-sm text-gray-400">
              <p>输入关键词搜索全部 18 节课程</p>
              <p className="mt-1 text-xs">支持按标题、描述、章节名称搜索</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
