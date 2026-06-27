"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  MessageSquareText,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { getSuggestedActions } from "@/backend/services/ai-knowledge-base";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  followUp?: string[];
  timestamp: Date;
}

export function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Add welcome message on first open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content:
            "Hello! 👋 I'm the **GST AI Assistant**. I can help you with invoicing, GST calculations, documents, and more.\n\nWhat would you like to know?",
          followUp: getSuggestedActions(),
          timestamp: new Date(),
        },
      ]);
    }
  }, [isOpen, messages.length]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text.trim() }),
      });

      const data = await res.json();

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response || "I couldn't process that. Please try again.",
        followUp: data.followUp || [],
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  // Simple markdown-like rendering for bold text
  const renderContent = (content: string) => {
    const parts = content.split(/(\*\*.*?\*\*|_.*?_)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="font-semibold text-foreground">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith("_") && part.endsWith("_")) {
        return (
          <em key={i} className="italic">
            {part.slice(1, -1)}
          </em>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <>
      {/* Chat Panel */}
      {isOpen && (
        <div className="chat-panel animate-bounce-in">
          <div className="flex flex-col glass-card rounded-2xl sm:rounded-2xl overflow-hidden shadow-2xl shadow-primary/10 h-[520px] sm:h-[520px]">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 gradient-gstai">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">GST AI Assistant</h3>
                  <p className="text-[10px] text-white/70">Always here to help</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <ChevronDown className="h-4 w-4 text-white" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 chat-messages">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed ${
                      msg.role === "user"
                        ? "gradient-primary text-white rounded-br-md"
                        : "bg-muted/50 text-foreground rounded-bl-md"
                    }`}
                  >
                    <div className="whitespace-pre-line">
                      {renderContent(msg.content)}
                    </div>

                    {/* Follow-up suggestions */}
                    {msg.followUp && msg.followUp.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3 pt-2 border-t border-border/30">
                        {msg.followUp.map((suggestion) => (
                          <button
                            key={suggestion}
                            onClick={() => sendMessage(suggestion)}
                            className="px-2.5 py-1 rounded-full bg-primary/10 hover:bg-primary/20 text-primary text-[11px] font-medium transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {msg.role === "user" && (
                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <User className="h-3.5 w-3.5 text-primary" />
                    </div>
                  )}
                </div>
              ))}

              {/* Typing indicator */}
              {isLoading && (
                <div className="flex gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-muted/50">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/60 typing-dot" />
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/60 typing-dot" />
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/60 typing-dot" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-2 px-4 py-3 border-t border-border/50"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                disabled={isLoading}
                className="flex-1 bg-muted/30 rounded-xl px-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground/50 focus:bg-muted/50 transition-colors"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center text-white disabled:opacity-40 hover:opacity-90 transition-opacity"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Bubble */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`chat-bubble group ${isOpen ? "scale-0 opacity-0" : "scale-100 opacity-100"} transition-all duration-300`}
      >
        <div className="relative w-14 h-14 rounded-2xl gradient-gstai flex items-center justify-center shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all animate-pulse-glow">
          {isOpen ? (
            <X className="h-5 w-5 text-white" />
          ) : (
            <MessageSquareText className="h-5 w-5 text-white" />
          )}

          {/* Notification dot */}
          {!isOpen && messages.length === 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
              <span className="text-[8px] text-white font-bold">!</span>
            </span>
          )}
        </div>
      </button>
    </>
  );
}
