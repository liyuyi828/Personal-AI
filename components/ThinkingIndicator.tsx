'use client';

/**
 * Visual indicator shown when AI is in "thinking" mode
 * (i.e., when there's an incomplete <think> tag)
 */
export default function ThinkingIndicator() {
  return (
    <div className="flex items-center gap-2 py-2 text-sm text-gray-500 dark:text-gray-400">
      <div className="flex gap-1">
        <span className="animate-bounce" style={{ animationDelay: '0ms' }}>
          •
        </span>
        <span className="animate-bounce" style={{ animationDelay: '150ms' }}>
          •
        </span>
        <span className="animate-bounce" style={{ animationDelay: '300ms' }}>
          •
        </span>
      </div>
      <span className="italic">thinking</span>
    </div>
  );
}
