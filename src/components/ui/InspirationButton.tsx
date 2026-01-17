import { useState } from "react";

const inspirationQuotes = [
  "The journey of a thousand miles begins with one step. - Lao Tzu",
  "What lies behind us and what lies before us are tiny matters compared to what lies within us. - Ralph Waldo Emerson",
  "Believe you can and you're halfway there. - Theodore Roosevelt",
  "The only way to do great work is to love what you do. - Steve Jobs",
  "Innovation distinguishes between a leader and a follower. - Steve Jobs",
  "Don't watch the clock; do what it does. Keep going. - Sam Levenson",
  "Whether you think you can or you think you can't, you're right. - Henry Ford",
  "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
  "Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill",
  "The only impossible journey is the one you never begin. - Tony Robbins",
  "In the middle of difficulty lies opportunity. - Albert Einstein",
  "It is during our darkest moments that we must focus to see the light. - Aristotle",
  "The way to get started is to quit talking and begin doing. - Walt Disney",
  "Your limitation—it's only your imagination.",
  "Push yourself, because no one else is going to do it for you.",
  "Great things never come from comfort zones.",
  "Dream it. Wish it. Do it.",
  "Success doesn't just find you. You have to go out and get it.",
  "The harder you work for something, the greater you'll feel when you achieve it.",
  "Don't stop when you're tired. Stop when you're done.",
];

export function InspirationButton() {
  const [currentQuote, setCurrentQuote] = useState("");
  const [showQuote, setShowQuote] = useState(false);

  const getRandomQuote = () => {
    const randomIndex = Math.floor(Math.random() * inspirationQuotes.length);
    setCurrentQuote(inspirationQuotes[randomIndex]);
    setShowQuote(true);
  };

  const hideQuote = () => {
    setShowQuote(false);
  };

  return (
    <div className="relative flex justify-center">
      <button
        className="text-sm text-muted-foreground flex items-center gap-1 hover:text-foreground transition-colors"
        onMouseEnter={getRandomQuote}
        onMouseLeave={hideQuote}
      >
        🎯 Inspiration
      </button>
      {showQuote && (
        <div className="absolute bottom-full mb-2 w-64 p-3 bg-popover text-popover-foreground text-xs rounded-lg shadow-lg border border-border z-50">
          <p className="italic leading-relaxed">{currentQuote}</p>
        </div>
      )}
    </div>
  );
}
