import React, { useState, useEffect, useRef } from 'react';
import chatService from '../services/chatService';
import { Send, Bot, User } from 'lucide-react';
import clsx from 'clsx';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const ChatPanel = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(localStorage.getItem('adminChatSessionId') || null);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!sessionId) return;
      try {
        const response = await chatService.getChatHistory(sessionId);
        if (response.data.messages) {
          setMessages(response.data.messages);
        }
      } catch (error) {
        console.error('Failed to load chat history:', error);
      }
    };
    fetchHistory();
  }, [sessionId]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await chatService.sendMessage(userMessage, sessionId);

      if (!sessionId) {
        setSessionId(response.data.sessionId);
        localStorage.setItem('adminChatSessionId', response.data.sessionId);
      }

      setMessages(prev => [...prev, { role: 'assistant', content: response.data.answer }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I encountered an error. Please try again later.', isError: true }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 bg-gray-900 text-white flex items-center shadow-md">
        <Bot className="h-6 w-6 mr-3 text-amber-500" />
        <div>
          <h2 className="text-lg font-semibold">AI Assistant</h2>
          <p className="text-xs text-gray-400">Ask questions about event requests</p>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <Bot className="h-12 w-12 mb-3 text-gray-300" />
            <p>Type a question to start chatting!</p>
            <p className="text-sm mt-2">Example: "Show me pending requests for tomorrow"</p>
          </div>
        )}
        
        {messages.map((msg, index) => (
          <div key={index} className={clsx(
            "flex max-w-[80%] mb-4",
            msg.role === 'user' ? "ml-auto" : "mr-auto"
          )}>
            {msg.role === 'assistant' && (
              <div className="flex-shrink-0 mr-3 h-8 w-8 rounded-full bg-gray-900 flex items-center justify-center">
                <Bot className="h-4 w-4 text-amber-500" />
              </div>
            )}
            
            <div className={clsx(
              "px-4 py-3 rounded-2xl",
              msg.role === 'user' 
                ? "bg-amber-600 text-white rounded-br-sm whitespace-pre-wrap" 
                : msg.isError 
                  ? "bg-red-50 text-red-600 border border-red-100 rounded-bl-sm whitespace-pre-wrap"
                  : "bg-white text-gray-800 border border-gray-200 rounded-bl-sm shadow-sm prose prose-sm prose-amber max-w-none prose-p:leading-relaxed prose-pre:bg-gray-100 prose-pre:text-gray-800"
            )}>
              {msg.role === 'assistant' && !msg.isError ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {msg.content}
                </ReactMarkdown>
              ) : (
                msg.content
              )}
            </div>
            
            {msg.role === 'user' && (
              <div className="flex-shrink-0 ml-3 h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
                <User className="h-4 w-4 text-amber-700" />
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex max-w-[80%] mr-auto mb-4">
            <div className="flex-shrink-0 mr-3 h-8 w-8 rounded-full bg-gray-900 flex items-center justify-center">
              <Bot className="h-4 w-4 text-amber-500" />
            </div>
            <div className="px-4 py-3 bg-white text-gray-800 border border-gray-200 rounded-2xl rounded-bl-sm shadow-sm flex items-center space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-gray-200">
        <form onSubmit={handleSend} className="flex relative items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about event requests..."
            className="flex-1 py-3 px-4 bg-gray-50 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all pr-12"
            disabled={isLoading}
          />
          <button 
            type="submit" 
            disabled={isLoading || !input.trim()}
            className="absolute right-2 p-2 bg-amber-600 text-white rounded-full hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPanel;
