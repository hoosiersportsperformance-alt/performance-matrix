import React, { useState, useEffect, useRef } from 'react';
import { createATSession, ChatMessage } from '../services/atService';
import { Send, User, Loader2, ShieldAlert, Stethoscope, AlertTriangle } from 'lucide-react';

const PT_RED = "#C63527";

const QUICK_RESPONSES = [
    "I tweaked my ankle.",
    "My shoulder hurts when I throw.",
    "I hit my head.",
    "Just general soreness."
];

const AIAthleticTrainer: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: 'disclaimer',
            role: 'model',
            text: "**IMPORTANT:** I’m an AI assistant and **not a doctor or certified athletic trainer**. I can help you think through what might be going on and give general guidance, but I can’t diagnose or clear you to play.\n\nAlways follow instructions from your athletic trainer, doctor, or coach, and call 911 in an emergency.",
            timestamp: new Date()
        },
        {
            id: 'welcome',
            role: 'model',
            text: "Hi there. I'm here to help you stay safe and healthy. What sport do you play and what’s going on today?",
            timestamp: new Date()
        }
    ]);

    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [chatSession, setChatSession] = useState<any>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const init = async () => {
            const session = await createATSession();
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
            const result = await chatSession.sendMessage({ message: text });

            const aiMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'model',
                text: result.text,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMsg]);
        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'model',
                text: "Connection error. Please tell a coach directly if you are hurt.",
                timestamp: new Date()
            }]);
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
                <div className="flex items-center gap-3 mb-1">
                    <div className="bg-red-100 p-2 rounded-xl">
                        <Stethoscope className="w-8 h-8 text-red-600" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">
                            Sports Medicine AI
                        </h2>
                        <p className="text-sm text-gray-500">
                            Injury triage, soreness guidance, and safety checks.
                        </p>
                    </div>
                </div>
            </div>

            {/* SAFETY HEADER */}
            <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-start gap-3 mb-4">
                <ShieldAlert className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-800 font-medium leading-relaxed">
                    <span className="font-bold">Disclaimer:</span> I am an AI, not a healthcare professional. 
                    If you have severe pain (8–10/10), head injury, difficulty breathing, or deformity,
                    <span className="font-bold underline cursor-pointer ml-1">STOP and tell an adult immediately.</span>
                </p>
            </div>

            {/* CHAT AREA */}
            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar bg-slate-50">
                    {messages.map((msg) => (
                        <div 
                            key={msg.id}
                            className={`flex gap-4 max-w-[90%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm
                                ${msg.role === 'user' ? 'bg-gray-900 text-white' : 'bg-red-600 text-white'}`}>
                                {msg.role === 'user' ? <User className="w-5 h-5" /> : <Stethoscope className="w-5 h-5" />}
                            </div>

                            <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                <div
                                    className={`px-5 py-3.5 rounded-2xl shadow-sm text-sm leading-relaxed whitespace-pre-wrap
                                    ${msg.role === 'user'
                                        ? 'bg-gray-900 text-white rounded-tr-none'
                                        : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none'}`}
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
                            <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center shadow-sm">
                                <Loader2 className="w-5 h-5 animate-spin" />
                            </div>
                            <div className="bg-white border border-gray-200 px-5 py-3.5 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* INPUT AREA */}
                <div className="p-4 bg-white border-t border-gray-100">
                    {messages.length < 4 && (
                        <div className="flex gap-2 overflow-x-auto pb-3 mb-2 custom-scrollbar">
                            {QUICK_RESPONSES.map((q, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSend(q)}
                                    className="whitespace-nowrap px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-full text-xs font-medium transition-colors flex items-center gap-1"
                                >
                                    <AlertTriangle className="w-3 h-3" /> {q}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="relative flex items-end gap-2">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="Describe your pain, injury, or soreness..."
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
                </div>
            </div>
        </div>
    );
};

export default AIAthleticTrainer;

