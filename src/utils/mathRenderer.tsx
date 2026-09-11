import React from 'react';
import katex from 'katex';

interface MathTextProps {
  text: string;
  className?: string;
}

export const MathText: React.FC<MathTextProps> = ({ text, className = '' }) => {
  if (!text) return null;

  // Split by $$...$$ for block math, then by $...$ for inline math
  const renderFormattedText = (rawText: string) => {
    // Regex for block math ($$...$$) and inline math ($...$)
    // Avoid matching escaped dollars (\$)
    const regex = /(\$\$[\s\S]*?\$\$|\$[^$\n]+\$)/g;
    const parts = rawText.split(regex);

    return parts.map((part, index) => {
      if (part.startsWith('$$') && part.endsWith('$$') && part.length > 4) {
        const math = part.slice(2, -2).trim();
        try {
          const html = katex.renderToString(math, {
            displayMode: true,
            throwOnError: false,
          });
          return (
            <div
              key={index}
              className="my-2 overflow-x-auto py-1 text-center"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch {
          return (
            <div key={index} className="my-1 font-mono text-indigo-400">
              {part}
            </div>
          );
        }
      } else if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
        const math = part.slice(1, -1).trim();
        try {
          const html = katex.renderToString(math, {
            displayMode: false,
            throwOnError: false,
          });
          return (
            <span
              key={index}
              className="inline-block px-0.5 text-indigo-200"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch {
          return (
            <span key={index} className="font-mono text-indigo-400">
              {part}
            </span>
          );
        }
      } else {
        // Plain text with line breaks preserved
        return (
          <span key={index} className="whitespace-pre-line">
            {part}
          </span>
        );
      }
    });
  };

  return <div className={`leading-relaxed ${className}`}>{renderFormattedText(text)}</div>;
};
