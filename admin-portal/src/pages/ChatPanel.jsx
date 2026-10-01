import React, { useState, useEffect, useRef } from 'react';
import chatService from '../services/chatService';
import { Send, Bot, User, MessageSquare } from 'lucide-react';
import clsx from 'clsx';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { format } from 'date-fns';

const ChatPanel = ({ mode = 'ai', negotiationMessages = [], onSendReply, isSendingReply = false }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(localStorage.getItem('adminChatSessionId') || null);
  const messagesEndRef = useRef(null);

  const scrollContainerRef = useRef(null);

  const isNegotiation = mode === 'negotiation';
  const isCurrentlySending = isNegotiation ? isSendingReply : isLoading;

  // Derive display messages based on mode
  const displayMessages = React.useMemo(() => {
    return isNegotiation 
      ? negotiationMessages.map(m => ({
          role: m.sender === 'admin' ? 'user' : 'assistant', // Admin is 'user' (right side)
          content: m.message,
          timestamp: m.timestamp,
          isCustomer: m.sender === 'user'
        }))
      : messages;
  }, [isNegotiation, negotiationMessages, messages]);

  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [displayMessages, isCurrentlySending]);

  useEffect(() => {
    if (isNegotiation) return;
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
  }, [sessionId, isNegotiation]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isCurrentlySending) return;

    const userMessage = input.trim();
    setInput('');

    if (isNegotiation) {
      if (onSendReply) {
        await onSendReply(userMessage);
      }
      return;
    }

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
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 bg-gray-900 text-white flex items-center shadow-md">
        {isNegotiation ? (
          <>
            <MessageSquare className="h-6 w-6 mr-3 text-indigo-400" />
            <div>
              <h2 className="text-lg font-semibold">Customer Negotiation</h2>
              <p className="text-xs text-gray-400">Chat directly with the customer</p>
            </div>
          </>
        ) : (
          <>
            <Bot className="h-6 w-6 mr-3 text-amber-500" />
            <div>
              <h2 className="text-lg font-semibold">AI Assistant</h2>
              <p className="text-xs text-gray-400">Ask questions about event requests</p>
            </div>
          </>
        )}
      </div>
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-4 py-8 md:px-6 md:py-10 space-y-8 bg-gray-50">
        {displayMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            {isNegotiation ? (
              <>
                <MessageSquare className="h-12 w-12 mb-3 text-gray-300" />
                <p>No negotiation messages yet.</p>
                <p className="text-sm mt-2">Send a message to start negotiating!</p>
              </>
            ) : (
              <>
                <Bot className="h-12 w-12 mb-3 text-gray-300" />
                <p>Type a question to start chatting!</p>
                <p className="text-sm mt-2">Example: "Show me pending requests for tomorrow"</p>
              </>
            )}
          </div>
        )}
        
        {displayMessages.map((msg, index) => (
          <div key={index} className={clsx(
            "flex w-full",
            msg.role === 'user' ? "justify-end" : "justify-start"
          )}>
            {msg.role === 'assistant' && (
              <div className="flex-shrink-0 mr-3 h-8 w-8 rounded-full flex items-center justify-center bg-gray-900">
                {isNegotiation ? <User className="h-4 w-4 text-indigo-400" /> : <Bot className="h-4 w-4 text-amber-500" />}
              </div>
            )}
            
            <div className="flex flex-col">
              <div className={clsx(
                "px-4 py-3 rounded-2xl",
                msg.role === 'user' 
                  ? (isNegotiation ? "bg-indigo-600 text-white rounded-br-sm whitespace-pre-wrap" : "bg-amber-600 text-white rounded-br-sm whitespace-pre-wrap")
                  : msg.isError 
                    ? "bg-red-50 text-red-600 border border-red-100 rounded-bl-sm whitespace-pre-wrap"
                    : "bg-white text-gray-800 border border-gray-200 rounded-bl-sm shadow-sm prose prose-sm prose-amber max-w-none prose-p:leading-relaxed prose-pre:bg-gray-100 prose-pre:text-gray-800"
              )}>
                {msg.role === 'assistant' && !msg.isError && !isNegotiation ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content}
                  </ReactMarkdown>
                ) : (
                  msg.content
                )}
              </div>
              {isNegotiation && msg.timestamp && (
                <span className={clsx("text-[10px] text-gray-400 mt-1", msg.role === 'user' ? "text-right" : "text-left")}>
                  {format(new Date(msg.timestamp), 'MMM d, h:mm a')}
                </span>
              )}
            </div>
            
            {msg.role === 'user' && (
              <div className={clsx(
                "flex-shrink-0 ml-3 h-8 w-8 rounded-full flex items-center justify-center",
                isNegotiation ? "bg-indigo-100 text-indigo-700" : "bg-amber-100 text-amber-700"
              )}>
                <User className="h-4 w-4" />
              </div>
            )}
          </div>
        ))}
        
        {isCurrentlySending && (
          <div className={clsx("flex max-w-[80%] mb-4", isNegotiation ? "ml-auto flex-row-reverse" : "mr-auto")}>
            <div className={clsx(
              "flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center",
              isNegotiation ? "bg-indigo-100 text-indigo-700 ml-3" : "bg-gray-900 mr-3"
            )}>
              {isNegotiation ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4 text-amber-500" />}
            </div>
            <div className={clsx(
              "px-4 py-3 border border-gray-200 rounded-2xl shadow-sm flex items-center space-x-1",
              isNegotiation ? "bg-indigo-600 border-indigo-600 rounded-br-sm" : "bg-white text-gray-800 rounded-bl-sm"
            )}>
              <div className={clsx("w-2 h-2 rounded-full animate-bounce", isNegotiation ? "bg-white/80" : "bg-gray-400")} style={{ animationDelay: '0ms' }}></div>
              <div className={clsx("w-2 h-2 rounded-full animate-bounce", isNegotiation ? "bg-white/80" : "bg-gray-400")} style={{ animationDelay: '150ms' }}></div>
              <div className={clsx("w-2 h-2 rounded-full animate-bounce", isNegotiation ? "bg-white/80" : "bg-gray-400")} style={{ animationDelay: '300ms' }}></div>
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
            placeholder={isNegotiation ? "Type your reply to the customer..." : "Ask about event requests..."}
            className="flex-1 py-3 px-4 bg-gray-50 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:border-transparent transition-all pr-12 focus:ring-indigo-500"
            style={isNegotiation ? { outlineColor: '#4f46e5' } : { outlineColor: '#d97706' }}
            disabled={isCurrentlySending}
          />
          <button 
            type="submit" 
            disabled={isCurrentlySending || !input.trim()}
            className={clsx(
              "absolute right-2 p-2 text-white rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 transition-colors",
              isNegotiation ? "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500" : "bg-amber-600 hover:bg-amber-700 focus:ring-amber-500"
            )}
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPanel;
