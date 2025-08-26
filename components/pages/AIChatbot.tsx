
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, Chat } from '@google/genai';
import { useAppContext } from '../../hooks/useAppContext';
import { SparklesIcon } from '../icons/Icons';
import { RequestStatus } from '../../types';

type Message = {
  sender: 'user' | 'ai';
  text: string;
};

// Use the provided API Key directly
const GEMINI_API_KEY = 'AIzaSyB7Nfel8XvDawr81V_is0Az0t1VaZ44L9A';

const AIChatbot: React.FC = () => {
  const { schools, workRequests, programs } = useAppContext();
  
  // State for conversational chat (left pane)
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const chatRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // State for AI summary (right pane)
  const [summary, setSummary] = useState('');
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const initializeChat = useCallback(() => {
    if (!GEMINI_API_KEY) {
      setChatError("Gemini API Key is missing. This feature is disabled.");
      return;
    }
    try {
      const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
      
      const fullContext = `
        You are an expert AI assistant for a School Program Administrator.
        Your purpose is to answer questions about schools and work requests based on the data provided below.
        Be helpful, concise, and professional. When asked for priorities or lists, use formatting like bullet points to make the information easy to read.
        
        CURRENT DATA:
        
        Schools: ${JSON.stringify(schools, null, 2)}
        Work Requests: ${JSON.stringify(workRequests, null, 2)}
      `;

      chatRef.current = ai.chats.create({
          model: 'gemini-2.5-flash',
          config: { systemInstruction: fullContext }
      });
      setChatError(null);
      if (messages.length === 0) {
        setMessages([{ sender: 'ai', text: "Hello! I'm your AI assistant. How can I help you manage your schools and tasks today?" }]);
      }
    } catch (e) {
        console.error("Failed to initialize AI Chat:", e);
        setChatError("Could not initialize AI Chat. Please check the API Key and configuration.");
    }
  }, [schools, workRequests, messages.length]);
  
  useEffect(() => {
    initializeChat();
  }, [initializeChat]);


  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isChatLoading || !chatRef.current) return;

    const userMessage: Message = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsChatLoading(true);
    setChatError(null);

    try {
      const response = await chatRef.current.sendMessage({ message: input });
      const aiMessage: Message = { sender: 'ai', text: response.text };
      setMessages(prev => [...prev, aiMessage]);
    } catch (e) {
      console.error(e);
      setChatError("Sorry, I encountered an error trying to respond. Please try again.");
      setMessages(prev => prev.slice(0, -1)); // Remove the user message that failed
      setInput(input);
    } finally {
      setIsChatLoading(false);
    }
  };
  
  const handleGenerateSummary = async () => {
    setIsSummaryLoading(true);
    setSummaryError(null);
    setSummary('');

    try {
        const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
        
        const openWorkRequests = workRequests.filter(req => req.status !== RequestStatus.Completed).map(req => {
            const programName = programs.find(p => p.id === req.programId)?.name || 'N/A';
            const schoolName = schools.find(s => s.id === req.schoolId)?.name || 'N/A';
            return { ...req, programName, schoolName };
        });

        const prompt = `
            Analyze the following list of open work requests. Your goal is to provide a professional daily breakdown of where the admin needs to focus their daily attention.
            Weight priority and due dates efficiently and provide a list of the top 10 most critical things that need to get done.
            For each item, provide a brief summary of the issue and a concrete recommendation on how to resolve it.
            Use clear headings, bullet points, and bold text to make the summary easy to read and actionable.
            
            OPEN WORK REQUESTS DATA:
            ${JSON.stringify(openWorkRequests, null, 2)}
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: "You are a highly experienced School Program Administrator Wizard with a Type 75 certification. Your analysis is sharp, insightful, and focused on operational efficiency."
            }
        });

        setSummary(response.text);

    } catch (e) {
        console.error("Failed to generate summary:", e);
        setSummaryError("An error occurred while generating the summary. Please try again.");
    } finally {
        setIsSummaryLoading(false);
    }
  };
  
  const isChatDisabled = !GEMINI_API_KEY || !!chatError;

  return (
    <div className="flex h-full gap-6">
      {/* Left Pane: Conversational Chat */}
      <div className="w-1/2 flex flex-col h-full bg-white dark:bg-dark-card rounded-lg shadow-md">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
            <SparklesIcon className="h-6 w-6 text-primary mr-2" />
            Conversational AI
          </h2>
        </div>
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="flex flex-col space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className={`flex items-start ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.sender === 'ai' && <SparklesIcon className="h-8 w-8 text-primary mr-3 flex-shrink-0" />}
                <div className={`px-4 py-2 rounded-lg max-w-lg ${msg.sender === 'user' ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))}
            {isChatLoading && (
              <div className="flex items-start justify-start">
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
            {chatError && messages.length <= 1 && (
              <div className="text-center text-red-500 bg-red-100 dark:bg-red-900/50 p-3 rounded-md">
                  {chatError}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isChatDisabled ? "AI Chat is disabled" : "Ask about your tasks or schools..."}
              className="flex-1 w-full px-4 py-2 bg-gray-100 dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={isChatLoading || isChatDisabled}
            />
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
              disabled={isChatLoading || !input.trim() || isChatDisabled}
            >
              Send
            </button>
          </form>
        </div>
      </div>

      {/* Right Pane: Daily Focus Summary */}
      <div className="w-1/2 flex flex-col h-full bg-white dark:bg-dark-card rounded-lg shadow-md">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
            <SparklesIcon className="h-6 w-6 text-secondary mr-2" />
            Daily Focus Summary
          </h2>
          <button
            onClick={handleGenerateSummary}
            disabled={isSummaryLoading}
            className="px-4 py-2 text-sm bg-secondary text-white rounded-lg hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary disabled:opacity-50"
          >
            {isSummaryLoading ? 'Generating...' : 'Generate AI Summary'}
          </button>
        </div>
        <div className="flex-1 p-6 overflow-y-auto">
            {isSummaryLoading && (
                <div className="flex justify-center items-center h-full">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
                    <p className="ml-4 text-gray-600 dark:text-gray-300">Analyzing priorities...</p>
                </div>
            )}
            {summaryError && (
                 <div className="text-red-500 bg-red-100 dark:bg-red-900/50 p-4 rounded-md">
                    <p className="font-bold">An error occurred:</p>
                    <p>{summaryError}</p>
                </div>
            )}
            {!isSummaryLoading && !summary && !summaryError && (
                 <div className="text-center text-gray-500 dark:text-gray-400 h-full flex flex-col justify-center items-center">
                    <SparklesIcon className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
                    <h3 className="font-semibold text-lg text-gray-700 dark:text-gray-300">Get Your Daily Action Plan</h3>
                    <p className="max-w-xs mt-1">Click "Generate AI Summary" to get a prioritized list of your top 10 tasks for the day.</p>
                </div>
            )}
            {summary && (
                <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                    {summary}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default AIChatbot;
