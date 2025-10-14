'use client';

import { parseMessageContent, hasIncompleteThinkTag } from '@/lib/formatMessage';
import ThinkingIndicator from './ThinkingIndicator';

interface FormattedMessageProps {
  content: string;
}

/**
 * Component that formats markdown-style text including:
 * - Bold text (**text**)
 * - Italic text (*text* or _text_)
 * - Inline code (`code`)
 * - Headings (# heading, ## heading, ### heading)
 * - Numbered lists (1. item)
 * - Bullet points (- item)
 * - Section separators (-- or ---)
 * - Markdown tables (| header | ... |)
 * - Code blocks (```code```)
 * - Removes <think>...</think> tags
 * - Shows "thinking" indicator for incomplete <think> tags
 */
export default function FormattedMessage({ content }: FormattedMessageProps) {
  const parts = parseMessageContent(content);
  const isThinking = hasIncompleteThinkTag(content);

  return (
    <div className="space-y-2">
      {parts.map((part, index) => {
        if (part.type === 'code') {
          return (
            <pre
              key={index}
              className="bg-gray-100 dark:bg-gray-900 rounded-md p-3 overflow-x-auto text-sm"
            >
              <code className="text-gray-800 dark:text-gray-200">{part.content}</code>
            </pre>
          );
        }

        // Process text content for inline markdown
        return (
          <div key={index} className="space-y-2">
            {renderTextContent(part.content)}
          </div>
        );
      })}

      {/* Show thinking indicator if there's an incomplete think tag */}
      {isThinking && <ThinkingIndicator />}
    </div>
  );
}

/**
 * Renders text content with support for tables and other markdown
 */
function renderTextContent(content: string) {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Check if this line starts a table
    if (line.trim().startsWith('|') && i + 1 < lines.length && lines[i + 1].trim().match(/^\|[-:\s|]+\|$/)) {
      // Parse the table
      const tableLines: string[] = [line];
      let j = i + 1;

      // Add separator line
      tableLines.push(lines[j]);
      j++;

      // Add all subsequent table rows
      while (j < lines.length && lines[j].trim().startsWith('|')) {
        tableLines.push(lines[j]);
        j++;
      }

      elements.push(
        <div key={`table-${i}`} className="my-4">
          {renderTable(tableLines)}
        </div>
      );

      i = j;
      continue;
    }

    // Process regular line
    elements.push(renderLine(line, i));
    i++;
  }

  return elements;
}

/**
 * Renders a markdown table
 */
function renderTable(tableLines: string[]) {
  if (tableLines.length < 3) return null;

  const headerLine = tableLines[0];
  const dataLines = tableLines.slice(2);

  // Parse header
  const headers = headerLine
    .split('|')
    .filter((cell) => cell.trim() !== '')
    .map((cell) => cell.trim());

  // Parse rows
  const rows = dataLines.map((line) =>
    line
      .split('|')
      .filter((cell) => cell.trim() !== '')
      .map((cell) => cell.trim())
  );

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600">
        <thead className="bg-gray-100 dark:bg-gray-800">
          <tr>
            {headers.map((header, idx) => (
              <th
                key={idx}
                className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left font-semibold"
              >
                {formatInlineMarkdown(header)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIdx) => (
            <tr key={rowIdx} className="hover:bg-gray-50 dark:hover:bg-gray-700">
              {row.map((cell, cellIdx) => (
                <td
                  key={cellIdx}
                  className="border border-gray-300 dark:border-gray-600 px-4 py-2"
                >
                  {formatInlineMarkdown(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Renders a single line of text with appropriate formatting
 */
function renderLine(line: string, lineIndex: number) {
  // Skip empty lines
  if (line.trim() === '') {
    return <div key={lineIndex} className="h-2" />;
  }

  // Heading (### )
  if (line.trim().startsWith('###')) {
    const text = line.replace(/^###\s*/, '');
    return (
      <h3 key={lineIndex} className="text-lg font-semibold mt-4 mb-2">
        {formatInlineMarkdown(text)}
      </h3>
    );
  }

  // Heading (## )
  if (line.trim().startsWith('##')) {
    const text = line.replace(/^##\s*/, '');
    return (
      <h2 key={lineIndex} className="text-xl font-bold mt-4 mb-2">
        {formatInlineMarkdown(text)}
      </h2>
    );
  }

  // Heading (# )
  if (line.trim().startsWith('#')) {
    const text = line.replace(/^#\s*/, '');
    return (
      <h1 key={lineIndex} className="text-2xl font-bold mt-4 mb-2">
        {formatInlineMarkdown(text)}
      </h1>
    );
  }

  // Section separator (-- or ---)
  if (/^-{2,}\s*$/.test(line.trim())) {
    return (
      <hr
        key={lineIndex}
        className="my-4 border-t border-gray-300 dark:border-gray-600"
      />
    );
  }

  // Numbered list (1. )
  if (/^\d+\.\s/.test(line.trim())) {
    const text = line.replace(/^\d+\.\s*/, '');
    return (
      <div key={lineIndex} className="flex gap-2 ml-4">
        <span className="font-medium min-w-[1.5rem]">
          {line.match(/^\d+/)?.[0]}.
        </span>
        <span>{formatInlineMarkdown(text)}</span>
      </div>
    );
  }

  // Bullet point (- ) - must have space after dash
  if (/^-\s/.test(line.trim())) {
    const text = line.trim().replace(/^-\s*/, '');
    return (
      <div key={lineIndex} className="flex gap-2 ml-4">
        <span className="min-w-[1rem]">•</span>
        <span>{formatInlineMarkdown(text)}</span>
      </div>
    );
  }

  // Regular paragraph
  return (
    <p key={lineIndex} className="leading-relaxed">
      {formatInlineMarkdown(line)}
    </p>
  );
}

/**
 * Formats inline markdown including bold, italic, and inline code
 */
function formatInlineMarkdown(text: string): React.ReactNode {
  let currentText = text;
  let keyCounter = 0;

  // Define patterns in order of priority (most specific first)
  const patterns = [
    // Inline code: `code`
    {
      regex: /`([^`]+)`/g,
      render: (match: string) => (
        <code
          key={`code-${keyCounter++}`}
          className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono text-red-600 dark:text-red-400"
        >
          {match}
        </code>
      ),
    },
    // Bold: **text**
    {
      regex: /\*\*([^*]+)\*\*/g,
      render: (match: string) => (
        <strong key={`bold-${keyCounter++}`} className="font-semibold">
          {match}
        </strong>
      ),
    },
    // Italic: *text* or _text_ (but not part of **, and not in URLs)
    {
      regex: /(?<!\*)\*([^*\s][^*]*[^*\s]|\w)\*(?!\*)|(?<!_)_([^_\s][^_]*[^_\s]|\w)_(?!_)/g,
      render: (match: string) => (
        <em key={`italic-${keyCounter++}`} className="italic">
          {match}
        </em>
      ),
    },
  ];

  // Process each pattern
  const tokens: Array<{ type: 'text' | 'formatted'; content: string | React.ReactNode; index: number }> = [];
  let processedRanges: Array<[number, number]> = [];

  patterns.forEach(({ regex, render }) => {
    const matches = Array.from(currentText.matchAll(regex));

    matches.forEach((match) => {
      const start = match.index!;
      const end = start + match[0].length;

      // Check if this range overlaps with already processed ranges
      const overlaps = processedRanges.some(
        ([pStart, pEnd]) => (start >= pStart && start < pEnd) || (end > pStart && end <= pEnd)
      );

      if (!overlaps) {
        const capturedText = match[1] || match[2]; // Get captured group
        tokens.push({
          type: 'formatted',
          content: render(capturedText),
          index: start,
        });
        processedRanges.push([start, end]);
      }
    });
  });

  // Sort processed ranges and tokens
  processedRanges.sort((a, b) => a[0] - b[0]);
  tokens.sort((a, b) => a.index - b.index);

  // Build final output
  if (tokens.length === 0) {
    return text;
  }

  let lastIndex = 0;
  const result: React.ReactNode[] = [];

  // Add text segments and formatted segments
  processedRanges.forEach(([start, end], idx) => {
    // Add text before this formatted segment
    if (start > lastIndex) {
      result.push(currentText.slice(lastIndex, start));
    }

    // Add formatted segment
    result.push(tokens[idx].content);

    lastIndex = end;
  });

  // Add remaining text
  if (lastIndex < currentText.length) {
    result.push(currentText.slice(lastIndex));
  }

  return result.length > 0 ? result : text;
}
