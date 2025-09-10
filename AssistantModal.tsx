import React, { useState, useEffect, useRef } from 'react';
import type { ChatMessage } from '../types';
import { getAssistantResponse } from '../services/assistantService';
import playSound from '../services/audioService';

interface AssistantModalProps {
    isOpen: boolean;
    onClose: () => void;
    isOnline: boolean;
}

const AssistantModal: React.FC<AssistantModalProps> = ({ isOpen, onClose, isOnline }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [shouldRender, setShouldRender] = useState(isOpen);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
            if (messages.length === 0) {
                setMessages([{ sender: 'ai', text: 'Olá! Como posso ajudar você a usar o Gerador YouTube hoje?' }]);
            }
        }
    }, [isOpen, messages.length]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const onAnimationEnd = () => {
        if (!isOpen) setShouldRender(false);
    };

    const handleClose = () => {
        playSound('click');
        onClose();
    };

    const handleSend = async () => {
        if (!userInput.trim() || isLoading) return;
        
        playSound('click');
        const newUserMessage: ChatMessage = { sender: 'user', text: userInput };
        setMessages(prev => [...prev, newUserMessage]);
        setUserInput('');
        setIsLoading(true);

        const responseText = await getAssistantResponse(userInput, isOnline);
        
        const newAiMessage: ChatMessage = { sender: 'ai', text: responseText };
        setMessages(prev => [...prev, newAiMessage]);
        setIsLoading(false);
        playSound('success');
    };

    if (!shouldRender) return null;
    const animationClass = isOpen ? 'animate-fadeIn' : 'animate-fadeOut';

    return (
        <div className={`fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 ${animationClass}`} onAnimationEnd={onAnimationEnd}>
            <div className="bg-youtube-dark rounded-2xl shadow-xl text-white w-full max-w-lg h-[80vh] flex flex-col">
                <header className="p-4 border-b border-youtube-gray/30 flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-bold">Assistente IA</h2>
                        <div className="flex items-center gap-2 text-xs text-youtube-gray">
                            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></span>
                            <span>{isOnline ? 'Online' : 'Offline'}</span>
                        </div>
                    </div>
                    <button onClick={handleClose} className="text-2xl text-youtube-gray hover:text-white">&times;</button>
                </header>
                
                <div className="flex-grow p-4 overflow-y-auto">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex mb-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`py-2 px-4 rounded-2xl max-w-[80%] ${msg.sender === 'user' ? 'bg-youtube-red text-white rounded-br-none' : 'bg-youtube-dark text-youtube-white rounded-bl-none border border-youtube-gray/30'}`}>
                                <p className="text-sm">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                         <div className="flex justify-start mb-4">
                            <div className="py-2 px-4 rounded-2xl bg-youtube-dark text-youtube-white rounded-bl-none border border-youtube-gray/30">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-youtube-gray rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    <div className="w-2 h-2 bg-youtube-gray rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                    <div className="w-2 h-2 bg-youtube-gray rounded-full animate-bounce"></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                
                <footer className="p-4 border-t border-youtube-gray/30">
                    <div className="flex items-center bg-youtube-black rounded-full p-1">
                        <input
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Pergunte-me algo..."
                            className="flex-grow bg-transparent px-4 py-2 text-sm focus:outline-none"
                            disabled={isLoading}
                        />
                        <button onClick={handleSend} disabled={!userInput.trim() || isLoading} className="w-10 h-10 bg-youtube-red rounded-full flex items-center justify-center disabled:opacity-50">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                            </svg>
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default AssistantModal;
