'use client';
import { useChat } from '@ai-sdk/react';
import { useState } from 'react';
import type { BraneUIMessage } from './api/chat/route';

export default function Chat() {
  const [input, setInput] = useState('');
  const { messages, sendMessage } = useChat<BraneUIMessage>();

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-zinc-950">
      {/* Messages container */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map(message => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[100%] ${
                  message.role === 'user'
                    ? 'bg-zinc-600 dark:bg-zinc-700 text-white rounded-2xl px-4 py-3'
                    : 'text-zinc-900 dark:text-zinc-100'
                }`}
              >
                {message.parts.map((part, i) => {
                  switch (part.type) {
                    case 'text':
                      return (
                        <div
                          key={`${message.id}-${i}`}
                          className="whitespace-pre-wrap break-words"
                        >
                          {part.text}
                        </div>
                      );
                  }
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Input form */}
      <div className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <form
            onSubmit={e => {
              e.preventDefault();
              const trimmed = input.trim();
              if (!trimmed) return;
              sendMessage({ text: trimmed });
              setInput('');
            }}
            className="relative"
          >
            <input
              className="w-full pl-4 pr-12 py-3 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-zinc-900 dark:text-zinc-100 placeholder-zinc-500"
              value={input}
              placeholder="chat with brane..."
              onChange={e => setInput(e.currentTarget.value)}
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 focus:outline-none disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-zinc-400 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}