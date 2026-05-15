import React from 'react';
import emojiRegex from 'emoji-regex';

export function renderWithAppleEmojis(text: string | null | undefined) {
  if (!text) return text;
  
  const parts = [];
  let lastIndex = 0;
  let match;

  const stringRegex = emojiRegex();
  
  while ((match = stringRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    
    parts.push(
      <img 
        key={`emoji-${match.index}`}
        src={`https://emojicdn.elk.sh/${encodeURIComponent(match[0])}?style=apple`}
        alt={match[0]}
        className="inline-block w-[1.2em] h-[1.2em] align-text-bottom mx-0.5"
        draggable={false}
        decoding="async"
      />
    );
    
    lastIndex = match.index + match[0].length;
  }
  
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }
  
  return parts.length > 0 ? parts : text;
}
