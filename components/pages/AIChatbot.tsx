
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, Chat } from '@google/genai';
import { useAppContext } from '../../hooks/useAppContext';
import { SparklesIcon } from '../icons/Icons';

type Message = {
  sender: 'user' | 'ai';
  text: string;
};

const AIChatbot: React.FC = () => {
  const { schools, workRequests } = useAppContext();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const initializeChat = useCallback(() => {
    if (!process.env.API_KEY) {
      setError("API_KEY environment variable not set. This feature is disabled.");
      return;
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const fullContext = `
      You are an expert AI assistant for a School Program Administrator.
      Your purpose is to answer questions about schools and work requests based on the data provided below.
      Be helpful, concise, and professional. When asked for priorities or lists, use formatting like bullet points to make the information easy to read.
      
      CURRENT DATA:
      
      Schools:
      ${JSON.stringify(schools, null, 2)}
      
      Work Requests:
      ${JSON.stringify(workRequests, null, 2)}
    `;

    chatRef.current = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: fullContext
        }
    });

    setMessages([{ sender: 'ai', text: "Hello! I'm your AI assistant. How can I help you manage your schools and tasks today?" }]);
  }, [schools, workRequests]);
  
  useEffect(() => {
    initializeChat();
  }, [initializeChat]);


  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !chatRef.current) return;

    const userMessage: Message = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await chatRef.current.sendMessage({ message: input });
      const aiMessage: Message = { sender: 'ai', text: response.text };
      setMessages(prev => [...prev, aiMessage]);
    } catch (e) {
      console.error(e);
      setError("Sorry, I encountered an error trying to respond. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-dark-card rounded-lg shadow-md">
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="flex flex-col space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-end ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.sender === 'ai' && <SparklesIcon className="h-8 w-8 text-primary mr-3 flex-shrink-0" />}
              <div className={`px-4 py-2 rounded-lg max-w-lg ${msg.sender === 'user' ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                <p className="whitespace-pre-wrap">{msg.text}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-end justify-start">
               <SparklesIcon className="h-8 w-8 text-primary mr-3" />
               <div className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700">
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                    </div>
               </div>
            </div>
          )}
          {error && <p className="text-red-500 text-center">{error}</p>}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={!process.env.API_KEY ? "AI Chat is disabled" : "Ask about your tasks or schools..."}
            className="flex-1 w-full px-4 py-2 bg-gray-100 dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={isLoading || !process.env.API_KEY}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
            disabled={isLoading || !input.trim() || !process.env.API_KEY}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIChatbot;