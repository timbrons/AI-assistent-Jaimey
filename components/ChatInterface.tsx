'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import ChatMessage from './ChatMessage';
import SuggestedQuestions from './SuggestedQuestions';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

const SUGGESTED_QUESTIONS = [
  'Wat is de langste snelweg ter wereld? 🛣️',
  'Welke stad is de oudste stad ter wereld? 🏛️',
  'Hoe ver is de maan van de aarde? 🌙',
  'Welk dier is het snelste ter wereld? 🐆',
  'Waarom is de lucht blauw? ☀️',
  'Hoe groot is de zon vergeleken met de aarde? ⭐',
  'Wat is het hoogste gebouw ter wereld? 🏢',
  'Hoeveel tanden heeft een witte haai? 🦈',
];

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText]);

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed || isLoading) return;

      const newUserMessage: Message = { role: 'user', content: trimmed };
      const nextMessages = [...messages, newUserMessage];

      setMessages(nextMessages);
      setInput('');
      setIsLoading(true);
      setStreamingText('');

      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: nextMessages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        });

        if (!response.ok || !response.body) {
          throw new Error(`HTTP ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullText = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          fullText += decoder.decode(value, { stream: true });
          setStreamingText(fullText);
        }

        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: fullText },
        ]);
      } catch (err) {
        console.error('Fout bij versturen bericht:', err);
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content:
              'Oeps! Er ging iets mis. Probeer je vraag nog een keer! 😅',
          },
        ]);
      } finally {
        setStreamingText('');
        setIsLoading(false);
        textareaRef.current?.focus();
      }
    },
    [messages, isLoading]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 128)}px`;
  };

  const isEmpty = messages.length === 0 && !isLoading && !streamingText;

  return (
    <div className="flex flex-col h-screen max-w-3xl mx-auto">
      {/* ── Header ── */}
      <header className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-4 py-3 shadow-lg flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl select-none" aria-hidden="true">🚀</span>
            <div>
              <h1 className="text-xl font-extrabold text-white tracking-tight leading-tight">
                Jaimey&rsquo;s Slimme Assistent
              </h1>
              <p className="text-purple-200 text-xs font-semibold">
                Stel me al je vragen! ✨
              </p>
            </div>
          </div>
          {!isEmpty && (
            <button
              onClick={() => {
                setMessages([]);
                setStreamingText('');
              }}
              className="bg-white/20 hover:bg-white/30 active:bg-white/40 text-white text-xs font-bold px-3 py-1.5 rounded-full transition-colors"
            >
              Nieuw gesprek
            </button>
          )}
        </div>
      </header>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {isEmpty ? (
          <SuggestedQuestions
            questions={SUGGESTED_QUESTIONS}
            onSelect={sendMessage}
          />
        ) : (
          <div className="p-4 space-y-4 pb-2">
            {messages.map((msg, i) => (
              <ChatMessage key={i} message={msg} />
            ))}

            {/* Streaming response */}
            {streamingText && (
              <ChatMessage
                message={{ role: 'assistant', content: streamingText }}
                isStreaming
              />
            )}

            {/* Typing indicator (before first token arrives) */}
            {isLoading && !streamingText && (
              <div className="flex items-end gap-2.5">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center flex-shrink-0 text-base select-none">
                  🤖
                </div>
                <div className="bg-white border-2 border-purple-100 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                  <div className="flex gap-1.5 items-center h-5">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="inline-block w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.18}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* ── Input ── */}
      <div className="bg-white border-t-2 border-purple-100 px-4 py-3 shadow-lg flex-shrink-0">
        <div className="flex gap-2 items-end">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Typ hier je vraag... 💬"
            disabled={isLoading}
            rows={1}
            className="flex-1 resize-none rounded-2xl border-2 border-purple-200 focus:border-purple-500 focus:outline-none px-4 py-3 text-base leading-snug transition-colors disabled:opacity-60 min-h-[48px] max-h-32 overflow-y-auto"
            aria-label="Stel een vraag"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={isLoading || !input.trim()}
            className="h-12 w-12 flex-shrink-0 bg-gradient-to-br from-orange-400 to-pink-500 text-white rounded-2xl flex items-center justify-center text-xl font-bold shadow hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
            aria-label="Verstuur vraag"
            title="Verstuur (Enter)"
          >
            🚀
          </button>
        </div>
        <p className="text-center text-xs text-gray-400 mt-1.5 select-none">
          Druk op Enter om te versturen &bull; Shift+Enter voor een nieuwe regel
        </p>
      </div>
    </div>
  );
}
