"use client";

import { useChat } from "@ai-sdk/react";
import { useState } from "react";

export default function Chat() {
  const [input, setInput] = useState("");
  const [showToolCalls, setShowToolCalls] = useState(false);
  const { messages, sendMessage, status } = useChat();

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-black">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-zinc-100 dark:border-zinc-900 bg-white/80 dark:bg-black/80 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <h1 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            brane
          </h1>
          <button
            type="button"
            onClick={() => setShowToolCalls(!showToolCalls)}
            className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            {showToolCalls ? "Hide" : "Show"} tool calls
          </button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6">
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full text-center">
              <div className="text-zinc-400 dark:text-zinc-600 text-sm">
                Start a conversation
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`mb-8 ${
                message.role === "user"
                  ? "text-zinc-900 dark:text-zinc-100"
                  : "text-zinc-800 dark:text-zinc-200"
              }`}
            >
              <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">
                {message.role === "user" ? "you" : "brane"}
              </div>
              <div className="space-y-3">
                {message.parts.map((part, i) => {
                  switch (part.type) {
                    case "text":
                      return (
                        <div
                          key={`${message.id}-${i}`}
                          className="text-sm leading-relaxed whitespace-pre-wrap"
                        >
                          {part.text}
                        </div>
                      );
                    case "tool-weather":
                      return showToolCalls ? (
                        <div
                          key={`${message.id}-${i}`}
                          className="text-xs bg-zinc-50 dark:bg-zinc-900 rounded-lg p-3 border border-zinc-100 dark:border-zinc-800"
                        >
                          <div className="text-zinc-500 dark:text-zinc-400 mb-2 font-medium">
                            Tool Call: weather
                          </div>
                          <pre className="text-zinc-600 dark:text-zinc-300 overflow-x-auto">
                            {JSON.stringify(
                              {
                                type: part.type,
                                input: part.input?.location,
                                output: part.output?.location,
                                temperature: part.output?.temperature,
                                toolCallId: part.toolCallId,
                              },
                              null,
                              2,
                            )}
                          </pre>
                        </div>
                      ) : null;
                    case "tool-get_classes":
                      return showToolCalls ? (
                        <div
                          key={`${message.id}-${i}`}
                          className="text-xs bg-zinc-50 dark:bg-zinc-900 rounded-lg p-3 border border-zinc-100 dark:border-zinc-800"
                        >
                          <div className="text-zinc-500 dark:text-zinc-400 mb-2 font-medium">
                            Tool Call: get_classes
                          </div>
                          <pre className="text-zinc-600 dark:text-zinc-300 overflow-x-auto">
                            {JSON.stringify(part, null, 2)}
                          </pre>
                        </div>
                      ) : null;
                  }
                })}
              </div>
            </div>
          ))}

          {status === "streaming" && (
            <div className="mb-8">
              <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">
                brane
              </div>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-zinc-400 dark:bg-zinc-600 rounded-full animate-pulse" />
                <div
                  className="w-1.5 h-1.5 bg-zinc-400 dark:bg-zinc-600 rounded-full animate-pulse"
                  style={{ animationDelay: "0.2s" }}
                />
                <div
                  className="w-1.5 h-1.5 bg-zinc-400 dark:bg-zinc-600 rounded-full animate-pulse"
                  style={{ animationDelay: "0.4s" }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-zinc-100 dark:border-zinc-900 bg-white dark:bg-black">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (input.trim()) {
                sendMessage({ text: input });
                setInput("");
              }
            }}
            className="relative"
          >
            <input
              className="w-full px-4 py-3 text-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:border-transparent transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600 text-zinc-900 dark:text-zinc-100"
              value={input}
              placeholder="Message Brane..."
              onChange={(e) => setInput(e.currentTarget.value)}
              disabled={status === "streaming"}
            />
          </form>
        </div>
      </div>
    </div>
  );
}
