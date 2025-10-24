'use client';
import { useChat } from '@ai-sdk/react';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { BraneUIMessage } from './api/chat/route';
import { TopBar } from '@/components/top-bar';
import { authClient } from '@/lib/auth/client';
import { MemoizedMarkdown } from '@/components/memoized-markdown';

// Helper function to generate brief summaries from tool parameters
function generateToolSummary(
  toolName: string,
  args: Record<string, unknown> | undefined,
): string {
  if (!args || Object.keys(args).length === 0) return '';

  // Extract key information based on tool type
  switch (toolName) {
    case 'searchInternet':
      return (args.query || '') as string;
    case 'storeMemory':
      return `"${(args.text || '') as string}"`.slice(0, 50);
    case 'searchMemories':
      return `query: "${(args.query || '') as string}"`;
    case 'updateMemory':
      return `id: ${args.id || ''}`;
    default: {
      // Generic fallback: show first meaningful value
      const firstValue = Object.values(args)[0];
      return firstValue ? String(firstValue) : '';
    }
  }
}

// ToolCall component with expand/collapse functionality
function ToolCall({
  toolName,
  part,
}: {
  toolName: string;
  // biome-ignore lint/suspicious/noExplicitAny: UI parts have different types
  part: any;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const summary = generateToolSummary(toolName, part.args);

  return (
    <div
      onClick={() => setIsExpanded(!isExpanded)}
      className="text-sm bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 my-3 shadow-sm"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-2 h-2 bg-gray-500 rounded-full flex-shrink-0"></div>
          <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">
            {toolName}
          </span>
          {summary && (
            <>
              <span className="text-gray-400 dark:text-gray-500">·</span>
              <span className="text-gray-600 dark:text-gray-400 truncate text-sm">
                {summary}
              </span>
            </>
          )}
        </div>
        <svg
          className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform flex-shrink-0 ${
            isExpanded ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
      {isExpanded && (
        <pre className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 overflow-x-auto text-xs font-mono bg-gray-100 dark:bg-gray-900/50 rounded-lg p-3">
          {JSON.stringify(part, null, 2)}
        </pre>
      )}
    </div>
  );
}

const STORAGE_KEY = 'brane-chat-messages';

export default function Chat() {
  const router = useRouter();
  const [input, setInput] = useState('');
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load initial messages from sessionStorage
  const loadMessages = (): BraneUIMessage[] => {
    if (typeof window === 'undefined') return [];
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  };

  const { messages, sendMessage, setMessages } = useChat<BraneUIMessage>({
    experimental_throttle: 50,
  });

  // Load messages from sessionStorage on mount
  useEffect(() => {
    const storedMessages = loadMessages();
    if (storedMessages.length > 0) {
      setMessages(storedMessages);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save messages to sessionStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  // Function to start a new chat
  const startNewChat = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    setMessages([]);
  };

  // Auto-resize textarea based on content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to auto to get correct scrollHeight
    textarea.style.height = 'auto';

    // Calculate new height (max 6 lines)
    const lineHeight = 24; // approximate line height in px
    const maxLines = 6;
    const maxHeight = lineHeight * maxLines;
    const newHeight = Math.min(textarea.scrollHeight, maxHeight);

    textarea.style.height = `${newHeight}px`;
  }, [input]);

  useEffect(() => {
    const checkAuth = async () => {
      const session = await authClient.getSession();
      if (!session.data) {
        router.push('/login');
      } else {
        setIsAuthChecking(false);
      }
    };
    checkAuth();
  }, [router]);

  if (isAuthChecking) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-[#1E1E1F]">
        <div className="text-zinc-500 dark:text-[#8A8A8B]">loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-[#1E1E1F]">
      <TopBar onNewChat={startNewChat} />

      {/* Main chat area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
          {messages.length === 0 ? (
            // Welcome screen when no messages
            <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center">
              <div className="mb-8">
                <div className="w-16 h-16 bg-gray-800 dark:bg-gray-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h1 className="text-3xl font-semibold text-gray-900 dark:text-white mb-2">
                  Good morning, Jack
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  How can I help you today?
                </p>
              </div>
            </div>
          ) : (
            // Messages
            <div className="space-y-8">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 bg-gray-600 dark:bg-gray-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] sm:max-w-[75%] ${
                      message.role === 'user'
                        ? 'bg-gray-700 dark:bg-gray-600 text-white rounded-3xl px-4 sm:px-6 py-3 shadow-sm'
                        : 'bg-white dark:bg-gray-800 rounded-3xl px-4 sm:px-6 py-4 shadow-sm border border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    {message.parts.map((part, i) => {
                      // Handle text parts
                      if (part.type === 'text') {
                        // Use markdown for assistant messages, plain text for user
                        if (message.role === 'assistant') {
                          return (
                            <div
                              key={`${message.id}-${i}`}
                              className="prose prose-gray dark:prose-invert max-w-none text-gray-800 dark:text-gray-100"
                            >
                              <MemoizedMarkdown
                                content={part.text}
                                id={`${message.id}-${i}`}
                              />
                            </div>
                          );
                        }
                        return (
                          <div
                            key={`${message.id}-${i}`}
                            className="whitespace-pre-wrap break-words font-medium"
                          >
                            {part.text}
                          </div>
                        );
                      }

                      // Handle all tool calls dynamically
                      if (part.type.startsWith('tool-')) {
                        const toolName = part.type.replace('tool-', '');
                        return (
                          <ToolCall
                            key={`${message.id}-${i}`}
                            toolName={toolName}
                            part={part}
                          />
                        );
                      }

                      return null;
                    })}
                  </div>

                  {message.role === 'user' && (
                    <div className="w-8 h-8 bg-gray-400 dark:bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white font-medium text-sm">J</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Input form */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1E1E1F]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          {/* Quick chat buttons - only show on new chat */}
          {messages.length === 0 && (
            <div className="flex gap-2 sm:gap-3 mb-4 sm:mb-6 flex-wrap justify-center">
              <button
                type="button"
                onClick={() => {
                  const text = "What's my agenda look like?";
                  sendMessage({ text });
                  setInput('');
                }}
                className="px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-2xl hover:bg-gray-150 dark:hover:bg-gray-700 transition-all duration-200 whitespace-nowrap shadow-sm hover:shadow-md"
              >
                📅 What's my agenda look like?
              </button>
              <button
                type="button"
                onClick={() => {
                  const text = "Explain a concept to me";
                  sendMessage({ text });
                  setInput('');
                }}
                className="px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-2xl hover:bg-gray-150 dark:hover:bg-gray-700 transition-all duration-200 whitespace-nowrap shadow-sm hover:shadow-md"
              >
                🧠 Explain a concept to me
              </button>
              <button
                type="button"
                onClick={() => {
                  const text = "Help me solve a problem";
                  sendMessage({ text });
                  setInput('');
                }}
                className="px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-2xl hover:bg-gray-150 dark:hover:bg-gray-700 transition-all duration-200 whitespace-nowrap shadow-sm hover:shadow-md"
              >
                💡 Help me solve a problem
              </button>
            </div>
          )}
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
            <div className="relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-3xl shadow-lg focus-within:shadow-xl transition-all duration-200 overflow-hidden">
              <textarea
                ref={textareaRef}
                className="w-full pl-6 pr-16 py-4 bg-transparent border-none focus:outline-none text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 resize-none overflow-y-auto scrollbar-hide text-base"
                value={input}
                placeholder="Message brane..."
                onChange={e => setInput(e.currentTarget.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    const trimmed = input.trim();
                    if (trimmed) {
                      sendMessage({ text: trimmed });
                      setInput('');
                    }
                  }
                }}
                rows={1}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="p-2 rounded-full bg-gray-600 hover:bg-gray-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white transition-all duration-200 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
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
              </div>
            </div>
          </form>

          {/* Optional: Add new chat button below input */}
          {messages.length > 0 && (
            <div className="flex justify-center mt-4">
              <button
                type="button"
                onClick={startNewChat}
                className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                Start new conversation
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}