
import React, { useState, useEffect, useRef } from 'react';
import { createCoachSession, ChatMessage } from '../services/aiCoachService';
import { Send, Bot, User, Loader2, Sparkles, MessageSquare } from 'lucide-react';

const PT_RED = "#C63527";

const SUGGESTED_QUESTIONS = [
    "What are the VBT zones for power?",
    "Give me a high-protein breakfast idea.",
    "How do I improve my vertical jump?",
    "Why is my readiness score low?",
    "Tips for squat depth?"
];

const AICoach: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: 'welcome',
            role: 'model',
            text: "Hello! I'm your Panther Performance Coach. I can help with VBT, exercise technique, nutrition, and recovery strategies. What's on your mind today?",
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [chatSession, setChatSession] = useState<any>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const init = async () => {
            const session = await createCoachSession();
            setChatSession(session);
        };
        init();
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (text: string) => {
        if (!text.trim() || !chatSession) return;

        // Add User Message
        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            text: text,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);

        try {
            // Send to Gemini
            const result = await chatSession.sendMessage({ message: text });
            
            // Add AI Response
            const aiMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'model',
                text: result.text,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMsg]);
        } catch (err) {
            console.error(err);
            const errorMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'model',
                text: "I'm having trouble processing that right now. Please try again.",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend(input);
        }
    };

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col animate-in fade-in duration-500">
            <div className="border-b border-gray-200 pb-4 mb-4">
                <h2
                    className="text-2xl font-extrabold tracking-tight mb-1 flex items-center gap-2"
                    style={{ color: PT_RED }}
                >
                    <Bot className="w-8 h-8" /> Performance Chat
                </h2>
                <p className="text-sm text-gray-500">
                    Ask questions about VBT, nutrition, meal prep, and training methodology.
                </p>
            </div>

            {/* Chat Area */}
            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar bg-gray-50">
                    {messages.map((msg) => (
                        <div 
                            key={msg.id} 
                            className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm
                                ${msg.role === 'user' ? 'bg-gray-900 text-white' : 'bg-white text-red-600 border border-red-100'}`}>
                                {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-6 h-6" />}
                            </div>
                            
                            <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                <div className={`px-5 py-3.5 rounded-2xl shadow-sm text-sm leading-relaxed whitespace-pre-wrap
                                    ${msg.role === 'user' 
                                        ? 'bg-gray-900 text-white rounded-tr-none' 
                                        : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'}`}
                                >
                                    {msg.text}
                                </div>
                                <span className="text-[10px] text-gray-400 mt-1 px-1">
                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-white text-red-600 border border-red-100 flex items-center justify-center shadow-sm">
                                <Loader2 className="w-5 h-5 animate-spin" />
                            </div>
                            <div className="bg-white border border-gray-100 px-5 py-3.5 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-gray-100">
                    {/* Suggested Chips */}
                    {messages.length < 3 && (
                        <div className="flex gap-2 overflow-x-auto pb-3 mb-2 custom-scrollbar">
                            {SUGGESTED_QUESTIONS.map((q, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSend(q)}
                                    className="whitespace-nowrap px-3 py-1.5 bg-gray-50 hover:bg-red-50 text-gray-600 hover:text-red-700 border border-gray-200 hover:border-red-200 rounded-full text-xs font-medium transition-colors flex items-center gap-1"
                                >
                                    <Sparkles className="w-3 h-3" /> {q}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="relative flex items-end gap-2">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="Ask about exercises, nutrition, or recovery..."
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white resize-none max-h-32 min-h-[50px]"
                            rows={1}
                        />
                        <button
                            onClick={() => handleSend(input)}
                            disabled={!input.trim() || isLoading}
                            className="h-[50px] w-[50px] bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition-all shadow-sm active:scale-95"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="text-center mt-2">
                        <p className="text-[10px] text-gray-400">
                            AI can make mistakes. Consult a real coach for critical medical or training advice.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AICoach;
