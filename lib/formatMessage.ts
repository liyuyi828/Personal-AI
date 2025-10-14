/**
 * Removes content inside <think>...</think> tags from the message
 */
export function removeThinkTags(content: string): string {
  return content.replace(/<think>[\s\S]*?<\/think>/g, '');
}

/**
 * Checks if there's an incomplete <think> tag (opened but not closed)
 */
export function hasIncompleteThinkTag(content: string): boolean {
  // Check if there's a <think> without a closing </think>
  const openTagCount = (content.match(/<think>/g) || []).length;
  const closeTagCount = (content.match(/<\/think>/g) || []).length;
  return openTagCount > closeTagCount;
}

/**
 * Extracts content before incomplete think tag
 */
export function getContentBeforeIncompleteThink(content: string): string {
  const lastThinkIndex = content.lastIndexOf('<think>');
  if (lastThinkIndex === -1) return content;

  // Check if there's a closing tag after this opening tag
  const remainingContent = content.slice(lastThinkIndex);
  const hasClosing = remainingContent.includes('</think>');

  if (!hasClosing) {
    // Return content before the incomplete <think> tag
    return content.slice(0, lastThinkIndex);
  }

  return content;
}

/**
 * Splits content into segments of text and code blocks
 */
export function parseMessageContent(content: string) {
  // First handle incomplete think tags
  let cleanedContent = content;

  if (hasIncompleteThinkTag(content)) {
    // If there's an incomplete think tag, only show content before it
    cleanedContent = getContentBeforeIncompleteThink(content);
  } else {
    // Otherwise, remove all complete think tags
    cleanedContent = removeThinkTags(content);
  }

  // Split by code blocks (``` or ```)
  const parts: Array<{ type: 'text' | 'code'; content: string; language?: string }> = [];
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;

  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(cleanedContent)) !== null) {
    // Add text before code block
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: cleanedContent.slice(lastIndex, match.index),
      });
    }

    // Add code block
    parts.push({
      type: 'code',
      content: match[2],
      language: match[1] || 'plaintext',
    });

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < cleanedContent.length) {
    parts.push({
      type: 'text',
      content: cleanedContent.slice(lastIndex),
    });
  }

  // If no parts were added, add the entire content as text
  if (parts.length === 0) {
    parts.push({
      type: 'text',
      content: cleanedContent,
    });
  }

  return parts;
}
