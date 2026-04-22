import React, { useEffect } from 'react';

interface FloatingEmojiProps {
  emoji: string;
  id: string;
  onComplete: (id: string) => void;
}

export const FloatingEmoji: React.FC<FloatingEmojiProps> = ({ emoji, id, onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete(id);
    }, 2000);

    return () => clearTimeout(timer);
  }, [id, onComplete]);

  const initialOffset = (Math.random() - 0.5) * 100;
  const direction = Math.random() > 0.5 ? 1 : -1;
  const outwardAmount = 120 * direction;

  const animationKeyframes = `
    @keyframes floatWave {
      0% {
        bottom: 0;
        left: calc(50% + ${initialOffset}px);
        opacity: 1;
        transform: scale(1) rotate(0deg);
      }
      25% {
        transform: scale(1.15) rotate(-8deg);
      }
      50% {
        transform: scale(1.1) rotate(5deg);
      }
      75% {
        transform: scale(1.05) rotate(-3deg);
      }
      100% {
        bottom: 50vh;
        left: calc(50% + ${initialOffset + outwardAmount}px);
        opacity: 0;
        transform: scale(0.8) rotate(0deg);
      }
    }
  `;

  return (
    <>
      <style>{animationKeyframes}</style>
      <div
        className="fixed text-5xl font-bold pointer-events-none"
        style={{
          left: '50%',
          bottom: 0,
          zIndex: 50,
          animation: 'floatWave 2s ease-in-out forwards',
        }}
      >
        {emoji}
      </div>
    </>
  );
};
